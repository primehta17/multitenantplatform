# Multi-Tenant Subscription Analytics Platform
## Assignment Tracker + Teaching Guide

---

## What We Are Building

A platform where multiple companies (tenants/organizations) can sign up, manage their own users, create subscription plans, and view analytics about their subscribers.

Think of it like a mini Stripe + Chargebee - each organization is isolated from others, manages its own plans and billing, and gets a dashboard showing revenue and churn.

**Evaluators care most about:**
1. Multi-tenant isolation - one org must NEVER see another org's data
2. Clean layered architecture - routes → controllers → services → models
3. Your ability to explain every decision you made

---

## Tech Stack

| Technology | Role | Why |
|---|---|---|
| MongoDB | Database | Flexible schema, good for multi-tenant with organizationId scoping |
| Express | Backend framework | Minimal, familiar, pairs well with Node |
| Node.js | Backend runtime | JavaScript end-to-end, easier context switching |
| React | Frontend | Required by assignment |
| React Router | Client-side routing | Standard for React SPAs |
| Axios | HTTP client | Clean API, interceptors for auth header, easy error handling |
| Recharts | Charts | Lightweight, React-native, easy to use |
| JWT | Authentication | Stateless, no session storage needed on server |
| ExchangeRate-API | External API | Free tier, no credit card, converts MRR to org's preferred currency |

---

## Development Approach - Vertical Slices

We build one complete feature at a time: BE first, then FE immediately after.
This way you can see and click through every feature as it is built, and catch integration issues early.

```
Phase 1 (Setup) → Phase 2 (Auth BE+FE) → Phase 3 (Plans BE+FE)
→ Phase 4 (Subscriptions BE+FE) → Phase 5 (Invoices BE+FE)
→ Phase 6 (User Management BE+FE) → Phase 7 (Analytics BE+FE) → Phase 8 (Docs)
```

---

## Phases + Checklist

Mark each item `[x]` when complete.

---

### Phase 1 - Project Setup
> Scaffolding only - no business logic yet. Just get servers running and connected.

**Backend**
- [x] Initialize backend folder structure (routes, controllers, services, models, middleware, config)
- [x] Install dependencies (express, mongoose, dotenv, bcryptjs, jsonwebtoken, morgan, cors)
- [x] Setup Express server (index.js)
- [x] Connect to MongoDB via mongoose
- [x] Setup .env with PORT, MONGODB_URI, JWT_SECRET
- [x] Add morgan for request logging
- [x] Add global error handler middleware

**Frontend**
- [x] Create React app (Vite)
- [x] Install dependencies (axios, react-router-dom, recharts)
- [x] Setup Axios instance (src/api/axios.js) with baseURL and JWT interceptor
- [x] Setup React Router shell (App.jsx with placeholder routes)

---

### Phase 2 - Auth Slice (BE + FE)
> Register an org + first admin, login, protect all future routes with JWT.

**Backend**
- [x] Create Organization model (name, slug, preferredCurrency, createdAt)
- [x] Create User model (name, email, passwordHash, role, organizationId, createdAt)
- [x] POST /api/auth/register - create org + first OrgAdmin, return JWT
- [x] POST /api/auth/login - verify credentials, return JWT
- [x] `authenticate` middleware - verify JWT, attach req.user to every request
- [x] `requireRole('OrgAdmin')` middleware - block non-admins from admin routes

**Frontend**
- [x] Register org page (org name, admin name, email, password)
- [x] Login page (email, password)
- [x] Store JWT in localStorage on login/register
- [x] Auth context (AuthContext.jsx) - expose user, token, login(), logout()
- [x] ProtectedRoute component - redirect to /login if no token
- [x] Redirect after login: OrgAdmin → /admin, OrgMember → /member

---

### Phase 3 - Plans Slice (BE + FE)
> Admins create plans. Members see them. This is the product catalog.

**Backend**
- [x] Create Plan model (name, price, billingCycle, features[], isActive, organizationId, createdBy)
- [x] GET /api/plans - list plans for the user's org (all authenticated users)
- [x] POST /api/plans - create plan (OrgAdmin only)
- [x] PUT /api/plans/:id - edit plan (OrgAdmin only)
- [x] PATCH /api/plans/:id/deactivate - deactivate plan (OrgAdmin only)

