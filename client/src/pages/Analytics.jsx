import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Pie, Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { toast } from "react-toastify";
import "../styles/Analytics.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

const BASE_URL = import.meta.env?.VITE_API_BASE_URL || "http://localhost:5000";

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().split("T")[0].slice(0, 7)
  );

  useEffect(() => {
    fetchAnalytics();
  }, [selectedMonth]);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem("token");

      // Generate analytics first
      await axios.get(
        `${BASE_URL}/api/analytics/generateMonthlyAnalytics/${selectedMonth}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Then fetch
      const analyticsRes = await axios.get(
        `${BASE_URL}/api/analytics/getMonthlyAnalytics/${selectedMonth}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const insightsRes = await axios.get(
        `${BASE_URL}/api/analytics/getInsights`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAnalytics(analyticsRes.data.analytics);
      setInsights(insightsRes.data.insights);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to load analytics");
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading analytics...</div>;
  }

  if (!analytics) {
    return <div className="loading">No data available for this month</div>;
  }

  const categoryChartData = {
    labels: analytics.categoryExpenses.map((c) => c.category),
    datasets: [
      {
        data: analytics.categoryExpenses.map((c) => c.amount),
        backgroundColor: [
          "#3b82f6",
          "#10b981",
          "#f43f5e",
          "#fbbf24",
          "#8b5cf6",
          "#ec4899",
        ],
      },
    ],
  };

  const dailyChartData = {
    labels: analytics.dailySpending.map((d) =>
      new Date(d.date).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" })
    ),
    datasets: [
      {
        label: "Daily Spending",
        data: analytics.dailySpending.map((d) => d.amount),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h2>Financial Analytics</h2>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="month-picker"
        />
      </div>

      {/* Summary Cards */}
      <motion.div className="summary-cards" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="card income-card">
          <h4>Total Income</h4>
          <p className="amount">${analytics.totalIncome.toLocaleString()}</p>
        </div>
        <div className="card expense-card">
          <h4>Total Expense</h4>
          <p className="amount">${analytics.totalExpense.toLocaleString()}</p>
        </div>
        <div className="card savings-card">
          <h4>Net Savings</h4>
          <p className="amount">${analytics.netSavings.toLocaleString()}</p>
        </div>
        <div className="card savings-rate-card">
          <h4>Savings Rate</h4>
          <p className="amount">{analytics.savingsRate.toFixed(1)}%</p>
        </div>
      </motion.div>

      {/* Charts */}
      <div className="charts-grid">
        <motion.div className="chart-container" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <h3>Spending by Category</h3>
          <Pie data={categoryChartData} options={{ responsive: true }} />
        </motion.div>

        <motion.div className="chart-container" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <h3>Daily Spending Trend</h3>
          <Line data={dailyChartData} options={{ responsive: true }} />
        </motion.div>
      </div>

      {/* Insights */}
      {insights && (
        <motion.div className="insights-section" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <h3>Spending Insights</h3>
          <div className="insights-grid">
            <div className="insight-card">
              <span className="label">Top Expense Category</span>
              <span className="value">{insights.topExpenseCategory || "N/A"}</span>
            </div>
            <div className="insight-card">
              <span className="label">Average Daily Spending</span>
              <span className="value">${insights.averageDailySpending}</span>
            </div>
            <div className="insight-card">
              <span className="label">Savings Rate</span>
              <span className="value">{insights.savingsRate}%</span>
            </div>
            <div className="insight-card">
              <span className="label">Top Income Category</span>
              <span className="value">{insights.topIncomeCategory || "N/A"}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Category Breakdown */}
      <motion.div className="category-breakdown" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <h3>Top Categories</h3>
        <div className="category-list">
          {analytics.categoryExpenses.slice(0, 5).map((cat, idx) => (
            <div key={idx} className="category-item">
              <span>{cat.category}</span>
              <div className="category-bar">
                <div
                  className="category-fill"
                  style={{
                    width: `${cat.percentage}%`,
                    backgroundColor: ["#3b82f6", "#10b981", "#f43f5e", "#fbbf24", "#8b5cf6"][
                      idx % 5
                    ],
                  }}
                />
              </div>
              <span className="percentage">{cat.percentage.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;
