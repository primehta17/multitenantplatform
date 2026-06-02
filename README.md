# Multi-Tenant Subscription Analytics Platform

A full-stack SaaS platform where multiple organizations (tenants) can sign up, manage their own users and subscription plans, and view analytics dashboards about their subscribers.

Think of it as a simplified Stripe + Chargebee - each organization is fully isolated from others, manages its own billing plans, and gets a dashboard showing revenue and churn.

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Database | MongoDB + Mongoose | Flexible schema; organizationId scoping enforces multi-tenant isolation naturally |
| Backend | Node.js + Express | Minimal framework, easy layered architecture, JavaScript end-to-end |
| Authentication | JWT (jsonwebtoken) | Stateless - no server-side session storage needed; token carries userId, orgId, role |
| Password hashing | bcryptjs | Industry standard; 12 salt rounds balances security and speed |
| Frontend | React + Vite | Required by assignment; Vite is faster than CRA |
| Routing | React Router v6 | Standard SPA routing; ProtectedRoute wraps admin and member areas |
| HTTP client | Axios | Interceptors allow JWT to be attached to every request automatically |
| Charts | Recharts | Lightweight, React-native charting library |
| External API | ExchangeRate-API | Free tier, no credit card; converts MRR to org's preferred currency |
| Request logging | Morgan | Logs every incoming HTTP request in dev mode |

---

## Setup and Run

