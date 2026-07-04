import React from "react";
import { motion } from "framer-motion";
import "../styles/AboutUs.css";

// Assets
import CloseIcon from "../assets/close-btn.png";
import TrackNestLogo from "../assets/TrackNest Icon.png";
import Rocket from "../assets/rocket.png";

// Feature Icons
import AddView from "../assets/add and view.png";
import Category from "../assets/category.png";
import Analytics from "../assets/analytics.png";
import EditProfile from "../assets/edit profile.png";
import PasswordRecovery from "../assets/password recovery.png";
import Dashboard from "../assets/dashboard.png";

// Social Icon
import GitHub from "../assets/github logo.png";

export const AboutUsModal = ({ onClose }) => {
  const features = [
    { icon: AddView, text: "Track Income & Expenses" },
    { icon: Category, text: "Smart Categorization" },
    { icon: Analytics, text: "Visual Analytics" },
    { icon: Dashboard, text: "Dashboard Overview" },
    { icon: EditProfile, text: "Profile Management" },
    { icon: PasswordRecovery, text: "Secure Account Recovery" },
  ];

  return (
    <div className="aboutUsWrapper" onClick={onClose}>
      <motion.div
        className="aboutUsContent"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="aboutHeader">
          <h3 className="aboutTitle">About TrackNest</h3>
          <button className="closeBtn" onClick={onClose}>
            <img src={CloseIcon} alt="Close" className="closeIconImg" />
          </button>
        </div>

        {/* Body */}
        <div className="aboutBody">
          {/* Intro */}
          <div className="aboutIntro">
            <img
              src={TrackNestLogo}
              alt="TrackNest"
              className="appLogo"
            />
            <p className="introText">
              TrackNest is a modern personal finance management application
              designed to help users monitor their income, expenses, and savings
              with ease. It provides insightful analytics and an intuitive
              dashboard to support better financial decision-making.
            </p>
          </div>

          {/* Features */}
          <div className="featuresSection">
            <h4>Key Features</h4>
            <div className="featuresGrid">
              {features.map((feature, index) => (
                <div className="featureCard" key={index}>
                  <img
                    src={feature.icon}
                    alt={feature.text}
                    className="featureIcon"
                  />
                  <span className="featureText">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mission */}
          <div className="missionSection">
            <div className="missionHeader">
              <img
                src={Rocket}
                alt="Rocket"
                className="rocketIcon"
              />
              <span>Our Mission</span>
            </div>

            <p className="missionText">
              "To empower individuals with simple, secure, and intelligent tools
              for managing their personal finances effectively."
            </p>
          </div>

          {/* Footer */}
          <div className="aboutFooter">
            <div className="devInfo">
              <p className="devText">
                Designed & Developed by{" "}
                <strong>Aditya Jung Chhetri</strong>
              </p>
            </div>

            <div className="socialLinks">
              <a
                href="https://github.com/chhetriaditya10/tracknest"
                target="_blank"
                rel="noreferrer"
                title="TrackNest GitHub Repository"
              >
                <img
                  src={GitHub}
                  alt="GitHub"
                  className="socialIcon"
                />
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
