import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

load_dotenv()

from app.database import init_db
from server.auth import router as auth_router
from server.routers import events


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database on startup."""
    init_db()
    yield


app = FastAPI(
    title="Calendar Service",
    description="Microservice for managing calendar events",
    version="1.0.0",
    lifespan=lifespan
)

# ── CORS Configuration ────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────

app.include_router(auth_router)
app.include_router(events.router)


@app.get("/health")
def health():
    """Global health check."""
    return {"status": "ok", "service": "calendar"}


# ── Frontend ──────────────────────────────────────────────────

if os.getenv("FRONTEND_DIR"):
    app.mount("/", StaticFiles(directory=os.environ["FRONTEND_DIR"], html=True), name="frontend")
