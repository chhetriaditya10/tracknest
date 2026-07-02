/**
 * Statistical Algorithms for Expense Analysis
 * 1. Anomaly Detection using Z-Score
 * 2. Time Series Forecasting using Weighted Moving Average
 */

// ============================================
// ALGORITHM 1: ANOMALY DETECTION (Z-SCORE)
// ============================================

/**
 * Calculate mean and standard deviation
 * @param {Array} values - Array of numbers
 * @returns {Object} - {mean, stdDev, variance}
 */
const calculateStatistics = (values) => {
  if (values.length === 0) return { mean: 0, stdDev: 0, variance: 0 };

  // Calculate Mean
  const mean = values.reduce((a, b) => a + b, 0) / values.length;

  // Calculate Variance
  const variance =
    values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    values.length;

  // Calculate Standard Deviation
  const stdDev = Math.sqrt(variance);

  return { mean, stdDev, variance };
};

/**
 * Detect anomalies in expenses using Z-Score method
 * Mathematical Formula: Z-Score = (X - Mean) / StdDev
 * Anomaly if |Z-Score| > 2.5 (approximately 99% confidence)
 *
 * @param {Array} expenses - Array of expense objects with {amount, date}
 * @param {Number} threshold - Z-score threshold (default: 2.5)
 * @returns {Array} - Expenses with anomaly flags and Z-scores
 */
export const detectAnomalies = (expenses, threshold = 2.5) => {
  if (expenses.length < 2) {
    return expenses.map((exp) => ({
      ...exp,
      zScore: 0,
      isAnomaly: false,
      anomalyReason: "Insufficient data",
    }));
  }

  // Extract amounts
  const amounts = expenses.map((e) => e.amount);

  // Calculate statistics
  const { mean, stdDev } = calculateStatistics(amounts);

  // Calculate Z-score for each expense
  const analyzedExpenses = expenses.map((expense) => {
    const zScore = stdDev === 0 ? 0 : (expense.amount - mean) / stdDev;
    const isAnomaly = Math.abs(zScore) > threshold;

    return {
      ...expense,
      zScore: parseFloat(zScore.toFixed(2)),
      isAnomaly,
      anomalyReason: isAnomaly
        ? `Amount is ${Math.abs(zScore).toFixed(1)}σ away from mean`
        : "Normal transaction",
      confidence: parseFloat(
        (100 * (1 - Math.exp(-Math.abs(zScore) / 2))).toFixed(1)
      ), // Confidence percentage
    };
  });

  return analyzedExpenses;
};

/**
 * Get statistics summary for expenses
 * @param {Array} expenses - Array of expenses
 * @returns {Object} - Statistics summary
 */
export const getExpenseStatistics = (expenses) => {
  if (expenses.length === 0) {
    return {
      mean: 0,
      median: 0,
      stdDev: 0,
      min: 0,
      max: 0,
      total: 0,
      count: 0,
    };
  }

  const amounts = expenses.map((e) => e.amount).sort((a, b) => a - b);
  const { mean, stdDev } = calculateStatistics(amounts);

  // Calculate median
  const median =
    amounts.length % 2 === 0
      ? (amounts[amounts.length / 2 - 1] + amounts[amounts.length / 2]) / 2
      : amounts[Math.floor(amounts.length / 2)];

  return {
    mean: parseFloat(mean.toFixed(2)),
    median: parseFloat(median.toFixed(2)),
    stdDev: parseFloat(stdDev.toFixed(2)),
    min: amounts[0],
    max: amounts[amounts.length - 1],
    total: parseFloat(amounts.reduce((a, b) => a + b, 0).toFixed(2)),
    count: amounts.length,
  };
};

// ============================================
// ALGORITHM 2: TIME SERIES FORECASTING
// ============================================

/**
 * Weighted Moving Average for expense forecasting
 * Recent expenses get higher weights
 * Formula: WMA = (W₁×Recent + W₂×Previous + W₃×Older) / (W₁+W₂+W₃)
 *
 * @param {Array} expenses - Array of expense amounts (time-ordered)
 * @param {Number} periods - Number of periods to average (default: 7)
 * @returns {Number} - Predicted next expense
 */
export const weightedMovingAverage = (expenses, periods = 7) => {
  if (expenses.length === 0) return 0;

  // Take last N periods
  const recentExpenses = expenses.slice(-periods);

  // Calculate weights (exponential: recent gets more weight)
  let totalWeightedSum = 0;
  let totalWeight = 0;

  recentExpenses.forEach((expense, index) => {
    // Weight increases as we move to recent data
    const weight = Math.pow(2, index / (recentExpenses.length - 1 || 1));
    totalWeightedSum += expense * weight;
    totalWeight += weight;
  });

  const prediction = totalWeightedSum / totalWeight;
  return parseFloat(prediction.toFixed(2));
};

