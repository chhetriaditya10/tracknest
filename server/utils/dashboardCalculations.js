import ExpenseModel from "../models/Expenses.js";
import IncomeModel from "../models/Incomes.js";
import InvestmentModel from "../models/Investments.js";
import AccountModel from "../models/Account.js";
import RecurringTransactionModel from "../models/RecurringTransaction.js";
import { monthlyForecast, detectAnomalies, getExpenseStatistics } from "./algorithms.js";

/**
 * Calculate forecasted spend for the next month using WMA algorithm
 * Single source of truth for forecast calculations
 * 
 * @param {String} userId - User ID
 * @param {Number} days - Historical data window (default: 90)
 * @param {String} method - Forecast method: 'wma' or 'linear' (default: 'wma')
 * @returns {Promise<Object>} - {forecast, confidence, method, lastUpdated}
 */
export const calculateForecastedSpend = async (userId, days = 90, method = 'wma') => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const expenses = await ExpenseModel.find({
      userId,
      date: { $gte: cutoffDate },
    }).sort({ date: 1 });

    if (expenses.length === 0) {
      return {
        forecast: null,
        confidence: 0,
        method: 'none',
        message: 'Insufficient historical data',
        lastUpdated: new Date(),
      };
    }

    const dailyAmounts = expenses.map((e) => e.amount);
    const forecastData = monthlyForecast(dailyAmounts);

    const recurringExpenses = await RecurringTransactionModel.find({
      userId,
      type: 'expense',
      isActive: true,
    });

    const recurringExpenseAdjustment = recurringExpenses.reduce((sum, rec) => {
      switch (rec.frequency) {
        case 'weekly':
          return sum + rec.amount * 4.33;
        case 'monthly':
          return sum + rec.amount;
        case 'yearly':
          return sum + rec.amount / 12;
        default:
          return sum + rec.amount;
      }
    }, 0);

    return {
      forecast: Math.round(forecastData.averageForecast + recurringExpenseAdjustment),
      recurringExpenseAdjustment: Math.round(recurringExpenseAdjustment),
      confidence: forecastData.confidence,
      method: 'wma',
      dataPoints: expenses.length,
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.error('Error calculating forecasted spend:', error);
    return {
      forecast: null,
      confidence: 0,
      method: 'none',
      error: error.message,
    };
  }
};

/**
 * Calculate real net worth from accounts and investments
 * 
 * @param {String} userId - User ID
 * @returns {Promise<Object>} - {netWorth, breakdown: {accounts, investments}}
 */
export const calculateNetWorth = async (userId) => {
  try {
    const accounts = await AccountModel.find({ userId });
    const investments = await InvestmentModel.find({ userId });

    const accountsTotal = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
    const investmentsTotal = investments.reduce((sum, inv) => sum + (inv.amount || 0), 0);

    return {
      netWorth: Math.round(accountsTotal + investmentsTotal),
      breakdown: {
        accounts: Math.round(accountsTotal),
        investments: Math.round(investmentsTotal),
        accountCount: accounts.length,
        investmentCount: investments.length,
      },
    };
  } catch (error) {
    console.error('Error calculating net worth:', error);
    return {
      netWorth: 0,
      breakdown: { accounts: 0, investments: 0, accountCount: 0, investmentCount: 0 },
      error: error.message,
    };
  }
};

/**
 * Detect category spending spikes (unusual expenses by category)
 * Compares this month's category totals vs last month
 * 
 * @param {String} userId - User ID
 * @param {Number} days - Historical window (default: 60, covers 2 months)
 * @param {Number} spikeThreshold - Percentage increase to flag as spike (default: 15)
 * @returns {Promise<Array>} - Array of categories with spikes [{category, thisMonth, lastMonth, spikePercent, isSpiked}]
 */
