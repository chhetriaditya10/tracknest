import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Records.css"; // Reusing the shared styles
import ClipLoader from "react-spinners/ClipLoader";
import { motion } from "framer-motion";
import { exportToCSV, exportToPDF } from "../utils/exportUtils";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const IncomesRecord = () => {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth());

  useEffect(() => {
    const fetchIncomes = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${BASE_URL}/api/balance/getBalances`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIncomes(res.data.balances);
      } catch (error) {
        console.error("Error fetching incomes", error);
      } finally {
        setLoading(false);
      }
    };
    fetchIncomes();
  }, []);

  const filteredIncomes = incomes.filter((item) => {
    const itemDate = new Date(item.date);
    return itemDate.getMonth() === parseInt(filterMonth);
  });

  const totalAmount = filteredIncomes.reduce(
    (acc, curr) => acc + curr.amount,
    0
  );

  if (loading)
    return (
      <div className="flex-center" style={{ height: "80vh" }}>
        <ClipLoader color="#8b5cf6" />
      </div>
    );

  return (
    <motion.div
      className="records-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <header className="records-header">
        <h2 className="records-title">Income Records</h2>
        <div className="export-buttons">
          <button 
            className="export-btn csv" 
            onClick={() => exportToCSV(incomes, "incomes", "income")}
          >
            📥 Export CSV
          </button>
          <button 
            className="export-btn pdf" 
            onClick={() => exportToPDF(incomes, "incomes", "income")}
          >
            📄 Export Report
          </button>
        </div>
      </header>

      <div className="filters-bar">
        <div className="filter-group">
          <label className="filter-label">Month:</label>
          <select
            className="filter-select"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
          >
            <option value="0">January</option>
            <option value="1">February</option>
            <option value="2">March</option>
            <option value="3">April</option>
            <option value="4">May</option>
            <option value="5">June</option>
            <option value="6">July</option>
            <option value="7">August</option>
            <option value="8">September</option>
            <option value="9">October</option>
            <option value="10">November</option>
            <option value="11">December</option>
          </select>
        </div>
        <div
          className="total-badge"
          style={{
            borderColor: "rgba(16, 185, 129, 0.3)",
            color: "var(--success)",
          }}
        >
          Total: Rs {totalAmount.toLocaleString()}
        </div>
      </div>

      <motion.div
        className="table-container glass-panel"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <table className="data-table">
          <thead>
            <tr>
              <th>Source</th>
              <th>Date</th>
              <th style={{ textAlign: "right" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {filteredIncomes.length > 0 ? (
              filteredIncomes.map((item) => (
                <tr key={item._id}>
                  <td>
                    <span className="category-tag tag-green">
                      {item.category}
                    </span>
                  </td>
                  <td>{new Date(item.date).toLocaleDateString()}</td>
                  <td
                    style={{
                      textAlign: "right",
                      fontWeight: "bold",
                      color: "var(--success)",
                    }}
                  >
                    + Rs {item.amount.toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="no-data">
                  No records found for this month.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </motion.div>
    </motion.div>
  );
};

export default IncomesRecord;
