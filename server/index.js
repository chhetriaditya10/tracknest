import express from "express";
import mongoose from "mongoose";
import connectToDb from "./db/db.js";
import cors from "cors";
import dotenv from "dotenv";
import authRouter from "./routes/authRoutes.js";
import expenseRouter from "./routes/expensesRoutes.js";
import incomeRouter from "./routes/incomesRoutes.js";
import activityRouter from "./routes/activities.js";
import accountRouter from "./routes/accountRoutes.js";
import budgetRouter from "./routes/budgetRoutes.js";
import analyticsRouter from "./routes/analyticsRoutes.js";
import recurringRouter from "./routes/recurringRoutes.js";
import aiRouter from "./routes/aiRoutes.js";
import aiChatRouter from "./routes/aiChatRoutes.js";
import investmentRouter from "./routes/investmentRoutes.js";
import goalRouter from "./routes/goalRoutes.js";
import checkoutRouter, { handleStripeWebhook } from "./routes/checkoutRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import { startRecurringJob } from "./scheduler/recurringJob.js";

dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.options(/(.*)/, cors());

// Stripe webhook endpoint must receive raw body to verify signature.
app.post(
  "/api/checkout/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

app.use(express.json());

app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    console.log(`API request ${req.method} ${req.path} - mongoose readyState=${mongoose.connection.readyState}`);
  }
  if (req.path.startsWith("/api") && mongoose.connection.readyState !== 1) {
    console.warn(
      "API request blocked because mongoose is not connected. readyState:",
      mongoose.connection.readyState
    );
    return res.status(503).json({
      success: false,
      message:
        "Database unavailable. Please configure MongoDB or start the local MongoDB service.",
    });
  }
  next();
});

// Routes
app.use("/api/auth", authRouter);
app.use("/api/expense", expenseRouter);
app.use("/api/balance", incomeRouter);
app.use("/api/activity", activityRouter);
app.use("/api/account", accountRouter);
app.use("/api/budget", budgetRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/recurring", recurringRouter);
console.log("Mounted /api/recurring routes:", recurringRouter.stack.filter((layer) => layer.route).map((layer) => ({ path: layer.route.path, methods: layer.route.methods })));
app.use("/api/investment", investmentRouter);
app.use("/api/goal", goalRouter);
app.use("/api/checkout", checkoutRouter);
app.use("/api/admin", adminRouter);
// AI Financial Advisor routes
app.use("/api/ai", aiRouter);
// AI Chat Assistant routes
app.use("/api/aichat", aiChatRouter);

// Expose direct POST /api/balance for compatibility with clients that may not resolve router mounts correctly.
app.post("/api/balance", (req, res, next) => {
  // Forward to the mounted router by calling the same handler chain.
  req.url = "/";
  incomeRouter.handle(req, res, next);
});

// API 404 fallback returns JSON instead of HTML for missing API endpoints.
app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.originalUrl}`,
  });
});

// Root route (for Render health check)
app.get("/", (req, res) => {
  res.send("TrackNest API is running ✅");
});

// Start server only AFTER DB is connected
const PORT = process.env.PORT || 5000;

// Export app for testing
export default app;

const startServer = () => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log("mongoose readyState:", mongoose.connection.readyState);
  });
};

connectToDb()
  .then(() => {
    if (mongoose.connection.readyState === 1) {
      console.log("✅ Database is ready. Starting server.");
      startRecurringJob();
    } else {
      console.warn(
        "⚠️ Database connect call resolved but mongoose readyState is not 1."
      );
    }
  })
  .catch((error) => {
    console.error("❌ Database connection attempt failed:", error.message);
  })
  .finally(() => {
    startServer();
  });
