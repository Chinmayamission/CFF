# CFF Mini - Docker Deployment Guide

This guide explains how to run CFF (Chinmaya Forms Framework) locally using Docker and deploy it to Railway.

## Prerequisites

- Docker & Docker Compose
- AWS Cognito User Pool (for authentication)
- MongoDB Atlas account (for Railway deployment) or local MongoDB

## Quick Start (Local Development)

### 1. Set up environment variables

```bash
# Copy the example env file
cp .env.mini.example .env.mini

# Edit .env.mini with your values
# Required: USER_POOL_ID, COGNITO_CLIENT_ID, MONGO_CONN_STR
```

### 2. Run with Docker Compose

```bash
# Build and start the app
docker-compose -f docker-compose.mini.yml --env-file .env.mini up --build

# Or run in detached mode
docker-compose -f docker-compose.mini.yml --env-file .env.mini up --build -d
```

> **Note:** MongoDB is not included by default. Set `MONGO_CONN_STR` in `.env.mini` to point to your MongoDB instance (local or Atlas). To use a local MongoDB container, uncomment the mongodb service in `docker-compose.mini.yml`.

### 3. Access the application

Open http://localhost:8000 in your browser.

- Frontend: http://localhost:8000
- API: http://localhost:8000/api/

### 4. Stop the services

```bash
docker-compose -f docker-compose.mini.yml down

# To also remove the MongoDB data volume:
docker-compose -f docker-compose.mini.yml down -v
```

## Railway Deployment

### 1. Install Railway CLI

```bash
# macOS
brew install railway

# Or using npm
npm install -g @railway/cli

# Login to Railway
railway login
```

### 2. Create a new Railway project

```bash
# Initialize a new project
railway init

# Or link to existing project
railway link
```

### 3. Set environment variables

Set these on the Railway console.

### 4. Deploy

```bash
# Deploy to Railway
railway up
```

### 5. Get your deployment URL

```bash
railway open
```

### 6. Configure Railway Settings

#### PUBLIC_API_URL (Required for Payments)

Set `PUBLIC_API_URL` to your full public URL. This is needed for:
- **PayPal IPN** - Callback URL is baked into frontend at build time
- **CCAvenue** - Redirect URL is generated server-side (prevents host header injection attacks)

```
PUBLIC_API_URL=https://forms.chinmayamission.com/api/
```

> **Security Note:** Without `PUBLIC_API_URL`, the backend falls back to using request headers to build URLs, which is vulnerable to host header injection (SSRF). Always set this in production.

## Environment Variables Reference

### Build-time Variables

These are baked into the frontend at build time:

| Variable | Required | Description |
|----------|----------|-------------|
| `USER_POOL_ID` | Yes | AWS Cognito User Pool ID |
| `COGNITO_CLIENT_ID` | Yes | AWS Cognito App Client ID |
| `MODE` | No | `dev` or `prod` (default: `dev`) |
| `GOOGLE_MAPS_API_KEY` | No | For address autocomplete |
| `PUBLIC_API_URL` | For payments | Full public URL for external callbacks (e.g., `https://forms.chinmayamission.com/api/`). Required for PayPal IP. |

### Runtime Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_CONN_STR` | Yes | MongoDB connection string |
| `PUBLIC_API_URL` | For payments | **Security:** Full public URL for payment callbacks (CCAvenue, etc.). Prevents host header injection attacks. Should match the build-time value. |
| `SES_AWS_ACCESS_KEY_ID` | No | AWS access key for sending emails via SES |
| `SES_AWS_SECRET_ACCESS_KEY` | No | AWS secret key for sending emails via SES |
| `SES_AWS_REGION` | No | AWS region for SES (default: `us-east-1`) |

## Architecture

```
┌─────────────────────────────────────────────┐
│              Docker Container               │
│  ┌───────────────────────────────────────┐  │
│  │            Gunicorn (WSGI)            │  │
│  │  ┌─────────────┐  ┌────────────────┐  │  │
│  │  │  /api/*     │  │  /* (static)   │  │  │
│  │  │  Chalice    │  │  React Frontend│  │  │
│  │  │  Backend    │  │  (built files) │  │  │
│  │  └─────────────┘  └────────────────┘  │  │
│  └───────────────────────────────────────┘  │
│                     │                       │
└─────────────────────│───────────────────────┘
                      │
                      ▼
              ┌───────────────┐
              │    MongoDB    │
              └───────────────┘
```
