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

// ✅ CORS - যেন ভেরসেল থেকে রিকোয়েস্ট আসতে পারে
app.use(cors({
  origin: [
    'https://storefrontend-ten.vercel.app', 
    'http://localhost:3000'
  ],
  credentials: true
}));

app.use(express.json());

// ✅ আপনার পোস্টম্যানের সাথে হুবহু মিল রেখে রাউট (v1 নেই)
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);

// চেক করার জন্য রুট
app.get('/', (req, res) => {
  res.send('MediStore API is running! 🚀');
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});