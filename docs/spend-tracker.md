# Spend Tracker — Technical Documentation

Spend Tracker is a lightweight personal expense-tracking application for recording day-to-day spending, reviewing monthly and yearly totals, and understanding where money is being spent by category.

The MVP is intentionally simple: **Ionic Angular frontend → Spring Boot REST API → Supabase PostgreSQL**.

---

## 🏗 System Architecture

### Application Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                         User Device                         │
│                iPhone / Desktop / Browser                  │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Ionic Angular Frontend                   │
│                                                             │
│  • Dashboard                                                │
│  • Month / Year filters                                     │
│  • Category donut chart                                     │
│  • Add Expense sheet                                        │
│  • Edit / Delete transaction                                │
└────────────────────────────┬────────────────────────────────┘
                             │
                        REST /api/*
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Spring Boot Backend                      │
│                                                             │
│  ExpenseController                                          │
│          │                                                  │
│          ▼                                                  │
│  ExpenseRepository                                          │
│          │                                                  │
│          ▼                                                  │
│  Spring Data JPA / Hibernate                                │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase PostgreSQL                      │
│                                                             │
│                         expenses                            │
└─────────────────────────────────────────────────────────────┘
```

### Production Deployment Architecture

The frontend and backend are deployed together as a single application.

```text
                        GitHub
                           │
                           ▼
                  Render Web Service
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
      Ionic Angular Build        Spring Boot API
       static HTML/JS/CSS         /api/expenses
              │                         │
              └────────────┬────────────┘
                           │
                           ▼
                  Supabase PostgreSQL
```

### Request Flow

1. The user opens the Spend Tracker application.
2. Ionic Angular loads the selected month or year.
3. The frontend calls the Spring Boot REST API.
4. Spring Boot validates the request.
5. Spring Data JPA queries Supabase PostgreSQL.
6. Expense records are returned to Angular.
7. Angular calculates the visible dashboard totals and category percentages.
8. The UI renders the summary card, category donut, and transaction list.

> The frontend does **not** connect directly to PostgreSQL.

---

## 🗄 Database Architecture

### Current Database Model

The personal MVP currently requires one primary application table.

```text
┌───────────────────────────┐
│         expenses          │
├───────────────────────────┤
│ id                        │
│ amount                    │
│ category                  │
│ merchant                  │
│ description               │
│ expense_date              │
│ payment_method            │
│ notes                     │
│ created_at                │
└───────────────────────────┘
```

### Table Summary

| Table | Purpose | Important Fields |
|---|---|---|
| `expenses` | Stores every recorded spending transaction | `id`, `amount`, `category`, `merchant`, `expense_date`, `payment_method`, `created_at` |

### `expenses` Table

| Column | Java Type | Database Purpose | Required |
|---|---|---|---|
| `id` | `Long` | Primary key | Yes |
| `amount` | `BigDecimal` | Expense amount | Yes |
| `category` | `ExpenseCategory` | Spending category stored as text | Yes |
| `merchant` | `String` | Store, company, or merchant name | No |
| `description` | `String` | Short expense description | No |
| `expense_date` | `LocalDate` | Date the spending occurred | Yes |
| `payment_method` | `String` | Credit card, cash, Apple Pay, etc. | No |
| `notes` | `String` | Optional user notes | No |
| `created_at` | `OffsetDateTime` | Record creation timestamp | Yes |

### Entity Constraints

Current `Expense` validation includes:

```text
amount > 0
category required
expenseDate required
```

The amount column is stored with:

```text
precision = 12
scale = 2
```

This supports normal personal-finance values while preserving cents accurately.

---

## 🧾 Expense Categories

Categories are currently represented by the backend `ExpenseCategory` enum rather than a database table.

| Enum Value | UI Label |
|---|---|
| `HOUSING` | Housing |
| `GROCERIES` | Groceries |
| `FOOD_AND_DINING` | Food & Dining |
| `TRANSPORTATION` | Transportation |
| `CAR` | Car |
| `UTILITIES` | Utilities |
| `SHOPPING` | Shopping |
| `HEALTH` | Health |
| `SUBSCRIPTIONS` | Subscriptions |
| `ENTERTAINMENT` | Entertainment |
| `TRAVEL` | Travel |
| `EDUCATION` | Education |
| `PERSONAL_CARE` | Personal Care |
| `INSURANCE` | Insurance |
| `FAMILY_AND_GIFTS` | Family & Gifts |
| `FEES_AND_TAXES` | Fees & Taxes |
| `OTHER` | Other |

### Category Design Decision

Using a Java enum keeps the MVP simple because:

1. Categories are fixed.
2. No category-management table is required.
3. Frontend and backend validation remain predictable.
4. Category values can be stored as readable PostgreSQL strings.

If user-defined categories are introduced later, this should be migrated to a `categories` table.

---

## 💳 Supported Payment Methods

The current frontend offers:

```text
Credit Card
Debit Card
Cash
Apple Pay
Bank Transfer
Other
```

Payment method is currently stored as text in the expense record.

---

## 🔌 API Reference

Base path:

```text
/api/expenses
```

### Get All Expenses

```http
GET /api/expenses
```

Returns all stored transactions ordered by expense date descending.

### Get Monthly Expenses

```http
GET /api/expenses?year=2026&month=8
```

Example result scope:

```text
2026-08-01 through 2026-08-31
```

### Get Yearly Expenses

```http
GET /api/expenses?year=2026
```

Example result scope:

```text
2026-01-01 through 2026-12-31
```

### Create Expense

```http
POST /api/expenses
Content-Type: application/json
```

Example:

```json
{
  "amount": 63.42,
  "category": "GROCERIES",
  "merchant": "Kroger",
  "description": "Weekly groceries",
  "expenseDate": "2026-08-22",
  "paymentMethod": "Credit Card",
  "notes": "First expense"
}
```

### Update Expense

```http
PUT /api/expenses/{id}
Content-Type: application/json
```

Example:

```json
{
  "amount": 19.98,
  "category": "CAR",
  "merchant": "Fuel",
  "description": "Fuel",
  "expenseDate": "2026-08-22",
  "paymentMethod": "Credit Card",
  "notes": ""
}
```

### Delete Expense

```http
DELETE /api/expenses/{id}
```

Successful deletion:

```text
204 No Content
```

### Get Categories

```http
GET /api/expenses/categories
```

Returns the supported backend enum values.

---

## 🔄 Expense CRUD Flow

### Add Expense

```text
User taps +
    │
    ▼
Add Expense sheet
    │
    ├── Amount
    ├── Category
    ├── Merchant
    ├── Date
    ├── Payment Method
    ├── Description
    └── Notes
    │
    ▼
Frontend validation
    │
    ▼
POST /api/expenses
    │
    ▼
Spring Boot validation
    │
    ▼
Supabase PostgreSQL
    │
    ▼
Reload selected period
    │
    ▼
Dashboard updates
```

### Edit Expense

```text
Transaction
    │
    ▼
Tap transaction / ...
    │
    ▼
Edit Expense sheet
    │
    ▼
PUT /api/expenses/{id}
    │
    ▼
Database update
    │
    ▼
Reload selected period
```

### Delete Expense

```text
Edit Expense
    │
    ▼
Delete Expense
    │
    ▼
Confirmation
    │
    ▼
DELETE /api/expenses/{id}
    │
    ▼
Reload selected period
```

---

## 📊 Monthly and Yearly Filtering

The dashboard supports two period modes:

```text
Month
Year
```

### Month Mode

Month mode sends:

```http
GET /api/expenses?year={year}&month={month}
```

The backend converts the year/month into:

```text
startDate = first day of month
endDate   = last day of month
```

Example:

```text
August 2026

startDate = 2026-08-01
endDate   = 2026-08-31
```

### Year Mode

Year mode sends:

```http
GET /api/expenses?year={year}
```

The backend converts the year into:

```text
startDate = January 1
endDate   = December 31
```

---

## 📈 Dashboard Analytics

The current frontend calculates analytics from the filtered transaction collection.

### Total Spending

```text
totalSpent = sum(expense.amount)
```

### Category Total

For every category:

```text
categoryTotal = sum(expenses in category)
```

### Category Percentage

```text
categoryPercentage =
    categoryTotal / totalSpent * 100
```

### Donut Chart

The current category chart uses a CSS:

```text
conic-gradient(...)
```

Each visible category receives a configured UI color and contributes a percentage slice to the donut.

Example:

```text
Total: $88.39

Groceries      $63.42    72%
Car            $19.98    23%
Entertainment   $4.99     6%
```

### Budget

The current MVP uses:

```text
Monthly budget = $2,500
```

This value is currently frontend configuration, not persisted in the database.

Year-mode budget is calculated as:

```text
monthlyBudget * 12
```

> A configurable budget/settings table is a future enhancement.

---

## 🖥 Frontend Architecture

### Technology

```text
Ionic Angular 9
Angular 22
TypeScript
SCSS
Angular HttpClient
Angular Forms
```

### Frontend Responsibilities

- Display monthly/yearly filters
- Display total spending
- Display remaining budget
- Calculate visible category totals
- Render category donut
- Render transactions
- Add new expenses
- Edit existing expenses
- Delete expenses
- Call Spring Boot REST endpoints
- Switch API URL between local and production modes

### API URL Behavior

Development:

```text
http://localhost:8080/api/expenses
```

Production:

```text
/api/expenses
```

This allows the frontend and backend to share the same Render domain in production.

---

## ☕ Backend Architecture

### Technology

```text
Java 21
Spring Boot
Spring Web
Spring Data JPA
Hibernate
Bean Validation
PostgreSQL JDBC Driver
Maven Wrapper
```

### Backend Responsibilities

- REST API routing
- Input validation
- PostgreSQL persistence
- Month/year date-range filtering
- Expense creation
- Expense update
- Expense deletion
- Category exposure
- Production static frontend hosting

---

## 🧩 Backend Components

| File | Responsibility |
|---|---|
| `SpendTrackerApplication.java` | Spring Boot application entry point |
| `Expense.java` | JPA entity for expense records |
| `ExpenseCategory.java` | Supported expense categories |
| `ExpenseRepository.java` | JPA persistence and date-range queries |
| `ExpenseController.java` | Expense REST endpoints |
| `CorsConfig.java` | Local frontend/backend CORS configuration |
| `SpaController.java` | Forwards frontend routes to `index.html` |
| `application.properties` | Runtime/database configuration |

---

## 🧩 Frontend Components

| File | Responsibility |
|---|---|
| `home.page.ts` | Dashboard state, analytics, CRUD behavior, period selection |
| `home.page.html` | Dashboard, chart, transactions, add/edit sheet |
| `home.page.scss` | Mobile-first dashboard and sheet styling |
| `expense.service.ts` | Expense API client |
| `app.config.ts` | Ionic, router, and HttpClient providers |
| `app.routes.ts` | Frontend routing |

---

## 🗂 Implementation File Map

```text
spend-tracker/
│
├── backend/
│   ├── .mvn/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/spendtracker/
│   │   │   │   ├── SpendTrackerApplication.java
│   │   │   │   ├── config/
│   │   │   │   │   └── CorsConfig.java
│   │   │   │   ├── controller/
│   │   │   │   │   ├── ExpenseController.java
│   │   │   │   │   └── SpaController.java
│   │   │   │   ├── model/
│   │   │   │   │   ├── Expense.java
│   │   │   │   │   └── ExpenseCategory.java
│   │   │   │   └── repository/
│   │   │   │       └── ExpenseRepository.java
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   ├── pom.xml
│   ├── mvnw
│   └── mvnw.cmd
│
├── frontend/
│   ├── src/
│   │   └── app/
│   │       ├── home/
│   │       │   ├── home.page.ts
│   │       │   ├── home.page.html
│   │       │   └── home.page.scss
│   │       ├── services/
│   │       │   └── expense.service.ts
│   │       ├── app.config.ts
│   │       └── app.routes.ts
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

---

## ⚙️ Configuration

### `application.properties`

Production-safe configuration:

```properties
spring.application.name=spend-tracker-api

server.port=${PORT:8080}

spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
spring.datasource.driver-class-name=org.postgresql.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.open-in-view=false

spring.datasource.hikari.maximum-pool-size=5
spring.datasource.hikari.minimum-idle=1
```

### Environment Variables

| Variable | Purpose |
|---|---|
| `DB_URL` | PostgreSQL JDBC connection URL |
| `DB_USERNAME` | PostgreSQL username |
| `DB_PASSWORD` | PostgreSQL password |
| `PORT` | Server port supplied by hosting environment |

> Real database credentials must not appear in source control.

---

## 🐘 Supabase Configuration

Supabase provides the PostgreSQL database.

Spring Boot connects using the PostgreSQL JDBC driver rather than accessing the database through the Supabase JavaScript client.

Current architecture:

```text
Angular
   │
   ▼
Spring Boot
   │
 JDBC
   │
   ▼
Supabase PostgreSQL
```

The Supabase API keys are not required for the current backend database connection.

---

## 🔐 Security Requirements

### Current MVP

The current application is intended for private personal use.

Currently implemented:

- Database credentials stored outside source code
- Spring Boot database access
- Backend validation
- No credentials committed to Git
- CORS restricted for local development origins

### Not Yet Implemented

- User authentication
- Authorization
- Per-user data ownership
- JWT
- Supabase Auth
- Row Level Security
- Multi-user isolation
- Rate limiting
- Public API protection

> Do not treat the current MVP as a secure public multi-user finance application.

Before public multi-user release, every expense must be associated with an authenticated user and queries must be restricted to that user.

---

## 🐳 Docker Architecture

The root `Dockerfile` uses a multi-stage build.

### Stage 1 — Frontend Build

```text
Node 22
   │
npm ci
   │
npm run build
   │
frontend/www
```

### Stage 2 — Backend Build

```text
Java 21 JDK
   │
Maven Wrapper
   │
Copy frontend/www
   │
src/main/resources/static
   │
Spring Boot package
```

### Stage 3 — Runtime

```text
Java 21 JRE
   │
app.jar
   │
Render
```

This allows a single Render Web Service to host:

```text
/
→ Ionic application

/api/*
→ Spring Boot REST API
```

---

## 🚀 Render Deployment

Target deployment:

```text
GitHub
   │
   ▼
Render
   │
   ├── Docker build
   ├── DB_URL
   ├── DB_USERNAME
   └── DB_PASSWORD
   │
   ▼
Spend Tracker
```

### Required Render Environment Variables

```text
DB_URL
DB_USERNAME
DB_PASSWORD
```

`PORT` is supplied by Render and Spring Boot reads it using:

```properties
server.port=${PORT:8080}
```

---

## 🧪 Validation Checklist

### Backend

- [ ] Spring Boot starts successfully with Java 21
- [ ] PostgreSQL connection succeeds
- [ ] `POST /api/expenses` creates an expense
- [ ] `GET /api/expenses` returns transactions
- [ ] Monthly filter returns only selected-month data
- [ ] Year filter returns only selected-year data
- [ ] `PUT /api/expenses/{id}` updates an expense
- [ ] `DELETE /api/expenses/{id}` removes an expense
- [ ] Invalid month/year returns a client error

### Frontend

- [ ] Dashboard loads expenses
- [ ] Month filter changes the visible transaction set
- [ ] Year filter changes the visible transaction set
- [ ] Total spending recalculates correctly
- [ ] Category totals recalculate correctly
- [ ] Donut chart matches category percentages
- [ ] Add Expense saves successfully
- [ ] Edit Expense saves successfully
- [ ] Delete Expense works successfully
- [ ] Empty periods display an empty state
- [ ] Mobile layout works at iPhone-sized widths

### Deployment

- [ ] `npm run build` succeeds
- [ ] Frontend output is generated under `frontend/www`
- [ ] Docker image builds
- [ ] Spring Boot serves `index.html`
- [ ] Production frontend calls relative `/api/expenses`
- [ ] Render environment variables are configured
- [ ] Render service can reach Supabase
- [ ] Direct `/home` navigation loads the SPA
- [ ] Database credentials are absent from Git history

---

## ✅ Architecture Decisions

### 1. Standalone Product

Spend Tracker is an independent application rather than a module inside another finance system.

### 2. Web-First Mobile Design

The frontend uses Ionic Angular so the same UI can support:

```text
Web
PWA
iOS through Capacitor
Android through Capacitor
```

without creating separate application codebases.

### 3. Spring Boot Owns Database Access

The browser does not connect directly to the database.

```text
Frontend
   ↓
Spring Boot
   ↓
PostgreSQL
```

This leaves room for authentication, validation, business rules, and API security later.

### 4. One Production Service

Frontend and backend are packaged together into one Render service.

Benefits:

- One deployment
- One public domain
- Relative `/api` URLs
- Simpler CORS
- Simpler personal hosting
- Lower infrastructure complexity

### 5. Supabase as PostgreSQL Hosting

Supabase is currently used primarily as managed PostgreSQL storage.

### 6. Categories as Enum

Fixed categories remain in code for the MVP.

### 7. Analytics Calculated in Frontend

Filtered expense records are returned by the backend, while the visible category totals and donut percentages are calculated in Angular.

This is appropriate for the current personal-data volume.

For a larger multi-user product, summary endpoints may be moved to SQL/backend aggregation.

### 8. Budget Is Currently Static

The monthly budget is currently configured in the frontend.

A future version should persist budget settings.

---

## 🔮 Future Improvements

### Receipt Scanning

Planned flow:

```text
Take receipt photo
        │
        ▼
Receipt processing
        │
        ├── Merchant
        ├── Date
        ├── Total
        └── Category suggestion
        │
        ▼
User review
        │
        ▼
Save Expense
```

The first receipt-scanning version should focus on:

```text
merchant
date
total
category
```

rather than attempting full line-item extraction.

### Merchant Category Memory

Example:

```text
Kroger     → Groceries
Shell      → Transportation / Car
Netflix    → Subscriptions
Starbucks  → Food & Dining
```

User corrections can later be persisted and reused.

### Configurable Budget

Future data model may include:

```text
budgets
-------
id
user_id
year
month
amount
```

### Yearly Trend Chart

Year view can be enhanced with:

```text
Jan
Feb
Mar
...
Dec
```

monthly totals so the user can see spending trends across the selected year.

### Recurring Expenses

Potential detection:

```text
Netflix
Rent
Insurance
Phone
Internet
Subscriptions
```

### Authentication

Before public release:

```text
users
expenses.user_id
authentication
authorization
per-user filtering
```

must be added.

### PWA

Planned:

- Web app manifest
- Application icons
- Service worker
- Add to Home Screen
- Standalone display mode

### Native Mobile

Capacitor can later package the frontend for:

```text
iOS
Android
```

without replacing the current Ionic Angular UI.

---

## 📌 Current MVP Scope

Implemented:

```text
✅ Supabase PostgreSQL
✅ Spring Boot REST backend
✅ Ionic Angular frontend
✅ Add expense
✅ Edit expense
✅ Delete expense
✅ Month filtering
✅ Year filtering
✅ Category totals
✅ Category percentage breakdown
✅ Donut visualization
✅ Budget progress
✅ Responsive mobile UI
✅ Docker deployment structure
```

Not yet implemented:

```text
❌ Authentication
❌ Multiple users
❌ Receipt scanning
❌ PWA installation configuration
❌ Native iOS build
❌ Native Android build
❌ Persisted budget settings
❌ Recurring expense detection
❌ Notifications
```

---

## 📚 Maintenance Notes

When adding a new expense field:

1. Update `Expense.java`.
2. Confirm PostgreSQL schema behavior.
3. Update create/edit request payloads.
4. Update `expense.service.ts`.
5. Update the Add/Edit Expense form.
6. Update documentation.
7. Test create and update flows.

When adding a new category:

1. Update `ExpenseCategory.java`.
2. Update frontend `categories`.
3. Assign a label/icon/color.
4. Test donut/category calculations.
5. Update this document.

When adding a new protected feature:

1. Add authentication first.
2. Associate expenses with the authenticated user.
3. Never accept a frontend-provided user ID as authorization proof.
4. Restrict backend queries to the authenticated principal.
5. Add security tests.