**Frontend**
- [x] Admin: Plans list page (table with name, price, billingCycle, status, actions)
- [x] Admin: Create/edit plan form (modal or separate page)
- [x] Admin: Deactivate plan button with confirmation
- [x] Member: View available plans page (cards with features list)

---

### Phase 4 - Subscriptions Slice (BE + FE)
> Members subscribe to plans. One active subscription per user at a time.

**Backend**
- [x] Create Subscription model (userId, planId, organizationId, status, startDate, cancelledAt)
- [x] POST /api/subscriptions - subscribe to a plan (creates subscription)
- [x] PUT /api/subscriptions/:id - upgrade or downgrade (changes plan)
- [x] DELETE /api/subscriptions/:id - cancel subscription
- [x] GET /api/subscriptions/me - get current user's active subscription

**Frontend**
- [x] Member: Subscribe button on plan cards (calls POST)
- [x] Member: Current plan section - show active plan with upgrade/downgrade/cancel options
- [x] Member: Upgrade/downgrade - show other available plans to switch to
- [x] Member: Cancel subscription with confirmation dialog

---

### Phase 5 - Invoices Slice (BE + FE)
> Every subscription action creates an invoice record. Members can see their billing history.

**Backend**
- [x] Create Invoice model (userId, planId, organizationId, amount, currency, status, createdAt, paidAt)
- [x] Auto-create invoice inside subscription service on: subscribe, upgrade, downgrade, cancel
- [x] Invoice status set to `paid` automatically (no real payment provider)
- [x] GET /api/invoices/me - list own invoices (member)
- [x] GET /api/invoices - list all org invoices (OrgAdmin only)

**Frontend**
- [x] Member: Invoice history table (plan name, amount, currency, status, date)
- [ ] Admin: All org invoices table (user, plan, amount, status, date)
- [x] Loading, error, and empty states for both tables

---

### Phase 6 - User Management Slice (BE + FE)
> Admins can see who is in their org, invite new users, and change roles.

**Backend**
- [x] GET /api/users - list all users in org (OrgAdmin only)
- [x] POST /api/users/invite - create user with status `invited`, role OrgMember (mocked, no email sent)
- [x] PATCH /api/users/:id/role - change user role (OrgAdmin only)

**Frontend**
- [x] Admin: Users list page (table with name, email, role, status badges)
- [x] Admin: Invite user form (email field, submits to POST /api/users/invite)
- [x] Admin: Change role dropdown inline in the table

---

### Phase 7 - Analytics Slice (BE + FE)
> The dashboard evaluators will look at most carefully. Aggregation + external API.

**Backend**
- [x] Create services/currencyService.js - fetch rates from ExchangeRate-API, handle errors gracefully
- [x] GET /api/analytics - OrgAdmin only, returns all metrics in one response
- [x] Query: active subscriber count grouped by plan name
- [x] Query: estimated MRR (sum of active subscription plan prices for current month)
- [x] Query: churn count (subscriptions cancelled in last 30 days)
- [x] Query: monthly trend - subscriber count or revenue for last 6 months
- [x] Convert MRR to org's preferredCurrency using currencyService

**Frontend**
- [x] Admin: Analytics dashboard page
- [x] Active subscribers card (number + breakdown by plan)
- [x] MRR card (converted currency amount)
- [x] Churn card (cancellations in last 30 days)
- [x] Bar or line chart - monthly trend (Recharts)
- [x] Loading, error, and empty states for all cards

---

### Phase 8 - Docs
> README, API docs, Decision log. This is what evaluators read before running your code.

- [ ] README: project overview + what the platform does
- [ ] README: setup and run instructions (step by step)
- [ ] README: environment variables table (name, description, example)
- [ ] README: architecture overview with the 3 key flows
- [ ] API docs: endpoint table per domain (method, URL, auth required, brief request/response)
- [ ] Decision log: data model choices, multi-tenant isolation approach, auth strategy, Axios over React Query, vertical slice dev approach

---

## Architecture Overview

```
Frontend (React)
    ↓ HTTP requests with JWT
Backend (Express)
    ↓ Routes → Controllers → Services → Models
MongoDB (separate collections, all scoped by organizationId)
    ↓
External: ExchangeRate-API (called from currencyService)
```

