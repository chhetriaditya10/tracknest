import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/ContextProvider";
import AIBot from "../components/aiBot";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";

// Components
import Chart from "../components/Chart";
import Modal from "../components/Modal";
import BudgetModal from "../components/BudgetModal";

// Assets & Styles
import "../styles/HomePage.css";
import IncomeIcon from "../assets/income icon.png";
import ExpenseIcon from "../assets/expenses icon.png";
import WalletIcon from "../assets/money gift icon.png";

// Safe access to env variable
const BASE_URL = import.meta.env?.VITE_API_BASE_URL || "http://localhost:5000";

const Home = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);

  // Modals
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [budget, setBudget] = useState(() => localStorage.getItem("monthlyBudget") || 50000);

  // Categories
  const expenseCategories = [
    "Foods",
    "Transport",
    "Grocery",
    "Entertainment",
    "Education",
    "Clothes",
    "Bills",
    "Others",
  ];

  const incomeCategories = [
    "Salary",
    "Allowance",
    "Loan",
    "Freelance",
    "Others",
  ];

  // --- Animations ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        when: "beforeChildren",
      },
    },
  };

  const itemFadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const itemPop = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 200, damping: 15 },
    },
  };

  const itemFadeRight = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const itemFadeLeft = {
    hidden: { opacity: 0, x: 30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  // --- Fetch Data ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [expRes, incRes, actRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/expense/getExpenses`, { headers }),
          axios.get(`${BASE_URL}/api/balance/getBalances`, { headers }),
          axios.get(`${BASE_URL}/api/activity/recent`, { headers }),
        ]);

        setExpenses(expRes.data.expenses || []);
        setIncomes(incRes.data.balances || []);
        setRecentActivity(actRes.data.activities || []);
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refresh]);

  // --- Calculations for Current Month ---
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const monthName = currentDate.toLocaleString("default", { month: "long" });

  // Filter for Current Month
  const monthlyExpensesList = expenses.filter((item) => {
    const d = new Date(item.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const monthlyIncomesList = incomes.filter((item) => {
    const d = new Date(item.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  // Calculate Monthly Totals
  const monthlyTotalExpense = monthlyExpensesList.reduce(
    (acc, curr) => acc + Number(curr.amount),
    0
  );
  const monthlyTotalIncome = monthlyIncomesList.reduce(
    (acc, curr) => acc + Number(curr.amount),
    0
  );

  // Calculate All-Time Balance (Wallet)
  const allTimeExpenses = expenses.reduce(
    (acc, curr) => acc + Number(curr.amount),
    0
  );
  const allTimeIncome = incomes.reduce(
    (acc, curr) => acc + Number(curr.amount),
    0
  );
  const currentBalance = allTimeIncome - allTimeExpenses;

  // --- Handlers ---
  const handleAddExpense = async (data) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${BASE_URL}/api/expense/addExpense`,
        { expense: data },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRefresh((prev) => !prev);
      setShowExpenseModal(false);
    } catch (error) {
      console.error("Add Expense Error", error);
    }
  };

  const handleAddIncome = async (data) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${BASE_URL}/api/balance/addBalance`,
        { balance: data },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRefresh((prev) => !prev);
      setShowIncomeModal(false);
    } catch (error) {
      console.error("Add Income Error", error);
    }
  };

  const handleSaveBudget = (newBudget) => {
    setBudget(newBudget);
    localStorage.setItem("monthlyBudget", newBudget);
    setShowBudgetModal(false);
    toast.success("Budget set successfully!");
  };

  // Budget calculations
  const budgetUsed = monthlyTotalExpense;
  const budgetPercent = Math.min((budgetUsed / budget) * 100, 100);
  const budgetRemaining = budget - budgetUsed;
  const isBudgetExceeded = budgetUsed > budget;

  // Show alert when budget exceeded
  useEffect(() => {
    if (isBudgetExceeded) {
      toast.warning("⚠️ You've exceeded your monthly budget!");
    } else if (budgetPercent >= 80) {
      toast.info("💡 You've used 80% of your budget.");
    }
  }, [isBudgetExceeded, budgetPercent]);

  if (loading) {
    return (
      <div className="loading-container">
        <ClipLoader color="#8b5cf6" size={50} />
      </div>
    );
  }

  return (
    <motion.div
      className="dashboard-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Welcome Header */}
      <motion.header className="welcome-section" variants={itemFadeUp}>
        <h1 className="welcome-title">Overview</h1>
        <p className="welcome-subtitle">
          Welcome back, @{user?.username || "User"}
        </p>
      </motion.header>

      {/* Top Row: Stats Cards */}
      <section className="stats-grid">
        {/* Total Balance (All Time) */}
        <motion.div
          className="stat-card glass-panel balance"
          variants={itemPop}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="stat-header">
            <img
              src={WalletIcon}
              alt="icon"
              style={{ width: 24, opacity: 0.8 }}
            />
            <span>Total Balance</span>
          </div>
          <div className="stat-value">Rs {currentBalance.toLocaleString()}</div>
        </motion.div>

        {/* Total Income (Current Month) */}
        <motion.div
          className="stat-card glass-panel income"
          variants={itemPop}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="stat-header">
            <img
              src={IncomeIcon}
              alt="icon"
              style={{ width: 24, opacity: 0.8 }}
            />
            <span>Income ({monthName})</span>
          </div>
          <div className="stat-value">
            Rs {monthlyTotalIncome.toLocaleString()}
          </div>
        </motion.div>

        {/* Total Expense (Current Month) */}
        <motion.div
          className="stat-card glass-panel expense"
          variants={itemPop}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="stat-header">
            <img
              src={ExpenseIcon}
              alt="icon"
              style={{ width: 24, opacity: 0.8 }}
            />
            <span>Expense ({monthName})</span>
          </div>
          <div className="stat-value">
            Rs {monthlyTotalExpense.toLocaleString()}
          </div>
        </motion.div>

        {/* Budget Progress */}
        <motion.div
          className="stat-card glass-panel budget"
          variants={itemPop}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowBudgetModal(true)}
          style={{ cursor: "pointer" }}
        >
          <div className="stat-header">
            <span>🎯</span>
            <span>Monthly Budget</span>
          </div>
          <div className="stat-value">Rs {parseInt(budget).toLocaleString()}</div>
          <div className="budget-progress-container">
            <div className="budget-progress-bar">
              <div 
                className={`budget-progress-fill ${isBudgetExceeded ? 'exceeded' : budgetPercent >= 80 ? 'warning' : 'safe'}`}
                style={{ width: `${budgetPercent}%` }}
              />
            </div>
            <span className={`budget-status ${isBudgetExceeded ? 'exceeded' : budgetPercent >= 80 ? 'warning' : 'safe'}`}>
              {isBudgetExceeded ? '🔴 Exceeded' : budgetPercent >= 80 ? '🟡 Warning' : '🟢 Safe'}
            </span>
          </div>
          <p style={{ fontSize: "12px", color: "#888", marginTop: "8px" }}>
            Rs {budgetUsed.toLocaleString()} / Rs {parseInt(budget).toLocaleString()} ({Math.round(budgetPercent)}%)
          </p>
        </motion.div>
      </section>

      {/* Middle Row: Chart & Actions */}
      <section className="main-grid">
        <motion.div
          className="chart-section glass-panel"
          variants={itemFadeRight}
        >
          <div className="section-header">
            <h3 className="section-title">Financial Analytics</h3>
          </div>
          <Chart expenses={expenses} balances={incomes} />
        </motion.div>

        <motion.div
          className="actions-section glass-panel"
          variants={itemFadeLeft}
        >
          <div className="section-header">
            <h3 className="section-title">Quick Actions</h3>
          </div>
          <motion.button
            className="action-btn add-income"
            onClick={() => setShowIncomeModal(true)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <span>+</span> Add Income
          </motion.button>
          <motion.button
            className="action-btn add-expense"
            onClick={() => setShowExpenseModal(true)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <span>-</span> Add Expense
          </motion.button>
        </motion.div>
      </section>

      {/* Bottom Row: Recent Transactions */}
      <motion.section
        className="recent-section glass-panel"
        variants={itemFadeUp}
      >
        <div className="section-header">
          <h3 className="section-title">Recent Transactions</h3>
        </div>
        <div className="transaction-list">
          {recentActivity.length === 0 ? (
            <p style={{ color: "var(--text-muted)", textAlign: "center" }}>
              No recent activity.
            </p>
          ) : (
            recentActivity.map((item, index) => (
              <motion.div
                key={index}
                className="transaction-item"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ x: 5, backgroundColor: "rgba(255,255,255,0.08)" }}
              >
                <div className="t-info">
                  <div className="t-icon">
                    {item.type === "income" ? "💰" : "🛍️"}
                  </div>
                  <div className="t-details">
                    <span className="t-category">{item.category}</span>
                    <span className="t-date">
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <span className={`t-amount ${item.type}`}>
                  {item.type === "income" ? "+" : "-"} Rs
                  {item.amount.toLocaleString()}
                </span>
              </motion.div>
            ))
          )}
        </div>
      </motion.section>

      <AIBot
        expenses={expenses}
        incomes={incomes}
        currentBalance={currentBalance}
      />

      {/* Modals */}
      <AnimatePresence>
        {showExpenseModal && (
          <motion.div
            className="modalBackground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Modal
              title="Add Expense"
              onClose={() => setShowExpenseModal(false)}
              onSubmit={handleAddExpense}
              categories={expenseCategories}
              currentBalance={currentBalance}
            />
          </motion.div>
        )}

        {showIncomeModal && (
          <motion.div
            className="modalBackground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Modal
              title="Add Income"
              onClose={() => setShowIncomeModal(false)}
              onSubmit={handleAddIncome}
              categories={incomeCategories}
              currentBalance={currentBalance}
            />
          </motion.div>
        )}

        {showBudgetModal && (
          <BudgetModal
            isOpen={showBudgetModal}
            onClose={() => setShowBudgetModal(false)}
            currentBudget={budget}
            onSave={handleSaveBudget}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Home;
