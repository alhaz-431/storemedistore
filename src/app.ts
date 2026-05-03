import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import medicineRoutes from "./routes/medicine.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/medicines", medicineRoutes);

export default app;