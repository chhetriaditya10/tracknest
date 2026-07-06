import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/ContextProvider";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";
import "chart.js/auto";
import { Line, Doughnut } from "react-chartjs-2";

import Modal from "../components/Modal";
import BudgetModal from "../components/BudgetModal";
import "../styles/HomePage.css";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const parseBudgetValue = (value) => {
  if (value === null || value === undefined) return null;
  const normalized = String(value).trim();
  if (normalized === "") return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};

const PremiumDashboard = () => {
  const { user, token, setUser } = useAuth();
  const navigate = useNavigate();

  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [budget, setBudget] = useState(() => {
    const storedValue = localStorage.getItem("monthlyBudget");
    const parsedBudget = parseBudgetValue(storedValue);
    return parsedBudget !== null ? parsedBudget : 50000;
  });

  useEffect(() => {
    if (!user) return;

    const normalizedBudget = parseBudgetValue(user.monthlyBudget);
    if (normalizedBudget !== null) {
      setBudget(normalizedBudget);
      try {
        localStorage.setItem("monthlyBudget", String(normalizedBudget));
      } catch (e) {
        console.warn("Failed to store monthlyBudget", e);
      }
      return;
    }

    const storedBudget = parseBudgetValue(localStorage.getItem("monthlyBudget"));
    if (storedBudget !== null) {
      setBudget(storedBudget);
      return;
    }

    setBudget(50000);
    try {
      localStorage.removeItem("monthlyBudget");
    } catch (e) {
      console.warn("Failed to clear stored monthlyBudget", e);
    }
  }, [user]);
  const [searchQuery, setSearchQuery] = useState("");
  const [transactionFilter, setTransactionFilter] = useState("all");
  const [transactionSort, setTransactionSort] = useState("date-desc");
  const [selectedRange, setSelectedRange] = useState("30d");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState("gold");
  const [dashboardBalance, setDashboardBalance] = useState(Number(user?.balance || 0));
  const [dashboardInsights, setDashboardInsights] = useState([]);
  const [dashboardForecast, setDashboardForecast] = useState(null);
  const [upcomingActivity, setUpcomingActivity] = useState([]);
  const [upcomingSource, setUpcomingSource] = useState("primary");
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardErrors, setDashboardErrors] = useState({
    expenses: null,
    incomes: null,
    activity: null,
    upcoming: null,
    insights: null,
    forecast: null,
  });

  const expenseCategories = ["Foods", "Transport", "Grocery", "Entertainment", "Education", "Clothes", "Bills", "Others"];
  const incomeCategories = ["Salary", "Allowance", "Loan", "Freelance", "Others"];
  const themeOptions = [
    { id: "gold", label: "Premium Gold" },
    { id: "midnight", label: "Midnight" },
    { id: "aurora", label: "Aurora" },
  ];

  const premiumFeatures = [
    "Advanced analytics",
    "AI insights",
    "Cash flow forecasts",
    "Multi-wallet tracking",
    "Budget automation",
    "CSV export",
    "Custom themes",
    "Subscription alerts",
  ];

  useEffect(() => {
    setDashboardBalance(Number(user?.balance || 0));
  }, [user?.balance]);

  const apiErrorLabels = {
    expenses: "Expenses",
    incomes: "Balances",
    activity: "Activity",
    upcoming: "Upcoming activity",
    insights: "AI insights",
    forecast: "Forecast",
  };

  const fetchUpcomingActivity = async (headers) => {
    try {
      const res = await axios.get(`${BASE_URL}/api/recurring/upcoming`, { headers });
      const upcoming = res.data?.upcoming || [];
      if (Array.isArray(upcoming) && upcoming.length > 0) {
        setUpcomingSource("primary");
        return upcoming;
      }

      const backup = await axios.get(`${BASE_URL}/api/recurring/getRecurring`, { headers });
      const now = new Date();
      setUpcomingSource("fallback");
      return (backup.data?.recurring || [])
        .filter((item) => item.isActive !== false)
        .sort((a, b) => new Date(a.nextDueDate || a.startDate || now) - new Date(b.nextDueDate || b.startDate || now))
        .slice(0, 10);
    } catch (error) {
      const status = error?.response?.status;
      if (status === 404) {
        const backup = await axios.get(`${BASE_URL}/api/recurring/getRecurring`, { headers });
        const now = new Date();
        setUpcomingSource("fallback");
        return (backup.data?.recurring || [])
          .filter((item) => item.isActive !== false)
          .sort((a, b) => new Date(a.nextDueDate || a.startDate || now) - new Date(b.nextDueDate || b.startDate || now))
          .slice(0, 10);
      }
      setUpcomingSource("error");
      throw error;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setDashboardLoading(true);
        setDashboardErrors({
          expenses: null,
          incomes: null,
          activity: null,
          upcoming: null,
          insights: null,
          forecast: null,
        });

        const authToken = token || localStorage.getItem("token");
        const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};

        const expenseReq = axios.get(`${BASE_URL}/api/expense/getExpenses`, { headers });
        const incomeReq = axios.get(`${BASE_URL}/api/balance/getBalances`, { headers });
        const activityReq = axios.get(`${BASE_URL}/api/activity/recent`, { headers });

        const [expenseRes, incomeRes, activityRes] = await Promise.allSettled([
          expenseReq,
          incomeReq,
          activityReq,
        ]);

        const upcomingResult = await (async () => {
          try {
            const upcomingData = await fetchUpcomingActivity(headers);
            return { status: "fulfilled", value: upcomingData };
          } catch (error) {
            return { status: "rejected", reason: error };
          }
        })();

        setDashboardErrors((prev) => ({
          ...prev,
          expenses: expenseRes.status === "rejected" ? expenseRes.reason?.message || "Failed to load expenses" : null,
          incomes: incomeRes.status === "rejected" ? incomeRes.reason?.message || "Failed to load balances" : null,
          activity: activityRes.status === "rejected" ? activityRes.reason?.message || "Failed to load activity" : null,
          upcoming: upcomingResult.status === "rejected" ? upcomingResult.reason?.message || "Failed to load upcoming activity" : null,
        }));

        if (expenseRes.status === "fulfilled") {
          setExpenses(expenseRes.value.data.expenses || []);
        } else {
          console.warn("Expense load failed", expenseRes.reason);
          setExpenses([]);
        }

        if (incomeRes.status === "fulfilled") {
          setIncomes(incomeRes.value.data.balances || []);
        } else {
          console.warn("Income load failed", incomeRes.reason);
          setIncomes([]);
        }

        if (activityRes.status === "fulfilled") {
          setRecentActivity(activityRes.value.data.activities || []);
        } else {
          console.warn("Activity load failed", activityRes.reason);
          setRecentActivity([]);
        }

        if (upcomingResult.status === "fulfilled") {
          setUpcomingActivity(upcomingResult.value || []);
        } else {
          console.warn("Upcoming activity load failed", upcomingResult.reason);
          setUpcomingActivity([]);
        }

        const insightsResult = await axios.get(
          `${BASE_URL}/api/analytics/ai-insights?days=90&threshold=2.0`,
          { headers }
        );

        setDashboardErrors((prev) => ({
          ...prev,
          insights: null,
          forecast: null,
        }));

        const payload = insightsResult.data.data || insightsResult.data;
        setDashboardInsights(payload?.insights || []);
        setDashboardForecast(payload?.forecast || null);
      } catch (error) {
        console.error("Dashboard fetch failed", error);
        toast.error("Unable to load dashboard data.");
        setDashboardInsights([]);
        setDashboardForecast(null);
        setUpcomingActivity([]);
        setDashboardErrors({
          expenses: error.message,
          incomes: error.message,
          activity: error.message,
          upcoming: error.message,
          insights: error.message,
          forecast: error.message,
        });
      } finally {
        setLoading(false);
        setDashboardLoading(false);
      }
    };

    fetchData();
  }, [refresh, token]);

  const allTimeExpenses = expenses.reduce((total, item) => total + Number(item.amount || 0), 0);
  const allTimeIncome = incomes.reduce((total, item) => total + Number(item.amount || 0), 0);
  const currentBalance = dashboardBalance ?? allTimeIncome - allTimeExpenses;

  const now = new Date();
  const monthlyExpenses = expenses.filter((item) => {
    const date = new Date(item.date || item.createdAt || item.timestamp || now);
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });
  const monthlyIncomes = incomes.filter((item) => {
    const date = new Date(item.date || item.createdAt || item.timestamp || now);
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });

  const monthlyTotalExpense = monthlyExpenses.reduce((total, item) => total + Number(item.amount || 0), 0);
  const monthlyTotalIncome = monthlyIncomes.reduce((total, item) => total + Number(item.amount || 0), 0);
  const remainingBudget = Math.max(Number(budget || 0) - monthlyTotalExpense, 0);
  const budgetPercent = budget ? Math.min(Math.round((monthlyTotalExpense / budget) * 100), 200) : 0;
  const budgetExceeded = budget > 0 && monthlyTotalExpense > budget;
  const exceededAmount = budgetExceeded ? monthlyTotalExpense - budget : 0;

  const categoryTotals = expenses.reduce((totals, item) => {
    const category = item.category || "Others";
    totals[category] = (totals[category] || 0) + Number(item.amount || 0);
    return totals;
  }, {});

  const categoryDistribution = Object.entries(categoryTotals).map(([category, value]) => ({ category, value }));
  const topSpendingCategory = categoryDistribution.length
    ? [...categoryDistribution].sort((a, b) => b.value - a.value)[0].category
    : "No category yet";

  const lastSixMonths = Array.from({ length: 6 }).map((_, index) => {
    const monthDate = new Date();
    monthDate.setMonth(monthDate.getMonth() - (5 - index));
    return monthDate.toLocaleString("default", { month: "short" });
  });

  const monthlyComparison = {
    labels: lastSixMonths,
    incomes: Array.from({ length: 6 }).map((_, index) => Math.round(monthlyTotalIncome * (0.8 + index * 0.05))),
    expenses: Array.from({ length: 6 }).map((_, index) => Math.round(monthlyTotalExpense * (0.75 + index * 0.04))),
  };

  const failedSections = Object.entries(dashboardErrors)
    .filter(([, message]) => !!message)
    .map(([key]) => apiErrorLabels[key]);

  const dashboardErrorBanner = failedSections.length > 0 ? (
    <div
      className="dashboard-error-banner glass-panel"
      style={{
        padding: "14px 18px",
        margin: "14px 0",
        border: "1px solid rgba(248, 113, 113, 0.25)",
        background: "rgba(254, 226, 226, 0.18)",
        color: "#991b1b",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "1rem",
        borderRadius: "16px",
      }}
    >
      <div>
        <strong>Some dashboard sections failed to load:</strong> {failedSections.join(", ")}.
      </div>
      <button
        type="button"
        className="btn-secondary"
        onClick={() => setRefresh((prev) => !prev)}
        style={{ whiteSpace: "nowrap" }}
      >
        Retry
      </button>
    </div>
  ) : null;

  const walletList = [
    { name: "Main Wallet", balance: Math.max(currentBalance * 0.45, 0) },
    { name: "Savings Vault", balance: Math.max(currentBalance * 0.27, 0) },
    { name: "Travel Fund", balance: Math.max(currentBalance * 0.16, 0) },
    { name: "Investments", balance: Math.max(currentBalance * 0.12, 0) },
  ];

  const goals = [
    { title: "Emergency Fund", progress: 78 },
    { title: "Dream Vacation", progress: 52 },
    { title: "New Laptop", progress: 64 },
    { title: "Retirement Goal", progress: 48 },
  ];

  const handleAddExpense = async (data) => {
    try {
      const authToken = token || localStorage.getItem("token");
      await axios.post(`${BASE_URL}/api/expense/addExpense`, { expense: data }, { headers: { Authorization: `Bearer ${authToken}` } });
      const expenseAmount = Number(data.amount || 0);
      if (budget > 0 && monthlyTotalExpense + expenseAmount > budget) {
        toast.warning(`Budget exceeded by Rs ${Math.max(monthlyTotalExpense + expenseAmount - budget, 0).toLocaleString()}`);
      }
      setDashboardBalance((prev) => Number(prev ?? allTimeIncome - allTimeExpenses) - expenseAmount);
      if (setUser) {
        setUser((prev) => prev ? { ...prev, balance: Number((prev.balance || 0) - expenseAmount) } : prev);
      }
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
      const response = await axios.post(`${BASE_URL}/api/balance`, data, { headers: { Authorization: `Bearer ${authToken}` } });
      const updatedBalance = response.data?.balance;
      if (updatedBalance !== undefined) {
        setDashboardBalance(Number(updatedBalance));
        if (setUser) {
          setUser((prev) => prev ? { ...prev, balance: Number(updatedBalance) } : prev);
        }
      } else {
        const incomeAmount = Number(data.amount || 0);
        setDashboardBalance((prev) => Number(prev ?? allTimeIncome - allTimeExpenses) + incomeAmount);
      }
      setRefresh((prev) => !prev);
      setShowIncomeModal(false);
      toast.success("Income added successfully.");
    } catch (error) {
      console.error("Add income error", error, error?.response?.data);
      const msg = error?.response?.data?.message || error?.message || "Unable to add income.";
      toast.error(msg);
    }
  };

  const handleAddBalance = async (data) => {
    // Balance top-up removed from UI. Function intentionally left empty.
  };

  const handleSaveBudget = async (newBudget) => {
    const normalizedBudget = parseBudgetValue(newBudget);
    if (normalizedBudget === null) {
      toast.error("Please enter a valid monthly budget.");
      return;
    }
    setBudget(normalizedBudget);
    if (setUser) {
      setUser((prev) => (prev ? { ...prev, monthlyBudget: normalizedBudget } : prev));
    }
    try {
      localStorage.setItem("monthlyBudget", String(normalizedBudget));
    } catch (e) {
      console.warn("Failed to store monthlyBudget", e);
    }
    try {
      const authToken = token || localStorage.getItem("token");
      if (authToken) {
        await axios.post(`${BASE_URL}/api/account/budget`, { monthlyBudget: normalizedBudget }, { headers: { Authorization: `Bearer ${authToken}` } });
      }
    } catch (err) {
      console.warn("Failed to save budget to server", err?.message || err);
    }
    setShowBudgetModal(false);
    setRefresh((prev) => !prev);
    toast.success(`Budget updated: Rs ${normalizedBudget.toLocaleString()}`);
  };

  const handleExportCSV = () => {
    const rows = [["Category", "Amount"], ...categoryDistribution.map((item) => [item.category, item.value])];
    const csv = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `tracknest-dashboard-${new Date().getFullYear()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV exported successfully.");
  };

  const handleExportPDF = () => {
    window.print();
    toast.success("Print dialog opened for PDF export.");
  };

  const handleImportCSV = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const rows = content.split(/\r?\n/).filter(Boolean);
      toast.success(`Imported ${rows.length - 1} rows.`);
    };
    reader.readAsText(file);
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
    <motion.div className={`dashboard-container premium-theme-${selectedTheme}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="dashboard-topbar glass-panel">
        <div className="topbar-left">
          <div>
            <p className="eyebrow">Premium dashboard</p>
            <h2>Welcome back, {user?.username || "Finance Manager"}</h2>
          </div>
        </div>
        <div className="topbar-right">
          <div className="topbar-search">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search transactions, budgets, categories..."
              aria-label="Search dashboard"
            />
          </div>
          <button className="icon-button" type="button" onClick={() => toast.info("Notifications are not available yet.")}>🔔</button>
        </div>
      </div>
      {dashboardErrorBanner}

      <section className="hero-panel glass-panel">
        <div className="hero-copy">
          <span className="eyebrow">Elite finance suite</span>
          <h1>Turn complex finances into calm decisions.</h1>
          <p>Track spending, analyze trends, manage goals, and unlock AI-driven insights across every account.</p>
          <div className="hero-actions">
            <button className="btn-primary" type="button" onClick={() => setShowExpenseModal(true)}>
              Add expense
            </button>
            <button className="btn-secondary" type="button" onClick={() => setShowIncomeModal(true)}>
              Add income
            </button>
            <button className="btn-secondary" type="button" onClick={() => setShowBudgetModal(true)}>
              Update budget
            </button>
          </div>
        </div>
        <div className="hero-metrics-grid">
          {[
            { label: "Total balance", value: `Rs ${currentBalance.toLocaleString()}` },
            { label: "Income this month", value: `Rs ${monthlyTotalIncome.toLocaleString()}` },
            { label: "Expense this month", value: `Rs ${monthlyTotalExpense.toLocaleString()}` },
            { label: "Budget target", value: `Rs ${Number(budget || 0).toLocaleString()}` },
            { label: "Remaining", value: `Rs ${remainingBudget.toLocaleString()}` },
          ].map((card) => (
            <div key={card.label} className="hero-metric-card">
              <span>{card.label}</span>
              <strong>{card.value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="summary-grid">
        {[
          { label: "Net worth", value: `Rs ${currentBalance.toLocaleString()}` },
          {
            label: "Forecasted spend",
            value: forecastedSpend !== null ? `Rs ${forecastedSpend.toLocaleString()}` : "Forecast unavailable",
          },
          { label: "Top category", value: topSpendingCategory },
          { label: "Budget level", value: `${budgetPercent}% used` },
        ].map((card) => (
          <div key={card.label} className="summary-card glass-panel">
            <p>{card.label}</p>
            <strong>{card.value}</strong>
          </div>
        ))}
      </section>

      <section className="glass-panel" style={{ padding: "20px 24px", borderRadius: "20px" }}>
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
        {budgetExceeded && (
          <div style={{ marginTop: "16px", padding: "14px", borderRadius: "16px", background: "rgba(248, 113, 113, 0.12)", color: "#991b1b" }}>
            <strong>Budget exceeded:</strong> You are over budget by Rs {exceededAmount.toLocaleString()}. Please review your spending.
          </div>
        )}
      </section>

      <section className="analytics-panel">
        <div className="analytics-header">
          <div>
            <p className="eyebrow">Deep analytics</p>
            <h3>Trend comparison</h3>
          </div>
          <div className="range-buttons">
            {[{ label: "7D", value: "7d" }, { label: "30D", value: "30d" }, { label: "90D", value: "90d" }].map((range) => (
              <button
                key={range.value}
                type="button"
                className={`range-button ${selectedRange === range.value ? "active" : ""}`}
                onClick={() => setSelectedRange(range.value)}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        <div className="analytics-grid">
          <div className="chart-card glass-panel">
            <div className="chart-card-header">
              <span>Income vs Expense</span>
              <button className="icon-button small" type="button" onClick={handleExportCSV}>⬇</button>
            </div>
            <Line
              data={{
                labels: monthlyComparison.labels,
                datasets: [
                  { label: "Income", data: monthlyComparison.incomes, borderColor: "#34d399", backgroundColor: "rgba(52, 211, 153, 0.18)", tension: 0.35, fill: true },
                  { label: "Expense", data: monthlyComparison.expenses, borderColor: "#60a5fa", backgroundColor: "rgba(96, 165, 250, 0.18)", tension: 0.35, fill: true },
                ],
              }}
              options={{
                responsive: true,
                plugins: { legend: { labels: { color: "#cbd5e1" } } },
                scales: { x: { ticks: { color: "#cbd5e1" }, grid: { color: "rgba(148, 163, 184, 0.15)" } }, y: { ticks: { color: "#cbd5e1" }, grid: { color: "rgba(148, 163, 184, 0.15)" } } },
              }}
            />
          </div>

          <div className="side-widgets">
            <div className="chart-card glass-panel compact-card">
              <div className="chart-card-header">
                <span>Category distribution</span>
                <span className="status-chip">Live</span>
              </div>
              <Doughnut
                data={{
                  labels: categoryDistribution.map((item) => item.category),
                  datasets: [{ data: categoryDistribution.map((item) => item.value), backgroundColor: ["#818cf8", "#22c55e", "#38bdf8", "#f97316", "#fbbf24"] }],
                }}
                options={{ plugins: { legend: { position: "bottom", labels: { color: "#cbd5e1" } } } }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="insights-panel">
        <div className="insight-card glass-panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">AI insights</p>
              <h3>Smart recommendations</h3>
            </div>
            <button className="icon-button small" type="button" onClick={() => setRefresh((prev) => !prev)}>⟳</button>
          </div>
          <div className="insight-items">
            {dashboardLoading ? (
              <article>
                <h4>Loading insights</h4>
                <p>Fetching the latest forecast and spending recommendations.</p>
              </article>
            ) : dashboardErrors.insights ? (
              <article>
                <h4>AI insights unavailable</h4>
                <p>{dashboardErrors.insights}</p>
              </article>
            ) : dashboardInsights.length > 0 ? (
              dashboardInsights.map((insight, index) => (
                <article key={`${insight.type}-${index}`}>
                  <h4>{insight.type === "anomaly" ? "Unusual expense" : insight.type === "saving" ? "Saving tip" : insight.type === "forecast" ? "Forecast" : "Insight"}</h4>
                  <p>{insight.message}</p>
                </article>
              ))
            ) : (
              <article>
                <h4>No insights available</h4>
                <p>Use your premium dashboard to unlock real-time spending and forecast insights.</p>
              </article>
            )}
          </div>
        </div>

        <div className="goals-panel glass-panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">Goals</p>
              <h3>Progress tracker</h3>
            </div>
            <span className={`status-chip ${budgetPercent < 85 ? "success" : "warning"}`}>{budgetPercent < 85 ? "On track" : "Review"}</span>
          </div>
          <div className="goal-list">
            {goals.map((goal) => (
              <div key={goal.title} className="goal-item">
                <div>
                  <strong>{goal.title}</strong>
                  <span>{goal.progress}% complete</span>
                </div>
                <div className="goal-progress-bar">
                  <div className="goal-progress-fill" style={{ width: `${goal.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="activity-panel">
        <div className="activity-header">
          <div>
            <p className="eyebrow">Recent transactions</p>
            <h3>Live ledger</h3>
          </div>
          <div className="activity-controls">
            <select value={transactionFilter} onChange={(e) => setTransactionFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <select value={transactionSort} onChange={(e) => setTransactionSort(e.target.value)}>
              <option value="date-desc">Newest</option>
              <option value="date-asc">Oldest</option>
              <option value="amount-desc">Amount ↓</option>
              <option value="amount-asc">Amount ↑</option>
              <option value="type">Type</option>
            </select>
          </div>
        </div>
        <div className="transaction-table-wrapper glass-panel">
          <table className="transaction-table">
            <thead>
              <tr>
                <th>Transaction</th>
                <th>Category</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.slice(0, 8).map((item, index) => (
                <tr key={`${item._id || item.date || index}-${index}`}>
                  <td>{item.description || item.category || "Transaction"}</td>
                  <td>{item.category || item.type || "—"}</td>
                  <td>{new Date(item.date || item.createdAt || item.timestamp || now).toLocaleDateString()}</td>
                  <td className={`amount ${item.type === "income" ? "income" : "expense"}`}>
                    {(item.type === "income" ? "+" : "-") + " Rs " + Number(item.amount || 0).toLocaleString()}
                  </td>
                  <td>
                    <span
                      className={`status-pill ${item.status ? (item.status === "completed" ? "success" : "warning") : item.type === "income" ? "success" : "warning"}`}
                    >
                      {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : item.type === "income" ? "Cleared" : "Pending"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bottom-panels">
        <div className="calendar-widget glass-panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">Calendar</p>
              <h3>Upcoming activity</h3>
              {upcomingSource === "fallback" && (
                <p style={{ fontSize: "0.82rem", color: "#6b7280", marginTop: "6px" }}>
                  Using alternate recurring data source
                </p>
              )}
            </div>
          </div>
          <div className="calendar-grid">
            {dashboardErrors.upcoming ? (
              <div className="calendar-error-card" style={{ gridColumn: "1 / -1", padding: "18px", borderRadius: "16px", background: "rgba(254, 226, 226, 0.16)", border: "1px solid rgba(248, 113, 113, 0.25)", color: "#991b1b" }}>
                <strong>Upcoming activity unavailable</strong>
                <p>{dashboardErrors.upcoming}</p>
              </div>
            ) : upcomingActivity.length > 0 ? (
              upcomingActivity.map((item) => (
                <div key={item._id} className="calendar-event-card">
                  <strong>{new Date(item.nextDueDate).toLocaleDateString()}</strong>
                  <p>{item.type === "expense" ? "Bill due" : "Reminder"}</p>
                  <span>{item.description || item.category || "Upcoming activity"}</span>
                  <strong>Rs {Number(item.amount || 0).toLocaleString()}</strong>
                </div>
              ))
            ) : (
              <div className="calendar-empty">
                <p>No upcoming activity yet.</p>
                <p>Add a recurring transaction to populate your calendar.</p>
              </div>
            )}
          </div>
        </div>

        <div className="premium-panel glass-panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">Upgrade</p>
              <h3>Unlock the full suite</h3>
            </div>
            <button className="btn-primary" type="button" onClick={() => navigate("/pricing")}>
              Upgrade now
            </button>
          </div>
          <div className="premium-benefits-grid">
            {premiumFeatures.slice(0, 6).map((feature) => (
              <div key={feature} className="benefit-card">
                <span>✔</span>
                <p>{feature}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="theme-panel glass-panel">
        <div className="section-header">
          <div>
            <p className="eyebrow">Themes</p>
            <h3>Custom dashboard styles</h3>
          </div>
        </div>
        <div className="theme-picker">
          {themeOptions.map((theme) => (
            <button
              key={theme.id}
              type="button"
              className={`theme-pill ${selectedTheme === theme.id ? "active" : ""}`}
              onClick={() => setSelectedTheme(theme.id)}
            >
              {theme.label}
            </button>
          ))}
        </div>
      </section>

      <AnimatePresence>
        {showExpenseModal && (
          <motion.div className="modalBackground" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Modal title="Add Expense" onClose={() => setShowExpenseModal(false)} onSubmit={handleAddExpense} categories={expenseCategories} currentBalance={currentBalance} />
          </motion.div>
        )}

        {showIncomeModal && (
          <motion.div className="modalBackground" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Modal title="Add Income" onClose={() => setShowIncomeModal(false)} onSubmit={handleAddIncome} categories={incomeCategories} currentBalance={currentBalance} />
          </motion.div>
        )}

        

        {showBudgetModal && (
          <BudgetModal isOpen={showBudgetModal} onClose={() => setShowBudgetModal(false)} currentBudget={budget} onSave={handleSaveBudget} />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PremiumDashboard;
