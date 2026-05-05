import { useState } from "react";
import "../styles/ForgotPassModal.css";
import CloseBTN from "../assets/close-btn.png";
import { toast } from "react-toastify";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const ForgotPassModal = ({ onClose }) => {
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const userEmail = localStorage.getItem("resetEmail");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChangePassword = async () => {
    if (newPass !== confirmPass) {
      return setError("Passwords do not match");
    }

    if (newPass.length < 6) {
      return setError("Password must be at least 6 characters");
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, newPassword: newPass }),
      });

      const data = await res.json();
      if (!res.ok) {
        return setError(data.message || "Failed to reset password");
      }

      localStorage.removeItem("resetEmail");
      toast.success("Password updated successfully");
      onClose();
    } catch (err) {
      toast.error("Error updating password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgotPassModalWrapper">
      <div className="forgotPassModalContent">
        <p className="modalTop">CHANGE PASSWORD</p>
        <img
          src={CloseBTN}
          alt="Close Button"
          className="closeButton"
          onClick={onClose}
        />

        <div className="passInputs">
          <div className="inputWithToggle">
            <input
              type={showNewPassword ? "text" : "password"}
              placeholder="New Password"
              className="newPass"
              value={newPass}
              onChange={(e) => {
                setNewPass(e.target.value);
                setError("");
              }}
            />
            <span
              onClick={() => setShowNewPassword(!showNewPassword)}
              style={{
                position: "absolute",
                right: 12,
                top: "46%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: "#aaa",
                fontSize: "0.75rem",
                userSelect: "none",
              }}
            >
              {showNewPassword ? "Hide" : "Show"}
            </span>
          </div>

          <div className="inputWithToggle">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              className="confirmPass"
              value={confirmPass}
              onChange={(e) => {
                setConfirmPass(e.target.value);
                setError("");
              }}
            />
            <span
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                position: "absolute",
                right: 12,
                top: "46%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: "#aaa",
                fontSize: "0.75rem",
                userSelect: "none",
              }}
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </span>
          </div>
        </div>

        {error && <p className="errorText">{error}</p>}

        <button
          className="changePassBTN"
          onClick={handleChangePassword}
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : "CHANGE PASSWORD"}
        </button>
      </div>
    </div>
  );
};
