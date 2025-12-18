# Invify

**Invify** is a lightweight, full-featured inventory management system designed for small businesses to manage products, categories, and stock levels with ease. Built as a freelance project to demonstrate strong full-stack capabilities using modern web technologies.

---

## 🚀 Features

- 🔐 **Authentication** with JWT & bcrypt
- 🧾 **Category & Product Management**
- 📦 Track inventory quantities, pricing & descriptions
- 🧠 **Protected API routes** with middleware enforcement
- 📊 Ready for future **reporting, order tracking, and analytics**
- 🛡️ Built with security and scalability in mind

---

## 🛠️ Tech Stack

**Frontend**
- Vite + React + TypeScript
- React Router
- Axios
- Vitest + React Testing Library

**Backend**
- Express.js + TypeScript
- PostgreSQL with Prisma ORM
- JWT Authentication
- Express Middleware
- Docker-ready architecture

---

## 🧪 Testing

- Component & integration testing using `Vitest` and `@testing-library/react`
- Test coverage for core forms & business logic

---

## ⚙️ Setup Instructions

1. Clone the repository
2. Set up your `.env` files for frontend and backend
3. Run Prisma migrations:  
   ```bash
   npx prisma migrate dev