/**
 * Exponential Smoothing for expense forecasting
 * α (alpha) = smoothing factor (0 < α < 1, typically 0.3)
 * Formula: S_t = α×X_t + (1-α)×S_{t-1}
 *
 * @param {Array} expenses - Array of expense amounts
 * @param {Number} alpha - Smoothing factor (default: 0.3)
 * @param {Number} periods - Number of periods to forecast (default: 1)
 * @returns {Number} - Predicted expense
 */
export const exponentialSmoothing = (expenses, alpha = 0.3, periods = 1) => {
  if (expenses.length === 0) return 0;

  // Initialize first smoothed value
  let smoothed = expenses[0];

  // Apply exponential smoothing to all data
  for (let i = 1; i < expenses.length; i++) {
    smoothed = alpha * expenses[i] + (1 - alpha) * smoothed;
  }

  // For future periods, use constant forecast
  return parseFloat(smoothed.toFixed(2));
};

/**
 * Linear Regression Forecasting
 * Fits a line through data points and predicts future values
 *
 * @param {Array} expenses - Array of expense amounts
 * @param {Number} forecastPeriods - Number of periods to forecast
 * @returns {Object} - {prediction, slope, intercept, r2}
 */
export const linearRegressionForecast = (
  expenses,
  forecastPeriods = 1
) => {
  if (expenses.length < 2) {
    return { prediction: expenses[0] || 0, slope: 0, intercept: 0, r2: 0 };
  }

  const n = expenses.length;
  const xValues = Array.from({ length: n }, (_, i) => i + 1); // 1, 2, 3, ...

  // Calculate sums needed for regression
  const sumX = xValues.reduce((a, b) => a + b, 0);
  const sumY = expenses.reduce((a, b) => a + b, 0);
  const sumXY = xValues.reduce(
    (sum, x, i) => sum + x * expenses[i],
    0
  );
  const sumX2 = xValues.reduce((sum, x) => sum + x * x, 0);
  const sumY2 = expenses.reduce((sum, y) => sum + y * y, 0);

  // Calculate slope and intercept
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Calculate R² (coefficient of determination)
  const meanY = sumY / n;
  const ssTotal = expenses.reduce((sum, y) => sum + Math.pow(y - meanY, 2), 0);
  const ssResidual = xValues.reduce(
    (sum, x, i) => sum + Math.pow(expenses[i] - (slope * x + intercept), 2),
    0
  );
  const r2 = 1 - ssResidual / (ssTotal || 1);

  // Forecast next value
  const nextX = n + forecastPeriods;
  const prediction = parseFloat((slope * nextX + intercept).toFixed(2));

  return {
    prediction: Math.max(prediction, 0), // Ensure non-negative
    slope: parseFloat(slope.toFixed(4)),
    intercept: parseFloat(intercept.toFixed(2)),
    r2: parseFloat(r2.toFixed(4)),
  };
};

/**
 * Monthly forecasting with multiple algorithms
 * Combines WMA, Exponential Smoothing, and Linear Regression
 *
 * @param {Array} dailyExpenses - Array of daily expense amounts
 * @returns {Object} - Forecast data with confidence
 */
export const monthlyForecast = (dailyExpenses) => {
  if (dailyExpenses.length === 0) {
    return {
      wmaForecast: 0,
      expSmoothing: 0,
      linearRegression: { prediction: 0, r2: 0 },
      averageForecast: 0,
      confidence: 0,
    };
  }

  // Get individual forecasts
  const wmaForecast = weightedMovingAverage(dailyExpenses, 7);
  const expSmoothing = exponentialSmoothing(dailyExpenses, 0.3, 1);
  const linearReg = linearRegressionForecast(dailyExpenses, 1);

  // Ensemble forecast (average of methods)
  const averageForecast =
    (wmaForecast + expSmoothing + linearReg.prediction) / 3;

  // Confidence based on linear regression R² value
  const confidence = Math.max(0, linearReg.r2 * 100);

  return {
    wmaForecast: parseFloat(wmaForecast.toFixed(2)),
    expSmoothing: parseFloat(expSmoothing.toFixed(2)),
    linearRegression: linearReg,
    averageForecast: parseFloat(averageForecast.toFixed(2)),
    confidence: parseFloat(confidence.toFixed(1)),
  };
};

/**
 * Category-based forecasting
 * Forecast expenses by category
 *
 * @param {Array} categoryExpenses - Array of {category, amount}
 * @returns {Object} - Forecast by category
 */
export const categoryForecast = (categoryExpenses) => {
  const categorized = {};

  // Group by category
  categoryExpenses.forEach((exp) => {
    if (!categorized[exp.category]) {
      categorized[exp.category] = [];
    }
    categorized[exp.category].push(exp.amount);
  });

  // Forecast for each category
  const forecast = {};
  for (const [category, amounts] of Object.entries(categorized)) {
    forecast[category] = monthlyForecast(amounts);
  }

  return forecast;
};
