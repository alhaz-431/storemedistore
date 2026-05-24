import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import path from "path"; // ইমেজ পাথের জন্য এটি প্রয়োজন

import adminRoutes from "./routes/admin.routes";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import medicineRoutes from "./routes/medicine.routes";
import categoryRoutes from "./routes/category.routes";
import orderRoutes from "./routes/order.routes";

const app: Application = express();

// ✅ CORS কনফিগারেশন (লোকাল এবং লাইভ ফ্রন্টএন্ড ডোমেন)
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://storefrontend-ten.vercel.app"
  ],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // FormData হ্যান্ডেল করতে সাহায্য করে

// ✅ ইমেজ এক্সেс করার জন্য স্ট্যাটিক ফোল্ডার কনফিগারেশন
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ✅ অ্যাসাইনমেন্ট রিকোয়ারমেন্ট অনুযায়ী ডিরেক্ট এপিআই রাউটিং (কোনো v1 থাকবে না)
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);

// Root Route
app.get("/", (req: Request, res: Response) => {
  res.send("MediStore API is running perfectly 🚀");
});

// 404 Route Not Found হ্যান্ডলার
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// গ্লোবাল এরর হ্যান্ডলার (Global Error Handler)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("🔥 Error Stack:", err.stack);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Something went wrong!",
  });
});

export default app;