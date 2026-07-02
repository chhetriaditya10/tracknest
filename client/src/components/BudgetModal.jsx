import React, { useState } from "react";
import { motion } from "framer-motion";
import "../styles/Modal.css";

const BudgetModal = ({ isOpen, onClose, currentBudget, onSave }) => {
  const [budgetAmount, setBudgetAmount] = useState(currentBudget || 50000);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (budgetAmount > 0) {
      onSave(budgetAmount);
    }
  };

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal-content glass-panel"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>🎯 Set Monthly Budget</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Monthly Budget (Rs)</label>
            <input
              type="number"
              className="input-field"
              value={budgetAmount}
              onChange={(e) => setBudgetAmount(e.target.value)}
              min="100"
              step="100"
              required
            />
          </div>

          <div className="budget-presets">
            <p style={{ fontSize: "12px", color: "#888", marginBottom: "8px" }}>
              Quick presets:
            </p>
            <div className="preset-buttons">
              {[25000, 50000, 75000, 100000].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  className={`preset-btn ${budgetAmount == amount ? 'active' : ''}`}
                  onClick={() => setBudgetAmount(amount)}
                >
                  Rs {amount.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save Budget
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default BudgetModal;
