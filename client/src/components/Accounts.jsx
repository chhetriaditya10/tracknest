import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import "../styles/Accounts.css";

const BASE_URL = import.meta.env?.VITE_API_BASE_URL || "http://localhost:5000";

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    accountName: "",
    accountType: "wallet",
    currency: "USD",
    balance: 0,
    icon: "💰",
    color: "#3b82f6",
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/api/account/getAccounts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAccounts(response.data.accounts);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      toast.error("Failed to load accounts");
      setLoading(false);
    }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${BASE_URL}/api/account/createAccount`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAccounts([...accounts, response.data.account]);
      setShowModal(false);
      setFormData({
        accountName: "",
        accountType: "wallet",
        currency: "USD",
        balance: 0,
        icon: "💰",
        color: "#3b82f6",
      });
      toast.success("Account created successfully!");
    } catch (error) {
      console.error("Error creating account:", error);
      toast.error("Failed to create account");
    }
  };

  const handleSetDefault = async (accountId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${BASE_URL}/api/account/setDefaultAccount/${accountId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAccounts();
      toast.success("Default account updated!");
    } catch (error) {
      console.error("Error setting default:", error);
      toast.error("Failed to update default account");
    }
  };

  if (loading) {
    return <div className="loading">Loading accounts...</div>;
  }

  return (
    <div className="accounts-container">
      <div className="accounts-header">
        <h2>My Accounts</h2>
        <button className="btn-add" onClick={() => setShowModal(true)}>
          + Add Account
        </button>
      </div>

      <div className="accounts-grid">
        {accounts.map((account) => (
          <motion.div
            key={account._id}
            className="account-card"
            whileHover={{ scale: 1.02 }}
          >
            <div className="account-icon">{account.icon}</div>
            <h3>{account.accountName}</h3>
            <p className="account-type">{account.accountType}</p>
            <div className="account-balance">
              <span className="currency">{account.currency}</span>
              <span className="amount">${account.balance.toLocaleString()}</span>
            </div>
            {account.isDefault && <span className="badge-default">Default</span>}
            <button
              className="btn-default"
              onClick={() => handleSetDefault(account._id)}
            >
              {account.isDefault ? "✓ Default" : "Set Default"}
            </button>
          </motion.div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <motion.div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <h3>Create New Account</h3>
            <form onSubmit={handleCreateAccount}>
              <input
                type="text"
                placeholder="Account Name"
                required
                value={formData.accountName}
                onChange={(e) =>
                  setFormData({ ...formData, accountName: e.target.value })
                }
              />
              <select
                value={formData.accountType}
                onChange={(e) =>
                  setFormData({ ...formData, accountType: e.target.value })
                }
              >
                <option value="wallet">Wallet</option>
                <option value="bank">Bank Account</option>
                <option value="credit_card">Credit Card</option>
              </select>
              <input
                type="number"
                placeholder="Initial Balance"
                value={formData.balance}
                onChange={(e) =>
                  setFormData({ ...formData, balance: Number(e.target.value) })
                }
              />
              <button type="submit" className="btn-submit">
                Create Account
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Accounts;
