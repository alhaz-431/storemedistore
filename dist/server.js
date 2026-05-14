"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const PORT = process.env.PORT || 5000;
// uncaught exception (must)
process.on("uncaughtException", (err) => {
    console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
    console.error(err);
    process.exit(1);
});
// server start
const server = app_1.default.listen(PORT, () => {
    console.log(`🚀 MediStore Server is running on port ${PORT}`);
});
// unhandled rejection
process.on("unhandledRejection", (err) => {
    console.log("UNHANDLED REJECTION! 💥 Shutting down...");
    console.error(err);
    server.close(() => {
        process.exit(1);
    });
});
