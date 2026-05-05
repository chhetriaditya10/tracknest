import express from "express";
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

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/expense", expenseRouter);
app.use("/api/balance", incomeRouter);
app.use("/api/activity", activityRouter);
app.use("/api/account", accountRouter);
app.use("/api/budget", budgetRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/recurring", recurringRouter);

// Root route (for Render health check)
app.get("/", (req, res) => {
  res.send("TrackNest API is running ✅");
});

// Start server only AFTER DB is connected
const PORT = process.env.PORT || 5000;

connectToDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error(
      "❌ Failed to connect to DB. Server not started.",
      error.message
    );
  });