### Folder Structure (Backend)
```
backend/
├── src/
│   ├── models/          ← Mongoose schemas
│   ├── routes/          ← Express route definitions
│   ├── controllers/     ← Request/response handling
│   ├── services/        ← Business logic (where real work happens)
│   ├── middleware/      ← authenticate, requireRole, errorHandler
│   ├── services/        ← currencyService, etc.
│   └── config/          ← DB connection, env validation
├── .env
└── package.json
```

### Folder Structure (Frontend)
```
frontend/
├── src/
│   ├── pages/           ← One file per screen
│   ├── components/      ← Reusable UI pieces
│   ├── api/             ← Axios calls, one file per domain (plans.js, auth.js, etc.)
│   ├── context/         ← Auth context (user, token, logout)
│   └── router/          ← Route definitions + protected route wrapper
└── package.json
```

---

## Teaching Rules (Claude Must Follow)

These rules apply every session, every phase.

1. **Before every phase** - explain what we are building, why, and the full data flow end to end
2. **Before every file** - explain what this file does and where it sits in the architecture
3. **Use these inline flags:**
   - `CONCEPT:` - foundational idea you should understand
   - `WHY:` - reason behind a specific decision
   - `FLOW:` - tracing data from frontend to DB and back
   - `WATCH OUT:` - common junior mistake or gotcha
4. **Never just write code** - always teach as you go
5. **After each phase** - summarize what was built and how it connects to the next phase
6. **Goal** - by Phase 8, you can explain the entire system to the evaluator yourself

---

## Collaborative Coding Rules (Claude Must Follow)

Every phase has a split: Claude writes boilerplate, the user writes the nerve center.

### How it works for each user-written piece:
1. **Claude explains** - what file to open, what function to write, what the logic should do
2. **Claude explains the approach** - step by step thinking, not the actual code. What to check, what to return, what to call. User is never left at point blank.
3. **User writes it** - in their own way based on the explanation
4. **Claude reviews** - confirms if correct, explains what to fix and why if not

### What the user writes (nerve centers - one per phase):
- **Phase 2 (Auth)** → `authenticate` middleware - this is where JWT is verified and req.user is set. Understanding this = understanding how identity flows through every request.
- **Phase 3 (Plans)** → `planService.createPlan()` - understanding this = understanding how org scoping works in every write operation.
- **Phase 4 (Subscriptions)** → `subscriptionService.subscribe()` - the core business logic function.
- **Phase 5 (Invoices)** → Invoice auto-creation inside the subscription service - understanding this = understanding how side effects are triggered.
- **Phase 6 (User Management)** → `PATCH /users/:id/role` controller - understanding this = understanding how role changes flow.
- **Phase 7 (Analytics)** → MongoDB aggregation query for MRR - the most interview-worthy piece of code in the whole app.
- **Frontend** → Axios interceptor - understanding this = understanding how JWT travels with every request automatically.

### Commit Rule (After Every Phase)
- When a phase is fully complete, Claude asks: "Should I commit the changes for Phase X?"
- If user says yes, Claude runs `git add` + `git commit` with a clear message like: `feat: Phase 2 - Auth slice (BE + FE)`
- This way every phase is a clean, reviewable commit in git history
- User can always diff any two phases to see exactly what changed

### Rule: user is never dropped at point blank
Before asking the user to write, Claude must provide:
- Which file and function name to create
- What parameters it receives
- What it should return
- The logical steps to follow (in plain English, not code)
- Any specific method or library call to use (e.g. "use jwt.verify()")
Only then ask the user to write.

---

## Key Concepts to Understand (Will Be Explained During Build)

- [ ] What is multi-tenancy and how organizationId enforces isolation
- [ ] How JWT works (sign on login, verify on every request)
- [ ] What middleware is and how it chains in Express
- [ ] Layered architecture - why we separate routes, controllers, services
- [ ] What MongoDB aggregation pipeline is (used in analytics)
- [ ] How Axios interceptors work (auto-attach JWT to every request)
- [ ] How protected routes work in React Router
- [ ] Why we wrap external APIs in a service layer

---

## Assumptions Made

- Email invites are mocked (saved to DB with status `pending`, no actual email sent)
- Invoice status is set to `paid` automatically on creation (no real payment provider)
- ExchangeRate-API is the chosen external API integration (free tier, no credit card needed)
- Users belong to exactly one organization
