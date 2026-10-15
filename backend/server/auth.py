import hashlib
import hmac
import os
import secrets

from fastapi import APIRouter, Cookie, Depends, HTTPException, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel

CALENDAR_API_TOKEN = os.getenv("CALENDAR_API_TOKEN", "default-token")
COOKIE_SECURE = os.getenv("COOKIE_SECURE", "false").lower() == "true"

# Unique name, so it cannot clash with cookies from other apps on the same host
SESSION_COOKIE = "calendar_session"

# auto_error=False so a missing header falls through to the cookie check instead of a 403
security = HTTPBearer(auto_error=False)

router = APIRouter(prefix="/auth")


def _matches(supplied: str) -> bool:
    return secrets.compare_digest(supplied.encode(), CALENDAR_API_TOKEN.encode())


def _session_value() -> str:
    # The browser only ever holds this derived value, never the raw token
    return hmac.new(CALENDAR_API_TOKEN.encode(), b"calendar-session", hashlib.sha256).hexdigest()


def verify_token(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    session: str | None = Cookie(None, alias=SESSION_COOKIE),
) -> str:
    """Accept either the Bearer API token (scripts, other services) or a login session cookie."""
    if credentials and _matches(credentials.credentials):
        return credentials.credentials
    if session and secrets.compare_digest(session.encode(), _session_value().encode()):
        return "session"
    raise HTTPException(status_code=401, detail="Invalid or missing API token")


class LoginIn(BaseModel):
    token: str


@router.post("/login")
def login(body: LoginIn, response: Response):
    if not _matches(body.token):
        raise HTTPException(status_code=401, detail="Invalid or missing API token")
    response.set_cookie(
        SESSION_COOKIE,
        _session_value(),
        httponly=True,
        samesite="strict",
        secure=COOKIE_SECURE,
        max_age=60 * 60 * 24 * 90,
    )
    return {"ok": True}


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(SESSION_COOKIE)
    return {"ok": True}


@router.get("/check")
def check(_: str = Depends(verify_token)):
    return {"ok": True}