export const calculateCategorySpikes = async (userId, days = 60, spikeThreshold = 15) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const expenses = await ExpenseModel.find({
      userId,
      date: { $gte: cutoffDate },
    }).sort({ date: 1 });

    if (expenses.length === 0) {
      return [];
    }

    // Split into this month and last month
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const thisMonthExpenses = expenses.filter((e) => new Date(e.date) >= thisMonthStart);
    const lastMonthExpenses = expenses.filter(
      (e) => new Date(e.date) >= lastMonthStart && new Date(e.date) <= lastMonthEnd
    );

    // Group by category
    const categoryTotals = {};

    thisMonthExpenses.forEach((exp) => {
      const category = exp.category || 'Uncategorized';
      if (!categoryTotals[category]) {
        categoryTotals[category] = { thisMonth: 0, lastMonth: 0 };
      }
      categoryTotals[category].thisMonth += exp.amount;
    });

    lastMonthExpenses.forEach((exp) => {
      const category = exp.category || 'Uncategorized';
      if (!categoryTotals[category]) {
        categoryTotals[category] = { thisMonth: 0, lastMonth: 0 };
      }
      categoryTotals[category].lastMonth += exp.amount;
    });

    // Calculate spikes
    const spikes = Object.entries(categoryTotals)
      .map(([category, totals]) => {
        if (totals.lastMonth === 0) {
          // New spending in this category
          return {
            category,
            thisMonth: totals.thisMonth,
            lastMonth: 0,
            spikePercent: 100,
            isSpiked: totals.thisMonth > 0, // Any new spending is a spike
          };
        }

        const spikePercent = ((totals.thisMonth - totals.lastMonth) / totals.lastMonth) * 100;
        return {
          category,
          thisMonth: Math.round(totals.thisMonth),
          lastMonth: Math.round(totals.lastMonth),
          spikePercent: Math.round(spikePercent),
          isSpiked: spikePercent > spikeThreshold,
        };
      })
      .filter((item) => item.isSpiked)
      .sort((a, b) => b.spikePercent - a.spikePercent);

    return spikes;
  } catch (error) {
    console.error('Error calculating category spikes:', error);
    return [];
  }
};

/**
 * Detect saving opportunities from recurring transactions
 * Identifies subscriptions/recurring expenses with highest total impact
 * 
 * @param {String} userId - User ID
 * @param {Number} limit - Number of opportunities to return (default: 3)
 * @returns {Promise<Array>} - Array of recurring transactions that could be optimized
 */
export const detectSavingOpportunities = async (userId, limit = 3) => {
  try {
    const recurringTransactions = await RecurringTransactionModel.find({
      userId,
      type: 'expense',
      isActive: true,
    });

    if (recurringTransactions.length === 0) {
      return [];
    }

    // Calculate monthly impact and sort by highest savings potential
    const opportunities = recurringTransactions
      .map((rec) => {
        let monthlyAmount = 0;

        switch (rec.frequency) {
          case 'daily':
            monthlyAmount = rec.amount * 30;
            break;
          case 'weekly':
            monthlyAmount = rec.amount * 4.33;
            break;
          case 'biweekly':
            monthlyAmount = rec.amount * 2.17;
            break;
          case 'monthly':
            monthlyAmount = rec.amount;
            break;
          case 'quarterly':
            monthlyAmount = rec.amount / 3;
            break;
          case 'yearly':
            monthlyAmount = rec.amount / 12;
            break;
          default:
            monthlyAmount = rec.amount;
        }

        return {
          _id: rec._id,
          description: rec.description || rec.category || 'Recurring expense',
          category: rec.category,
          amount: rec.amount,
          frequency: rec.frequency,
          monthlyImpact: Math.round(monthlyAmount),
          potentialSavings: Math.round(monthlyAmount),
        };
      })
      .sort((a, b) => b.monthlyImpact - a.monthlyImpact)
      .slice(0, limit);

    return opportunities;
  } catch (error) {
    console.error('Error detecting saving opportunities:', error);
    return [];
  }
};

