# Invify — AI Coding Agent Instructions

## Project Overview
**Invify** is a full-stack inventory management SaaS built with React + TypeScript + Tailwind (frontend), Node.js + Express (backend), PostgreSQL + Prisma (database), and JWT authentication. The app enables small businesses to manage products, categories, and inventory workflows.

**Tech Stack:** React + Vite | Node.js + Express | PostgreSQL + Prisma | JWT Auth | Docker | Vitest

---

## Architecture & Data Flow

### Backend Structure (`/backend/src`)
- **Entry Point:** `index.ts` → `app.ts` (Express setup, middleware, route mounting)
- **Routes:** `/api/auth`, `/api/categories`, `/api/category-types`, `/api/products`
- **Controller Pattern:** Each route has a controller (e.g., `productController.ts`) with async handlers using `express-async-handler`
- **Database:** Prisma client instantiated in controllers (`new PrismaClient()`) for direct DB access
- **Auth Flow:** JWT tokens generated on login/register, verified via `protect` middleware (checks `Authorization: Bearer <token>` header)

### Frontend Structure (`/frontend/src`)
- **Routing:** React Router v7 with `PrivateRoute` wrapper for protected pages (checks `localStorage.getItem('token')`)
- **API Layer:** Centralized axios instance in `utils/api.ts` with request interceptor that attaches JWT token to all requests
- **State Management:** Local state using `useState`; API calls directly in page components
- **Testing:** Vitest + React Testing Library with factory patterns (e.g., `productFactory.ts`)

### Data Model (`prisma/schema.prisma`)
```
User → Categories → CategoryType
              ↓
            Products (related to Category)
```
- **User:** UUID, unique username, bcrypt-hashed password
- **Category:** Unique code, name, optional CategoryType relation
- **CategoryType:** Lookup table (code, label)
- **Product:** Unique code, price, quantity, required categoryId relation

---

## Key Patterns & Conventions

### Error Handling
- Backend: `express-async-handler` wraps async handlers; errors throw and set `res.statusCode` before throwing (e.g., `res.status(401); throw new Error(...)`)
- `errorMiddleware.ts` catches all errors and returns JSON with `message` and optional `stack`
- Frontend: API calls wrapped in try/catch; errors logged to console

### Input Validation
- **Backend:** Manual validation in controllers—normalize strings (trim, uppercase codes), validate numbers with `Number.isFinite()` and `Number.isInteger()`, check uniqueness, validate foreign keys
- **Frontend:** Form validation happens client-side before API calls (see `CreateCategoryForm.tsx`)

### Authentication
- Register/login returns `{ id, username, token }`
- Token stored in `localStorage` on frontend
- Axios interceptor adds `Authorization: Bearer <token>` to all requests
- Backend `protect` middleware validates token signature and user existence
- Protected routes use `<PrivateRoute>` wrapper

### Code Organization
- Controllers contain business logic; no separate service layer
- API client methods in dedicated files (`api/category.ts`, `api/product.ts`)
- Components are stateful; pages fetch and manage data directly
- Factories in tests (`productFactory.ts`) generate mock data with default values

---

## Build & Run Commands

### Backend
```bash
npm run dev          # Start with ts-node-dev (watches/reloads)
npm run build        # TypeScript compilation → dist/
npm run start        # Run built JS
npm run prisma       # Run Prisma CLI commands
```

### Frontend
```bash
npm run dev          # Start Vite dev server (port 5173)
npm run build        # TypeScript check + Vite build → dist/
npm run test         # Run Vitest (watches by default)
npm run lint         # ESLint check
```

### Database Setup
```bash
docker-compose up -d postgres  # Start PostgreSQL (port 5432)
npx prisma migrate dev         # Run migrations + seed
```

**Environment:** Backend expects `DATABASE_URL` (PostgreSQL), `JWT_SECRET`, `PORT` (default 4000). Frontend hardcodes `http://localhost:4000/api` as base URL and `http://localhost:5173` is CORS-allowed origin.

---

## Testing Approach
- **Frontend:** Vitest + React Testing Library
- **Mocking Pattern:** `vi.mock()` at test file top; use factory functions to generate test data with sensible defaults
- **Test Structure:** `beforeEach(() => vi.clearAllMocks())` to reset mocks; render component, mock API calls, assert DOM output
- **Example:** [Products.test.tsx](frontend/tests/Products.test.tsx) mocks category and product APIs, uses `productFactory()` to create fixture objects

---

## Critical Files Reference
- **Auth:** [authController.ts](backend/src/controllers/authController.ts), [authMiddleware.ts](backend/src/middleware/authMiddleware.ts), [api.ts](frontend/src/utils/api.ts)
- **Product CRUD:** [productController.ts](backend/src/controllers/productController.ts), [api/product.ts](frontend/src/api/product.ts)
- **Routing:** [App.tsx](frontend/src/App.tsx), [app.ts](backend/src/app.ts)
- **Data Schema:** [schema.prisma](backend/prisma/schema.prisma)
- **Tests:** [Products.test.tsx](frontend/tests/Products.test.tsx), [factories/productFactory.ts](frontend/tests/factories/productFactory.ts)

---

## When Adding Features
1. **Backend:** Add Prisma model → migration → controller with validation → route → test error cases
2. **Frontend:** Add API method → component/page logic → form/UI → Vitest mocking → test user flows
3. **Validation:** Backend validates all inputs (normalize, check existence, verify types); frontend prevents invalid submission UI-side
4. **Auth:** Protect backend routes with `protect` middleware; protect frontend pages with `<PrivateRoute>` wrapper
