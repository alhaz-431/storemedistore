"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes")); // ✅ MUST HAVE THIS
const medicine_routes_1 = __importDefault(require("./routes/medicine.routes"));
const category_routes_1 = __importDefault(require("./routes/category.routes"));
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/api/admin", admin_routes_1.default);
app.use("/api/auth", auth_routes_1.default);
app.use("/api/users", user_routes_1.default); // ✅ now works
app.use("/api/medicines", medicine_routes_1.default);
app.use("/api/categories", category_routes_1.default);
app.use("/api/orders", order_routes_1.default);
exports.default = app;
