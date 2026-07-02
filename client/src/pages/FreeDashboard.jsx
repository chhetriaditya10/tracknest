import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/ContextProvider";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";
import "chart.js/auto";
import { Line } from "react-chartjs-2";

import Modal from "../components/Modal";
import PremiumPreviewModal from "../components/PremiumPreviewModal";
import "../styles/HomePage.css";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const FreeDashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [expenses, setExpenses] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [budget, setBudget] = useState(() => Number(localStorage.getItem("monthlyBudget")) || 50000);
  const [searchQuery, setSearchQuery] = useState("");
  const [transactionFilter, setTransactionFilter] = useState("all");
  const [transactionSort, setTransactionSort] = useState("date-desc");
  const [selectedRange, setSelectedRange] = useState("30d");

  const expenseCategories = ["Foods", "Transport", "Grocery", "Entertainment", "Education", "Clothes", "Bills", "Others"];
  const incomeCategories = ["Salary", "Allowance", "Loan", "Freelance", "Others"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const authToken = token || localStorage.getItem("token");
        const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};

        const [expenseRes, activityRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/expense/getExpenses`, { headers }),
          axios.get(`${BASE_URL}/api/activity/recent`, { headers }),
        ]);

        setExpenses(expenseRes.data.expenses || []);
        setRecentActivity(activityRes.data.activities || []);
      } catch (error) {
        console.error("Dashboard fetch failed", error);
        toast.error("Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refresh, token]);

  const allTimeExpenses = expenses.reduce((total, item) => total + Number(item.amount || 0), 0);
  const now = new Date();
  const monthlyExpenses = expenses.filter((item) => {
    const date = new Date(item.date || item.createdAt || item.timestamp || now);
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });
  const monthlyTotalExpense = monthlyExpenses.reduce((total, item) => total + Number(item.amount || 0), 0);
  const budgetPercent = budget ? Math.min(Math.round((monthlyTotalExpense / budget) * 100), 200) : 0;
  const remainingBudget = Math.max(Number(budget || 0) - monthlyTotalExpense, 0);

  const categoryTotals = expenses.reduce((totals, item) => {
    const category = item.category || "Others";
    totals[category] = (totals[category] || 0) + Number(item.amount || 0);
    return totals;
  }, {});

  const categoryDistribution = Object.entries(categoryTotals).map(([category, value]) => ({ category, value }));
  const topSpendingCategory = categoryDistribution.length
    ? [...categoryDistribution].sort((a, b) => b.value - a.value)[0].category
    : "No category yet";

  const monthlyComparison = {
    labels: Array.from({ length: 6 }).map((_, index) => {
      const monthDate = new Date();
      monthDate.setMonth(monthDate.getMonth() - (5 - index));
      return monthDate.toLocaleString("default", { month: "short" });
    }),
    expenses: Array.from({ length: 6 }).map((_, index) => Math.round(monthlyTotalExpense * (0.75 + index * 0.04))),
  };

  const handleAddExpense = async (data) => {
    try {
      const authToken = token || localStorage.getItem("token");
      await axios.post(`${BASE_URL}/api/expense/addExpense`, { expense: data }, { headers: { Authorization: `Bearer ${authToken}` } });
      setRefresh((prev) => !prev);
      setShowExpenseModal(false);
      toast.success("Expense added successfully.");
    } catch (error) {
      console.error("Add expense error", error);
      toast.error("Unable to add expense.");
    }
  };

  const handleAddIncome = async (data) => {
    try {
      const authToken = token || localStorage.getItem("token");
      await axios.post(`${BASE_URL}/api/balance/addBalance`, { balance: data }, { headers: { Authorization: `Bearer ${authToken}` } });
      setRefresh((prev) => !prev);
      setShowIncomeModal(false);
      toast.success("Income added successfully.");
    } catch (error) {
      console.error("Add income error", error);
      toast.error("Unable to add income.");
    }
  };

  const filteredTransactions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return recentActivity
      .filter((item) => {
        if (transactionFilter !== "all" && item.type !== transactionFilter) return false;
        if (!query) return true;
        return [item.category, item.note, item.description, item.type]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(query));
      })
      .sort((a, b) => {
        if (transactionSort === "amount-desc") return Number(b.amount || 0) - Number(a.amount || 0);
        if (transactionSort === "amount-asc") return Number(a.amount || 0) - Number(b.amount || 0);
        if (transactionSort === "type") return String(a.type).localeCompare(String(b.type));
        return new Date(b.date || b.createdAt || b.timestamp || now) - new Date(a.date || a.createdAt || a.timestamp || now);
      });
  }, [recentActivity, searchQuery, transactionFilter, transactionSort, now]);

  if (loading) {
    return (
      <div className="loading-container">
        <ClipLoader color="#8b5cf6" size={56} />
      </div>
    );
  }

  return (
    <motion.div className="dashboard-container free-theme" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="dashboard-topbar glass-panel">
        <div className="topbar-left">
          <div>
            <p className="eyebrow">Starter workspace</p>
            <div className="topbar-title-row">
              <h2>Hi, {user?.username || "Finance Manager"}</h2>
              <span className="status-badge free">Free tier</span>
            </div>
          </div>
        </div>
        <div className="topbar-right">
          <div className="topbar-search">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search transactions..."
              aria-label="Search dashboard"
            />
          </div>
          <button className="icon-button" type="button" onClick={() => toast.info("Upgrade to premium for more analytics.")}>⭐</button>
        </div>
      </div>

      <section className="hero-panel glass-panel">
        <div className="hero-copy">
          <span className="eyebrow">Starter workspace</span>
          <h1>Essential finance tracking for every day.</h1>
          <p>Manage expenses, monitor cash flow, and upgrade when you want smarter forecasts and AI insights.</p>
          <div className="hero-actions">
            <button className="btn-primary" type="button" onClick={() => setShowExpenseModal(true)}>
              Add expense
            </button>
            <button className="btn-secondary" type="button" onClick={() => setShowPremiumModal(true)}>Upgrade to premium</button>
          </div>
        </div>
        <div className="hero-metrics-grid">
          {[
            { label: "Balance", value: `Rs ${allTimeExpenses.toLocaleString()}` },
            { label: "Spent this month", value: `Rs ${monthlyTotalExpense.toLocaleString()}` },
            { label: "Top category", value: topSpendingCategory },
            { label: "Budget level", value: `${budgetPercent}% used` },
          ].map((card) => (
            <div key={card.label} className="hero-metric-card simple-card">
              <span>{card.label}</span>
              <strong>{card.value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="glass-panel" style={{ padding: "20px 24px", borderRadius: "20px", marginTop: "18px" }}>
        <div className="d-flex justify-content-between align-items-center" style={{ marginBottom: "10px" }}>
          <div>
            <p className="eyebrow">Budget snapshot</p>
            <h3 style={{ margin: 0 }}>Spending vs target</h3>
          </div>
          <div style={{ textAlign: "right" }}>
            <strong>Remaining: Rs {remainingBudget.toLocaleString()}</strong>
            <div style={{ color: "#94a3b8", fontSize: "0.95rem" }}>Budget: Rs {Number(budget || 0).toLocaleString()} • Spent: Rs {monthlyTotalExpense.toLocaleString()}</div>
          </div>
        </div>
        <div style={{ height: "10px", background: "rgba(255,255,255,0.12)", borderRadius: "999px", overflow: "hidden" }}>
          <div style={{ width: `${Math.min(budgetPercent, 100)}%`, height: "100%", background: "linear-gradient(90deg, #8b5cf6, #22c55e)", borderRadius: "999px" }} />
        </div>
      </section>

      <section className="analytics-panel compact-panel">
        <div className="analytics-header">
          <div>
            <p className="eyebrow">Overview</p>
            <h3>Quick insights</h3>
          </div>
        </div>
        <div className="quick-insight-list glass-panel">
          {[
            { label: "Budget Target", value: `${budgetPercent}%` },
            { label: "Forecast", value: "Upgrade for premium forecast" },
            { label: "Top Category", value: topSpendingCategory },
          ].map((item) => (
            <div key={item.label} className="quick-insight-row d-flex justify-content-between align-items-center">
              <span className="quick-insight-label">{item.label}</span>
              <span className="quick-insight-value">{item.value}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="activity-panel">
        <div className="activity-header">
          <div>
            <p className="eyebrow">Recent activity</p>
            <h3>Essential ledger</h3>
          </div>
          <button className="btn-secondary" type="button" onClick={() => setShowPremiumModal(true)}>Unlock premium</button>
        </div>

        <div className="transaction-table-wrapper glass-panel simple-table-wrapper">
          <table className="transaction-table simple-table">
            <thead>
              <tr>
                <th>Transaction</th>
                <th>Category</th>
                <th>Date</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.slice(0, 6).map((item, index) => (
                <tr key={`${item._id || item.date || index}-${index}`}>
                  <td>{item.category || item.description || "Transaction"}</td>
                  <td>{item.type || "—"}</td>
                  <td>{new Date(item.date || item.createdAt || item.timestamp || now).toLocaleDateString()}</td>
                  <td>Rs {Number(item.amount || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <AnimatePresence>
        {showExpenseModal && (
          <motion.div className="modalBackground" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Modal title="Add Expense" onClose={() => setShowExpenseModal(false)} onSubmit={handleAddExpense} categories={expenseCategories} />
          </motion.div>
        )}
        {showIncomeModal && (
          <motion.div className="modalBackground" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Modal title="Add Income" onClose={() => setShowIncomeModal(false)} onSubmit={handleAddIncome} categories={incomeCategories} />
          </motion.div>
        )}
        {showPremiumModal && (
          <PremiumPreviewModal
            onClose={() => setShowPremiumModal(false)}
            onConfirm={() => {
              setShowPremiumModal(false);
              navigate("/pricing");
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FreeDashboard;
