# SecureOps — Cybersecurity Incident Response Dashboard

A full-stack SaaS dashboard for outsourced IT/security teams to monitor and manage cybersecurity incidents across multiple clients.

## Overview

SecureOps gives security analysts a central workspace to track incidents, create remediation tickets, and maintain a complete audit trail of every action taken. The platform supports multiple client organizations (tenants) and enforces role-based access so each user sees only what they're permitted to.

## Features

- **Incident Management** — Create, assign, triage, and resolve security incidents with severity levels (Low / Medium / High / Critical) and a full status lifecycle
- **Ticket System** — Break incidents down into actionable tickets; link tickets back to their source incident
- **Activity Feed** — Every status change, reassignment, comment, and field edit is recorded as an immutable activity entry
- **Multi-Tenant Architecture** — Data is scoped per client organization; analysts can be restricted to a single tenant
- **Role-Based Access Control** — Three roles: Admin, Analyst, Client User — enforced at the API layer via JWT + role guards
- **Dashboard & Charts** — At-a-glance metrics: open incident counts, incidents by severity (bar chart), incidents over time (line chart), recent incidents table
- **Client Management** - View and manage tenants with tier classification (Starter / Professional / Enterprise)

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Recharts |
| Backend | NestJS, TypeScript, Prisma ORM |
| Database | PostgreSQL |
| Auth | JWT (access tokens), bcryptjs |
| Deployment | Docker |

## Data Model

```
Tenant  ──< Incident ──< Ticket
               │               │
               ▼               ▼
        IncidentActivity  TicketActivity
               │               │
               └───────┬───────┘
                      User
```

- **Incident** — severity, status, client scope, assignee, detected/resolved timestamps
- **Ticket** — priority, status, linked incident, assignee
- **Activity** — typed audit log entries with optional structured metadata
- **Tenant** — client organization with tier and status
- **User** — role-scoped to a tenant (or global for Admins)

## API Endpoints

```
POST   /auth/login
POST   /auth/register

GET    /incidents
POST   /incidents
GET    /incidents/:id
PATCH  /incidents/:id
DELETE /incidents/:id
PATCH  /incidents/:id/status
PATCH  /incidents/:id/severity
PATCH  /incidents/:id/assign
PATCH  /incidents/:id/title
PATCH  /incidents/:id/description
POST   /incidents/:id/comment
GET    /incidents/:id/activities

GET    /tickets
POST   /tickets
GET    /tickets/:id
PATCH  /tickets/:id
DELETE /tickets/:id
PATCH  /tickets/:id/status
PATCH  /tickets/:id/priority
PATCH  /tickets/:id/assign
PATCH  /tickets/:id/link-incident
POST   /tickets/:id/comment
GET    /tickets/:id/activities

GET    /tenants
POST   /tenants
GET    /tenants/:id
PATCH  /tenants/:id
DELETE /tenants/:id

GET    /dashboard/stats
GET    /users
```

## Getting Started

### Prerequisites

- Node.js 20+
- Docker (for PostgreSQL)

### 1. Start PostgreSQL

```bash
docker run -d --name postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:16-alpine
```

### 2. Backend

```bash
cd incident-manager-api
cp .env.example .env
npm install
npm run db:push               # apply schema
npm run db:seed               # load sample data
npm run start:dev             # http://localhost:3001
```

**`incident-manager-api/.env.example`**

```env
DATABASE_URL=
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN_SECONDS=86400
FRONTEND_URL=
PORT=3001
```

### 3. Frontend

```bash
cd incident-manager-ui
cp .env.example .env.local
npm install
npm run dev                   # http://localhost:3000
```

**`incident-manager-ui/.env.example`**

```env
NEXT_PUBLIC_API_URL=
```

### Docker (API)

```bash
cd incident-manager-api
docker build -t incident-manager-api .
docker run --rm -p 3001:3001 --env-file local.env incident-manager-api
```
