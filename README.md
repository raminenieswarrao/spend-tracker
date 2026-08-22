# Spend Tracker

A lightweight personal expense tracker built with **Spring Boot**, **Ionic Angular**, and **Supabase PostgreSQL**.

The application is designed as a simple mobile-first spending tracker that can run in a browser today and later be packaged as a PWA or native iOS/Android application.

## ✨ Current Features

- Add expenses
- Edit expenses
- Delete expenses
- Monthly expense filtering
- Yearly expense filtering
- Category-based spending totals
- Category percentage breakdown
- Donut chart for category distribution
- Monthly budget tracking
- Recent transaction history
- Responsive mobile-first UI
- Persistent PostgreSQL storage through Supabase
- Single-container deployment design for Render

## 🧰 Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Ionic Angular 9 / Angular 22 |
| Backend | Spring Boot / Java 21 |
| API | REST |
| Database | Supabase PostgreSQL |
| Persistence | Spring Data JPA / Hibernate |
| Build | Maven Wrapper + npm |
| Deployment | Docker + Render |
| Mobile Strategy | Web first; PWA / Capacitor later |

## 🏗 Project Structure

```text
spend-tracker/
│
├── backend/
│   ├── src/
│   ├── pom.xml
│   ├── mvnw
│   └── mvnw.cmd
│
├── frontend/
│   ├── src/
│   ├── angular.json
│   ├── package.json
│   └── capacitor.config.ts
│
├── docs/
│   └── spend-tracker.md
│
├── Dockerfile
├── .dockerignore
├── .gitignore
└── README.md
```

## 🏛 High-Level Architecture

```text
               iPhone / Browser
                      │
                      ▼
              Ionic Angular UI
                      │
                 REST /api/*
                      │
                      ▼
                Spring Boot
                      │
               Spring Data JPA
                      │
                      ▼
            Supabase PostgreSQL
```

For production, the Ionic build is copied into Spring Boot static resources and both frontend and backend are served from one Render Web Service.

```text
GitHub
   │
   ▼
Render Web Service
   ├── Ionic Angular static application
   └── Spring Boot REST API
              │
              ▼
       Supabase PostgreSQL
```

## 🗄 Main Database Table

The MVP currently uses one main table:

```text
expenses
```

Important fields:

```text
id
amount
category
merchant
description
expense_date
payment_method
notes
created_at
```

See [`docs/spend-tracker.md`](docs/spend-tracker.md) for the complete architecture and database documentation.

## 🔌 Main API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/expenses` | Get all expenses |
| GET | `/api/expenses?year=2026&month=8` | Get expenses for a month |
| GET | `/api/expenses?year=2026` | Get expenses for a year |
| POST | `/api/expenses` | Create an expense |
| PUT | `/api/expenses/{id}` | Update an expense |
| DELETE | `/api/expenses/{id}` | Delete an expense |
| GET | `/api/expenses/categories` | Get supported categories |

## ⚙️ Environment Variables

Spring Boot reads database credentials from environment variables.

```text
DB_URL
DB_USERNAME
DB_PASSWORD
```

The application also supports:

```text
PORT
```

`PORT` defaults to `8080` locally and is supplied by Render in production.

> Database credentials must never be committed to GitHub.

## ▶️ Local Development

### Backend

Set the Supabase PostgreSQL environment variables in PowerShell:

```powershell
$env:DB_URL="jdbc:postgresql://YOUR_HOST:5432/postgres?sslmode=require"
$env:DB_USERNAME="YOUR_USERNAME"
$env:DB_PASSWORD="YOUR_PASSWORD"

cd backend
.\mvnw.cmd spring-boot:run
```

Backend:

```text
http://localhost:8080
```

### Frontend

```powershell
cd frontend
ionic serve
```

Frontend:

```text
http://localhost:8100
```

In development, the frontend calls:

```text
http://localhost:8080/api/expenses
```

In production, it calls:

```text
/api/expenses
```

## 📦 Production Build

Build the frontend:

```powershell
cd frontend
npm run build
```

Angular/Ionic production output:

```text
frontend/www
```

The root `Dockerfile` builds the frontend, copies it into Spring Boot static resources, packages the backend JAR, and runs the entire application as one container.

## 🔐 Current Security Scope

This is currently a **single-user personal MVP**.

Not yet implemented:

- Login
- Authentication
- User accounts
- Per-user database isolation
- Row Level Security
- Public multi-user access

These must be added before exposing the application as a public multi-user product.

## 🔮 Planned Improvements

- PWA installation support
- iPhone Home Screen installation
- Receipt image scanning
- Automatic receipt field extraction
- Merchant/category auto-detection
- Configurable monthly budget
- Yearly monthly-spending chart
- Recurring expense detection
- Notifications
- Search and transaction filters
- Authentication
- Multiple users
- App Store / Play Store packaging with Capacitor

## 📚 Documentation

Full technical documentation:

[`docs/spend-tracker.md`](docs/spend-tracker.md)
