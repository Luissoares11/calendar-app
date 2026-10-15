# Stage 1: build the frontend into static files
FROM node:20-alpine AS frontend

WORKDIR /src

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./

RUN npm run build

# Stage 2: the backend, serving the built frontend from the same port

FROM python:3.12-slim

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/app ./app
COPY backend/server ./server
COPY --from=frontend /src/dist ./frontend

RUN mkdir -p data logs

ENV FRONTEND_DIR=/app/frontend

EXPOSE 8010

CMD ["python", "-m", "uvicorn", "server.main:app", "--host", "0.0.0.0", "--port", "8010"]
