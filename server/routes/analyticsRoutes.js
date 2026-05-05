import express from "express";
import Analytics from "../models/Analytics.js";
import Expenses from "../models/Expenses.js";
import Incomes from "../models/Incomes.js";
import { verifyToken } from "../middlewares/middleware.js";

const router = express.Router();

// Generate monthly analytics
router.get("/generateMonthlyAnalytics/:month", verifyToken, async (req, res) => {
  try {
    const { month } = req.params; // Format: "2026-05"
    const [year, monthNum] = month.split("-");
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 1);

    // Get expenses
    const expenses = await Expenses.find({
      userId: req.user.id,
      date: { $gte: startDate, $lt: endDate },
    });

    // Get incomes
    const incomes = await Incomes.find({
      userId: req.user.id,
      date: { $gte: startDate, $lt: endDate },
    });

    // Calculate totals
    const totalExpense = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const totalIncome = incomes.reduce((sum, i) => sum + Number(i.amount), 0);
    const netSavings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

    // Category breakdown
    const categoryExpenses = {};
    expenses.forEach((e) => {
      categoryExpenses[e.category] = (categoryExpenses[e.category] || 0) + Number(e.amount);
    });

    const categoryIncomes = {};
    incomes.forEach((i) => {
      categoryIncomes[i.category] = (categoryIncomes[i.category] || 0) + Number(i.amount);
    });

    // Convert to arrays
    const categoryExpensesArray = Object.entries(categoryExpenses).map(([category, amount]) => ({
      category,
      amount,
      percentage: (amount / totalExpense) * 100,
    }));

    const categoryIncomesArray = Object.entries(categoryIncomes).map(([category, amount]) => ({
      category,
      amount,
      percentage: (amount / totalIncome) * 100,
    }));

    // Find top categories
    const topExpenseCategory =
      categoryExpensesArray.length > 0
        ? categoryExpensesArray.reduce((prev, current) =>
            prev.amount > current.amount ? prev : current
          ).category
        : null;

    const topIncomeCategory =
      categoryIncomesArray.length > 0
        ? categoryIncomesArray.reduce((prev, current) =>
            prev.amount > current.amount ? prev : current
          ).category
        : null;

    // Daily spending
    const dailySpending = {};
    expenses.forEach((e) => {
      const date = new Date(e.date).toISOString().split("T")[0];
      dailySpending[date] = (dailySpending[date] || 0) + Number(e.amount);
    });

    const dailySpendingArray = Object.entries(dailySpending).map(([date, amount]) => ({
      date: new Date(date),
      amount,
    }));

    // Create or update analytics
    let analytics = await Analytics.findOneAndUpdate(
      { userId: req.user.id, month },
      {
        userId: req.user.id,
        month,
        year: Number(year),
        totalIncome,
        totalExpense,
        categoryExpenses: categoryExpensesArray,
        categoryIncomes: categoryIncomesArray,
        dailySpending: dailySpendingArray,
        netSavings,
        savingsRate,
        topExpenseCategory,
        topIncomeCategory,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    res.status(200).json({ analytics });
  } catch (err) {
    res.status(500).json({ message: "Error generating analytics", error: err.message });
  }
});

// Get monthly analytics
router.get("/getMonthlyAnalytics/:month", verifyToken, async (req, res) => {
  try {
    const { month } = req.params;
    const analytics = await Analytics.findOne({
      userId: req.user.id,
      month,
    });

    if (!analytics) {
      return res.status(404).json({ message: "Analytics not found" });
    }

    res.status(200).json({ analytics });
  } catch (err) {
    res.status(500).json({ message: "Error fetching analytics", error: err.message });
  }
});

// Get yearly analytics
router.get("/getYearlyAnalytics/:year", verifyToken, async (req, res) => {
  try {
    const { year } = req.params;
    const analytics = await Analytics.find({
      userId: req.user.id,
      year: Number(year),
    });

    const yearlyStats = {
      totalIncome: analytics.reduce((sum, a) => sum + a.totalIncome, 0),
      totalExpense: analytics.reduce((sum, a) => sum + a.totalExpense, 0),
      netSavings: analytics.reduce((sum, a) => sum + a.netSavings, 0),
      monthlyBreakdown: analytics,
    };

    yearlyStats.averageMonthlyExpense = yearlyStats.totalExpense / analytics.length || 0;
    yearlyStats.averageSavingsRate =
      analytics.reduce((sum, a) => sum + a.savingsRate, 0) / analytics.length || 0;

    res.status(200).json({ yearlyStats });
  } catch (err) {
    res.status(500).json({ message: "Error fetching yearly analytics", error: err.message });
  }
});

// Get comparison between months
router.get("/compareMonths/:month1/:month2", verifyToken, async (req, res) => {
  try {
    const { month1, month2 } = req.params;

    const analytics1 = await Analytics.findOne({
      userId: req.user.id,
      month: month1,
    });

    const analytics2 = await Analytics.findOne({
      userId: req.user.id,
      month: month2,
    });

    if (!analytics1 || !analytics2) {
      return res.status(404).json({ message: "Analytics not found for one or both months" });
    }

    const comparison = {
      month1: {
        month: month1,
        totalIncome: analytics1.totalIncome,
        totalExpense: analytics1.totalExpense,
        netSavings: analytics1.netSavings,
      },
      month2: {
        month: month2,
        totalIncome: analytics2.totalIncome,
        totalExpense: analytics2.totalExpense,
        netSavings: analytics2.netSavings,
      },
      incomeChange:
        ((analytics2.totalIncome - analytics1.totalIncome) / analytics1.totalIncome) * 100 || 0,
      expenseChange:
        ((analytics2.totalExpense - analytics1.totalExpense) / analytics1.totalExpense) * 100 ||
        0,
      savingsChange:
        ((analytics2.netSavings - analytics1.netSavings) / analytics1.netSavings) * 100 || 0,
    };

    res.status(200).json({ comparison });
  } catch (err) {
    res.status(500).json({ message: "Error comparing months", error: err.message });
  }
});

// Get spending insights
router.get("/getInsights", verifyToken, async (req, res) => {
  try {
    const currentMonth = new Date().toISOString().split("T")[0].slice(0, 7);
    const analytics = await Analytics.findOne({
      userId: req.user.id,
      month: currentMonth,
    });

    if (!analytics) {
      return res.status(404).json({ message: "No data for current month" });
    }

    const insights = {
      savingsRate: analytics.savingsRate.toFixed(2),
      topExpenseCategory: analytics.topExpenseCategory,
      topIncomeCategory: analytics.topIncomeCategory,
      highestSpendingDay: analytics.dailySpending.reduce((max, day) =>
        day.amount > max.amount ? day : max
      ),
      averageDailySpending:
        analytics.dailySpending.length > 0
          ? (analytics.totalExpense / analytics.dailySpending.length).toFixed(2)
          : 0,
      categoryBreakdown: analytics.categoryExpenses.slice(0, 5), // Top 5 categories
    };

    res.status(200).json({ insights });
  } catch (err) {
    res.status(500).json({ message: "Error fetching insights", error: err.message });
  }
});

export default router;
