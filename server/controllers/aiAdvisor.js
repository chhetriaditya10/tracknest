import ExpenseModel from "../models/Expenses.js";
import IncomeModel from "../models/Incomes.js";
import BudgetModel from "../models/Budget.js";
import { computeBasicStats, weightedMovingAverage, analyzeTrend, computeConfidence, generateRecommendations } from "../lib/aiService.js";

export const getAdvice = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Authentication required' });

    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);

    const expenses = await ExpenseModel.find({ userId, date: { $gte: threeMonthsAgo } }).lean();
    const incomes = await IncomeModel.find({ userId, date: { $gte: threeMonthsAgo } }).lean();
    const budgets = await BudgetModel.find({ userId }).lean();

    const totalSpent = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
    const totalIncome = incomes.reduce((s, i) => s + (Number(i.amount) || 0), 0);
    const savingsRate = totalIncome > 0 ? Math.max(0, (totalIncome - totalSpent) / totalIncome) : 0;

    const amounts = expenses.map((e) => Number(e.amount) || 0);
    const { mean, sd } = computeBasicStats(amounts);
    const outliers = expenses.filter((e) => sd > 0 && Math.abs(((Number(e.amount) || 0) - mean) / sd) > 2).slice(0, 5);

    // Build monthly totals for last 6 months for trend/prediction
    const monthMap = new Map();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      monthMap.set(key, 0);
    }
    expenses.forEach((e) => {
      const d = new Date(e.date);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      if (monthMap.has(key)) monthMap.set(key, monthMap.get(key) + (Number(e.amount) || 0));
    });

    const monthlyTotals = Array.from(monthMap.values());

    const prediction = weightedMovingAverage(monthlyTotals, 3);
    const trendInfo = analyzeTrend(monthlyTotals);
    const confidence = computeConfidence(monthlyTotals);

    const suggestions = generateRecommendations({ savingsRate, trend: trendInfo.trend, outliers, budgetsCount: budgets.length });

    const transactionsAnalyzed = expenses.length;
    const categoriesIncluded = Array.from(new Set(expenses.map((e) => e.category).filter(Boolean)));
    const monthsWithNoData = monthlyTotals.filter((v) => !v || v === 0).length;

    const summary = {
      totalSpent,
      totalIncome,
      savingsRate: Number(savingsRate.toFixed(3)),
      recentMonths: 3,
      budgetsCount: budgets.length,
      monthlyTotals,
      prediction: prediction === null ? null : Number(prediction.toFixed(2)),
      predictionConfidence: confidence,
      trend: trendInfo.trend,
    };

    // Non-breaking metadata to support UI data-quality indicators
    const metadata = {
      transactionsAnalyzed,
      categoriesIncluded,
      monthsHistorical: monthlyTotals.length,
      monthsWithNoData,
      missingData: monthsWithNoData > 0,
      lastUpdated: new Date().toISOString(),
    };

    return res.status(200).json({ summary, suggestions, outliers, metadata });
  } catch (err) {
    console.error('AI advisor error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};

export default { getAdvice };
