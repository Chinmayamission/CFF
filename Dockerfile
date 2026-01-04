# Multi-stage Dockerfile for CFF (Chinmaya Forms Framework)
# Builds frontend and runs backend in a single container

# =============================================================================
# Stage 1: Build Frontend
# =============================================================================
FROM node:18-alpine AS frontend-builder

WORKDIR /app

# Install dependencies first (better caching)
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# Copy source files
COPY scripts/ ./scripts/
COPY webpack.common.js webpack.mini.js ./
COPY .babelrc tsconfig.json ./

# Build arguments for frontend configuration
ARG USER_POOL_ID=""
ARG COGNITO_CLIENT_ID=""
ARG GOOGLE_MAPS_API_KEY=""
ARG MODE="prod"

# Build frontend
ENV USER_POOL_ID=${USER_POOL_ID}
ENV COGNITO_CLIENT_ID=${COGNITO_CLIENT_ID}
ENV GOOGLE_MAPS_API_KEY=${GOOGLE_MAPS_API_KEY}
ENV MODE=${MODE}

# NODE_OPTIONS needed for webpack compatibility with Node 18's OpenSSL 3.0
RUN NODE_OPTIONS=--openssl-legacy-provider npm run build-mini

# =============================================================================
# Stage 2: Python Runtime
# =============================================================================
FROM python:3.8-slim

WORKDIR /app

# Install system dependencies (including build tools for pycryptodomex)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libc6-dev \
    libffi-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY lambda/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir gunicorn chalice

# Copy backend code
COPY lambda/ ./lambda/

# Copy built frontend from stage 1
COPY --from=frontend-builder /app/scripts/dist ./static/

# Environment variables (can be overridden at runtime)
ENV STATIC_DIR=/app/static
ENV PYTHONPATH=/app
ENV PORT=8000

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/')" || exit 1

# Run with gunicorn (with access logging to stdout)
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "2", "--threads", "4", "--timeout", "120", "--access-logfile", "-", "--access-logformat", "%(h)s %(l)s %(u)s %(t)s \"%(r)s\" %(s)s %(b)s \"%(f)s\" \"%(a)s\" %(D)s", "lambda.wsgi:app"]
