import React, { useState } from "react";
import "../styles/ChangeEmailModal.css";
import CloseBTN from "../assets/close-btn.png";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import ClipLoader from "react-spinners/ClipLoader";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const ChangeEmailModal = ({ onClose, user, token, onEmailChanged }) => {
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpdateEmail = async () => {
    setError("");

    if (!newEmail) {
      setError("Please enter a new email address");
      return;
    }
    if (!newEmail.includes("@")) {
      setError("Invalid email format");
      return;
    }
    if (newEmail === user.email) {
      setError("New email must be different from current");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/change-email/direct`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newEmail }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Email updated successfully");
        if (onEmailChanged) onEmailChanged(newEmail);

        // Update local storage
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        storedUser.email = newEmail;
        localStorage.setItem("user", JSON.stringify(storedUser));

        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 1000);
      } else {
        setError(data.message || "Failed to update email");
      }
    } catch (err) {
      setError("Server error. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="changeEmailModalWrapper" onClick={onClose}>
      <motion.div
        className="changeEmailModalContent"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <h3 className="modal-top">Change Email</h3>

        <button className="closeButton" onClick={onClose}>
          <img
            src={CloseBTN}
            alt="Close"
            style={{ width: "100%", height: "100%" }}
          />
        </button>

        <div className="email-inputs">
          <div className="input-group">
            <input
              type="email"
              placeholder="New Email Address"
              value={newEmail}
              onChange={(e) => {
                setNewEmail(e.target.value);
                setError("");
              }}
              autoFocus
            />
          </div>
        </div>

        {error && <p className="errorMsg">{error}</p>}

        <button
          className="changeEmailBtn"
          onClick={handleUpdateEmail}
          disabled={loading}
        >
          {loading ? <ClipLoader size={20} color="#fff" /> : "Update Email"}
        </button>
      </motion.div>
    </div>
  );
};
