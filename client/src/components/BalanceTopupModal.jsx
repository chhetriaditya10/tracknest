import React, { useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";
import "../styles/Modal.css";

const getToday = () => new Date().toISOString().split("T")[0];

const BalanceTopupModal = ({ isOpen, onClose, onSubmit }) => {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(getToday());
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setAmount("");
    setNote("");
    setDate(getToday());
    setError("");
    setSubmitting(false);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!amount) {
      setError("Amount is required.");
      return;
    }

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Amount must be greater than 0.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      await onSubmit({
        amount: parsedAmount,
        note: note.trim(),
        date: date || getToday(),
      });
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modalBackground">
      <div className="modalWrapper">
        <div className="topSection">
          <h3>Add balance</h3>
          <button className="closeBtn" type="button" onClick={onClose}>
            ✕
          </button>
        </div>

        <form className="inputs" onSubmit={handleSubmit}>
          <div className="inputGroup">
            <label htmlFor="balance-amount">Amount</label>
            <input
              id="balance-amount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              autoFocus
            />
          </div>

          <div className="inputGroup">
            <label htmlFor="balance-note">Note / Source</label>
            <input
              id="balance-note"
              type="text"
              placeholder="e.g. Cash deposit, Freelance payment"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </div>

          <div className="inputGroup">
            <label htmlFor="balance-date">Date</label>
            <input
              id="balance-date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </div>

          {error ? <p className="modalError">{error}</p> : null}

          <button className="saveBtn" type="submit" disabled={submitting}>
            {submitting ? <ClipLoader color="#ffffff" size={20} /> : "Add balance"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BalanceTopupModal;
