import React, { useState } from "react";
import "../styles/ChangePassModal.css";
import CloseBTN from "../assets/close-btn.png";
import axios from "axios";
import { toast } from "react-toastify";
import ClipLoader from "react-spinners/ClipLoader";
import { motion } from "framer-motion";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const ChangePassModal = ({ onClose }) => {
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const showTemporaryError = (message) => {
    setError(message);
    setTimeout(() => setError(""), 3000);
  };

  const handleSubmit = async () => {
    setError("");

    if (!currentPass || !newPass || !confirmPass)
      return showTemporaryError("Please fill all fields");

    if (newPass !== confirmPass)
      return showTemporaryError("Passwords don't match");

    if (newPass.length < 8) return showTemporaryError("Min 8 characters");

    if (newPass === currentPass)
      return showTemporaryError("New password must differ from current");

    setLoading(true);

    const token = localStorage.getItem("token");
    try {
      const res = await axios.put(
        `${BASE_URL}/api/auth/change-password`,
        {
          currentPassword: currentPass,
          newPassword: newPass,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(res.data.message || "Password updated!");

      // Small delay before closing to show success state if button changed (optional, keeping simple here)
      setTimeout(() => {
        setLoading(false);
        onClose();
      }, 1000);
    } catch (err) {
      setLoading(false);
      showTemporaryError(err.response?.data?.message || "Error occurred");
    }
  };

  return (
    <div className="changePassModalWrapper" onClick={onClose}>
      <motion.div
        className="changePassModalContent"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <h3 className="modal-top">Change Password</h3>

        <button className="closeButton" onClick={onClose}>
          <img
            src={CloseBTN}
            alt="Close"
            style={{ width: "100%", height: "100%" }}
          />
        </button>

        <div className="pass-inputs">
          <div className="inputWithToggle">
            <input
              type={showCurrent ? "text" : "password"}
              placeholder="Current Password"
              value={currentPass}
              onChange={(e) => {
                setCurrentPass(e.target.value);
                setError("");
              }}
            />
            <button
              type="button"
              className="toggleText"
              onClick={() => setShowCurrent((prev) => !prev)}
            >
              {showCurrent ? "Hide" : "Show"}
            </button>
          </div>

          <div className="inputWithToggle">
            <input
              type={showNew ? "text" : "password"}
              placeholder="New Password"
              value={newPass}
              onChange={(e) => {
                setNewPass(e.target.value);
                setError("");
              }}
            />
            <button
              type="button"
              className="toggleText"
              onClick={() => setShowNew((prev) => !prev)}
            >
              {showNew ? "Hide" : "Show"}
            </button>
          </div>

          <div className="inputWithToggle">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPass}
              onChange={(e) => {
                setConfirmPass(e.target.value);
                setError("");
              }}
            />
            <button
              type="button"
              className="toggleText"
              onClick={() => setShowConfirm((prev) => !prev)}
            >
              {showConfirm ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {error && <p className="errorMsg">{error}</p>}

        <button
          className="changePassBtn"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? <ClipLoader color="#fff" size={20} /> : "Update Password"}
        </button>
      </motion.div>
    </div>
  );
};
