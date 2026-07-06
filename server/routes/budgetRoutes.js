import express from "express";
import mongoose from "mongoose";
import Budget from "../models/Budget.js";
import ExpenseModel from "../models/Expenses.js";
import { verifyToken } from "../middlewares/middleware.js";
import { calculateBudgetThreshold } from "../utils/budgetThreshold.js";

const router = express.Router();

// ✅ HELPER FUNCTION: Calculate spent for a budget's period
async function calculateSpentForPeriod(budget) {
  const now = new Date();
  let startDate;

  // Determine period start date
  if (budget.period === "daily") {
    startDate = new Date(now);
    startDate.setHours(0, 0, 0, 0);
  } else if (budget.period === "weekly") {
    startDate = new Date(now);
    const day = now.getDay();
    startDate.setDate(now.getDate() - day); // Start of week (Sunday)
    startDate.setHours(0, 0, 0, 0);
  } else if (budget.period === "month" || budget.period === "monthly") {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (budget.period === "quarterly") {
    const quarter = Math.floor(now.getMonth() / 3);
    startDate = new Date(now.getFullYear(), quarter * 3, 1);
  } else if (budget.period === "yearly") {
    startDate = new Date(now.getFullYear(), 0, 1);
  } else {
    // Default to monthly
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  try {
    const query = {
      userId: mongoose.Types.ObjectId(budget.userId),
      date: { $gte: startDate },
    };

    if (budget.category && budget.category.toLowerCase() !== "all") {
      query.category = new RegExp(`^${budget.category.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
    }

    console.log("Budget spend query:", JSON.stringify({
      userId: budget.userId?.toString(),
      category: query.category ? budget.category : "(all)",
      startDate: query.date.$gte.toISOString(),
    }));

    const expenses = await ExpenseModel.find(query).lean();
    console.log("Expenses found for budget:", expenses.length);

    const totalSpent = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    return totalSpent;
  } catch (error) {
    console.error("Error calculating spent for period:", error);
    return 0;
  }
}

// Get all budgets for user
router.get("/getBudgets", verifyToken, async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.user.id });
    res.status(200).json({ budgets });
  } catch (err) {
    res.status(500).json({ message: "Error fetching budgets", error: err.message });
  }
});

// Get active budgets only
router.get("/getActiveBudgets", verifyToken, async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.user.id, isActive: true });
    res.status(200).json({ budgets });
  } catch (err) {
    res.status(500).json({ message: "Error fetching budgets", error: err.message });
  }
});

// Create new budget
router.post("/createBudget", verifyToken, async (req, res) => {
  try {
    const { budgetName, budgetType, category, limit, period, alerts } = req.body;

    if (!budgetName || !budgetType || limit === undefined || limit === null || !period) {
      return res.status(400).json({
        message: "budgetName, budgetType, limit, and period are required",
      });
    }

    const parsedLimit = Number(limit);
    if (isNaN(parsedLimit) || parsedLimit <= 0) {
      return res.status(400).json({
        message: "Budget limit must be a positive number",
      });
    }

    const validPeriods = ["daily", "weekly", "month", "monthly", "quarterly", "yearly"];
    const normalizedPeriod = validPeriods.includes(period) ? period : "monthly";

    const newBudget = new Budget({
      userId: req.user.id,
      budgetName,
      budgetType,
      category,
      limit: parsedLimit,
      period: normalizedPeriod,
      spent: 0, // ✅ Initialize to 0 (will be calculated dynamically)
      alerts: alerts || [
        { threshold: 50, enabled: true, notificationMethod: "app" },
        { threshold: 80, enabled: true, notificationMethod: "app" },
        { threshold: 100, enabled: true, notificationMethod: "app" },
      ],
      startDate: new Date(),
    });

    await newBudget.save();
    res.status(201).json({ message: "Budget created successfully", budget: newBudget });
  } catch (err) {
    res.status(500).json({ message: "Error creating budget", error: err.message });
  }
});

// Update budget
router.put("/updateBudget/:id", verifyToken, async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget || budget.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { budgetName, limit, alerts, isActive, status } = req.body;

    if (budgetName) budget.budgetName = budgetName;
    if (limit !== undefined) budget.limit = limit;
    if (alerts) budget.alerts = alerts;
    if (isActive !== undefined) budget.isActive = isActive;
    if (status) budget.status = status;

    budget.updatedAt = Date.now();
    await budget.save();

    res.status(200).json({ message: "Budget updated successfully", budget });
  } catch (err) {
    res.status(500).json({ message: "Error updating budget", error: err.message });
  }
});

export const getBudgetSummaryHandler = async (req, res) => {
  try {
    console.log("========== BUDGET DEBUG ==========");
    const userId = req.user?.id;
    console.log("Authenticated user ID:", userId?.toString());

    if (!userId) {
      console.warn("Missing authenticated user ID in getBudgetSummary");
      return res.status(401).json({ message: "User authentication required" });
    }

    const allBudgets = await Budget.find({}).lean();
    console.log("Total budgets in DB:", allBudgets.length);

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const budgets = await Budget.find({ userId: userObjectId }).lean();
    console.log("Budgets found for user:", budgets.length);

    budgets.forEach((b, index) => {
      console.log(`Budget ${index + 1}: name=${b.budgetName}, userId=${b.userId?.toString()}, active=${b.isActive}, limit=${b.limit}, category=${b.category}, period=${b.period}`);
    });

    let totalSpent = 0;
    let totalLimit = 0;
    let safeCount = 0;
    let warningCount = 0;
    let exceededCount = 0;

    const monthlyBudgetTarget = Number(req.user?.monthlyBudget) || 0;
    if (monthlyBudgetTarget > 0) {
      totalLimit = monthlyBudgetTarget;

      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const monthlyExpenses = await ExpenseModel.find({
        userId: userObjectId,
        date: { $gte: startDate, $lt: endDate },
      }).lean();

      totalSpent = monthlyExpenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);

      const thresholdInfo = calculateBudgetThreshold(totalSpent, totalLimit);
      if (thresholdInfo.budgetStatus === "Safe") safeCount++;
      else if (thresholdInfo.budgetStatus === "Warning") warningCount++;
      else if (thresholdInfo.budgetStatus === "Exceeded") exceededCount++;

      console.log(`MonthlyBudget summary: limit=${totalLimit}, spent=${totalSpent}, status=${thresholdInfo.budgetStatus}`);
    } else {
      for (const budget of budgets) {
        const spent = await calculateSpentForPeriod(budget);

        console.log(
          `Budget: ${budget.budgetName} | Limit: ${budget.limit} | Spent: ${spent}`
        );

        totalSpent += spent;
        totalLimit += Number(budget.limit) || 0;

        const thresholdInfo = calculateBudgetThreshold(spent, budget.limit);

        if (thresholdInfo.budgetStatus === "Safe") safeCount++;
        else if (thresholdInfo.budgetStatus === "Warning") warningCount++;
        else if (thresholdInfo.budgetStatus === "Exceeded") exceededCount++;
      }
    }

    const summary = {
      totalBudgets: budgets.length,
      totalLimit,
      totalSpent,
      safeCount,
      warningCount,
      exceededCount,
    };

    const thresholdInfo = calculateBudgetThreshold(
      summary.totalSpent,
      summary.totalLimit
    );

    summary.spentPercentage = thresholdInfo.thresholdPercentage;
    summary.budgetStatus = thresholdInfo.budgetStatus;
    summary.warningMessage = thresholdInfo.warningMessage;
    summary.thresholdPercentage = thresholdInfo.thresholdPercentage;
    summary.warningThreshold = thresholdInfo.warningThreshold;
    summary.remainingBudget = thresholdInfo.remainingBudget;
    summary.exceededAmount = thresholdInfo.exceededAmount;

    console.log("Summary:", summary);
    console.log("==================================");

    res.status(200).json({ summary });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error fetching budget summary",
      error: err.message,
    });
  }
};

// Get budget summary with DYNAMIC spent calculation ✅
router.get("/getBudgetSummary", verifyToken, getBudgetSummaryHandler);

// Get individual budget details with spent calculation ✅
router.get("/getBudgetDetails/:id", verifyToken, async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget || budget.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // ✅ Calculate actual spent for this budget
    const spent = await calculateSpentForPeriod(budget);
    const thresholdInfo = calculateBudgetThreshold(spent, budget.limit);

    const budgetDetails = {
      ...budget.toObject(),
      spent, // ✅ Current period spent
      percentageUsed: thresholdInfo.thresholdPercentage,
      status: thresholdInfo.budgetStatus,
      remainingBudget: thresholdInfo.remainingBudget,
      exceededAmount: thresholdInfo.exceededAmount,
    };

    res.status(200).json({ budget: budgetDetails });
  } catch (err) {
    res.status(500).json({ message: "Error fetching budget details", error: err.message });
  }
});

// Delete budget
router.delete("/deleteBudget/:id", verifyToken, async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget || budget.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Budget.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Budget deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting budget", error: err.message });
  }
});

export default router;