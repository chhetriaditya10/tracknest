import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/ContextProvider";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";
import { Bar, Pie } from "react-chartjs-2";
import "chart.js/auto";

import LightDashboardSidebar from "../components/LightDashboardSidebar";
import LightDashboardNavbar from "../components/LightDashboardNavbar";
import BudgetModal from "../components/BudgetModal";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const parseBudgetValue = (value) => {
  if (value === null || value === undefined) return null;
  const normalized = String(value).trim();
  if (normalized === "") return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};

const LightDashboard = () => {
  const { user, token, setUser } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => window.innerWidth < 1024);
  const [budget, setBudget] = useState(() => {
    const storedValue = localStorage.getItem("monthlyBudget");
    if (storedValue === null) return 50000;
    const parsedBudget = parseBudgetValue(storedValue);
    return parsedBudget >= 0 ? parsedBudget : 50000;
  });
  const [showBudgetModal, setShowBudgetModal] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarCollapsed(window.innerWidth < 1024);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (user?.monthlyBudget !== undefined) {
      if (user.monthlyBudget === null) {
        const storedBudget = parseBudgetValue(localStorage.getItem("monthlyBudget"));
        if (storedBudget !== null) {
          setBudget(storedBudget);
        } else {
          setBudget(50000);
          try {
            localStorage.removeItem("monthlyBudget");
          } catch (e) {
            console.warn("Failed to clear stored monthlyBudget", e);
          }
        }
      } else {
        const normalizedBudget = parseBudgetValue(user.monthlyBudget);
        setBudget(normalizedBudget !== null ? normalizedBudget : 50000);
        try {
          localStorage.setItem("monthlyBudget", String(normalizedBudget));
        } catch (e) {
          console.warn("Failed to store monthlyBudget", e);
        }
      }
    }
  }, [user?.monthlyBudget]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const authToken = token || localStorage.getItem("token");
        const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};

        const [expenseRes, incomeRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/expense/getExpenses`, { headers }),
          axios.get(`${BASE_URL}/api/balance/getBalances`, { headers }),
        ]);

        setExpenses(expenseRes.data.expenses || []);
        setIncomes(incomeRes.data.balances || []);
      } catch (error) {
        console.error(error);
        toast.error("Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refresh, token]);

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

  const now = new Date();
  const monthlyExpenses = expenses.filter((item) => {
    const date = new Date(item.date || item.createdAt || item.timestamp || now);
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });

  const totalBalance = incomes.reduce((sum, item) => sum + Number(item.amount || 0), 0) - expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const spentThisMonth = monthlyExpenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const categoryTotals = expenses.reduce((totals, item) => {
    const category = item.category || "Others";
    totals[category] = (totals[category] || 0) + Number(item.amount || 0);
    return totals;
  }, {});

  const categoryDistribution = Object.entries(categoryTotals).map(([category, value]) => ({ category, value }));
  const topCategory = categoryDistribution.length
    ? categoryDistribution.reduce((prev, current) => (current.value > prev.value ? current : prev)).category
    : null;
  const budgetPercent = budget ? Math.min(Math.round((spentThisMonth / budget) * 100), 200) : 0;
  const remainingBudget = Math.max(Number(budget || 0) - spentThisMonth, 0);

  const monthlyLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const monthlyData = monthlyLabels.map((label, index) => {
    const base = spentThisMonth;
    return Math.round(base * (0.7 + index * 0.05));
  });

  const topColors = ["#2563eb", "#10b981", "#f59e0b", "#f43f5e", "#8b5cf6"];

  const streams = useMemo(() => {
    const categories = categoryDistribution.slice(0, 5);
    return {
      labels: categories.map((item) => item.category),
      datasets: [
        {
          data: categories.map((item) => item.value),
          backgroundColor: topColors.slice(0, categories.length),
          borderWidth: 0,
        },
      ],
    };
  }, [categoryDistribution]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F6FA]">
        <ClipLoader color="#4f46e5" size={56} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EEF2F9] text-slate-900">
      <LightDashboardSidebar
        isOpen={isSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        onClose={() => setIsSidebarOpen(false)}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      <div className={`ml-0 flex min-h-screen w-full flex-1 flex-col items-stretch justify-start transition-all duration-300 ${
        isSidebarCollapsed ? "md:ml-20" : "md:ml-56"
      }`}>
        <div className="sticky top-0 z-30 bg-[#EEF2F9] shadow-sm shadow-slate-200/60">
          <LightDashboardNavbar onMenuClick={() => setIsSidebarOpen(true)} />
        </div>

        <main className="mx-auto w-full max-w-7xl px-4 pt-6 pb-8 sm:px-6 lg:px-8">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 items-stretch">
            <div className="dashboard-card p-6 h-full">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Total Balance</p>
              <p className="mt-4 text-3xl font-semibold text-slate-900">Rs {totalBalance.toLocaleString()}</p>
                <span className="dashboard-pill mt-4 bg-emerald-50 text-emerald-700">+8% since last month</span>
                <div className="mt-3">
                  <button className="btn-secondary" type="button" onClick={() => setShowBudgetModal(true)}>Set Budget</button>
                </div>
            </div>
            <div className="dashboard-card p-6 h-full bg-[#fff7ed] border-[#fcd34d]">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Spent This Month</p>
              <p className="mt-4 text-3xl font-semibold text-slate-900">Rs {spentThisMonth.toLocaleString()}</p>
              <span className="dashboard-pill mt-4 bg-rose-50 text-rose-700">+12% vs last month</span>
            </div>
            <div className="dashboard-card p-6 h-full">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Top Category</p>
              <p className="mt-4 text-3xl font-semibold text-slate-900">{topCategory || "No data yet"}</p>
            </div>
            <div className="dashboard-card p-6 h-full">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Budget target</p>
              <p className="mt-4 text-3xl font-semibold text-slate-900">Rs {Number(budget || 0).toLocaleString()}</p>
            </div>
            <div className="dashboard-card p-6 h-full">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Budget Remaining</p>
                  <p className="mt-4 text-3xl font-semibold text-slate-900">Rs {remainingBudget.toLocaleString()}</p>
                </div>
                <span className="dashboard-pill bg-blue-50 text-blue-700">{budgetPercent}%</span>
              </div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-blue-600" style={{ width: `${Math.min(budgetPercent, 100)}%` }} />
              </div>
              <p className="mt-3 text-sm text-slate-500">Budget: Rs {Number(budget || 0).toLocaleString()} • Spent: Rs {spentThisMonth.toLocaleString()}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-6 grid-cols-1 lg:grid-cols-2 items-stretch">
            <div className="dashboard-card p-6 h-full">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">Monthly Expenses</p>
                  <h2 className="text-xl font-semibold text-slate-900">6-month trend</h2>
                </div>
                <button className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
                  Recent ▾
                </button>
              </div>
              <div className="min-h-[260px]">
                <Bar
                  data={{
                    labels: monthlyLabels,
                    datasets: [
                      {
                        label: "Expenses",
                        data: monthlyData,
                        backgroundColor: monthlyData.map((value, index) =>
                          index === monthlyData.length - 1 ? "#1d4ed8" : "#3b82f6"
                        ),
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                    },
                    scales: {
                      x: {
                        ticks: { color: "#64748b" },
                        grid: { display: false },
                      },
                      y: {
                        ticks: { color: "#64748b" },
                        grid: { color: "rgba(148, 163, 184, 0.15)" },
                      },
                    },
                  }}
                />
              </div>
            </div>

            <div className="dashboard-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">Top Category</p>
                  <h2 className="text-xl font-semibold text-slate-900">Spending mix</h2>
                </div>
              </div>
              <div className="grid gap-6 grid-cols-1 lg:grid-cols-[1fr_auto] lg:items-center">
                <div className="min-h-[260px]">
                  <Pie data={streams} />
                </div>
                <div className="space-y-3">
                  {streams.labels.length ? (
                    streams.labels.map((label, index) => (
                      <div key={label} className="flex items-center justify-between rounded-3xl bg-slate-50 p-3">
                        <div className="flex items-center gap-3">
                          <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: streams.datasets[0].backgroundColor[index] }} />
                          <span className="text-sm font-medium text-slate-700">{label}</span>
                        </div>
                        <span className="text-sm font-semibold text-slate-900">Rs {Number(categoryTotals[label] || 0).toLocaleString()}</span>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-3xl bg-slate-50 p-6 text-center text-sm text-slate-500">
                      No category data available yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-6 grid-cols-1 xl:grid-cols-2">
            <div className="dashboard-card p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">Recent Expenses</p>
                  <h2 className="text-xl font-semibold text-slate-900">Latest transactions</h2>
                </div>
              </div>
              <div className="overflow-x-auto rounded-[18px] border border-slate-200 bg-white">
                <table className="min-w-full text-left text-sm text-slate-600">
                  <thead className="border-b border-slate-200">
                    <tr>
                      <th className="py-3 pr-6 font-semibold text-slate-500">Amount</th>
                      <th className="py-3 pr-6 font-semibold text-slate-500">Category</th>
                      <th className="py-3 font-semibold text-slate-500">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {expenses.length ? (
                      [...expenses]
                        .sort((a, b) => new Date(b.date || b.createdAt || b.timestamp) - new Date(a.date || a.createdAt || a.timestamp))
                        .slice(0, 6)
                        .map((item, index) => (
                          <tr key={index}>
                            <td className="py-4 pr-6 font-semibold text-slate-900">Rs {Number(item.amount || 0).toLocaleString()}</td>
                            <td className="py-4 pr-6">{item.category || "Uncategorized"}</td>
                            <td className="py-4">{new Date(item.date || item.createdAt || new Date()).toLocaleDateString()}</td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="py-10 text-center text-slate-500">
                          No recent expenses yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="dashboard-card p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">Bills and Subscriptions</p>
                  <h2 className="text-xl font-semibold text-slate-900">Upcoming payments</h2>
                </div>
              </div>
              <div className="space-y-3">
                {expenses.filter((item) => /(bill|subscription|rent|netflix|spotify|gym|insurance)/i.test(item.category || item.description || "")).slice(0, 5).map((bill, index) => (
                  <div key={index} className="flex items-center justify-between gap-3 rounded-3xl bg-slate-50 p-4">
                    <div className="flex items-center gap-3">
                      <span className={`h-3.5 w-3.5 rounded-full ${["bg-blue-500","bg-emerald-500","bg-rose-500","bg-amber-500","bg-violet-500"][index % 5]}`} />
                      <div>
                        <p className="font-medium text-slate-900">{bill.category || "Upcoming bill"}</p>
                        <p className="text-sm text-slate-500">{new Date(bill.date || bill.createdAt || new Date()).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <p className="font-semibold text-slate-900">Rs {Number(bill.amount || 0).toLocaleString()}</p>
                  </div>
                ))}
                {!expenses.some((item) => /(bill|subscription|rent|netflix|spotify|gym|insurance)/i.test(item.category || item.description || "")) && (
                  <div className="rounded-3xl bg-slate-50 p-6 text-center text-sm text-slate-500">
                    No upcoming bills or subscriptions found.
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
        {showBudgetModal && (
          <BudgetModal isOpen={showBudgetModal} onClose={() => setShowBudgetModal(false)} currentBudget={budget} onSave={handleSaveBudget} />
        )}
      </div>
    </div>
  );
};

export default LightDashboard;
