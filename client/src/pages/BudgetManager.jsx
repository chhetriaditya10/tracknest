import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import "../styles/BudgetManager.css";

const BASE_URL = import.meta.env?.VITE_API_BASE_URL || "http://localhost:5000";

const BudgetManager = () => {
  const [budgets, setBudgets] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    budgetName: "",
    budgetType: "category",
    category: "Foods",
    limit: 1000,
    period: "monthly",
  });

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const token = localStorage.getItem("token");
      
      const budgetRes = await axios.get(`${BASE_URL}/api/budget/getActiveBudgets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const summaryRes = await axios.get(`${BASE_URL}/api/budget/getBudgetSummary`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setBudgets(budgetRes.data.budgets);
      setSummary(summaryRes.data.summary);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching budgets:", error);
      toast.error("Failed to load budgets");
      setLoading(false);
    }
  };

  const handleCreateBudget = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${BASE_URL}/api/budget/createBudget`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBudgets([...budgets, response.data.budget]);
      setShowModal(false);
      setFormData({
        budgetName: "",
        budgetType: "category",
        category: "Foods",
        limit: 1000,
        period: "monthly",
      });
      toast.success("Budget created successfully!");
      fetchBudgets();
    } catch (error) {
      console.error("Error creating budget:", error);
      toast.error("Failed to create budget");
    }
  };

  const handleDeleteBudget = async (budgetId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${BASE_URL}/api/budget/deleteBudget/${budgetId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBudgets(budgets.filter((b) => b._id !== budgetId));
      toast.success("Budget deleted!");
      fetchBudgets();
    } catch (error) {
      console.error("Error deleting budget:", error);
      toast.error("Failed to delete budget");
    }
  };

  if (loading) {
    return <div className="loading">Loading budgets...</div>;
  }

  return (
    <div className="budget-manager-container">
      <div className="budget-header">
        <h2>Budget Management</h2>
        <button className="btn-add" onClick={() => setShowModal(true)}>
          + Create Budget
        </button>
      </div>

      {/* Summary */}
      {summary && (
        <motion.div
          className="budget-summary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="summary-card">
            <h4>Total Budget Limit</h4>
            <p>${summary.totalLimit.toLocaleString()}</p>
          </div>
          <div className="summary-card">
            <h4>Total Spent</h4>
            <p>${summary.totalSpent.toLocaleString()}</p>
          </div>
          <div className="summary-card">
            <h4>Spent %</h4>
            <p>{summary.spentPercentage.toFixed(1)}%</p>
          </div>
          <div className="summary-card">
            <h4>Status</h4>
            <p>
              <span className="status-safe">{summary.safeCount}</span>
              <span className="status-warning">{summary.warningCount}</span>
              <span className="status-exceeded">{summary.exceededCount}</span>
            </p>
          </div>
        </motion.div>
      )}

      {/* Budgets List */}
      <div className="budgets-list">
        {budgets.map((budget) => {
          const percentage = (budget.spent / budget.limit) * 100;
          const statusColor =
            budget.status === "safe"
              ? "#10b981"
              : budget.status === "warning"
              ? "#fbbf24"
              : "#f43f5e";

          return (
            <motion.div
              key={budget._id}
              className="budget-item"
              whileHover={{ scale: 1.02 }}
            >
              <div className="budget-info">
                <h3>{budget.budgetName}</h3>
                <p className="category">{budget.category}</p>
              </div>

              <div className="budget-details">
                <div className="amount-info">
                  <span className="spent">${budget.spent.toLocaleString()}</span>
                  <span className="divider">/</span>
                  <span className="limit">${budget.limit.toLocaleString()}</span>
                </div>

                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.min(percentage, 100)}%`,
                      backgroundColor: statusColor,
                    }}
                  />
                </div>

                <div className="status-badge" style={{ color: statusColor }}>
                  {budget.status === "safe"
                    ? "🟢 Safe"
                    : budget.status === "warning"
                    ? "🟡 Warning"
                    : "🔴 Exceeded"}
                </div>
              </div>

              <button
                className="btn-delete"
                onClick={() => handleDeleteBudget(budget._id)}
              >
                Delete
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <motion.div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <h3>Create New Budget</h3>
            <form onSubmit={handleCreateBudget}>
              <input
                type="text"
                placeholder="Budget Name"
                required
                value={formData.budgetName}
                onChange={(e) =>
                  setFormData({ ...formData, budgetName: e.target.value })
                }
              />
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              >
                <option value="Foods">Foods</option>
                <option value="Transport">Transport</option>
                <option value="Grocery">Grocery</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Education">Education</option>
                <option value="Clothes">Clothes</option>
                <option value="Bills">Bills</option>
                <option value="Others">Others</option>
              </select>
              <input
                type="number"
                placeholder="Budget Limit"
                required
                value={formData.limit}
                onChange={(e) =>
                  setFormData({ ...formData, limit: Number(e.target.value) })
                }
              />
              <select
                value={formData.period}
                onChange={(e) =>
                  setFormData({ ...formData, period: e.target.value })
                }
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
              <button type="submit" className="btn-submit">
                Create Budget
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default BudgetManager;
