"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path")); // ইমেজ পাথের জন্য এটি প্রয়োজন
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const medicine_routes_1 = __importDefault(require("./routes/medicine.routes"));
const category_routes_1 = __importDefault(require("./routes/category.routes"));
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const app = (0, express_1.default)();
// ✅ CORS কনফিগারেশন (লোকাল এবং লাইভ ফ্রন্টএন্ড ডোমেন)
app.use((0, cors_1.default)({
    origin: [
        "http://localhost:3000",
        "https://storefrontend-ten.vercel.app"
    ],
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true })); // FormData হ্যান্ডেল করতে সাহায্য করে
// ✅ ইমেজ এক্সেс করার জন্য স্ট্যাটিক ফোল্ডার কনফিগারেশন
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../uploads")));
// ✅ অ্যাসাইনমেন্ট রিকোয়ারমেন্ট অনুযায়ী ডিরেক্ট এপিআই রাউটিং (কোনো v1 থাকবে না)
app.use("/api/admin", admin_routes_1.default);
app.use("/api/auth", auth_routes_1.default);
app.use("/api/users", user_routes_1.default);
app.use("/api/medicines", medicine_routes_1.default);
app.use("/api/categories", category_routes_1.default);
app.use("/api/orders", order_routes_1.default);
// Root Route
app.get("/", (req, res) => {
    res.send("MediStore API is running perfectly 🚀");
});
// 404 Route Not Found হ্যান্ডলার
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});
// গ্লোবাল এরর হ্যান্ডলার (Global Error Handler)
app.use((err, req, res, next) => {
    console.error("🔥 Error Stack:", err.stack);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Something went wrong!",
    });
});
exports.default = app;
