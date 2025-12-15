import express from 'express';
import cors from 'cors';
import tasksRouter from './routes/taskRoutes.js';
import authRoutes from './routes/authRoutes.js'; 
import { errorHandler } from './middleware/errorMiddleware.js';

const app = express();

app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true,
}));
app.use(express.json());

app.use('/api/tasks', tasksRouter);
app.use('/api/auth', authRoutes);
app.use(errorHandler);

export default app;
