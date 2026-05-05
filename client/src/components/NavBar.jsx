import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/ContextProvider";
import defaultProfile from "../assets/default-profile.png";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data.user);
    };
    fetchUser();
  }, []);

  const menuVariants = {
    open: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
    closed: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.2 },
    },
  };

  const iconVariants = {
    open: { rotate: 180 },
    closed: { rotate: 0 },
  };

  const pathVariants = {
    open: { opacity: 1 },
    closed: { opacity: 0 },
  };

  return (
    <div>
      <nav
        style={{
          background: "linear-gradient(135deg, #2b274a, #1f1c39)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          height: "75px",
          position: "fixed",
          top: 0,
          width: "100%",
          zIndex: 1000,
        }}
      >
        <div
          className="userProfile"
          style={{ display: "flex", alignItems: "center" }}
        >
          <img
            src={user?.profilePicture || defaultProfile}
            alt="profile"
            className="profilePic"
            style={{
              borderRadius: "50%",
              objectFit: "cover",
              width: "45px",
              height: "45px",
              border: "none",
            }}
          />
          <p
            className="usernameProfile"
            style={{
              color: "white",
              marginLeft: "10px",
              fontSize: "16px",
              fontWeight: "600",
              letterSpacing: "0.3px",
            }}
          >
            {user?.username || ""}
          </p>
        </div>

        <motion.button
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "10px",
            outline: "none",
          }}
          onClick={() => setIsOpen(!isOpen)}
          animate={isOpen ? "open" : "closed"}
          variants={iconVariants}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="white">
            <motion.path
              d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"
              variants={pathVariants}
              initial="closed"
              animate={isOpen ? "closed" : "open"}
            />
            <motion.path
              d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
              variants={pathVariants}
              initial="closed"
              animate={isOpen ? "open" : "closed"}
            />
          </svg>
        </motion.button>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                background: "rgba(0,0,0,0.5)",
                zIndex: 999,
              }}
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              style={{
                position: "fixed",
                top: "75px",
                right: 0,
                backgroundColor: "#2e2b47",
                width: "100%",
                boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
                zIndex: 1000,
              }}
              initial="closed"
              animate="open"
              exit="closed"
              variants={menuVariants}
            >
              {["Home", "Expenses", "Incomes", "Settings"].map((text) => (
                <Link
                  key={text}
                  to={`/${text.toLowerCase()}`}
                  style={{
                    display: "block",
                    padding: "15px 20px",
                    color: "white",
                    textDecoration: "none",
                    fontWeight: "600",
                    fontSize: "15px",
                    letterSpacing: "0.5px",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                  onClick={() => setIsOpen(false)}
                >
                  {text}
                </Link>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NavBar;
