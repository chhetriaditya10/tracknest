import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/ContextProvider";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/Sidebar.css";
import { ConfirmationModal } from "./ConfirmationModal";

// Assets
import Logo from "../assets/TrackNest Icon.png";
import HomeIcon from "../assets/home.png";
import ExpensesIcon from "../assets/expenses icon.png";
import IncomesIcon from "../assets/income icon.png";
import SettingsIcon from "../assets/account-settings.png";
import LogoutIcon from "../assets/logout.png";
import DefaultProfile from "../assets/default-profile.png";
import CloseIcon from "../assets/close-btn.png"; // 👈 Import Close Icon

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    logout();
    navigate("/");
    setShowLogoutModal(false);
  };

  // Navigation Config
  const navItems = [
    { path: "/home", label: "Dashboard", icon: HomeIcon },
    { path: "/expenses", label: "Expenses", icon: ExpensesIcon },
    { path: "/incomes", label: "Incomes", icon: IncomesIcon },
    { path: "/analytics", label: "Analytics", icon: HomeIcon },
    ...(user?.plan === "premium" || user?.isAdmin ? [{ path: "/ai-advisor", label: "AI Advisor", icon: HomeIcon }] : []),
    { path: "/settings", label: "Settings", icon: SettingsIcon },
    ...(user?.isAdmin ? [{ path: "/admin", label: "🛡️ Admin", icon: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyUzYuNDggMjIgMTIgMjJzMTAtMTAgMjAtMTBTMTcuNTIgMiAxMiAyWk0xMiAyMEgxMVYyMUgxMlYyMFpNNC4yIDE0QzQuMjEgMTMuNzcgNC40NSAxMy41OCA0LjcyIDEzLjQ1TDUuMjUgMTMuMTRDNS4zIDEzLjA5IDUuMzMgMTMgNS40IDEyLjk4TDUuODMgMTIuNjZDNS45NSAxMi41NCA2LjA3IDEyLjQ1IDYuMTkgMTIuMzNMNi40IDEyLjFDNi41MSAxMi4wOSA2LjUxIDEyLjA5IDYuNTEgMTIuMDhMNyAxMS43OUw2LjUxIDExLjQ4TDYuNTEgMTEuNDhNNyAxMS4xNUw2LjUxIDExLjA0TDYuNTEgMTEuMDRNNyAwLjg1TDYuNTEgMC43NEw2LjUxIDAuNzRNNyAwLjIxTDYuNTEgMC4xMEw2LjUxIDAuMU01LjIzIDAuNDVDNC45NiAwLjU4IDQuNzQgMC43NyA0LjUyIDAuOThMNC4wOSAxLjI5QzMuOTYgMS40MiAzLjg0IDEuNTUgMy43MiAxLjY4TDMuMjkgMS45OUMzLjE3IDIuMTIgMi45NSAyLjI1IDIuNzMgMi4zN0wzLjE5IDIuODhDMy4zMSAzLjAxIDMuNDMgMy4xNCAzLjU1IDMuMjdMNyAxMC4zMUw3IDEwLjMxWk0xNyAxMC4zMUwxNyAxMC4zMUwxNyAxMC4zMU0xNyAxMC4zMUwxNyAxMC4zMU01LjIzIDAuNDVNNyAwLjg1TTcuNTEgMC43NEw2LjUxIDAuNzRNNyAwLjIxTTUuODMgMTIuNjZNNi4xOSAxMi4zM0w2LjQwIDEyLjExTDYuNTEgMTIuMDhNNyAxMS43OUw2LjUxIDExLjQ4TTcuNTEgMTEuMDRNNyAxMS4xNU0xNyAxMC4zMU0xNyAxMC4zMU0xNyAxMC4zMU0xNyAxMC3MzE0LjMwIDMuOTlaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K" }] : []),
  ];

  // Insert AI Chat item directly below AI Advisor when present
  if ((user?.plan === 'premium' || user?.isAdmin)) {
    const aiAdvisorIndex = navItems.findIndex((n) => n.path === '/ai-advisor');
    const aiChatItem = { path: '/ai-chat', label: 'AI Chat', icon: HomeIcon };
    if (aiAdvisorIndex !== -1) {
      navItems.splice(aiAdvisorIndex + 1, 0, aiChatItem);
    } else {
      // fallback: add near top
      navItems.splice(4, 0, aiChatItem);
    }
  }

  // Animation Variants
  const sidebarContentVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
  };

  return (
    <>
      {/* Mobile Overlay with Fade Animation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={`mobile-overlay ${isOpen ? "open" : ""}`}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <aside className={`sidebar ${isOpen ? "mobile-open" : ""}`}>
        <motion.div
          className="sidebar-content-wrapper"
          variants={sidebarContentVariants}
          initial="hidden"
          animate="visible"
          style={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
          {/* Header */}
          <motion.div
            className="sidebar-header"
            variants={itemVariants}
            style={{ marginBottom: "40px" }}
          >
            {/* Wrapper for Logo & Text */}
            <div className="brand-wrapper">
              <img src={Logo} alt="TrackNest" className="brand-logo" />
              <span className="brand-text">TrackNest</span>
            </div>

            {/* Close Button (Visible only on Mobile) */}
            <button className="sidebar-close-btn" onClick={onClose}>
              <img src={CloseIcon} alt="Close" />
            </button>
          </motion.div>

          {/* Navigation - Takes up available space */}
          <nav
            className="sidebar-nav"
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `nav-item ${isActive ? "active" : ""}`
                }
                onClick={() => onClose && onClose()}
              >
                <motion.div
                  className="nav-item-inner"
                  variants={itemVariants}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    width: "100%",
                  }}
                >
                  <img src={item.icon} alt={item.label} className="nav-icon" />
                  <span>{item.label}</span>
                </motion.div>
              </NavLink>
            ))}
          </nav>

          {/* Footer / Profile - Pushed to bottom */}
          <motion.div
            className="sidebar-footer"
            variants={itemVariants}
            style={{
              marginTop: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "15px",
            }}
          >
            <div className="user-info">
              <img
                src={user?.profilePicture || DefaultProfile}
                alt="Profile"
                className="user-avatar"
              />
              <div className="user-details">
                <span className="user-name">@{user?.username || "User"}</span>
                <span className="user-email">
                  {user?.email || "Loading..."}
                </span>
              </div>
            </div>

            <button className="logout-btn" onClick={handleLogoutClick}>
              <img src={LogoutIcon} alt="Logout" className="logout-icon" />
              Logout
            </button>
          </motion.div>
        </motion.div>
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <ConfirmationModal
          onClose={() => setShowLogoutModal(false)}
          icon={LogoutIcon}
          text="Are you sure you want to logout?"
          onSubmit={confirmLogout}
        />
      )}
    </>
  );
};

export default Sidebar;
