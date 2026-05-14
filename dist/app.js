"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path")); // ইমেজ পাথের জন্য এটি প্রয়োজন
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const medicine_routes_1 = __importDefault(require("./routes/medicine.routes"));
const category_routes_1 = __importDefault(require("./routes/category.routes"));
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const app = (0, express_1.default)();
// ✅ CORS
app.use((0, cors_1.default)({
    origin: [
        "http://localhost:3000",
        "https://storefrontend-ten.vercel.app"
    ],
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true })); // FormData হ্যান্ডেল করতে সাহায্য করে
// ✅ ইমেজ এক্সেস করার জন্য স্ট্যাটিক ফোল্ডার কনফিগারেশন
// এর ফলে https://your-domain.com/uploads/filename.jpg লিংকে ছবি পাওয়া যাবে
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../uploads")));
// API versioning (BEST PRACTICE)
const API = "/api/v1";
app.use(`${API}/admin`, admin_routes_1.default);
app.use(`${API}/auth`, auth_routes_1.default);
app.use(`${API}/users`, user_routes_1.default);
app.use(`${API}/medicines`, medicine_routes_1.default);
app.use(`${API}/categories`, category_routes_1.default);
app.use(`${API}/orders`, order_routes_1.default);
// Root
app.get("/", (req, res) => {
    res.send("MediStore API is running perfectly 🚀");
});
// 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});
// Error handler
app.use((err, req, res, next) => {
    console.error("🔥 Error Stack:", err.stack);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Something went wrong!",
    });
});
exports.default = app;
