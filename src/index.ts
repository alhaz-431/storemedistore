// src/index.ts

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import categoryRoutes from './routes/categoryRoutes';
import medicineRoutes from './routes/medicineRoutes';
import orderRoutes from './routes/orderRoutes';
import userRoutes from './routes/userRoutes'; // <--- এই নতুন লাইনটি যোগ করুন

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes); // <--- এই নতুন লাইনটি যোগ করুন

app.get('/', (req, res) => {
  res.send('MediStore API is running perfectly! 🚀');
});

// Server Start
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});