// AI helpers: weighted moving average, trend analysis, confidence scoring, and recommendations
export function computeBasicStats(amounts = []) {
  const n = amounts.length;
  if (n === 0) return { mean: 0, sd: 0 };
  const mean = amounts.reduce((s, v) => s + v, 0) / n;
  const sd = Math.sqrt(amounts.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / n);
  return { mean, sd };
}

// Weighted Moving Average prediction. Most recent values get higher weight.
export function weightedMovingAverage(values = [], window = 3, weights = null) {
  const n = values.length;
  if (n === 0) return null;
  if (n === 1) return values[0];

  const slice = values.slice(-window);
  const m = slice.length;
  // default weights: more weight to most recent
  const defaultWeights = [0.5, 0.3, 0.2];
  let w = weights && weights.length === m ? weights.slice(0, m) : defaultWeights.slice(0, m);

  // Normalize weights to length m
  const sumW = w.reduce((s, v) => s + v, 0);
  if (sumW === 0) w = Array(m).fill(1 / m);
  else w = w.map((v) => v / sumW);

  // align weights: last element of slice is most recent -> weight[0] should map to most recent
  // ensure w[0] * slice[m-1], w[1] * slice[m-2], ...
  let prediction = 0;
  for (let i = 0; i < m; i++) {
    const value = slice[m - 1 - i] || 0;
    const weight = w[i] || 0;
    prediction += value * weight;
  }

  return prediction;
}

// Simple linear trend analysis using least-squares regression.
// Returns {trend: 'increasing'|'decreasing'|'stable'|'insufficient_data', slope, intercept}
export function analyzeTrend(values = []) {
  const n = values.length;
  if (n < 2) return { trend: 'insufficient_data', slope: 0, intercept: 0 };

  const xs = Array.from({ length: n }, (_, i) => i);
  const meanX = (n - 1) / 2;
  const meanY = values.reduce((s, v) => s + v, 0) / n;

  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - meanX) * (values[i] - meanY);
    den += Math.pow(xs[i] - meanX, 2);
  }
  const slope = den === 0 ? 0 : num / den;
  const intercept = meanY - slope * meanX;

  // Determine significance relative to mean magnitude
  const meanAbs = Math.abs(meanY) || 1;
  const normalizedSlope = slope / meanAbs;
  const THRESHOLD = 0.02; // 2% relative slope threshold

  let trend = 'stable';
  if (normalizedSlope > THRESHOLD) trend = 'increasing';
  else if (normalizedSlope < -THRESHOLD) trend = 'decreasing';

  return { trend, slope, intercept };
}

// Confidence estimation for predictions: depends on number of points and variability
export function computeConfidence(values = []) {
  const n = values.length;
  if (n === 0) return 0;
  const { mean, sd } = computeBasicStats(values);
  const dataConfidence = Math.min(1, n / 6); // more months -> higher base confidence
  const variability = mean > 0 ? Math.min(1, sd / mean) : 1; // higher variability reduces confidence
  const confidence = dataConfidence * (1 - variability);
  return Number(Math.max(0, Math.min(1, confidence)).toFixed(3));
}

// Improved rule-based recommendations. Accepts multiple signals to produce prioritized suggestions.
export function generateRecommendations({ savingsRate = 0, trend = 'stable', outliers = [], budgetsCount = 0 }) {
  const suggestions = [];

  if (savingsRate < 0) {
    suggestions.push({ priority: 1, reason: 'Negative savings', action: 'Immediate review: expenses exceed income' });
    return suggestions;
  }

  if (savingsRate < 0.05) suggestions.push({ priority: 1, reason: 'Very low savings', action: 'Aim to save at least 5-10% of income' });
  else if (savingsRate < 0.15) suggestions.push({ priority: 2, reason: 'Low savings', action: 'Consider cutting discretionary spending by 5-10%' });
  else suggestions.push({ priority: 4, reason: 'Healthy savings', action: 'Keep up the good work' });

  if (trend === 'increasing') suggestions.push({ priority: 1, reason: 'Increasing spending trend', action: 'Identify rising categories and set tighter budgets' });
  else if (trend === 'decreasing') suggestions.push({ priority: 3, reason: 'Decreasing spending trend', action: 'Opportunity to reallocate savings to goals' });

  if ((outliers && outliers.length > 0)) {
    suggestions.push({ priority: 1, reason: 'Large recent expenses detected', action: `Review ${outliers.length} outlier transactions for potential refunds or errors` });
  }

  if (budgetsCount === 0) suggestions.push({ priority: 2, reason: 'No budgets set', action: 'Create category budgets to improve tracking' });

  // sort by priority (lower number = higher priority)
  suggestions.sort((a, b) => a.priority - b.priority);
  return suggestions;
}