/**
 * Calculate financial score based on real metrics
 * Factors: budget adherence, spending stability, savings rate
 * 
 * @param {String} userId - User ID
 * @param {Number} budget - Monthly budget (from user settings)
 * @returns {Promise<Number>} - Score 0-100
 */
export const calculateFinancialScore = async (userId, budget = null) => {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const thisMonthExpenses = await ExpenseModel.find({
      userId,
      date: { $gte: monthStart },
    });

    const thisMonthIncome = await IncomeModel.find({
      userId,
      date: { $gte: monthStart },
    });

    const totalExpense = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalIncome = thisMonthIncome.reduce((sum, i) => sum + i.amount, 0);

    let score = 50; // Base score

    // Budget adherence (0-30 points)
    if (budget) {
      const budgetPercent = (totalExpense / budget) * 100;
      if (budgetPercent <= 80) score += 30;
      else if (budgetPercent <= 100) score += 20;
      else if (budgetPercent <= 120) score += 10;
    } else {
      score += 20; // Partial credit if no budget set
    }

    // Savings rate (0-20 points)
    if (totalIncome > 0) {
      const savingsRate = ((totalIncome - totalExpense) / totalIncome) * 100;
      if (savingsRate >= 30) score += 20;
      else if (savingsRate >= 20) score += 15;
      else if (savingsRate >= 10) score += 10;
      else if (savingsRate >= 0) score += 5;
    }

    // Spending stability (0-20 points)
    if (thisMonthExpenses.length > 5) {
      const amounts = thisMonthExpenses.map((e) => e.amount);
      const stats = getExpenseStatistics(amounts.map((a) => ({ amount: a })));
      const coefficientOfVariation = stats.stdDev / stats.mean;
      
      if (coefficientOfVariation < 0.5) score += 20;
      else if (coefficientOfVariation < 1.0) score += 15;
      else if (coefficientOfVariation < 1.5) score += 10;
      else score += 5;
    }

    // Anomalies penalty (0-10 points)
    const anomalies = detectAnomalies(
      thisMonthExpenses.map((e) => ({ amount: e.amount })),
      2.5
    );
    const anomalyCount = anomalies.filter((a) => a.isAnomaly).length;
    if (anomalyCount === 0) score += 10;
    else if (anomalyCount <= 2) score += 5;
    // else score += 0 (penalty already applied)

    // Ensure score is within bounds
    return Math.min(100, Math.max(0, score));
  } catch (error) {
    console.error('Error calculating financial score:', error);
    return 50; // Default middle score on error
  }
};

/**
 * Get comprehensive dashboard data (all metrics at once)
 * Single call to get all calculations for performance
 * 
 * @param {String} userId - User ID
 * @param {Object} options - {budget, days, includeForcast, includeNetWorth, includeScore, includeSpikes, includeSavings}
 * @returns {Promise<Object>} - Complete dashboard data
 */
export const getDashboardMetrics = async (userId, options = {}) => {
  try {
    const {
      budget = null,
      days = 90,
      includeForecast = true,
      includeNetWorth = true,
      includeScore = true,
      includeSpikes = true,
      includeSavings = true,
    } = options;

    const metrics = {};

    // Fetch all in parallel
    const [forecast, netWorth, score, spikes, savings] = await Promise.all([
      includeForecast ? calculateForecastedSpend(userId, days) : null,
      includeNetWorth ? calculateNetWorth(userId) : null,
      includeScore ? calculateFinancialScore(userId, budget) : null,
      includeSpikes ? calculateCategorySpikes(userId) : null,
      includeSavings ? detectSavingOpportunities(userId) : null,
    ]);

    if (includeForecast) metrics.forecast = forecast;
    if (includeNetWorth) metrics.netWorth = netWorth;
    if (includeScore) metrics.financialScore = score;
    if (includeSpikes) metrics.categorySpikes = spikes;
    if (includeSavings) metrics.savingOpportunities = savings;

    return {
      success: true,
      data: metrics,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('Error getting dashboard metrics:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};
