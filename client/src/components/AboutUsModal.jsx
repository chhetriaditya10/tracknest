import React from "react";
import { motion } from "framer-motion";
import "../styles/AboutUs.css";

// Assets
import CloseIcon from "../assets/close-btn.png";
import TrackNestLogo from "../assets/TrackNest Icon.png";
import Rocket from "../assets/rocket.png";
import Programmer from "../assets/programmer.png";

// Feature Icons
import AddView from "../assets/add and view.png";
import Category from "../assets/category.png";
import Analytics from "../assets/analytics.png";
import EditProfile from "../assets/edit profile.png";
import PasswordRecovery from "../assets/password recovery.png";
import Dashboard from "../assets/dashboard.png";

// Social Icons
import FB from "../assets/facebook.png";
import IG from "../assets/instagram logo.png";
import GitHub from "../assets/github logo.png";
import Tiktok from "../assets/tik-tok logo.png";

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

        {/* Body Content */}
        <div className="aboutBody">
          {/* Intro Section */}
          <div className="aboutIntro">
            <img src={TrackNestLogo} alt="TrackNest" className="appLogo" />
            <p className="introText">
              TrackNest is your personal finance companion. Simple, intuitive, and
              designed to help you understand your spending habits effortlessly.
            </p>
          </div>

          {/* Features Grid */}
          <div className="featuresSection">
            <h4>Key Features</h4>
            <div className="featuresGrid">
              {features.map((feat, index) => (
                <div className="featureCard" key={index}>
                  <img src={feat.icon} alt="feature" className="featureIcon" />
                  <span className="featureText">{feat.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mission Section */}
          <div className="missionSection">
            <div className="missionHeader">
              <img src={Rocket} alt="Rocket" className="rocketIcon" />
              <span>Our Mission</span>
            </div>
            <p className="missionText">
              "To make money management accessible and stress-free for everyone,
              regardless of financial background."
            </p>
          </div>

          {/* Footer / Developer Info */}
          <div className="aboutFooter">
            <div className="devInfo">
              <img src={Programmer} alt="Dev" className="devAvatar" />
              <p className="devText">
                Designed & Developed by <strong>Sydney Santos</strong>
              </p>
            </div>

            <div className="socialLinks">
              <a
                href="https://www.facebook.com/sydney.santos.7773"
                target="_blank"
                rel="noreferrer"
              >
                <img src={FB} alt="Facebook" className="socialIcon" />
              </a>
              <a
                href="https://www.instagram.com/jst.sydd/"
                target="_blank"
                rel="noreferrer"
              >
                <img src={IG} alt="Instagram" className="socialIcon" />
              </a>
              <a
                href="https://github.com/Syddevv"
                target="_blank"
                rel="noreferrer"
              >
                <img src={GitHub} alt="GitHub" className="socialIcon" />
              </a>
              <a
                href="https://www.tiktok.com/@sydd_dev"
                target="_blank"
                rel="noreferrer"
              >
                <img src={Tiktok} alt="TikTok" className="socialIcon" />
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
