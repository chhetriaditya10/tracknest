import React, { useMemo, useState } from "react";
import { ClipLoader } from "react-spinners";
import "../styles/Modal.css";

const defaultPaymentModes = ["Cash", "Card", "Bank Transfer", "UPI", "Other"];

const TransactionModal = ({
  isOpen,
  onClose,
  onSave,
  title,
  categories,
  defaultCategory,
}) => {
  const [category, setCategory] = useState(defaultCategory || categories[0] || "Other");
  const [customCategory, setCustomCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [paymentMode, setPaymentMode] = useState(defaultPaymentModes[0]);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const categoryOptions = useMemo(
    () => [...new Set(categories.concat(["Other"]))],
    [categories]
  );

  const selectedCategory = category === "Other" && customCategory ? customCategory : category;

  const resetForm = () => {
    setCategory(defaultCategory || categories[0] || "Other");
    setCustomCategory("");
    setSubCategory("");
    setPaymentMode(defaultPaymentModes[0]);
    setAmount("");
    setDate(new Date().toISOString().slice(0, 10));
    setDescription("");
  };

  const handleSubmit = async () => {
    if (!amount || !date || !selectedCategory) {
      return;
    }

    setSaving(true);
    try {
      await onSave({
        category: selectedCategory,
        subCategory,
        paymentMode,
        amount: Number(amount),
        date,
        description,
      });
      resetForm();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modalBackground">
      <div className="modalWrapper">
        <div className="topSection">
          <h3>{title}</h3>
          <button className="closeBtn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="inputs">
          <div className="inputGroup">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {category === "Other" && (
            <div className="inputGroup">
              <label htmlFor="customCategory">Custom category</label>
              <input
                id="customCategory"
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="e.g. Taxi, Medical, Gift"
              />
            </div>
          )}

          <div className="inputGroup">
            <label htmlFor="subCategory">Sub-category</label>
            <input
              id="subCategory"
              type="text"
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
              placeholder="e.g. Groceries, Netflix, Transport"
            />
          </div>

          <div className="inputGroup">
            <label htmlFor="paymentMode">Payment mode</label>
            <select
              id="paymentMode"
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
            >
              {defaultPaymentModes.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>
          </div>

          <div className="inputGroup">
            <label htmlFor="amount">Amount</label>
            <input
              id="amount"
              type="number"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="inputGroup">
            <label htmlFor="date">Date</label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="inputGroup">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional note about this transaction"
            />
          </div>

          <button
            className="saveBtn"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? <ClipLoader color="#ffffff" size={20} /> : "Save Transaction"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;
