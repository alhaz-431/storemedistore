import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import categoryRoutes from './routes/categoryRoutes';
import medicineRoutes from './routes/medicineRoutes';
import orderRoutes from './routes/orderRoutes';
import userRoutes from './routes/userRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Middlewares - CORS কনফিগারেশন আপডেট করা হয়েছে
app.use(cors({
  origin: [
    'https://storefrontend-ten.vercel.app', // আপনার Vercel লিংক
    'http://localhost:3000'                 // লোকাল টেস্টের জন্য
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// ✅ Routes
app.use('/api/v1/auth', authRoutes);         // v1 যোগ করা হয়েছে কনভেনশন অনুযায়ী
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/medicines', medicineRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/users', userRoutes);

// Root Route
app.get('/', (req, res) => {
  res.send('MediStore API is running perfectly! 🚀');
});

// ✅ Server Start
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});