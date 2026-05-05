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
  origin: [
    "http://localhost:3000",
    "https://storefrontend-ten.vercel.app"
  ],
  credentials: true
}));

app.use(express.json());

// API versioning (BEST PRACTICE)
const API = "/api";

app.use(`${API}/admin`, adminRoutes);
app.use(`${API}/auth`, authRoutes);
app.use(`${API}/users`, userRoutes);
app.use(`${API}/medicines`, medicineRoutes);
app.use(`${API}/categories`, categoryRoutes);
app.use(`${API}/orders`, orderRoutes);

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
  console.error(err.stack);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Something went wrong!",
  });
});

export default app;