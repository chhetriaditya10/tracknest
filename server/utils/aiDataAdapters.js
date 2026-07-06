import ExpenseModel from "../models/Expenses.js";
import { calculateForecastedSpend } from "../utils/dashboardCalculations.js";
import { detectAnomalies } from "../utils/algorithms.js";

export const getMonthlyAnalyticsForUser = async (userId) => {
  // Reuse existing analytics endpoints where possible. Minimal adapter here.
  // As a safe fallback, compute simple totals from expenses.
  const expenses = await ExpenseModel.find({ user: userId }).sort({ date: -1 }).lean();
  const totalExpense = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const categoryExpenses = Object.values(
    expenses.reduce((acc, e) => {
      const key = e.category || 'Uncategorized';
      acc[key] = acc[key] || { category: key, amount: 0 };
      acc[key].amount += Number(e.amount) || 0;
      return acc;
    }, {})
  ).sort((a, b) => b.amount - a.amount);

  return { totalExpense, categoryExpenses, dailySpending: expenses.slice(0, 30) };
};

export const getForecastForUser = async (userId) => {
  try {
    const res = await calculateForecastedSpend(userId, 90);
    return res || null;
  } catch (err) {
    return null;
  }
};

export const getAnomaliesForUser = async (userId) => {
  // If there's an existing anomaly detector, reuse it. Otherwise run a light heuristic.
  try {
    const expenses = await ExpenseModel.find({ user: userId }).sort({ date: -1 }).lean();
    const anomalies = typeof detectAnomalies === 'function' ? detectAnomalies(expenses || []) : [];
    return anomalies || [];
  } catch (err) {
    return [];
  }
};
