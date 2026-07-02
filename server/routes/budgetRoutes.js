import express from "express";
import Budget from "../models/Budget.js";
import { verifyToken } from "../middlewares/middleware.js";

const router = express.Router();

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

// Update budget spent amount
router.put("/updateBudgetSpent/:id", verifyToken, async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget || budget.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { spent } = req.body;
    budget.spent = spent;

    // Update status based on spent amount
    const percentage = (spent / budget.limit) * 100;
    if (spent > budget.limit) {
      budget.status = "exceeded";
    } else if (percentage >= 80) {
      budget.status = "warning";
    } else {
      budget.status = "safe";
    }

    budget.updatedAt = Date.now();
    await budget.save();

    res.status(200).json({ message: "Budget spent updated", budget });
  } catch (err) {
    res.status(500).json({ message: "Error updating budget spent", error: err.message });
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

// Get budget summary
router.get("/getBudgetSummary", verifyToken, async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.user.id, isActive: true });
    
    const summary = {
      totalBudgets: budgets.length,
      totalLimit: budgets.reduce((sum, b) => sum + b.limit, 0),
      totalSpent: budgets.reduce((sum, b) => sum + b.spent, 0),
      safeCount: budgets.filter((b) => b.status === "safe").length,
      warningCount: budgets.filter((b) => b.status === "warning").length,
      exceededCount: budgets.filter((b) => b.status === "exceeded").length,
    };

    summary.spentPercentage = (summary.totalSpent / summary.totalLimit) * 100 || 0;

    res.status(200).json({ summary });
  } catch (err) {
    res.status(500).json({ message: "Error fetching budget summary", error: err.message });
  }
});

export default router;
