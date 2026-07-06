import React from 'react';
import { motion } from 'framer-motion';

export default function AiAdvisorRecommendations({ suggestions = [] }) {
  return (
    <motion.div className="advisor-card" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
      <div className="ai-card-header">
        <h3>Recommendations</h3>
        <span className="ai-badge">✅</span>
      </div>
      <ul className="recommendation-list">
        {suggestions.map((item, index) => (
          <li key={index} className="recommendation-item">
            <strong>{item.reason}</strong>
            <span>{item.action}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
