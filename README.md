# 🧠 Smart Task Manager

Smart Task Manager is a full-stack task management application built with a modern microservices-ready architecture. It allows users to register, log in, and manage personal tasks with statuses, deadlines, and secure access. The project is designed for growth, CI/CD integration, and future cloud deployment.

---

## 🚀 Tech Stack

### 🔹 Frontend
- React
- TypeScript
- Tailwind CSS
- Vite

### 🔹 Backend
- Node.js
- Express.js
- PostgreSQL
- JWT (Authentication)
- Docker

### 🔹 DevOps & Deployment
- Docker Compose
- GitHub Actions (planned)
- Cloud-ready (AWS / Render in future phase)

---

## ✨ Features

- User registration and login with secure JWT tokens
- Task CRUD: create, read, update, delete
- Task filtering by status (`todo`, `in_progress`, `done`)
- Responsive UI with Tailwind CSS
- PostgreSQL database integration
- Modular file structure for scalable development
- Dockerized development environment

---

## 📁 Folder Structure
smart-task-manager/
├── backend/ → Node.js + Express API
├── frontend/ → React + TypeScript UI
├── docker-compose.yml
└── README.md


---

## 🧪 Getting Started (Local Dev)

### Clone the repo

```bash
git clone https://github.com/NaamaZecharia/smart-task-manager.git
cd smart-task-manager

## Run with Docker
docker-compose up --build

--

## 🔐 API Endpoints (Backend)
## Auth
POST /api/auth/signup
POST /api/auth/login

## Tasks (Protected routes – require JWT)
GET    /api/tasks
POST   /api/tasks
PUT    /api/tasks/:id
DELETE /api/tasks/:id

--

## 📌 Roadmap
 JWT-based authentication

 - [ ] PostgreSQL DB integration

 - [ ] REST API for tasks

 - [ ] React + Tailwind UI

 - [ ] GraphQL API layer (optional)

- [ ]  CI/CD via GitHub Actions

- [ ]  Cloud deployment (Render / AWS)

 - [ ] Notification microservice (Kafka or Redis pub/sub)

--

## 👩‍💻 Created by
Naama Bayles
Full Stack Developer | naamaz56@gmail.com | [LinkedIn](https://www.linkedin.com/in/naama-bayles-565826134/)
