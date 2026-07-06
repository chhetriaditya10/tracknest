import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
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
import { useAuth } from "../context/ContextProvider";
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
  const { token, user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [yearlyStats, setYearlyStats] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [budgetSummary, setBudgetSummary] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [insights, setInsights] = useState([]);
  const [forecastError, setForecastError] = useState(null);
  const [insightsError, setInsightsError] = useState(null);
  const [pageError, setPageError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().split("T")[0].slice(0, 7)
  );
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const yearOptions = useMemo(() => {
    const year = new Date().getFullYear();
    return [year - 2, year - 1, year, year + 1];
  }, []);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setForecastError(null);
    setInsightsError(null);
    setPageError(null);

    const headers = { Authorization: `Bearer ${token}` };

    try {
      try {
        await axios.get(`${BASE_URL}/api/analytics/generateMonthlyAnalytics/${selectedMonth}`, {
          headers,
        });
      } catch (generateError) {
        console.warn("generateMonthlyAnalytics failed:", generateError?.response?.data || generateError.message);
      }

      const results = await Promise.allSettled([
        axios.get(`${BASE_URL}/api/analytics/getMonthlyAnalytics/${selectedMonth}`, { headers }),
        axios.get(`${BASE_URL}/api/analytics/getInsights?days=90`, { headers }),
        axios.get(`${BASE_URL}/api/analytics/getYearlyAnalytics/${selectedYear}`, { headers }),
        axios.get(`${BASE_URL}/api/analytics/forecast?days=90`, { headers }),
        axios.get(`${BASE_URL}/api/budget/getBudgetSummary`, { headers }),
      ]);

      const [analyticsRes, insightsRes, yearlyRes, forecastRes, budgetRes] = results;

      if (analyticsRes.status === "fulfilled") {
        setAnalytics(analyticsRes.value.data.analytics);
      } else {
        console.error("Monthly analytics failed:", analyticsRes.reason?.response?.data || analyticsRes.reason?.message);
        setPageError("Some analytics data could not be loaded. The dashboard will show available sections.");
        setAnalytics({
          totalIncome: 0,
          totalExpense: 0,
          netSavings: 0,
          savingsRate: 0,
          dailySpending: [],
          categoryExpenses: [],
          categoryIncomes: [],
        });
      }

      if (insightsRes.status === "fulfilled") {
        const rawInsights =
          insightsRes.value.data.insights || insightsRes.value.data?.data?.insights;

        if (Array.isArray(rawInsights)) {
          setInsights(rawInsights);
        } else if (rawInsights && typeof rawInsights === "object") {
          const normalizedInsights = [];
          if (rawInsights.message) {
            normalizedInsights.push({ message: rawInsights.message });
          }
          if (rawInsights.savingsRate) {
            normalizedInsights.push({
              message: `Savings rate is ${rawInsights.savingsRate}% this month.`,
            });
          }
          if (rawInsights.topExpenseCategory) {
            normalizedInsights.push({
              message: `Top expense category: ${rawInsights.topExpenseCategory}.`,
            });
          }
          if (rawInsights.topIncomeCategory) {
            normalizedInsights.push({
              message: `Top income category: ${rawInsights.topIncomeCategory}.`,
            });
          }
          if (rawInsights.highestSpendingDay) {
            normalizedInsights.push({
              message: `Highest spending day: ${new Date(rawInsights.highestSpendingDay.date).toLocaleDateString()} for Rs ${rawInsights.highestSpendingDay.amount}.`,
            });
          }
          if (rawInsights.averageDailySpending) {
            normalizedInsights.push({
              message: `Average daily spending: Rs ${rawInsights.averageDailySpending}.`,
            });
          }
          if (rawInsights.categoryBreakdown && rawInsights.categoryBreakdown.length > 0) {
            normalizedInsights.push({
              message: `Top category: ${rawInsights.categoryBreakdown[0].category} with Rs ${rawInsights.categoryBreakdown[0].amount}.`,
            });
          }
          setInsights(normalizedInsights);
          if (normalizedInsights.length === 0) {
            setInsightsError("Insights are not available yet.");
          }
        } else {
          setInsights([]);
          setInsightsError("Insights are not available yet.");
        }
      } else {
        setInsightsError(
          insightsRes.reason?.response?.data?.message || insightsRes.reason?.message || "Unable to load insights"
        );
      }

      if (yearlyRes.status === "fulfilled") {
        setYearlyStats(yearlyRes.value.data.yearlyStats);
      } else {
        console.error("Yearly analytics failed:", yearlyRes.reason?.response?.data || yearlyRes.reason?.message);
        setYearlyStats({
          totalIncome: 0,
          totalExpense: 0,
          netSavings: 0,
          monthlyBreakdown: [],
          averageMonthlyExpense: 0,
        });
      }

      if (forecastRes.status === "fulfilled") {
        const forecastPayload = forecastRes.value.data.data || forecastRes.value.data;
        setForecast(forecastPayload?.forecast || null);
        if (!forecastPayload?.forecast) {
          setForecastError(forecastPayload?.message || "Not enough data for forecast yet.");
        }
      } else {
        setForecastError(
          forecastRes.reason?.response?.data?.message || forecastRes.reason?.message || "Unable to load forecast"
        );
      }

      let budgetSummaryData = null;

      if (budgetRes.status === "fulfilled" && budgetRes.value.data?.summary) {
        budgetSummaryData = budgetRes.value.data.summary;
      } else {
        console.error("Budget summary failed:", budgetRes.reason?.response?.data || budgetRes.reason?.message);
      }

      const monthlyBudgetTarget = Number(user?.monthlyBudget || 0);
      const monthlyExpense = analyticsRes.status === "fulfilled" ? analyticsRes.value.data.analytics?.totalExpense || 0 : 0;

      if (monthlyBudgetTarget > 0) {
        const percentage = Math.round((monthlyExpense / monthlyBudgetTarget) * 100);
        const budgetStatus = monthlyExpense > monthlyBudgetTarget
          ? "Exceeded"
          : percentage >= 80
            ? "Warning"
            : "Safe";

        budgetSummaryData = {
          totalBudgets: 0,
          totalLimit: monthlyBudgetTarget,
          totalSpent: monthlyExpense,
          thresholdPercentage: percentage,
          budgetStatus,
          warningMessage: monthlyExpense > monthlyBudgetTarget
            ? `Budget exceeded by Rs ${monthlyExpense - monthlyBudgetTarget}`
            : `You have used ${percentage}% of your budget`,
          warningThreshold: 80,
          remainingBudget: Math.max(monthlyBudgetTarget - monthlyExpense, 0),
          exceededAmount: Math.max(monthlyExpense - monthlyBudgetTarget, 0),
        };
      }

      setBudgetSummary(budgetSummaryData);

      const previousMonth = new Date(`${selectedMonth}-01`);
      previousMonth.setMonth(previousMonth.getMonth() - 1);
      const previousMonthKey = previousMonth.toISOString().slice(0, 7);

      if (analyticsRes.status === "fulfilled") {
        try {
          const compareRes = await axios.get(
            `${BASE_URL}/api/analytics/compareMonths/${previousMonthKey}/${selectedMonth}`,
            { headers }
          );
          setComparison(compareRes.data.comparison);
        } catch (compareError) {
          console.error("Comparison fetch failed:", compareError?.response?.data || compareError.message);
        }
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setPageError("Unable to load analytics at the moment. Please refresh or try again later.");
    } finally {
      setLoading(false);
    }
  }, [token, selectedMonth, selectedYear]);

  useEffect(() => {
    if (!token) return;
    fetchAnalytics();
  }, [token, selectedMonth, selectedYear, fetchAnalytics]);

  if (loading) {
    return <div className="loading">Loading analytics...</div>;
  }

  const analyticsSafe = analytics || {
    totalIncome: 0,
    totalExpense: 0,
    netSavings: 0,
    savingsRate: 0,
    dailySpending: [],
    categoryExpenses: [],
    categoryIncomes: [],
  };

  const yearStatsSafe = yearlyStats || {
    totalIncome: 0,
    totalExpense: 0,
    netSavings: 0,
    monthlyBreakdown: [],
    averageMonthlyExpense: 0,
  };

  const avgDailyExpense = analyticsSafe.dailySpending?.length
    ? analyticsSafe.totalExpense / analyticsSafe.dailySpending.length
    : 0;
  const cashFlow = analyticsSafe.totalIncome - analyticsSafe.totalExpense;
  const budgetUtilization = budgetSummary?.thresholdPercentage ?? 0;

  const budgetStatusClass = budgetSummary?.budgetStatus === "Safe"
    ? "budget-safe"
    : budgetSummary?.budgetStatus === "Warning"
      ? "budget-warning"
      : budgetSummary?.budgetStatus === "Exceeded"
        ? "budget-danger"
        : "budget-neutral";

  const budgetStatusLabel = budgetSummary?.budgetStatus || "No budget";

  const expenseTrendData = {
    labels: (analyticsSafe.dailySpending || []).map((d) =>
      new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    ),
    datasets: [
      {
        label: "Expense",
        data: (analyticsSafe.dailySpending || []).map((d) => d.amount),
        borderColor: "#f43f5e",
        backgroundColor: "rgba(244, 63, 94, 0.12)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const incomeTrendData = {
    labels: yearStatsSafe.monthlyBreakdown.map((item) => item.month),
    datasets: [
      {
        label: "Income",
        data: yearStatsSafe.monthlyBreakdown.map((item) => item.totalIncome),
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.15)",
        tension: 0.3,
        fill: true,
      },
      {
        label: "Expense",
        data: yearStatsSafe.monthlyBreakdown.map((item) => item.totalExpense),
        borderColor: "#f43f5e",
        backgroundColor: "rgba(244, 63, 94, 0.15)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const categoryChartData = {
    labels: (analyticsSafe.categoryExpenses || []).map((item) => item.category),
    datasets: [
      {
        data: (analyticsSafe.categoryExpenses || []).map((item) => item.amount),
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

  const incomeCategoryData = {
    labels: (analyticsSafe.categoryIncomes || []).map((item) => item.category),
    datasets: [
      {
        label: "Income by Category",
        data: (analyticsSafe.categoryIncomes || []).map((item) => item.amount),
        backgroundColor: ["#22c55e", "#38bdf8", "#f97316", "#a855f7", "#facc15"],
      },
    ],
  };

  const comparisonData = comparison
    ? {
        labels: [comparison.month1.month, comparison.month2.month],
        datasets: [
          {
            label: "Income",
            data: [comparison.month1.totalIncome, comparison.month2.totalIncome],
            backgroundColor: "#10b981",
          },
          {
            label: "Expense",
            data: [comparison.month1.totalExpense, comparison.month2.totalExpense],
            backgroundColor: "#f43f5e",
          },
        ],
      }
    : null;

  const heatmapCells = (() => {
    const firstDay = new Date(`${selectedMonth}-01`);
    const offset = firstDay.getDay();
    const daysInMonth = new Date(firstDay.getFullYear(), firstDay.getMonth() + 1, 0).getDate();
    const dailyMap = (analyticsSafe.dailySpending || []).reduce((acc, item) => {
      const day = new Date(item.date).getDate();
      acc[day] = (acc[day] || 0) + item.amount;
      return acc;
    }, {});
    const cells = [];

    for (let i = 0; i < offset; i += 1) {
      cells.push(null);
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push(dailyMap[day] || 0);
    }
    while (cells.length % 7 !== 0) {
      cells.push(null);
    }
    return cells;
  })();

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <div>
          <h2>Financial Analytics</h2>
          <p>Interactive charts, cash flow visibility, and forecasting for your finances.</p>
        </div>
        <div className="analytics-controls">
          <div className="selector-group">
            <label>Month</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="month-picker"
            />
          </div>
          <div className="selector-group">
            <label>Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="year-picker"
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      {pageError && (
        <div className="analytics-alert">
          {pageError}
        </div>
      )}

      <div className="summary-grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="summary-card income-card">
          <span>Income</span>
          <strong>Rs {analyticsSafe.totalIncome.toLocaleString()}</strong>
          <small>Month inflow</small>
        </div>
        <div className="summary-card expense-card">
          <span>Expense</span>
          <strong>Rs {analyticsSafe.totalExpense.toLocaleString()}</strong>
          <small>Month outflow</small>
        </div>
        <div className="summary-card savings-card">
          <span>Savings</span>
          <strong>Rs {analyticsSafe.netSavings.toLocaleString()}</strong>
          <small>Remaining cash</small>
        </div>
        <div className="summary-card rate-card">
          <span>Savings Rate</span>
          <strong>{analyticsSafe.savingsRate.toFixed(1)}%</strong>
          <small>Income saved</small>
        </div>
      </div>

      <div className="reports-grid">
        <div className="report-card" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <h3>Expense Trend</h3>
          <Line data={expenseTrendData} options={{ responsive: true, plugins: { legend: { position: "top" } } }} />
        </div>

        <div className="report-card" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <h3>Income Trend</h3>
          <Line data={incomeTrendData} options={{ responsive: true, plugins: { legend: { position: "top" } } }} />
        </div>
      </div>

      <div className="reports-grid">
        <div className="report-card" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <h3>Category Spending</h3>
          <Pie data={categoryChartData} options={{ responsive: true, plugins: { legend: { position: "bottom" } } }} />
        </div>

        <div className="report-card" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <h3>Income by Category</h3>
          <Bar
            data={incomeCategoryData}
            options={{ responsive: true, plugins: { legend: { display: false } } }}
          />
        </div>
      </div>

      <div className="report-grid-large">
        <div className="report-card" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <h3>Monthly Report</h3>
          <div className="metrics-grid">
            <div>
              <span>Total Income</span>
              <strong>Rs {analyticsSafe.totalIncome.toLocaleString()}</strong>
            </div>
            <div>
              <span>Total Expense</span>
              <strong>Rs {analyticsSafe.totalExpense.toLocaleString()}</strong>
            </div>
            <div>
              <span>Average Daily Expense</span>
              <strong>Rs {avgDailyExpense.toFixed(0).toLocaleString()}</strong>
            </div>
            <div>
              <span>Cash Flow</span>
              <strong>Rs {cashFlow.toLocaleString()}</strong>
            </div>
          </div>
        </div>

        <div className="report-card" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <h3>Yearly Report</h3>
          <div className="metrics-grid">
            <div>
              <span>Annual Income</span>
              <strong>Rs {yearStatsSafe.totalIncome.toLocaleString()}</strong>
            </div>
            <div>
              <span>Annual Expense</span>
              <strong>Rs {yearStatsSafe.totalExpense.toLocaleString()}</strong>
            </div>
            <div>
              <span>Annual Savings</span>
              <strong>Rs {yearStatsSafe.netSavings.toLocaleString()}</strong>
            </div>
            <div>
              <span>Avg Monthly Expense</span>
              <strong>Rs {yearStatsSafe.averageMonthlyExpense.toFixed(0).toLocaleString()}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="analytics-insights-grid">
        <div className={`insight-box ${budgetStatusClass}`} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <h3>Budget Utilization</h3>
          <strong>{budgetSummary ? `${budgetUtilization.toFixed(1)}%` : "—"}</strong>
          <p>{budgetSummary ? `${budgetSummary.totalSpent.toLocaleString()} spent of ${budgetSummary.totalLimit.toLocaleString()}` : "No active budgets"}</p>
          {budgetSummary ? (
            <>
              <div className="budget-status-row">
                <span>Status</span>
                <strong>{budgetStatusLabel}</strong>
              </div>
              <div className="budget-message">{budgetSummary.warningMessage}</div>
              <div className="budget-details-grid">
                <div>
                  <span>Remaining Budget</span>
                  <strong>Rs {budgetSummary.remainingBudget.toLocaleString()}</strong>
                </div>
                <div>
                  <span>Exceeded Amount</span>
                  <strong>Rs {budgetSummary.exceededAmount.toLocaleString()}</strong>
                </div>
              </div>
            </>
          ) : null}
        </div>

        <div className="insight-box" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <h3>Forecast</h3>
          {forecastError ? (
            <>
              <strong>Unavailable</strong>
              <p className="text-sm text-rose-600">{forecastError}</p>
            </>
          ) : typeof forecast === "number" ? (
            <>
              <strong>Rs {forecast.toLocaleString()}</strong>
              <p>Expected next-month spend</p>
            </>
          ) : forecast && typeof forecast === "object" && typeof forecast.averageForecast === "number" ? (
            <>
              <strong>Rs {forecast.averageForecast.toLocaleString()}</strong>
              <p>Expected next-month spend</p>
            </>
          ) : (
            <>
              <strong>Not enough data</strong>
              <p>Forecast will appear after more transactions.</p>
            </>
          )}
        </div>

        <div className="insight-box" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <h3>Insights</h3>
          {insightsError ? (
            <p className="text-sm text-rose-600">{insightsError}</p>
          ) : insights && insights.length > 0 ? (
            <ul className="insights-list">
              {insights.slice(0, 2).map((insight, idx) => (
                <li key={idx}>{insight.message}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">Not enough data for insights yet.</p>
          )}
        </div>

        <div className="insight-box" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <h3>Savings Rate</h3>
          <strong>{analyticsSafe.savingsRate.toFixed(1)}%</strong>
          <p>Portion of income retained</p>
        </div>
      </div>

      {comparisonData && (
        <div className="comparison-section" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <div className="comparison-header">
            <h3>Monthly Comparison</h3>
            <p>{comparison.month1.month} vs {comparison.month2.month}</p>
          </div>
          <Bar
            data={comparisonData}
            options={{ responsive: true, plugins: { legend: { position: "top" } } }}
          />
        </div>
      )}

      <div className="heatmap-section" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <div className="heatmap-header">
          <h3>Heatmap Calendar</h3>
          <p>Visualize high-activity spending days</p>
        </div>
        <div className="heatmap-grid">
          {Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className="heatmap-day-label">
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][index]}
            </div>
          ))}
          {heatmapCells.map((value, index) => {
            const intensity = value ? Math.min(value / analyticsSafe.totalExpense, 1) : 0;
            const background = value
              ? `rgba(59, 130, 246, ${0.15 + intensity * 0.6})`
              : "rgba(255,255,255,0.04)";
            const dayNumber = value !== null ? index - new Date(`${selectedMonth}-01`).getDay() + 1 : null;
            return (
              <div key={index} className="heatmap-cell" style={{ background }}>
                {dayNumber > 0 && dayNumber <= new Date(`${selectedMonth}-01`).setMonth(new Date(`${selectedMonth}-01`).getMonth() + 1) ? dayNumber : ""}
              </div>
            );
          })}
        </div>
      </div>

      <div className="top-categories-section" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <h3>Top Spending Categories</h3>
        <div className="top-categories-list">
          {(analyticsSafe.categoryExpenses || []).slice(0, 5).map((item, idx) => (
            <div key={idx} className="category-row">
              <span>{item.category}</span>
              <strong>Rs {item.amount.toLocaleString()}</strong>
              <span>{item.percentage?.toFixed(1) ?? 0}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;

