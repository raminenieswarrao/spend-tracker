# Spend Tracker — Technical Documentation

Spend Tracker is a secure personal expense-tracking application for recording day-to-day spending, reviewing monthly and yearly totals, understanding spending by category, and quickly recording common merchants.

The current architecture is:

**Ionic Angular frontend → Spring Boot REST API → Supabase PostgreSQL**

The frontend and backend are deployed together as a single Render Web Service.

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
│  • Login / Registration                                     │
│  • Dashboard                                                │
│  • Month / Year filters                                     │
│  • Category donut chart                                     │
│  • Add / Edit Expense sheet                                 │
│  • Quick Merchant selection                                 │
│  • Merchant logos                                           │
│  • Logout                                                   │
└────────────────────────────┬────────────────────────────────┘
                             │
                         /api/*
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Spring Boot Backend                      │
│                                                             │
│  Spring Security                                            │
│  JWT authentication                                         │
│  HttpOnly authentication cookies                            │
│  CSRF protection                                            │
│                                                             │
│  AuthController                                             │
│  ExpenseController                                          │
│  HealthController                                           │
│                                                             │
│  Spring Data JPA / Hibernate                                │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase PostgreSQL                      │
│                                                             │
│  users                                                      │
│  refresh_tokens                                             │
│  expenses                                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Production Deployment Architecture

The frontend and backend are deployed together.

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
       static HTML/JS/CSS             /api/*
              │                         │
              └────────────┬────────────┘
                           │
                           ▼
                  Supabase PostgreSQL
```

Production URL:

```text
https://spend-tracker-4hm4.onrender.com
```

The Angular application and Spring Boot API share the same production origin.

This simplifies:

- Authentication cookies
- CSRF handling
- CORS
- Deployment
- API URL configuration

---

# 🔐 Authentication Architecture

Spend Tracker now supports secure multi-user authentication.

Authentication uses:

```text
Email + Password
       │
       ▼
Spring Security
       │
       ├── BCrypt password hashing
       │
       ├── JWT access token
       │
       └── Refresh token
```

Tokens are not stored in browser local storage.

They are stored in cookies.

---

## Access Token

The access token is a JWT.

Properties:

```text
Lifetime: 15 minutes
Algorithm: HMAC SHA-256
Issuer: spend-tracker-api
```

The JWT contains:

```text
subject = user ID
role
jti
issued time
expiration time
```

Sensitive user information and passwords are not included.

The access token is stored in:

```text
access_token
```

Cookie configuration:

```text
HttpOnly = true
Path = /
SameSite = Lax
Secure = configurable
```

Production uses:

```text
APP_SECURITY_COOKIE_SECURE=true
```

---

## Refresh Token

Refresh tokens are:

```text
32 random bytes
Base64 URL encoded
```

Only a SHA-256 hash of the refresh token is stored in PostgreSQL.

The browser stores the raw token in:

```text
refresh_token
```

Configuration:

```text
HttpOnly = true
Path = /api/auth
SameSite = Lax
Lifetime = 7 days
```

Refresh tokens are rotated whenever they are used.

The previous token becomes revoked.

---

## Refresh Token Replay Protection

If an already-revoked refresh token is presented again:

```text
revoked refresh token detected
        │
        ▼
possible token replay
        │
        ▼
revoke active refresh tokens for user
```

This provides protection against stolen refresh-token reuse.

---

## Password Security

Passwords are hashed using:

```text
BCrypt
strength = 12
```

Raw passwords are never stored.

---

## Login Protection

Failed login attempts are tracked.

Current behavior:

```text
5 failed attempts
      │
      ▼
Account locked
      │
      ▼
15 minutes
```

Authentication failures return a generic response:

```text
Invalid email or password.
```

This prevents revealing whether a particular email exists during login.

---

# 🛡 CSRF Protection

Because authentication uses cookies, state-changing requests are protected with CSRF tokens.

The frontend requests:

```http
GET /api/auth/csrf
```

The backend returns the CSRF token.

The frontend then sends it through:

```text
X-XSRF-TOKEN
```

for operations such as:

```text
POST expense
PUT expense
DELETE expense
POST refresh
POST logout
```

---

# 👤 User Data Isolation

Every expense belongs to an authenticated user.

```text
users
  │
  └── expenses
        user_id
```

The backend obtains the user ID from the authenticated JWT.

The frontend never decides ownership.

For example, expense creation works conceptually as:

```text
JWT
 │
 ▼
authenticated user ID
 │
 ▼
Expense.user = authenticated user
```

The client does not send a trusted `userId`.

---

## Cross-User Protection

Expense queries use the authenticated user ID.

Examples:

```text
findAllByUser_Id...
findByIdAndUser_Id...
```

Therefore:

```text
User A cannot read User B expense
User A cannot edit User B expense
User A cannot delete User B expense
```

Cross-user resource access behaves as if the expense does not exist.

---

# 🗄 Database Architecture

The application currently uses three primary tables.

```text
┌───────────────────────┐
│        users          │
├───────────────────────┤
│ id                    │
│ name                  │
│ email                 │
│ password_hash         │
│ role                  │
│ enabled               │
│ email_verified        │
│ failed_login_attempts │
│ locked_until          │
│ created_at            │
│ updated_at            │
└───────────┬───────────┘
            │
            │
      ┌─────┴────────────┐
      ▼                  ▼
┌───────────────┐  ┌─────────────────┐
│   expenses    │  │ refresh_tokens  │
├───────────────┤  ├─────────────────┤
│ id            │  │ id              │
│ user_id       │  │ user_id         │
│ amount        │  │ token_hash      │
│ category      │  │ expires_at      │
│ merchant      │  │ revoked         │
│ description   │  │ created_at      │
│ expense_date  │  │ revoked_at      │
│ payment_method│  └─────────────────┘
│ notes         │
│ created_at    │
└───────────────┘
```

---

## `users`

Stores application users.

Important fields:

| Column | Purpose |
|---|---|
| `id` | Primary key |
| `name` | User display name |
| `email` | Unique login email |
| `password_hash` | BCrypt password hash |
| `role` | USER or ADMIN |
| `enabled` | Account enabled state |
| `email_verified` | Email verification state |
| `failed_login_attempts` | Login protection |
| `locked_until` | Temporary account lock |
| `created_at` | Creation timestamp |
| `updated_at` | Update timestamp |

---

## `refresh_tokens`

Stores refresh-token hashes.

| Column | Purpose |
|---|---|
| `id` | Primary key |
| `user_id` | Token owner |
| `token_hash` | SHA-256 token hash |
| `expires_at` | Expiration time |
| `revoked` | Revocation state |
| `created_at` | Creation timestamp |
| `revoked_at` | Revocation timestamp |

Raw refresh tokens are never stored.

---

## `expenses`

Stores user expense records.

| Column | Java Type | Purpose |
|---|---|---|
| `id` | `Long` | Primary key |
| `user_id` | `User` | Expense owner |
| `amount` | `BigDecimal` | Expense amount |
| `category` | `ExpenseCategory` | Expense category |
| `merchant` | `String` | Merchant name |
| `description` | `String` | Optional description |
| `expense_date` | `LocalDate` | Expense date |
| `payment_method` | `String` | Payment method |
| `notes` | `String` | Optional notes |
| `created_at` | `OffsetDateTime` | Creation timestamp |

Important indexes include:

```text
user_id
user_id + expense_date
```

---

# 🧾 Expense Categories

Current backend categories:

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

Categories remain code-based rather than database-managed.

---

# 💳 Payment Methods

Current frontend values:

```text
Credit Card
Debit Card
Cash
Apple Pay
Bank Transfer
Other
```

---

# ⚡ Quick Merchant Selection

The Add Expense form supports category-specific Quick Merchants.

Example:

```text
Food & Dining
      │
      ▼
McDonald's
Chick-fil-A
Chipotle
Starbucks
Subway
Taco Bell
Other
```

Selecting:

```text
McDonald's
```

automatically fills:

```text
merchant = McDonald's
```

The Merchant input remains editable.

---

## Food & Dining Merchants

Current configured merchants:

```text
McDonald's
Chick-fil-A
Chipotle
Starbucks
Subway
Taco Bell
Other
```

Merchant images are stored under:

```text
frontend/src/assets/icon/food/
```

---

## Car / Fuel Merchants

Current configured merchants:

```text
Shell
BP
Speedway
Exxon
Marathon
Kroger Fuel
Meijer
QuikTrip
Sheetz
Other
```

Merchant assets are stored under:

```text
frontend/src/assets/icon/fuel/
```

---

# 🖼 Merchant Logo Fallback

Transaction rows can resolve a merchant image from the Quick Merchant configuration.

Example:

```text
Food & Dining + McDonald's
        │
        ▼
mcdonalds.png
```

For manually entered merchants:

```text
Food & Dining + Namaste India
        │
        ▼
No predefined merchant match
        │
        ▼
Food "Other" image
```

Fuel works the same way:

```text
CAR + Shell
→ Shell image

CAR + Local Fuel Station
→ Fuel Other image
```

For categories where Quick Merchants have not yet been configured, the normal category emoji remains the fallback.

---

# 🧩 Quick Merchant Architecture

Merchant definitions are intentionally separated from `home.page.ts`.

```text
home/
│
├── config/
│   └── merchants.config.ts
│
├── models/
│   └── home.models.ts
│
├── home.page.ts
├── home.page.html
└── home.page.scss
```

`merchants.config.ts` stores merchant configuration and merchant lookup helpers.

This prevents `home.page.ts` from continuously growing as new merchants are introduced.

Important helper functions include:

```text
getQuickMerchants()
getQuickMerchantByName()
getOtherMerchant()
getMerchantImage()
```

---

# 🔌 Authentication API

Base path:

```text
/api/auth
```

---

## Register

```http
POST /api/auth/register
```

Request:

```json
{
  "name": "Example User",
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "confirmPassword": "SecurePassword123!"
}
```

---

## Login

```http
POST /api/auth/login
```

Request:

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

Successful login creates authentication cookies.

---

## Current User

```http
GET /api/auth/me
```

Requires a valid access token.

Returns the currently authenticated user's public information.

---

## CSRF Token

```http
GET /api/auth/csrf
```

Returns CSRF token information used by the frontend.

---

## Refresh Session

```http
POST /api/auth/refresh
```

Uses the refresh-token cookie.

The old refresh token is revoked and replaced.

---

## Logout

```http
POST /api/auth/logout
```

Revokes the refresh token and clears authentication cookies.

---

# 🔌 Expense API

Base path:

```text
/api/expenses
```

All expense operations require authentication.

All results are scoped to the authenticated user.

---

## Get Expenses

```http
GET /api/expenses
```

---

## Monthly Expenses

```http
GET /api/expenses?year=2026&month=9
```

Returns the authenticated user's expenses for the selected month.

---

## Yearly Expenses

```http
GET /api/expenses?year=2026
```

Returns the authenticated user's expenses for the selected year.

---

## Create Expense

```http
POST /api/expenses
```

Example:

```json
{
  "amount": 18.54,
  "category": "FOOD_AND_DINING",
  "merchant": "Namaste India",
  "description": "",
  "expenseDate": "2026-09-01",
  "paymentMethod": "Credit Card",
  "notes": ""
}
```

The backend determines the owner from authentication.

The request does not contain a trusted user ID.

---

## Update Expense

```http
PUT /api/expenses/{id}
```

Only the owner can update the expense.

---

## Delete Expense

```http
DELETE /api/expenses/{id}
```

Only the owner can delete the expense.

Successful response:

```text
204 No Content
```

---

# ❤️ Health Endpoint

Render uses:

```http
GET /api/health
```

Expected response:

```json
{
  "status": "UP"
}
```

This endpoint is publicly accessible so Render can verify application health without authentication.

---

# 📊 Dashboard Analytics

Angular calculates dashboard analytics from the authenticated user's filtered expenses.

---

## Total Spending

```text
totalSpent =
    sum(expense.amount)
```

---

## Category Totals

```text
categoryTotal =
    sum(expenses belonging to category)
```

---

## Category Percentage

```text
categoryPercentage =
    categoryTotal
    / totalSpent
    * 100
```

---

## Donut Chart

The donut uses:

```text
conic-gradient(...)
```

Category colors are configured in Angular.

---

# 💰 Budget

Current monthly budget:

```text
$2,500
```

This is currently configured in the frontend.

Year mode uses:

```text
monthlyBudget * 12
```

Budget configuration is not yet persisted.

---

# 🖥 Frontend Architecture

Technology:

```text
Ionic Angular 9
Angular 22
TypeScript
SCSS
Angular HttpClient
Angular Forms
```

Frontend responsibilities:

- Registration
- Login
- Session restoration
- Logout
- CSRF handling
- Month/year selection
- Expense dashboard
- Analytics
- Add expense
- Edit expense
- Delete expense
- Quick Merchant selection
- Merchant image selection
- Protected frontend routes

---

## Frontend API URL Behavior

Development:

```text
http://localhost:8080/api/*
```

Production:

```text
/api/*
```

Production therefore uses the same origin as the Angular application.

---

# 🔐 Frontend Authentication

Authentication logic lives in:

```text
services/auth.service.ts
```

The service:

```text
login
register
get current user
restore session
refresh session
logout
```

All relevant requests use:

```text
withCredentials: true
```

JWT tokens are not stored in:

```text
localStorage
sessionStorage
```

---

# 🛡 Route Protection

The Home page is protected by:

```text
guards/auth.guard.ts
```

Unauthenticated users attempting to access:

```text
/home
```

are redirected to:

```text
/login
```

---

# ☕ Backend Architecture

Technology:

```text
Java 21
Spring Boot 4
Spring Security
Spring Web
Spring Data JPA
Hibernate
Bean Validation
PostgreSQL
Maven Wrapper
```

Backend responsibilities:

- Registration
- Authentication
- Authorization
- JWT creation and validation
- Refresh-token rotation
- CSRF validation
- Account lockout
- User-scoped expense CRUD
- PostgreSQL persistence
- Static Angular hosting
- SPA route forwarding
- Production health checks

---

# 🧩 Important Backend Components

```text
SpendTrackerApplication.java

config/
    PasswordConfig.java
    JwtConfig.java
    SecurityConfig.java

controller/
    AuthController.java
    ExpenseController.java
    HealthController.java
    SpaController.java

dto/
    RegisterRequest.java
    LoginRequest.java
    AuthResponse.java
    LoginResult.java
    RefreshResult.java
    ExpenseRequest.java
    ExpenseResponse.java

exception/
    InvalidCredentialsException.java
    GlobalExceptionHandler.java

model/
    User.java
    Role.java
    RefreshToken.java
    Expense.java
    ExpenseCategory.java

repository/
    UserRepository.java
    RefreshTokenRepository.java
    ExpenseRepository.java

security/
    CookieBearerTokenResolver.java
    JwtService.java

service/
    AuthService.java
```

---

# 🧩 Important Frontend Components

```text
src/app/

guards/
    auth.guard.ts

services/
    auth.service.ts
    expense.service.ts

login/
    login.page.ts
    login.page.html
    login.page.scss

register/
    register.page.ts
    register.page.html
    register.page.scss

home/
    config/
        merchants.config.ts

    models/
        home.models.ts

    home.page.ts
    home.page.html
    home.page.scss

app.config.ts
app.routes.ts
```

---

# 🗂 Implementation File Map

```text
spend-tracker/
│
├── backend/
│   ├── src/main/java/com/spendtracker/
│   │
│   │   ├── config/
│   │   ├── controller/
│   │   ├── dto/
│   │   ├── exception/
│   │   ├── model/
│   │   ├── repository/
│   │   ├── security/
│   │   └── service/
│   │
│   ├── src/main/resources/
│   │   └── application.properties
│   │
│   ├── pom.xml
│   ├── mvnw
│   └── mvnw.cmd
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── guards/
│   │   │   ├── services/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── home/
│   │   │       ├── config/
│   │   │       ├── models/
│   │   │       ├── home.page.ts
│   │   │       ├── home.page.html
│   │   │       └── home.page.scss
│   │   │
│   │   └── assets/
│   │       └── icon/
│   │           ├── food/
│   │           └── fuel/
│   │
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

# ⚙️ Runtime Configuration

Important environment variables:

| Variable | Purpose |
|---|---|
| `DB_URL` | PostgreSQL JDBC URL |
| `DB_USERNAME` | PostgreSQL username |
| `DB_PASSWORD` | PostgreSQL password |
| `JWT_SECRET` | Base64 JWT signing key |
| `APP_SECURITY_COOKIE_SECURE` | Enables Secure authentication cookies |
| `PORT` | Runtime HTTP port |

Production Render configuration includes:

```text
DB_URL
DB_USERNAME
DB_PASSWORD
JWT_SECRET
APP_SECURITY_COOKIE_SECURE=true
```

Real credentials must never be committed to Git.

---

# 🐘 Supabase

Supabase is used as managed PostgreSQL hosting.

Current database connection path:

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

The browser does not directly access PostgreSQL.

Supabase Auth is not used.

Authentication is implemented by Spring Boot.

---

# 🐳 Docker Architecture

The application uses a multi-stage Docker build.

---

## Stage 1 — Angular

```text
Node
  │
npm ci
  │
npm run build
  │
frontend/www
```

---

## Stage 2 — Spring Boot Build

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

---

## Stage 3 — Runtime

```text
Java 21 runtime
       │
       ▼
app.jar
       │
       ▼
Render
```

The result is:

```text
/
→ Angular

/api/*
→ Spring Boot
```

---

# 🌐 SPA Routing

Spring Boot forwards frontend routes such as:

```text
/
/login
/register
/home
```

to:

```text
/index.html
```

Angular Router then handles navigation.

---

# ✅ Security Status

Currently implemented:

```text
✅ User registration
✅ User login
✅ BCrypt password hashing
✅ JWT authentication
✅ HttpOnly access-token cookie
✅ HttpOnly refresh-token cookie
✅ Refresh-token hashing
✅ Refresh-token rotation
✅ Refresh-token replay detection
✅ CSRF protection
✅ Account lockout
✅ Logout
✅ Protected Angular routes
✅ Per-user expense ownership
✅ Per-user expense filtering
✅ Cross-user edit protection
✅ Cross-user delete protection
✅ Unknown request-field rejection
✅ Secure production cookies
```

Potential future security improvements:

```text
Rate limiting
Email verification workflow
Password reset
Access-token revocation / blacklist
Advanced device/session management
Concurrent refresh-token locking
Security event auditing
```

---

# 🧪 Validation Checklist

## Authentication

```text
[x] Register user
[x] Login user
[x] JWT access token generated
[x] Refresh token generated
[x] /api/auth/me returns current user
[x] Logout works
[x] CSRF-protected logout works
[x] Refresh-token rotation works
[x] Replay detection works
[x] Account lockout works
```

---

## User Isolation

```text
[x] User sees only their expenses
[x] User cannot update another user's expense
[x] User cannot delete another user's expense
[x] Expense ownership comes from authentication
```

---

## Expenses

```text
[x] Create expense
[x] Read expenses
[x] Update expense
[x] Delete expense
[x] Month filtering
[x] Year filtering
[x] Expense DTO validation
[x] Unknown field rejection
```

---

## Frontend

```text
[x] Login page
[x] Registration page
[x] Protected Home route
[x] Logout
[x] Dashboard
[x] Monthly filter
[x] Yearly filter
[x] Category analytics
[x] Donut visualization
[x] Add Expense
[x] Edit Expense
[x] Delete Expense
[x] Quick Merchant selection
[x] Food merchant assets
[x] Fuel merchant assets
[x] Manual merchant fallback
[x] Responsive layout
```

---

## Deployment

```text
[x] Angular production build
[x] Docker multi-stage build
[x] Spring Boot serves Angular
[x] Same-origin production API
[x] Render environment configuration
[x] Supabase connectivity
[x] Public /api/health endpoint
[x] Direct /login route
[x] Direct /register route
[x] Direct /home route
[x] Production authentication
```

---

# ✅ Architecture Decisions

## 1. Spring Boot Owns Authentication

Authentication is implemented inside Spring Boot instead of using Supabase Auth.

This keeps:

```text
authentication
authorization
expense ownership
business rules
```

inside the backend.

---

## 2. Tokens Are Not Stored in Browser Storage

JWT and refresh tokens use HttpOnly cookies.

This reduces exposure to JavaScript-based token theft.

---

## 3. Expense Ownership Is Backend Controlled

The authenticated principal determines expense ownership.

The frontend cannot assign an expense to another user.

---

## 4. Frontend and Backend Share One Production Origin

Benefits:

```text
simpler cookies
simpler CSRF
simpler CORS
one deployment
one URL
```

---

## 5. Quick Merchants Are Configuration

Merchant definitions are kept outside `home.page.ts`.

Adding new merchants should normally require updating:

```text
merchants.config.ts
```

plus adding the corresponding image assets.

---

## 6. Unknown Merchants Use Category-Specific Other Assets

Example:

```text
Food
Namaste India
→ Food Other image
```

instead of requiring an image for every restaurant.

---

## 7. Categories Remain an Enum

The category list remains fixed for the current application.

User-created categories can be introduced later if needed.

---

## 8. Dashboard Analytics Stay in Angular

The backend returns filtered expenses.

Angular currently calculates:

```text
total
category totals
percentages
donut slices
budget progress
```

This is appropriate for the current scale.

---

# 🔮 Future Improvements

Potential future work:

```text
Configurable monthly budgets
Recurring-expense detection
Receipt scanning
Merchant/category memory
Additional Quick Merchant categories
Yearly trend charts
Password reset
Email verification
Session/device management
Rate limiting
PWA improvements
Native iOS packaging
Native Android packaging
```

---

# 📌 Current Scope

Implemented:

```text
✅ Supabase PostgreSQL
✅ Spring Boot backend
✅ Ionic Angular frontend
✅ Secure authentication
✅ User registration
✅ Login / logout
✅ JWT
✅ Refresh tokens
✅ CSRF
✅ User-scoped expenses
✅ Add expense
✅ Edit expense
✅ Delete expense
✅ Month filtering
✅ Year filtering
✅ Category analytics
✅ Donut chart
✅ Budget progress
✅ Food Quick Merchants
✅ Fuel Quick Merchants
✅ Merchant image assets
✅ Merchant fallback handling
✅ Responsive mobile UI
✅ Docker deployment
✅ Render production deployment
✅ Production health endpoint
```

Not yet implemented:

```text
❌ Password reset
❌ Email verification workflow
❌ Rate limiting
❌ Receipt scanning
❌ Persisted budget settings
❌ Recurring-expense detection
❌ Notifications
❌ Full PWA offline support
❌ Native production iOS build
❌ Native production Android build
```

---

# 📚 Maintenance Notes

## Adding a New Expense Field

1. Update backend entity/request/response models.
2. Update database behavior.
3. Update `expense.service.ts`.
4. Update Add/Edit form.
5. Test create/update.
6. Update documentation.

---

## Adding a New Category

1. Update `ExpenseCategory.java`.
2. Add frontend category configuration.
3. Assign label/icon/color.
4. Test API validation.
5. Test analytics.
6. Update documentation.

---

## Adding Quick Merchants

1. Add merchant image assets.
2. Add merchant entries to:

```text
home/config/merchants.config.ts
```

3. Confirm merchant selection auto-fills the Merchant field.
4. Confirm transaction image resolution.
5. Confirm unknown merchant falls back to `Other`.
6. Test mobile layout.
7. Update documentation if the merchant/category set materially changes.

---

## Security Rule

Never trust a user ID supplied by the browser.

Authorization must always use:

```text
authenticated principal
        │
        ▼
backend user lookup
        │
        ▼
user-scoped repository query
```

---

# 🏁 Current Architecture

```text
Browser / Mobile
      │
      ▼
Ionic Angular
      │
      │ HttpOnly cookies + CSRF
      ▼
Spring Security
      │
      ▼
Spring Boot REST API
      │
      │ authenticated user ID
      ▼
Spring Data JPA
      │
      ▼
Supabase PostgreSQL
```

Spend Tracker is now a secure authenticated multi-user expense-tracking application rather than the original unauthenticated personal MVP.
