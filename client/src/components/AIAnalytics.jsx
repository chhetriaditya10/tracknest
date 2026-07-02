import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/ContextProvider";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import "../styles/AIAnalytics.css";

const BASE_URL = import.meta.env?.VITE_API_BASE_URL || "http://localhost:5000";

const AIAnalytics = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [anomalies, setAnomalies] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [aiInsights, setAiInsights] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("anomalies");
  const [days, setDays] = useState(30);
  const [threshold, setThreshold] = useState(2.0);

  useEffect(() => {
    if (!user) return;
    const hasPremiumAccess =
      user.role === "admin" ||
      user.plan === "premium" ||
      user.plan === "ultra" ||
      ["active", "trialing"].includes(user.subscriptionStatus);
    if (!hasPremiumAccess) {
      setLoading(false);
      return;
    }
    fetchAnalytics();
  }, [days, threshold, user, token]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const authToken = token || localStorage.getItem("token");
      if (!authToken) {
        throw new Error("No auth token available");
      }

      const headers = { Authorization: `Bearer ${authToken}` };

      const anomalyRes = await fetch(
        `${BASE_URL}/api/analytics/anomalies?days=${days}&threshold=${threshold}`,
        { headers }
      );
      const anomalyData = await anomalyRes.json();
      setAnomalies(anomalyData.data || anomalyData);
      setStatistics(anomalyData.data?.statistics || anomalyData.statistics || null);

      const forecastRes = await fetch(
        `${BASE_URL}/api/analytics/forecast?days=${days}`,
        { headers }
      );
      const forecastData = await forecastRes.json();
      setForecast(
        forecastData.data?.forecast ||
        forecastData.forecast ||
        forecastData.data ||
        null
      );

      const insightsRes = await fetch(
        `${BASE_URL}/api/analytics/ai-insights?days=${days}&threshold=${threshold}`,
        { headers }
      );
      const insightsData = await insightsRes.json();
      setAiInsights(
        insightsData.data?.insights ||
        insightsData.insights ||
        []
      );
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="ai-analytics loading">Preparing analytics for your account...</div>;
  }

  const hasPremiumAccess =
    user.role === "admin" ||
    user.plan === "premium" ||
    user.plan === "ultra" ||
    ["active", "trialing"].includes(user.subscriptionStatus);

  if (!hasPremiumAccess) {
    return (
      <div className="ai-analytics no-access">
        <div className="ai-header">
          <h1>AI Analytics</h1>
          <p>Upgrade to premium to unlock advanced spending insights and forecasting.</p>
        </div>
        <div className="upgrade-callout">
          <p>Premium subscription is required to access anomaly detection and AI forecasting.</p>
          <button className="btn-primary" type="button" onClick={() => navigate("/pricing")}>Upgrade Now</button>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="ai-analytics loading">Loading AI Analytics...</div>;
  }

  return (
    <div className="ai-analytics">
      <div className="ai-header">
        <h1>🤖 AI-Powered Expense Analytics</h1>
        <p>Statistical anomaly detection & predictive forecasting</p>
      </div>

      {/* Days Filter */}
      <div className="filter-section">
        <label>Analyze Last:</label>
        <select value={days} onChange={(e) => setDays(e.target.value)}>
          <option value="7">7 Days</option>
          <option value="30">30 Days</option>
          <option value="90">90 Days</option>
          <option value="180">6 Months</option>
        </select>
      </div>

      {/* Sensitivity Control */}
      <div className="filter-section anomaly-sensitivity">
        <label>Anomaly Sensitivity: <strong>{threshold.toFixed(1)}</strong></label>
        <input
          type="range"
          min="1.0"
          max="3.5"
          step="0.1"
          value={threshold}
          onChange={(e) => setThreshold(parseFloat(e.target.value))}
        />
        <div className="sensitivity-labels">
          <span>More Sensitive</span>
          <span>Less Sensitive</span>
        </div>
      </div>

      {/* Key Insights */}
      <div className="insights-grid">
        {aiInsights.map((insight, idx) => (
          <div key={idx} className={`insight-card ${insight.severity}`}>
            <div className="insight-icon">
              {insight.type === "anomaly" && "⚠️"}
              {insight.type === "forecast" && "📊"}
              {insight.type === "volatility" && "📈"}
              {insight.type === "statistics" && "📉"}
            </div>
            <div className="insight-content">
              <h3>{insight.message}</h3>
              {insight.value && <p className="insight-value">${insight.value.toFixed(2)}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Statistics Box */}
      {statistics && (
        <div className="statistics-box">
          <h2>📊 Spending Statistics</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <label>Average</label>
              <span>${statistics.mean.toFixed(2)}</span>
            </div>
            <div className="stat-item">
              <label>Median</label>
              <span>${statistics.median.toFixed(2)}</span>
            </div>
            <div className="stat-item">
              <label>Std Dev</label>
              <span>${statistics.stdDev.toFixed(2)}</span>
            </div>
            <div className="stat-item">
              <label>Min</label>
              <span>${statistics.min.toFixed(2)}</span>
            </div>
            <div className="stat-item">
              <label>Max</label>
              <span>${statistics.max.toFixed(2)}</span>
            </div>
            <div className="stat-item">
              <label>Total</label>
              <span>${statistics.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === "anomalies" ? "active" : ""}`}
          onClick={() => setActiveTab("anomalies")}
        >
          ⚠️ Anomalies ({anomalies?.anomalyCount || 0})
        </button>
        <button
          className={`tab ${activeTab === "forecast" ? "active" : ""}`}
          onClick={() => setActiveTab("forecast")}
        >
          📈 Forecast
        </button>
      </div>

      {/* Anomalies Tab */}
      {activeTab === "anomalies" && (
        <div className="tab-content">
          <h2>Unusual Spending Detected</h2>
          {anomalies?.anomalies && anomalies.anomalies.length > 0 ? (
            <div className="anomalies-list">
              {anomalies.anomalies.map((anomaly, idx) => (
                <div key={idx} className="anomaly-card">
                  <div className="anomaly-header">
                    <span className="amount">${anomaly.amount.toFixed(2)}</span>
                    <span className="category">{anomaly.category}</span>
                  </div>
                  <div className="anomaly-details">
                    <p>
                      <strong>Z-Score:</strong> {anomaly.zScore}
                    </p>
                    <p>
                      <strong>Reason:</strong> {anomaly.anomalyReason}
                    </p>
                    <p>
                      <strong>Confidence:</strong> {anomaly.confidence}%
                    </p>
                  </div>
                  <p className="date">{new Date(anomaly.date).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No anomalies detected in this period</p>
          )}
        </div>
      )}

      {/* Forecast Tab */}
      {activeTab === "forecast" && (
        <div className="tab-content">
          <h2>Expense Forecast</h2>
          {forecast ? (
            <div className="forecast-box">
              <div className="forecast-methods">
                <div className="forecast-item">
                  <h3>Weighted Moving Average</h3>
                  <p className="value">${forecast.wmaForecast.toFixed(2)}</p>
                </div>
                <div className="forecast-item">
                  <h3>Exponential Smoothing</h3>
                  <p className="value">${forecast.expSmoothing.toFixed(2)}</p>
                </div>
                <div className="forecast-item">
                  <h3>Linear Regression</h3>
                  <p className="value">${forecast.linearRegression.prediction.toFixed(2)}</p>
                  <p className="r2">R² = {forecast.linearRegression.r2.toFixed(3)}</p>
                </div>
              </div>

              <div className="ensemble-forecast">
                <h3>🎯 Ensemble Forecast (Combined)</h3>
                <div className="forecast-highlight">
                  <span className="predicted-amount">${forecast.averageForecast.toFixed(2)}</span>
                  <span className="confidence">
                    Confidence: <strong>{forecast.confidence.toFixed(1)}%</strong>
                  </span>
                </div>
                <p className="forecast-description">
                  Based on historical data and weighted algorithms, your next month's expenses are
                  predicted to be approximately <strong>${forecast.averageForecast.toFixed(2)}</strong>
                </p>
              </div>
            </div>
          ) : (
            <p className="no-data">Insufficient data for forecast</p>
          )}
        </div>
      )}

      {/* Algorithm Explanation */}
      <div className="algorithm-info">
        <h3>📚 How It Works</h3>
        <div className="algo-details">
          <div className="algo-item">
            <h4>Anomaly Detection (Z-Score)</h4>
            <p>
              Identifies unusual expenses by measuring how many standard deviations each transaction
              is from the average. Transactions with Z-score &gt; 2.5 are flagged as anomalies.
            </p>
            <code>Z-Score = (Transaction - Mean) / Standard Deviation</code>
          </div>
          <div className="algo-item">
            <h4>Time Series Forecasting</h4>
            <p>
              Predicts future spending using three methods: Weighted Moving Average (recent expenses
              weighted higher), Exponential Smoothing (adaptive learning), and Linear Regression (trend
              analysis). The final prediction is the ensemble average.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAnalytics;
