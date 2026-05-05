import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/ContextProvider";
import { useNavigate } from "react-router-dom";

import "../styles/Settings.css";

// Modals
import { ConfirmationModal } from "../components/ConfirmationModal";
import { ChangePassModal } from "../components/ChangePassModal";
import { ChangeEmailModal } from "../components/ChangeEmailModal";
import { EditProfileModal } from "../components/EditProfileModal";
import { AboutUsModal } from "../components/AboutUsModal";
import { ForgotPassModal } from "../components/ForgotPassModal";
import { ResetDataModal } from "../components/ResetDataModal";

// Assets
import DefaultProfile from "../assets/default-profile.png";
import PasswordIcon from "../assets/password.png";
import GmailIcon from "../assets/gmail.png";
import LogoutIcon from "../assets/logout.png";
import AboutIcon from "../assets/about icon.png";
import ArrowIcon from "../assets/arrow icon.png";
import ResetIcon from "../assets/reset.png";

// Safe fallback for BASE_URL
const BASE_URL = import.meta.env?.VITE_API_BASE_URL || "http://localhost:5000";

const Settings = () => {
  const navigate = useNavigate();
  const { user, logout, token, setUser } = useAuth();

  // Modal States
  const [modalState, setModalState] = useState({
    password: false,
    email: false,
    logout: false,
    about: false,
    editProfile: false,
    changePassForm: false,
    changeEmailForm: false,
    forgotPass: false,
    resetData: false,
  });

  const toggleModal = (key, value) => {
    setModalState((prev) => ({ ...prev, [key]: value }));
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // --- Animations ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren",
      },
    },
  };

  const slideDown = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const slideUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.div
      className="settings-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="settings-header" variants={slideDown}>
        <h2 className="settings-title">Account Settings</h2>
        <p className="settings-subtitle">
          Manage your profile and security preferences.
        </p>
      </motion.div>

      {/* Profile Section */}
      <motion.div className="profile-section glass-panel" variants={slideDown}>
        <motion.img
          src={user?.profilePicture || DefaultProfile}
          alt="Profile"
          className="profile-img-large"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        />
        <div className="profile-info-large">
          <h3>@{user?.username}</h3>
          <p>{user?.email}</p>
          <motion.button
            className="btn-outline"
            style={{
              marginTop: "12px",
              padding: "8px 16px",
              fontSize: "0.85rem",
            }}
            onClick={() => toggleModal("editProfile", true)}
            whileHover={{
              scale: 1.05,
              backgroundColor: "rgba(255,255,255,0.1)",
            }}
            whileTap={{ scale: 0.95 }}
          >
            Edit Profile
          </motion.button>
        </div>
      </motion.div>

      {/* Settings List */}
      <div className="settings-grid">
        <motion.div
          className="setting-item"
          onClick={() => toggleModal("password", true)}
          variants={slideUp}
          whileHover={{ x: 5, backgroundColor: "rgba(255, 255, 255, 0.06)" }}
        >
          <div className="setting-left">
            <div className="setting-icon-box">
              <img src={PasswordIcon} className="setting-icon" alt="pass" />
            </div>
            <div className="setting-text">
              <h4>Change Password</h4>
              <p>Update your account password</p>
            </div>
          </div>
          <img src={ArrowIcon} className="arrow-right" width={20} alt="arrow" />
        </motion.div>

        <motion.div
          className="setting-item"
          onClick={() => toggleModal("email", true)}
          variants={slideUp}
          whileHover={{ x: 5, backgroundColor: "rgba(255, 255, 255, 0.06)" }}
        >
          <div className="setting-left">
            <div className="setting-icon-box">
              <img src={GmailIcon} className="setting-icon" alt="email" />
            </div>
            <div className="setting-text">
              <h4>Change Email</h4>
              <p>Update your connected email address</p>
            </div>
          </div>
          <img src={ArrowIcon} className="arrow-right" width={20} alt="arrow" />
        </motion.div>

        {/* New Reset Data Setting */}
        <motion.div
          className="setting-item"
          onClick={() => toggleModal("resetData", true)}
          variants={slideUp}
          whileHover={{ x: 5, backgroundColor: "rgba(255, 255, 255, 0.06)" }}
        >
          <div className="setting-left">
            <div className="setting-icon-box">
              <img src={ResetIcon} className="setting-icon" alt="reset" />
            </div>
            <div className="setting-text">
              <h4>Reset Data</h4>
              <p>Clear expenses, incomes, or all data</p>
            </div>
          </div>
          <img src={ArrowIcon} className="arrow-right" width={20} alt="arrow" />
        </motion.div>

        <motion.div
          className="setting-item"
          onClick={() => toggleModal("about", true)}
          variants={slideUp}
          whileHover={{ x: 5, backgroundColor: "rgba(255, 255, 255, 0.06)" }}
        >
          <div className="setting-left">
            <div className="setting-icon-box">
              <img src={AboutIcon} className="setting-icon" alt="about" />
            </div>
            <div className="setting-text">
              <h4>About TrackNest</h4>
              <p>Version info and developer credits</p>
            </div>
          </div>
          <img src={ArrowIcon} className="arrow-right" width={20} alt="arrow" />
        </motion.div>

        <motion.div
          className="setting-item"
          style={{ borderColor: "rgba(244, 63, 94, 0.3)" }}
          onClick={() => toggleModal("logout", true)}
          variants={slideUp}
          whileHover={{ x: 5, backgroundColor: "rgba(244, 63, 94, 0.15)" }}
        >
          <div className="setting-left">
            <div
              className="setting-icon-box"
              style={{ background: "rgba(244, 63, 94, 0.1)" }}
            >
              <img src={LogoutIcon} className="setting-icon" alt="logout" />
            </div>
            <div className="setting-text">
              <h4 style={{ color: "var(--danger)" }}>Logout</h4>
              <p>Sign out of your account</p>
            </div>
          </div>
          <img src={ArrowIcon} className="arrow-right" width={20} alt="arrow" />
        </motion.div>
      </div>

      {/* --- Modals --- */}
      <AnimatePresence>
        {modalState.editProfile && (
          <div className="modalBackground">
            <EditProfileModal
              closeModal={() => toggleModal("editProfile", false)}
            />
          </div>
        )}

        {/* Confirmation Modals */}
        {modalState.password && (
          <div className="modalBackground">
            <ConfirmationModal
              onClose={() => toggleModal("password", false)}
              icon={PasswordIcon}
              text="Change Password?"
              onSubmit={() => {
                toggleModal("password", false);
                toggleModal("changePassForm", true);
              }}
            />
          </div>
        )}

        {modalState.email && (
          <div className="modalBackground">
            <ConfirmationModal
              onClose={() => toggleModal("email", false)}
              icon={GmailIcon}
              text="Change Email Address?"
              onSubmit={() => {
                toggleModal("email", false);
                toggleModal("changeEmailForm", true);
              }}
            />
          </div>
        )}

        {modalState.logout && (
          <div className="modalBackground">
            <ConfirmationModal
              onClose={() => toggleModal("logout", false)}
              icon={LogoutIcon}
              text="Are you sure you want to logout?"
              onSubmit={handleLogout}
            />
          </div>
        )}

        {/* Functional Modals */}
        {modalState.changePassForm && (
          <ChangePassModal
            onClose={() => toggleModal("changePassForm", false)}
          />
        )}

        {modalState.changeEmailForm && (
          <ChangeEmailModal
            onClose={() => toggleModal("changeEmailForm", false)}
            user={user}
            token={token}
            onEmailChanged={(newEmail) => setUser({ ...user, email: newEmail })}
          />
        )}

        {modalState.resetData && (
          <ResetDataModal onClose={() => toggleModal("resetData", false)} />
        )}

        {modalState.forgotPass && (
          <div className="modalBackground">
            <div className="modalWrapper">
              <ForgotPassModal
                onClose={() => toggleModal("forgotPass", false)}
              />
            </div>
          </div>
        )}

        {modalState.about && (
          <AboutUsModal onClose={() => toggleModal("about", false)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Settings;
