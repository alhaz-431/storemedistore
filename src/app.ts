import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import path from "path"; // ইমেজ পাথের জন্য এটি প্রয়োজন

import adminRoutes from "./routes/admin.routes";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import medicineRoutes from "./routes/medicine.routes";
import categoryRoutes from "./routes/category.routes";
import orderRoutes from "./routes/order.routes";

const app: Application = express();

// ✅ CORS
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://storefrontend-ten.vercel.app"
  ],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // FormData হ্যান্ডেল করতে সাহায্য করে

// ✅ ইমেজ এক্সেস করার জন্য স্ট্যাটিক ফোল্ডার কনফিগারেশন
// এর ফলে https://your-domain.com/uploads/filename.jpg লিংকে ছবি পাওয়া যাবে
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// API versioning (BEST PRACTICE)
const API = "/api/v1";

app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);

// Root
app.get("/", (req: Request, res: Response) => {
  res.send("MediStore API is running perfectly 🚀");
});

// 404
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("🔥 Error Stack:", err.stack);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Something went wrong!",
  });
});

export default app;