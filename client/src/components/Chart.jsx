import React, { useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/DatePicker.css";
import "../styles/Chart.css";

const Chart = ({ expenses, balances }) => {
  const [viewMode, setViewMode] = useState("past"); // "past", "future", "custom"
  const [timeRange, setTimeRange] = useState("daily"); // "daily", "weekly", "monthly"
  const [customStart, setCustomStart] = useState(new Date());
  const [customEnd, setCustomEnd] = useState(new Date());

  // Format a single date into { key: 'YYYY-MM-DD', label: 'Jul 22' }
  const formatDay = (date) => ({
    key: date.toISOString().split("T")[0],
    label: date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  });

  const getDaysWithKeys = (mode) => {
    const days = [];

    if (mode === "past") {
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(formatDay(d));
      }
    } else if (mode === "future") {
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        days.push(formatDay(d));
      }
    } else if (mode === "custom") {
      let d = new Date(customStart);
      while (d <= customEnd) {
        days.push(formatDay(new Date(d)));
        d.setDate(d.getDate() + 1);
      }
    }

    return days;
  };

  const generateChartData = (expenses, balances, mode) => {
    const days = getDaysWithKeys(mode);
    const incomeData = Array(days.length).fill(0);
    const expenseData = Array(days.length).fill(0);

    days.forEach((day, idx) => {
      const income = balances
        .filter((i) => i.createdAt?.startsWith(day.key))
        .reduce((sum, i) => sum + i.amount, 0);

      const expense = expenses
        .filter((e) => e.createdAt?.startsWith(day.key))
        .reduce((sum, e) => sum + e.amount, 0);

      incomeData[idx] = income;
      expenseData[idx] = expense;
    });

    return {
      labels: days.map((d) => d.label),
      incomeData,
      expenseData,
    };
  };

  const { labels, incomeData, expenseData } = generateChartData(
    expenses,
    balances,
    viewMode
  );

  return (
    <div className="chartWrapper">
      {/* Time Range Toggle */}
      <div className="time-range-toggle">
        {["daily", "weekly", "monthly"].map((range) => (
          <button
            key={range}
            className={`range-btn ${timeRange === range ? "active" : ""}`}
            onClick={() => setTimeRange(range)}
          >
            {range.charAt(0).toUpperCase() + range.slice(1)}
          </button>
        ))}
      </div>

      {/* View Mode Selector */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        <select
          id="viewMode"
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value)}
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            color: "white",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "6px",
            padding: "6px 10px",
            fontSize: "0.85rem",
            cursor: "pointer",
            outline: "none",
          }}
        >
          <option value="past">Last 7 Days</option>
          <option value="future">Next 7 Days</option>
          <option value="custom">Custom Range</option>
        </select>

        {/* Date Pickers - Only show if custom */}
        {viewMode === "custom" && (
          <div
            style={{
              display: "flex",
              gap: "8px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div style={{ width: "100px" }}>
              <DatePicker
                className="custom-datepicker"
                selected={customStart}
                onChange={(date) => setCustomStart(date)}
                selectsStart
                startDate={customStart}
                endDate={customEnd}
                dateFormat="MMM dd"
              />
            </div>
            <span style={{ color: "#aaa" }}>-</span>
            <div style={{ width: "100px" }}>
              <DatePicker
                className="custom-datepicker"
                selected={customEnd}
                onChange={(date) => setCustomEnd(date)}
                selectsEnd
                startDate={customStart}
                endDate={customEnd}
                minDate={customStart}
                maxDate={new Date(new Date().setFullYear(2099))}
                dateFormat="MMM dd"
              />
            </div>
          </div>
        )}
      </div>

      {/* Chart Container */}
      <div className="chart-canvas-container">
        <Bar
          data={{
            labels,
            datasets: [
              {
                label: "Income",
                data: incomeData,
                backgroundColor: "#a78bfa",
                borderRadius: 4,
              },
              {
                label: "Expenses",
                data: expenseData,
                backgroundColor: "#f472b6",
                borderRadius: 4,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            layout: {
              padding: {
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
              },
            },
            plugins: {
              legend: {
                labels: {
                  color: "#94a3b8",
                  font: { family: "Inter", size: 11 },
                  boxWidth: 12,
                },
                position: "top",
                align: "end",
              },
              tooltip: {
                backgroundColor: "#1e293b",
                titleColor: "#f8fafc",
                bodyColor: "#cbd5e1",
                borderColor: "rgba(255,255,255,0.1)",
                borderWidth: 1,
                padding: 10,
                cornerRadius: 8,
                displayColors: true,
              },
            },
            scales: {
              x: {
                grid: { display: false },
                ticks: {
                  color: "#94a3b8",
                  font: { size: 10 },
                  maxRotation: 0,
                  minRotation: 0,
                  autoSkip: true,
                  maxTicksLimit: 7,
                },
                border: { display: false },
              },
              y: {
                grid: { color: "rgba(255, 255, 255, 0.05)" },
                ticks: {
                  color: "#94a3b8",
                  font: { size: 10 },
                  padding: 0,
                  maxTicksLimit: 5,
                },
                border: { display: false },
                beginAtZero: true,
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default Chart;
