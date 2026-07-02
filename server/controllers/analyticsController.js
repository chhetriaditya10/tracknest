import ExpenseModel from "../models/Expenses.js";
import {
  detectAnomalies,
  getExpenseStatistics,
  categoryForecast,
} from "../utils/algorithms.js";
import {
  calculateForecastedSpend,
  calculateCategorySpikes,
  detectSavingOpportunities,
} from "../utils/dashboardCalculations.js";

/**
 * Analyze expenses for anomalies
 * GET /api/analytics/anomalies
 */
export const analyzeAnomalies = async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 30, threshold = 2.0 } = req.query;

    // Fetch recent expenses
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

    const expenses = await ExpenseModel.find({
      userId,
      date: { $gte: cutoffDate },
    }).sort({ date: -1 });

    if (expenses.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          anomalies: [],
          statistics: getExpenseStatistics([]),
          anomalyCount: 0,
          totalTransactions: 0,
        },
      });
    }

    // Detect anomalies
    const expenseData = expenses.map((e) => ({
      _id: e._id,
      amount: e.amount,
      category: e.category,
      date: e.date,
    }));

    const analyzedExpenses = detectAnomalies(expenseData, parseFloat(threshold));

    // Filter anomalies
    const anomalyList = analyzedExpenses.filter((e) => e.isAnomaly);

    // Get statistics
    const statistics = getExpenseStatistics(expenseData);

    return res.status(200).json({
      success: true,
      data: {
        anomalies: anomalyList,
        allAnalyzed: analyzedExpenses,
        statistics,
        anomalyCount: anomalyList.length,
        totalTransactions: expenses.length,
        anomalyPercentage: parseFloat(
          ((anomalyList.length / expenses.length) * 100).toFixed(2)
        ),
      },
    });
  } catch (error) {
    console.error("Error in analyzeAnomalies:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Forecast monthly expenses
 * GET /api/analytics/forecast
 */
export const forecastExpenses = async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 90, byCategory = false } = req.query;

    // Fetch historical expenses
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

    const expenses = await ExpenseModel.find({
      userId,
      date: { $gte: cutoffDate },
    }).sort({ date: 1 });

    if (expenses.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          forecast: null,
          message: "Insufficient historical data",
        },
      });
    }

    if (byCategory === "true") {
      // Category-based forecast
      const categoryExpenses = expenses.map((e) => ({
        category: e.category,
        amount: e.amount,
      }));

      const forecast = categoryForecast(categoryExpenses);

      return res.status(200).json({
        success: true,
        data: {
          forecast,
          historicalDataPoints: expenses.length,
          forecastType: "categoryBased",
        },
      });
    } else {
      const forecast = await calculateForecastedSpend(userId, parseInt(days, 10));

      return res.status(200).json({
        success: true,
        data: {
          forecast,
          historicalDataPoints: expenses.length,
          forecastType: "overall",
        },
      });
    }
  } catch (error) {
    console.error("Error in forecastExpenses:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Get expense insights (combined analysis)
 * GET /api/analytics/insights
 */
export const getInsights = async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 30, threshold = 2.0 } = req.query;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

    const expenses = await ExpenseModel.find({
      userId,
      date: { $gte: cutoffDate },
    }).sort({ date: -1 });

    if (!Array.isArray(expenses) || expenses.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          message: "Not enough data for insights yet",
          insights: [],
          statistics: getExpenseStatistics([]),
          forecast: null,
          anomalyCount: 0,
        },
      });
    }

    const expenseData = expenses.map((e) => ({
      _id: e._id,
      amount: e.amount,
      category: e.category || "Uncategorized",
      date: e.date,
    }));

    // Get anomalies
    const anomalies = detectAnomalies(expenseData, parseFloat(threshold));
    const anomalyList = anomalies.filter((e) => e.isAnomaly);

    // Get statistics
    const statistics = getExpenseStatistics(expenseData);
    const forecastResult = await calculateForecastedSpend(userId, 90);
    const categorySpikes = await calculateCategorySpikes(userId, 60, 15);
    const savings = await detectSavingOpportunities(userId, 3);

    const insights = [];

    if (categorySpikes.length > 0) {
      const topSpike = categorySpikes[0];
      insights.push({
        type: "anomaly",
        severity: "warning",
        message: `Your ${topSpike.category} spending rose ${topSpike.spikePercent}% vs last month.`,
        details: topSpike,
      });
    } else {
      insights.push({
        type: "anomaly",
        severity: "info",
        message: "No unusual spending detected this month.",
      });
    }

    if (savings.length > 0) {
      const topOpportunity = savings[0];
      insights.push({
        type: "saving",
        severity: "info",
        message: `Review ${topOpportunity.description} to save up to Rs ${topOpportunity.potentialSavings.toLocaleString()}.`,
        details: topOpportunity,
      });
    } else {
      insights.push({
        type: "saving",
        severity: "info",
        message: "No saving opportunities found among your recurring expenses.",
      });
    }

    if (forecastResult.forecast !== null && forecastResult.forecast !== undefined) {
      insights.push({
        type: "forecast",
        severity: "info",
        message: `Projected spend next month is Rs ${forecastResult.forecast.toLocaleString()}.`,
        details: {
          confidence: forecastResult.confidence,
          method: forecastResult.method,
        },
      });
    } else {
      insights.push({
        type: "forecast",
        severity: "info",
        message: forecastResult.message || "Not enough data available to forecast spending yet.",
      });
    }

    if (statistics.count > 0) {
      insights.push({
        type: "statistics",
        severity: "info",
        message: `Average daily expense: Rs ${statistics.mean.toLocaleString()}.`,
        details: statistics,
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        insights,
        statistics,
        forecast: forecastResult,
        anomalyCount: anomalyList.length,
      },
    });
  } catch (error) {
    console.error("Error in getInsights:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
