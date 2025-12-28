import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes'; 
import { errorHandler } from './middleware/errorMiddleware';
import categoryTypeRoutes from './routes/categoryTypeRoutes';
import categoryRoutes from './routes/categoryRoutes';

const app = express();

app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true,
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use("/api/category-types", categoryTypeRoutes);
app.use('/api/categories', categoryRoutes);
app.use(errorHandler);

export default app;
