import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";
import TrackNest_Icon from "../assets/TrackNest Icon.png";
import "../styles/Login.css"; // Import base auth styles
import "../styles/Register.css"; // Import specific register overrides

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/api/auth/register`, formData);

      if (res.data.success) {
        toast.success("Account created successfully! Please login.");
        navigate("/login");
      }
    } catch (err) {
      setError(err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Left Side - Visual */}
      <motion.div
        className="auth-visual register-visual"
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
          <h1 className="visual-heading">Join the TrackNest Community.</h1>
          <p className="visual-text">
            Start your journey towards financial freedom today. Create an
            account to access professional tracking tools.
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
            <h2>Create Account</h2>
            <p>Get started with your free account</p>
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
              <label>Username</label>
              <input
                type="text"
                name="username"
                className="input-field"
                placeholder="johndoe"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                className="input-field"
                placeholder="name@company.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                className="input-field"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
                required
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
              {loading ? (
                <ClipLoader color="#fff" size={20} />
              ) : (
                "Create Account"
              )}
            </motion.button>
          </form>

          <div className="auth-footer">
            Already have an account?
            <Link to="/login" className="auth-link">
              Sign In
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
