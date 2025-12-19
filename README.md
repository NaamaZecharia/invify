# Invify — Inventory Management SaaS (Full Stack)

Modern inventory management web app built for small businesses to organize products, categories, and stock workflows with a clean UI and secure APIs.

> **Tech stack:** React + TypeScript + Tailwind (Vite) • Node.js + Express • PostgreSQL + Prisma • JWT Auth • Docker • Vitest

---

## ✨ Why Invify?
Small businesses often track inventory across spreadsheets, notes, and scattered systems. **Invify** centralizes product and category management with a fast, responsive UI and a secure backend — designed for scalability and clean maintainable code.

---

## 🚀 Features
- **Authentication & Security**
  - JWT-based authentication
  - Protected routes & middleware authorization
- **Inventory Management**
  - Create / update / delete **Categories**
  - Create / update / delete **Products**
  - Clean CRUD API structure with controllers + services
- **Modern Frontend**
  - Responsive UI with Tailwind CSS
  - Component-based architecture
  - Form handling & client-side validation patterns
- **Database & Data Modeling**
  - PostgreSQL schema designed with Prisma ORM
  - Relational modeling for products and categories
- **Testing**
  - Unit + integration tests using **Vitest** and **Testing Library**
- **Developer Experience**
  - Dockerized local PostgreSQL setup
  - Clean repo structure + consistent async error handling

---

## 🧱 Tech Stack
**Frontend**
- React, TypeScript
- Vite
- Tailwind CSS

**Backend**
- Node.js, Express
- JWT authentication
- REST APIs

**Database**
- PostgreSQL
- Prisma ORM

**Tooling**
- Docker / Docker Compose
- Git / GitHub
- Vitest + Testing Library

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

## ✅ Getting Started (Local)

### Prerequisites
- Node.js (LTS)
- Docker

### Clone & install
```bash
git clone https://github.com/NaamaZecharia/invify.git
cd invify
```

```bash
cd backend && npm install
cd ../frontend && npm install
```

---

## 🐘 Database Setup
```bash
docker compose up -d
npx prisma migrate dev
npx prisma generate
```

---

## 🔐 Environment Variables
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
- Event-driven workflows
- Serverless deployment
- AI-assisted features

---

## 👩‍💻 Author
**Naama Bayles**  
Full Stack Engineer — Austin, TX  
https://www.linkedin.com/in/naama-bayles-565826134/