### Prerequisites
- Node.js v18+
- A MongoDB Atlas account (free tier works) or local MongoDB installation
- An ExchangeRate-API key (free at [exchangerate-api.com](https://www.exchangerate-api.com))

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd assignment

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Configure environment variables

Create `backend/.env` (use `.env.example` as reference):

```
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/subscription-platform
JWT_SECRET=a_long_random_string_change_this
JWT_EXPIRES_IN=7d
EXCHANGE_RATE_API_KEY=your_api_key_here
```

### 3. Run the backend

```bash
cd backend
npm run dev     # starts with nodemon on port 5000
```

### 4. Run the frontend

```bash
cd frontend
npm run dev     # starts Vite dev server on port 5173
```

### 5. Open the app

Go to `http://localhost:5173` - you'll be redirected to `/login`.

Click **"Create an organization"** to register a new org and the first admin.

---

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `PORT` | Express server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET` | Secret key for signing JWT tokens - keep this private | `my_super_secret_key_123` |
| `JWT_EXPIRES_IN` | JWT expiry duration | `7d` |
| `EXCHANGE_RATE_API_KEY` | API key from exchangerate-api.com | `abc123def456` |

---

## Architecture Overview

```
Browser (React)
  │  Axios sends HTTP request with JWT in Authorization header
  ▼
Express Server
  │  Routes → Controllers → Services → Models
  ▼
MongoDB Atlas
  │  All collections scoped by organizationId
  ▼
ExchangeRate-API (external)
  Called from currencyService for MRR currency conversion
```

### Module Interactions

```
Organization
  └── has many Users (organizationId on User)
  └── has many Plans (organizationId on Plan)

User
  └── belongs to one Organization
  └── has many Subscriptions (userId on Subscription)
  └── has many Invoices (userId on Invoice)

Plan
  └── belongs to one Organization
  └── referenced by Subscriptions and Invoices

Subscription
  └── links User ↔ Plan within an Organization
  └── triggers Invoice creation as a side effect (in service layer)
  └── one active subscription per user at a time (enforced in subscriptionService)

Invoice
  └── auto-created by subscriptionService on every subscription change
  └── links User ↔ Plan ↔ Organization for billing history

ExchangeRate-API
  └── called only by currencyService
  └── currencyService called only by analyticsService (for MRR conversion)
  └── never called directly from controllers
```

### Folder Structure

```
assignment/
├── backend/
│   └── src/
│       ├── models/         ← Mongoose schemas (Organization, User, Plan, Subscription, Invoice)
│       ├── routes/         ← Express route definitions (one file per domain)
│       ├── controllers/    ← Request/response handling (thin layer, calls service)
│       ├── services/       ← Business logic (where real work happens)
│       ├── middleware/     ← authenticate, requireRole, errorHandler
│       └── config/         ← DB connection
├── frontend/
│   └── src/
│       ├── pages/          ← One file per screen (admin/, member/)
│       ├── components/     ← Shared UI (Navbar)
│       ├── api/            ← Axios calls per domain (plans.js, auth.js, etc.)
│       ├── context/        ← AuthContext (user, token, loginUser, logout)
│       └── router/         ← ProtectedRoute component
└── README.md
```

---

## Key Flows

### 1. Organization Onboarding

```
User visits /register
  → fills org name, admin name, email, password
  → POST /api/auth/register
      → Organization created (name, slug, preferredCurrency: 'USD')
      → User created (role: OrgAdmin, passwordHash via bcrypt)
      → JWT signed with { userId, orgId, role }
  → Token stored in localStorage
  → Redirected to /admin/plans
```

### 2. User Subscription / Upgrade Flow

```
Member visits /member/plans
  → GET /api/plans  (JWT auto-attached by Axios interceptor)
  → authenticate middleware verifies token, attaches req.user
  → planService returns only plans where organizationId = req.user.orgId

Member clicks Subscribe
  → POST /api/subscriptions  { planId }
  → subscriptionService.subscribe()
      → checks: no existing active subscription (blocks duplicates)
      → checks: plan exists and is active in this org
      → creates Subscription record
      → side effect: creates Invoice { status: 'paid', amount: plan.price }
  → Member sees current plan with upgrade/cancel options
```

### 3. Analytics Dashboard Data Flow

```
Admin visits /admin/analytics
  → GET /api/analytics
  → requireRole('OrgAdmin') blocks non-admins
  → analyticsService.getAnalytics(user)
      → 4 MongoDB aggregations run in parallel (Promise.all):
          1. $match active subs → $lookup plans → $group by plan name → subscriber counts
          2. $match active subs → $lookup plans → $group all → sum prices = raw MRR
          3. countDocuments cancelled in last 30 days = churn
          4. $group by year/month → new subscribers per month for last 6 months
      → currencyService fetches live rate from ExchangeRate-API
      → MRR converted from USD to org's preferredCurrency
      → single response object returned
  → Frontend renders 3 metric cards + Recharts bar chart
```

---

## API Documentation

All protected routes require `Authorization: Bearer <token>` header.

### Auth

| Method | URL | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | None | Create org + first OrgAdmin, returns JWT |
| POST | `/api/auth/login` | None | Login, returns JWT |

**Register request:**
```json
{ "orgName": "Acme Corp", "name": "Jane", "email": "jane@acme.com", "password": "secret" }
```
**Register response:**
```json
{ "token": "eyJ...", "user": { "id": "...", "name": "Jane", "email": "jane@acme.com", "role": "OrgAdmin" } }
```

---

### Plans

| Method | URL | Auth | Description |
|---|---|---|---|
| GET | `/api/plans` | Any authenticated user | List active plans for the user's org |
| POST | `/api/plans` | OrgAdmin | Create a new plan |
| PUT | `/api/plans/:id` | OrgAdmin | Update a plan |
| PATCH | `/api/plans/:id/deactivate` | OrgAdmin | Deactivate a plan |

**Create plan request:**
```json
{ "name": "Pro", "price": 49, "billingCycle": "monthly", "features": ["Unlimited users", "API access"] }
```

---

### Subscriptions

| Method | URL | Auth | Description |
|---|---|---|---|
| GET | `/api/subscriptions/me` | Any authenticated user | Get current user's active subscription |
| POST | `/api/subscriptions` | Any authenticated user | Subscribe to a plan |
| PUT | `/api/subscriptions/:id` | Any authenticated user | Change plan (upgrade/downgrade) |
| DELETE | `/api/subscriptions/:id` | Any authenticated user | Cancel subscription |

**Subscribe request:**
```json
{ "planId": "60d21b4667d0d8992e610c85" }
```

---

### Invoices

| Method | URL | Auth | Description |
|---|---|---|---|
| GET | `/api/invoices/me` | Any authenticated user | List current user's invoices |
| GET | `/api/invoices` | OrgAdmin | List all org invoices |

**Invoice response item:**
```json
{
  "_id": "...",
  "planId": { "name": "Pro", "billingCycle": "monthly" },
  "amount": 49,
  "currency": "USD",
  "status": "paid",
  "description": "Subscribed to Pro",
  "createdAt": "2025-06-01T10:00:00Z"
}
```

---

### Users

| Method | URL | Auth | Description |
|---|---|---|---|
| GET | `/api/users` | OrgAdmin | List all users in org |
| POST | `/api/users/invite` | OrgAdmin | Invite a new user (mocked - no email sent) |
| PATCH | `/api/users/:id/role` | OrgAdmin | Change a user's role |

**Invite request:**
```json
{ "name": "Bob", "email": "bob@acme.com", "password": "temppassword" }
```

**Change role request:**
```json
{ "role": "OrgAdmin" }
```

---

### Analytics

| Method | URL | Auth | Description |
|---|---|---|---|
| GET | `/api/analytics` | OrgAdmin | All metrics in one response |

**Response:**
```json
{
  "totalActiveSubscribers": 12,
  "subscribersByPlan": [
    { "plan": "Pro", "count": 8 },
    { "plan": "Basic", "count": 4 }
  ],
  "mrr": { "amount": 490.50, "currency": "INR" },
  "churnLast30Days": 2,
  "monthlyTrend": [
    { "month": "2025-01", "newSubscribers": 3 },
    { "month": "2025-02", "newSubscribers": 5 }
  ]
}
```

---

## Design Decisions and Trade-offs

### 1. Multi-tenant isolation via organizationId on every model

Every document in every collection has an `organizationId` field. Every query filters by `req.user.orgId` which comes from the verified JWT - not from user-supplied input. This means a user from Org A cannot access Org B's data even if they know the IDs, because the JWT (signed with our secret) contains the orgId from their own org.

**Trade-off:** Adds a field to every model and a condition to every query. Worth it - this is the fundamental guarantee of multi-tenancy.

### 2. JWT over sessions

JWT is stateless - the server doesn't store session data. The token carries `userId`, `orgId`, and `role`. Every request is self-contained. This scales better (no shared session store needed between servers) and simplifies the architecture.

**Trade-off:** Tokens can't be invalidated before expiry (7 days). In production, a token blacklist or short expiry + refresh token pattern would address this.

### 3. Layered architecture: routes → controllers → services → models

Routes handle HTTP method + path. Controllers handle request/response extraction and call the service. Services contain all business logic. Models define the schema.

**Why:** Each layer has one responsibility. A controller never touches MongoDB directly. A service never reads `req.headers`. This makes each layer independently testable and easy to reason about.

### 4. Axios interceptor for JWT

Instead of manually attaching the JWT in every API call, one interceptor in `src/api/axios.js` reads from localStorage and attaches it to every outgoing request. All API files stay clean - they just call `axios.get('/plans')` without thinking about auth.

### 5. Vertical slice development (BE + FE per feature)

Each phase shipped a complete working feature - backend API + frontend UI together. This meant the app was always in a runnable state and integration issues were caught immediately rather than at the end.

**Trade-off:** Requires thinking across both layers simultaneously, but avoids the common problem of building a full backend only to discover the frontend needs different data shapes.

### 6. Invoice auto-creation as a service-layer side effect

When `subscriptionService.subscribe()` runs, it also calls `invoiceService.createInvoice()`. The controller doesn't know about this. This is the correct architectural pattern - side effects belong in the service layer, not scattered across controllers.

### 7. Currency conversion with graceful fallback

`currencyService.convertCurrency()` wraps the ExchangeRate-API call in a try/catch. If the external API is down or returns an error, we log a warning and return the original USD amount. The analytics dashboard always works - just shows USD in the worst case.

### 8. Frontend state management — useState + useEffect with Axios

Each page manages its own loading, error, and data state using React's built-in `useState` and `useEffect`. API calls go through the Axios instance directly, no additional library.

**Why not Redux?** Redux adds significant boilerplate (actions, reducers, selectors) and is justified when many unrelated components need the same shared state. Here, each page fetches its own data independently. Global shared state is minimal — just the auth token and user, which lives in `AuthContext`.

**Why not React Query?** React Query handles caching, background refetching, and deduplication automatically — powerful, but adds a dependency and abstraction layer that's harder to explain in a walkthrough. For this assignment, the simpler `useState + useEffect` pattern makes the data flow obvious and easy to reason about: fetch on mount, show loading, show error, show data.

**The pattern used across every page:**
```javascript
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');

useEffect(() => {
  apiCall().then(({ data }) => setData(data))
           .catch(() => setError('...'))
           .finally(() => setLoading(false));
}, []);
```

**Trade-off:** No caching — navigating away and back re-fetches. Acceptable for an internal dashboard used by small teams. React Query would be the right upgrade for a production app with many users.

### 9. Mocked email invites

Inviting a user creates them in the DB with a temporary password set by the admin. In production, the flow would be: create user with a signed invite token, email them the link, they click and set their own password. Mocked here because email infrastructure is out of scope for this assignment.

---

## Assumptions

- Users belong to exactly one organization
- Invoice status is set to `paid` immediately on creation (no real payment provider)
- Email delivery is mocked - admin sets a temporary password and shares it directly
- MRR is estimated as the sum of active subscription plan prices (not accounting for annual discounts or proration)
- ExchangeRate-API free tier is used; if the key is missing, currency conversion falls back to USD
