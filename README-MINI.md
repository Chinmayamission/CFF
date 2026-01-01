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

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `USER_POOL_ID` | Yes | AWS Cognito User Pool ID |
| `COGNITO_CLIENT_ID` | Yes | AWS Cognito App Client ID |
| `MONGO_CONN_STR` | Yes | MongoDB connection string |
| `MODE` | No | `DEV`, `BETA`, or `PROD` (default: `DEV`) |
| `GOOGLE_MAPS_API_KEY` | No | For address autocomplete |
| `SMTP_USERNAME` | No | For sending emails |
| `SMTP_PASSWORD` | No | For sending emails |

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
