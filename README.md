# Invify — Inventory & Order Management SaaS (Full Stack)

Invify is a modern full-stack web application designed for small businesses to manage **products, categories, customers, and orders** through a clean UI and secure APIs.

👉 **Live Demo:** https://invify-prod.vercel.app  
👉 **Backend API:** https://invify-6vh2.onrender.com  

> **Tech stack:** React + TypeScript + Tailwind (Vite) • Node.js + Express • PostgreSQL + Prisma • JWT Auth • Vercel • Render

---

## ✨ Why Invify?
Small businesses often track inventory and orders across spreadsheets, notes, and disconnected tools.  
**Invify** centralizes inventory and order workflows into a single system — built with scalability, security, and clean architecture in mind.

---

## 🚀 Features

### 🔐 Authentication & Security
- JWT-based authentication
- Protected routes & authorization middleware
- Environment-based configuration

### 📦 Inventory Management
- Create / update / delete **Categories**
- Create / update / delete **Products**
- Structured CRUD APIs with controller–service separation

### 🧾 Orders & Customers
- Customer management
- Draft & confirmed orders
- Custom order items + product-based items
- Calculated totals (subtotal, tax, discount, total)

### 🎨 Modern Frontend
- React + Vite for fast builds
- Responsive UI with Tailwind CSS
- Modal-driven UX for complex workflows
- Client-side validation patterns

### 🗄️ Database & Data Modeling
- PostgreSQL with Prisma ORM
- Relational schema for products, categories, customers, and orders
- Migration-based schema evolution

### 🧪 Testing & Developer Experience
- Unit & integration tests using **Vitest**
- Clean repo structure
- Consistent async error handling
- Dockerized local PostgreSQL setup

---

## 🧱 Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS

### Backend
- Node.js
- Express
- REST APIs
- JWT Authentication

### Database
- PostgreSQL
- Prisma ORM

### Tooling & Infrastructure
- Git / GitHub
- Docker & Docker Compose
- Vercel (frontend)
- Render (backend)
- Supabase (PostgreSQL)

---

## 🗂️ Project Structure (High Level)
```
/frontend
/src
/components
/pages
/services
/hooks

/backend
/src
/routes
/controllers
/middleware
/services
/prisma
```

---

## 🚀 Deployment

Invify is deployed as a **production-ready full-stack application** using modern cloud infrastructure with CI/CD enabled.

### 🌐 Live URLs
- **Frontend (Vercel)**  
  https://invify-prod.vercel.app
- **Backend API (Render)**  
  https://invify-6vh2.onrender.com

---

### 🧱 Deployment Architecture
```
Browser
↓
Vercel (React / Vite frontend)
↓ HTTPS + CORS
Render (Node.js / Express API)
↓
Supabase (PostgreSQL)
```
---


---

### 🔁 CI / CD Flow

**Frontend (Vercel)**
- Automatic deployment on every push to `main`
- Vite build pipeline
- Global CDN delivery
- Preview deployments for non-production commits

**Backend (Render)**
- Automatic deployment on push to `main`
- TypeScript build
- Prisma client generation
- Application restart

---

### 🔐 Environment Variables

All secrets and configuration are managed via **cloud environment variables**.

**Backend (Render)**
- `DATABASE_URL`
- `JWT_SECRET`
- `CORS_ORIGIN`
- `NODE_ENV=production`

**Frontend (Vercel)**
- `VITE_API_BASE_URL` → Render API URL

`.env` files are used **only for local development** and are not committed.

---

### 🌍 CORS & Security
- Explicit CORS configuration allows only trusted frontend origins
- Credentialed cross-origin requests supported
- Unauthorized origins are blocked by default

---

## ✅ Getting Started (Local)

### Prerequisites
- Node.js (LTS)
- Docker

### Clone & install
```
git clone https://github.com/NaamaZecharia/invify.git
cd invify

cd backend && npm install
cd ../frontend && npm install
```

## 🐘 Database Setup
```
docker compose up -d
npx prisma migrate dev
npx prisma generate
```
---

### 🔐 Environment Variables (Local)
Create `.env` in `backend/`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/invify"
JWT_SECRET="your_secret"
PORT=5000
```

---

## ▶️ Run the App
```bash
cd backend && npm run dev
cd frontend && npm run dev
```

---

## 🧪 Testing
```bash
npm test
```

---

## 🗺️ Roadmap
- Role-based permissions
- Inventory alerts
- Pagination & search
- Order editing workflows
- Serverless deployment
- AI-assisted features

---

## 👩‍💻 Author
**Naama Bayles**  
Full Stack Engineer — Austin, TX  
https://www.linkedin.com/in/naama-bayles-565826134/
