import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";

import adminRoutes from "./routes/admin.routes";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import medicineRoutes from "./routes/medicine.routes";
import categoryRoutes from "./routes/category.routes";
import orderRoutes from "./routes/order.routes";

const app: Application = express();

// CORS
app.use(cors({
  origin: process.env.NODE_ENV === "production"
    ? ["https://storefrontend-ten.vercel.app"]
    : ["http://localhost:3000"],
  credentials: true
}));

app.use(express.json());

// Routes
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

// Not Found
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Something went wrong!",
  });
});

export default app;