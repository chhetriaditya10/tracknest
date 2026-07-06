import React from 'react';
import { motion } from 'framer-motion';

export default function AiAdvisorAnomalies({ anomalies = [] }) {
  return (
    <motion.div className="advisor-card" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
      <div className="ai-card-header">
        <h3>Anomalies</h3>
        <span className="ai-badge">⚠️</span>
      </div>
      {anomalies.length > 0 ? (
        <table className="ai-data-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Amount</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {anomalies.map((item) => (
              <tr key={item._id || `${item.category}-${item.amount}-${item.date}`}>
                <td>{item.category || 'Unknown'}</td>
                <td>Rs {Number(item.amount || 0).toLocaleString()}</td>
                <td>{new Date(item.date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="ai-table-empty">No outliers detected.</div>
      )}
    </motion.div>
  );
}
