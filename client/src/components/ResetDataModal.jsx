import React, { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";
import ClipLoader from "react-spinners/ClipLoader";
import "../styles/ResetDataModal.css";
import CloseBTN from "../assets/close-btn.png";

// Safe fallback for BASE_URL to prevent "import.meta" warning/errors in some environments
const BASE_URL = import.meta.env?.VITE_API_BASE_URL || "http://localhost:5000";

export const ResetDataModal = ({ onClose }) => {
  const [selectedType, setSelectedType] = useState("expenses"); // expenses, incomes, all
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    const confirmMsg =
      selectedType === "all"
        ? "Are you sure you want to DELETE EVERYTHING? This cannot be undone."
        : `Are you sure you want to delete all ${selectedType}?`;

    if (!window.confirm(confirmMsg)) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${BASE_URL}/api/auth/reset-data`,
        { type: selectedType },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success(res.data.message);
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || "Failed to reset data.";
      toast.error(errorMsg);
      setLoading(false);
    }
  };

  return (
    <div className="resetDataModalWrapper" onClick={onClose}>
      <motion.div
        className="resetDataModalContent"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
      >
        <button className="closeButton" onClick={onClose}>
          <img src={CloseBTN} alt="Close" />
        </button>

        <h3 className="resetTitle">⚠️ Reset Data</h3>
        <p className="resetSubtitle">
          Select the type of data you want to permanently delete.
        </p>

        <div className="resetOptions">
          <label
            className={`resetOptionLabel ${
              selectedType === "expenses" ? "selected" : ""
            }`}
          >
            <input
              type="radio"
              name="resetType"
              value="expenses"
              checked={selectedType === "expenses"}
              onChange={(e) => setSelectedType(e.target.value)}
              className="resetOptionInput"
            />
            Reset Expenses Only
          </label>

          <label
            className={`resetOptionLabel ${
              selectedType === "incomes" ? "selected" : ""
            }`}
          >
            <input
              type="radio"
              name="resetType"
              value="incomes"
              checked={selectedType === "incomes"}
              onChange={(e) => setSelectedType(e.target.value)}
              className="resetOptionInput"
            />
            Reset Incomes Only
          </label>

          <label
            className={`resetOptionLabel ${
              selectedType === "all" ? "selected" : ""
            }`}
          >
            <input
              type="radio"
              name="resetType"
              value="all"
              checked={selectedType === "all"}
              onChange={(e) => setSelectedType(e.target.value)}
              className="resetOptionInput"
            />
            🔥 Factory Reset (All Data)
          </label>
        </div>

        {selectedType === "all" && (
          <p className="warningText">
            Warning: This will wipe your entire transaction history. Your
            account details (email/password) will remain.
          </p>
        )}

        <button
          className="resetConfirmBtn"
          onClick={handleReset}
          disabled={loading}
        >
          {loading ? <ClipLoader color="#fff" size={20} /> : "Confirm Reset"}
        </button>
      </motion.div>
    </div>
  );
};
