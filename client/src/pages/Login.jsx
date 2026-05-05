import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/ContextProvider";
import axios from "axios";
import { motion } from "framer-motion";
import TrackNest_Icon from "../assets/TrackNest Icon.png";
import "../styles/Login.css";
import { ClipLoader } from "react-spinners";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSlowLoadingMsg, setShowSlowLoadingMsg] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  useEffect(() => {
    let timer;
    if (loading) {
      timer = setTimeout(() => {
        setShowSlowLoadingMsg(true);
      }, 3000);
    } else {
      setShowSlowLoadingMsg(false);
    }
    return () => clearTimeout(timer);
  }, [loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/api/auth/login`, formData);
      if (res.data.success) {
        login(res.data.user);
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        navigate("/home");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Left Side - Visual */}
      <motion.div
        className="auth-visual"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="visual-content">
          <motion.img
            src={TrackNest_Icon}
            alt="Logo"
            className="visual-logo"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          />
          <h1 className="visual-heading">Welcome back to TrackNest.</h1>
          <p className="visual-text">
            Your personal finance command center. Log in to track expenses,
            analyze your habits, and grow your wealth.
          </p>
        </div>
      </motion.div>

      {/* Right Side - Form */}
      <div className="auth-form-container">
        <motion.div
          className="auth-card glass-panel"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
        >
          <div className="auth-header">
            <h2>Sign In</h2>
            <p>Enter your details to access your account</p>
          </div>

          {error && (
            <motion.div
              className="error-message"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email or Username</label>
              <input
                type="text"
                name="identifier"
                className="input-field"
                placeholder="name@example.com"
                value={formData.identifier}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                className="input-field"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <motion.button
              type="submit"
              className="btn-primary"
              style={{ width: "100%" }}
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? <ClipLoader color="#ffffff" size={18} /> : "Sign In"}
            </motion.button>

            {showSlowLoadingMsg && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  fontSize: "0.85rem",
                  color: "var(--text-muted)",
                  textAlign: "center",
                  marginTop: "12px",
                  fontStyle: "italic",
                }}
              >
                Server waking up, this may take a minute...
              </motion.p>
            )}
          </form>

          <div className="auth-footer">
            Don't have an account?
            <Link to="/register" className="auth-link">
              Create Account
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
