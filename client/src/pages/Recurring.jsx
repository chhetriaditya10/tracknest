import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/ContextProvider";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const Recurring = () => {
  const { token } = useAuth();
  const [recurringItems, setRecurringItems] = useState([]);
  const [upcomingActivity, setUpcomingActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formState, setFormState] = useState({
    type: "expense",
    category: "Bills",
    description: "",
    amount: "",
    startDate: new Date().toISOString().slice(0, 10),
    frequency: "monthly",
  });

  const categories = ["Bills", "Grocery", "Transport", "Foods", "Entertainment", "Salary", "Freelance", "Others"];
  const frequencies = ["daily", "weekly", "biweekly", "monthly", "quarterly", "yearly"];

  const getAuthHeaders = () => {
    const authToken = token || localStorage.getItem("token");
    return authToken ? { Authorization: `Bearer ${authToken}` } : {};
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      const [recurringRes, upcomingRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/recurring/getRecurring`, { headers }),
        axios.get(`${BASE_URL}/api/recurring/upcoming`, { headers }),
      ]);

      setRecurringItems(recurringRes.data?.recurring || []);
      setUpcomingActivity(upcomingRes.data?.upcoming || []);
    } catch (err) {
      console.error("Recurring page load error", err);
      toast.error("Unable to load recurring transactions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (field) => (event) => {
    setFormState((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { type, category, amount, description, startDate, frequency } = formState;

    if (!amount || !startDate || !frequency) {
      toast.error("Please complete all recurring transaction fields.");
      return;
    }

    setSaving(true);
    try {
      const headers = getAuthHeaders();
      await axios.post(
        `${BASE_URL}/api/recurring/createRecurring`,
        {
          type,
          category,
          description,
          amount: Number(amount),
          startDate,
          frequency,
        },
        { headers }
      );
      toast.success("Recurring transaction created.");
      setFormState((prev) => ({ ...prev, description: "", amount: "" }));
      await loadData();
    } catch (err) {
      console.error("Create recurring error", err);
      toast.error(err?.response?.data?.message || "Failed to create recurring transaction.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 20px" }}>
      <div style={{ marginBottom: 24 }}>
        <p style={{ color: "#8b5cf6", fontWeight: 700, marginBottom: 8 }}>Recurring billing</p>
        <h1 style={{ margin: 0, fontSize: "2rem", lineHeight: 1.1 }}>Manage recurring bills & subscriptions</h1>
        <p style={{ marginTop: 12, color: "#64748b", maxWidth: 680 }}>
          Create a scheduled expense or income, view active recurring items, and preview upcoming due dates in one place.
        </p>
      </div>

      <div style={{ display: "grid", gap: 20, gridTemplateColumns: "1fr 1fr" }}>
        <section style={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 20, padding: 24, color: "#ffffff" }}>
          <h2 style={{ margin: 0, fontSize: "1.25rem", marginBottom: 14 }}>Upcoming activity</h2>
          {loading ? (
            <div style={{ padding: 40, textAlign: "center" }}><ClipLoader color="#8b5cf6" /></div>
          ) : upcomingActivity.length > 0 ? (
            <div style={{ display: "grid", gap: 12 }}>
              {upcomingActivity.map((item) => (
                <div key={`${item._id || item.date}-${item.description}-${item.amount}`} style={{ background: "#1e293b", borderRadius: 16, padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 600 }}>{item.description || item.category || "Recurring item"}</span>
                    <span style={{ color: item.type === "income" ? "#4ade80" : "#f87171" }}>
                      {item.type === "income" ? "+" : "-"} Rs {Number(item.amount || 0).toLocaleString()}
                    </span>
                  </div>
                  <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", color: "#94a3b8" }}>
                    <span>Due: {new Date(item.nextDueDate || item.startDate || item.date).toLocaleDateString()}</span>
                    <span>{item.frequency ? item.frequency.replace(/\b\w/g, (c) => c.toUpperCase()) : "One-time"}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: "#cbd5e1", padding: 24, borderRadius: 16, background: "#111827" }}>
              <p style={{ margin: 0 }}>No upcoming recurring activity yet.</p>
              <p style={{ margin: "8px 0 0" }}>Create a recurring transaction to populate the schedule.</p>
            </div>
          )}
        </section>

        <section style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 20, padding: 24 }}>
          <h2 style={{ margin: 0, fontSize: "1.25rem", marginBottom: 14 }}>Create recurring transaction</h2>
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
            <div style={{ display: "grid", gap: 10 }}>
              <label style={{ fontWeight: 600 }}>Type</label>
              <select value={formState.type} onChange={handleChange("type")} style={{ padding: "12px 14px", borderRadius: 12, border: "1px solid #cbd5e1" }}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              <label style={{ fontWeight: 600 }}>Category</label>
              <select value={formState.category} onChange={handleChange("category")} style={{ padding: "12px 14px", borderRadius: 12, border: "1px solid #cbd5e1" }}>
                {categories.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              <label style={{ fontWeight: 600 }}>Description</label>
              <input
                type="text"
                value={formState.description}
                onChange={handleChange("description")}
                placeholder="e.g. Rent, Spotify subscription"
                style={{ padding: "12px 14px", borderRadius: 12, border: "1px solid #cbd5e0" }}
              />
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              <label style={{ fontWeight: 600 }}>Amount</label>
              <input
                type="number"
                value={formState.amount}
                onChange={handleChange("amount")}
                placeholder="0.00"
                style={{ padding: "12px 14px", borderRadius: 12, border: "1px solid #cbd5e0" }}
              />
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              <label style={{ fontWeight: 600 }}>Start date</label>
              <input
                type="date"
                value={formState.startDate}
                onChange={handleChange("startDate")}
                style={{ padding: "12px 14px", borderRadius: 12, border: "1px solid #cbd5e0" }}
              />
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              <label style={{ fontWeight: 600 }}>Frequency</label>
              <select value={formState.frequency} onChange={handleChange("frequency")} style={{ padding: "12px 14px", borderRadius: 12, border: "1px solid #cbd5e0" }}>
                {frequencies.map((frequency) => (
                  <option key={frequency} value={frequency}>
                    {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" disabled={saving} style={{ border: "none", borderRadius: 14, padding: "14px 18px", background: "#8b5cf6", color: "#fff", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer" }}>
              {saving ? <ClipLoader size={18} color="#ffffff" /> : "Create recurring transaction"}
            </button>
          </form>
        </section>
      </div>

      <section style={{ marginTop: 24, borderRadius: 20, background: "#ffffff", border: "1px solid #e2e8f0", padding: 24 }}>
        <h2 style={{ margin: 0, fontSize: "1.25rem", marginBottom: 14 }}>Active recurring transactions</h2>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center" }}><ClipLoader color="#8b5cf6" /></div>
        ) : recurringItems.length > 0 ? (
          <div style={{ display: "grid", gap: 14 }}>
            {recurringItems.map((item) => (
              <div key={item._id} style={{ borderRadius: 18, border: "1px solid #e2e8f0", padding: 18, background: "#f8fafc" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700 }}>{item.description || item.category || "Recurring transaction"}</p>
                    <p style={{ margin: "4px 0 0", color: "#64748b" }}>
                      {item.type === "income" ? "Income" : "Expense"} • {item.frequency?.charAt(0).toUpperCase() + item.frequency?.slice(1)}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ margin: 0, fontWeight: 700 }}>
                      {item.type === "income" ? "+" : "-"} Rs {Number(item.amount || 0).toLocaleString()}
                    </p>
                    <p style={{ margin: "4px 0 0", color: "#475569" }}>Next due {new Date(item.nextDueDate || item.startDate || item.date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: 24, borderRadius: 16, background: "#f8fafc", color: "#475569" }}>
            <p style={{ margin: 0 }}>No active recurring transactions found.</p>
            <p style={{ margin: "8px 0 0" }}>Fill out the form above to start recurring tracking.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Recurring;
