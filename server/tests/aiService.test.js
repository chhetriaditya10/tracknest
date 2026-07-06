import { describe, it, expect } from '@jest/globals';
import {
  weightedMovingAverage,
  analyzeTrend,
  computeConfidence,
  generateRecommendations,
  computeBasicStats,
} from '../lib/aiService.js';

describe('aiService algorithms', () => {
  it('weightedMovingAverage predicts correctly for 3 months', () => {
    const vals = [100, 200, 300];
    const pred = weightedMovingAverage(vals, 3);
    // default weights [0.5,0.3,0.2] -> 0.5*300 + 0.3*200 + 0.2*100 = 230
    expect(Math.round(pred)).toBe(230);
  });

  it('weightedMovingAverage handles single value', () => {
    expect(weightedMovingAverage([150], 3)).toBe(150);
  });

  it('analyzeTrend detects increasing trend', () => {
    const vals = [100, 200, 300];
    const info = analyzeTrend(vals);
    expect(info.trend).toBe('increasing');
  });

  it('analyzeTrend detects decreasing trend', () => {
    const vals = [300, 200, 100];
    const info = analyzeTrend(vals);
    expect(info.trend).toBe('decreasing');
  });

  it('analyzeTrend returns insufficient for small data', () => {
    const info = analyzeTrend([100]);
    expect(info.trend).toBe('insufficient_data');
  });

  it('computeConfidence is higher with more stable data', () => {
    const lowVar = [100, 102, 98, 101, 99, 100];
    const highVar = [10, 200, 5, 300, 2, 400];
    const cLow = computeConfidence(lowVar);
    const cHigh = computeConfidence(highVar);
    expect(cLow).toBeGreaterThan(cHigh);
  });

  it('generateRecommendations prioritizes negative savings', () => {
    const recs = generateRecommendations({ savingsRate: -0.1, trend: 'increasing', outliers: [], budgetsCount: 0 });
    expect(recs.length).toBeGreaterThan(0);
    expect(recs[0].reason.toLowerCase()).toContain('negative');
  });

  it('computeBasicStats returns mean and sd', () => {
    const { mean, sd } = computeBasicStats([1, 2, 3, 4]);
    expect(mean).toBe(2.5);
    expect(sd).toBeGreaterThan(0);
  });
});
