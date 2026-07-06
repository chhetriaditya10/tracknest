import React from 'react';
import { motion } from 'framer-motion';
import ProgressBar from './ProgressBar';

export default function AiAdvisorTrendCard({ summary = {}, metadata = {} }) {
  const confidence = Math.round((summary.predictionConfidence ?? 0) * 100);

  return (
    <motion.div className="advisor-card" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
      <div className="ai-card-header">
        <h3>Trend & Confidence</h3>
        <span className="ai-badge">📊</span>
      </div>
      <p className="ai-subtitle">Monthly forecast consistency and model confidence</p>
      <div className="ai-summary-value">{summary.trend || 'Stable'}</div>
      <div className="ai-progress-meta">Prediction confidence</div>
      <ProgressBar percent={confidence} tooltipText={`${confidence}% confidence based on trend stability`} />
      <div className="ai-progress-meta">
        Based on {metadata.monthsHistorical || 0} months and {metadata.transactionsAnalyzed || 0} transactions.
      </div>
    </motion.div>
  );
}
