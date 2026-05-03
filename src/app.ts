import express from "express";
import cors from "cors";

import adminRoutes from "./routes/admin.routes";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes"; // ✅ MUST HAVE THIS
import medicineRoutes from "./routes/medicine.routes";
import categoryRoutes from "./routes/category.routes";
import orderRoutes from "./routes/order.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes); // ✅ now works
app.use("/api/medicines", medicineRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);

export default app;