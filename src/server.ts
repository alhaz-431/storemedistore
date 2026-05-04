import app from "./app";

const PORT = process.env.PORT || 5000;

// uncaught exception (must)
process.on("uncaughtException", (err: any) => {
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.error(err);
  process.exit(1);
});

// server start
const server = app.listen(PORT, () => {
  console.log(`🚀 MediStore Server is running on port ${PORT}`);
});

// unhandled rejection
process.on("unhandledRejection", (err: any) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.error(err);
  server.close(() => {
    process.exit(1);
  });
});