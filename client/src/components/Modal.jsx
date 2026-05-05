import React, { useState } from "react";
import "../styles/Modal.css";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";

const Modal = ({ title, onClose, onSubmit, categories, currentBalance }) => {
  const [category, setCategory] = useState(categories[0]?.toLowerCase() || "");
  const [customCategory, setCustomCategory] = useState(""); // State for "Others" input
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!amount || !date) {
      toast.error("Please fill out all fields");
      return;
    }

    // If category is 'others', validate the custom input
    if (category === "others" && !customCategory.trim()) {
      toast.error("Please specify the category");
      return;
    }

    if (
      (title === "New Expense" || title.toLowerCase().includes("expense")) &&
      parseFloat(amount) > currentBalance
    ) {
      toast.error("Not enough balance");
      return;
    }

    try {
      setLoading(true);

      // Use custom category name if 'others' is selected
      const finalCategory =
        category === "others" ? customCategory.trim() : category;

      await onSubmit({
        category: finalCategory,
        amount: parseFloat(amount),
        date,
      });
      {
        title === "Add Income"
          ? toast.success("Income added successfully")
          : toast.success("Expense added successfully");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while saving.");
    } finally {
      setLoading(false);
    }
  };

  return (
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
            {categories.map((cat) => (
              <option key={cat} value={cat.toLowerCase()}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Specification Input - Only shows when 'others' is selected */}
        {category === "others" && (
          <div className="inputGroup" style={{ animation: "fadeIn 0.3s" }}>
            <label htmlFor="customCategory">Specify Details</label>
            <input
              type="text"
              id="customCategory"
              placeholder="e.g. Gift, Repair, Taxi..."
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              autoFocus
            />
          </div>
        )}

        <div className="inputGroup">
          <label htmlFor="total">Amount</label>
          <input
            type="number"
            id="total"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div className="inputGroup">
          <label htmlFor="inputDate">Date</label>
          <input
            type="date"
            id="inputDate"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <button
          className="saveBtn"
          onClick={handleSave}
          disabled={loading} // Disable button while loading
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "10px",
          }}
        >
          {loading ? (
            <ClipLoader color="#ffffff" size={20} />
          ) : (
            "Save Transaction"
          )}
        </button>
      </div>
    </div>
  );
};

export default Modal;
