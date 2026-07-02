/**
 * Test Script for AI Algorithms
 * Run this to verify the algorithms are working correctly
 */

import {
  detectAnomalies,
  getExpenseStatistics,
  weightedMovingAverage,
  exponentialSmoothing,
  linearRegressionForecast,
  monthlyForecast
} from './algorithms.js';

// Test Data - Sample expenses
const testExpenses = [
  { amount: 50, category: 'Food', date: new Date() },
  { amount: 45, category: 'Transport', date: new Date() },
  { amount: 55, category: 'Food', date: new Date() },
  { amount: 48, category: 'Entertainment', date: new Date() },
  { amount: 52, category: 'Food', date: new Date() },
  { amount: 500, category: 'Shopping', date: new Date() }, // This should be flagged as anomaly
  { amount: 49, category: 'Food', date: new Date() },
  { amount: 51, category: 'Transport', date: new Date() },
];

const testAmounts = testExpenses.map(e => e.amount);

console.log('🧪 TESTING AI ALGORITHMS FOR TRACKNEST\n');
console.log('=' .repeat(50));

// Test 1: Anomaly Detection
console.log('\n🔴 TEST 1: ANOMALY DETECTION (Z-Score)');
console.log('-'.repeat(40));

const anomalies = detectAnomalies(testExpenses, 2.5);
console.log('Test Data:', testAmounts);
console.log('Anomalies Found:', anomalies.filter(a => a.isAnomaly).length);

anomalies.forEach((expense, idx) => {
  if (expense.isAnomaly) {
    console.log(`⚠️  ANOMALY #${idx + 1}: $${expense.amount} (Z-Score: ${expense.zScore})`);
    console.log(`   Reason: ${expense.anomalyReason}`);
    console.log(`   Confidence: ${expense.confidence}%`);
  }
});

// Test 2: Statistics
console.log('\n📊 TEST 2: STATISTICS CALCULATION');
console.log('-'.repeat(40));

const stats = getExpenseStatistics(testExpenses);
console.log(`Mean (Average): $${stats.mean}`);
console.log(`Median: $${stats.median}`);
console.log(`Standard Deviation: $${stats.stdDev}`);
console.log(`Min: $${stats.min}, Max: $${stats.max}`);
console.log(`Total: $${stats.total}, Count: ${stats.count}`);

// Test 3: Forecasting Methods
console.log('\n📈 TEST 3: FORECASTING METHODS');
console.log('-'.repeat(40));

// Weighted Moving Average
const wma = weightedMovingAverage(testAmounts, 7);
console.log(`Weighted Moving Average: $${wma}`);

// Exponential Smoothing
const expSmooth = exponentialSmoothing(testAmounts, 0.3);
console.log(`Exponential Smoothing: $${expSmooth}`);

// Linear Regression
const linearReg = linearRegressionForecast(testAmounts);
console.log(`Linear Regression: $${linearReg.prediction}`);
console.log(`R² (Accuracy): ${linearReg.r2.toFixed(3)}`);

// Ensemble Forecast
const ensemble = monthlyForecast(testAmounts);
console.log(`Ensemble Forecast: $${ensemble.averageForecast}`);
console.log(`Confidence: ${ensemble.confidence}%`);

console.log('\n✅ ALL TESTS COMPLETED!');
console.log('=' .repeat(50));
console.log('\n📝 INTERPRETATION:');
console.log('- The $500 expense should be flagged as an anomaly');
console.log('- R² should be between 0-1 (higher = better fit)');
console.log('- Confidence shows prediction reliability');
console.log('- Ensemble method combines all 3 approaches for robustness');

// Export for use in other tests
export { testExpenses, testAmounts };