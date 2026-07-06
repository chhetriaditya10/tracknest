import React from 'react';
import { motion } from 'framer-motion';

const iconMap = {
  prediction: '📈',
  trend: '📊',
  confidence: '⚡',
  health: '💡',
  recommendation: '✅',
};

export default function AiAdvisorOverview({ summary = {} }) {
  const metrics = [
    {
      label: 'Prediction',
      value:
        summary.prediction !== null && typeof summary.prediction !== 'undefined'
          ? `Rs ${summary.prediction.toLocaleString()}`
          : 'N/A',
      icon: iconMap.prediction,
      color: 'primary',
    },
    {
      label: 'Health Score',
      value: `${Math.round((summary.predictionConfidence ?? 0) * 100)}%`,
      icon: iconMap.health,
      color: 'success',
    },
    {
      label: 'Trend',
      value: summary.trend || 'Stable',
      icon: iconMap.trend,
      color: 'warning',
    },
    {
      label: 'Anomalies',
      value: summary.outliersCount || 0,
      icon: iconMap.recommendation,
      color: 'danger',
    },
  ];

  return (
    <div className="ai-summary-grid">
      {metrics.map((metric) => (
        <motion.div key={metric.label} whileHover={{ y: -3 }} className="advisor-card">
          <div className="ai-card-header">
            <div>
              <h3>{metric.label}</h3>
              <p className="ai-subtitle">{metric.label === 'Prediction' ? 'Next month outlook' : 'Current model status'}</p>
            </div>
            <div className="ai-badge">{metric.icon}</div>
          </div>
          <div className="ai-summary-value">{metric.value}</div>
        </motion.div>
      ))}
    </div>
  );
}
