import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "../styles/LandingPage.css";

const LandingPage = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <div className="landing-page">
      <nav className={`landing-nav ${isScrolled ? "scrolled" : ""}`}>
        <div className="nav-content">
          <div className="nav-brand" onClick={() => navigate("/")}>Fast Budget</div>
          <div className="nav-links">
            <button className="nav-link" onClick={() => navigate("/login")}>Sign In</button>
            <button className="nav-cta" onClick={() => navigate("/register")}>Get Started</button>
          </div>
        </div>
      </nav>

      <header className="hero-section">
        <motion.div
          className="hero-copy"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="hero-badge">Expense Manager • Budget Planner • Analytics</span>
          <h1>Manage your personal finances and budget smarter.</h1>
          <p>
            Fast Budget gives you a complete view of your income, expenses, and budgets — all from one clean web dashboard.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => navigate("/register")}>Try the Web App</button>
            <button className="btn-secondary" onClick={() => navigate("/login")}>Sign In</button>
          </div>
          <div className="hero-badges">
            <span>Web app access</span>
            <span>Real-time budget alerts</span>
            <span>Expense categories</span>
          </div>
        </motion.div>

        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="hero-card">
            <div className="hero-card-header">Monthly Overview</div>
            <div className="hero-card-value">Rs 34,820</div>
            <div className="hero-card-meta">Total expenses this month</div>
            <div className="hero-card-progress">
              <div className="progress-bar" style={{ width: "65%" }}></div>
            </div>
          </div>
        </motion.div>
      </header>

      <main className="landing-content">
        <motion.section
          className="section feature-section"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="section-copy">
            <h2>Your Finances at a Glance</h2>
            <p>
              Stop wondering where your money goes. Fast Budget provides easy-to-read reports, charts, and summaries so you can track spending habits and reach your goals.
            </p>
          </div>
          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Dashboard Insights</h3>
              <p>See income, expenses, and budgets in one place.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Budget Tracking</h3>
              <p>Set limits and receive warnings before you overspend.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Quick Entry</h3>
              <p>Record transactions fast so nothing slips through.</p>
            </div>
          </div>
        </motion.section>

        <motion.section
          className="section split-section"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div>
            <h2>Accounts with Automatic Sync</h2>
            <p>
              Securely connect bank accounts and see your full financial picture. This feature is optional — manual entry works too.
            </p>
            <p className="section-note">
              Includes support for budgets, credit cards, and linked accounts.
            </p>
          </div>
          <div className="split-card">
            <div className="split-card-item">
              <span>Account balance</span>
              <strong>Rs 122,430</strong>
            </div>
            <div className="split-card-item">
              <span>Synced spending</span>
              <strong>Rs 8,740</strong>
            </div>
          </div>
        </motion.section>

        <motion.section
          className="section card-row-section"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="card-row">
            <div className="info-card">
              <h3>Create Budgets and Stick to Them</h3>
              <p>Set spending limits for categories, track progress in real-time, and receive alerts before you overspend.</p>
            </div>
            <div className="info-card">
              <h3>Expense Tracking</h3>
              <p>Categorize spending, use recurring templates, and manage custom categories with ease.</p>
            </div>
            <div className="info-card">
              <h3>Easy Import</h3>
              <p>Bring your data from other apps quickly using CSV import.</p>
            </div>
          </div>
        </motion.section>

        <motion.section
          className="section callout-section"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <h2>Fast Budget Web</h2>
          <p>Use the web app for larger screens, seamless access, and powerful budgeting tools wherever you work.</p>
          <div className="callout-grid">
            <div className="callout-card">
              <div className="callout-icon">🌐</div>
              <h4>Web App Access</h4>
              <p>Open Fast Budget from any browser.</p>
            </div>
            <div className="callout-card">
              <div className="callout-icon">🏦</div>
              <h4>Bank Sync</h4>
              <p>Download transactions from supported accounts automatically.</p>
            </div>
            <div className="callout-card">
              <div className="callout-icon">✉️</div>
              <h4>Contact Support</h4>
              <p>Questions? Reach us at support@example.com.</p>
            </div>
          </div>
        </motion.section>

        <motion.section
          className="section pricing-section"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="pricing-intro">
            <h2>Choose the plan that's right for you</h2>
            <p>Want to simplify your financial life? Pick a plan that fits your goals and get the most from your budgeting workflow.</p>
          </div>
          <div className="pricing-cards">
            <div className="pricing-card">
              <div className="pricing-label">Premium</div>
              <div className="pricing-price">Rs 1,999 / Year</div>
              <ul>
                <li>Data saved online</li>
                <li>Web app access</li>
                <li>Automatic sync</li>
              </ul>
              <button className="btn-primary">Get Premium</button>
            </div>
            <div className="pricing-card featured">
              <div className="pricing-label">Ultra</div>
              <div className="pricing-price">Rs 2,999 / Year</div>
              <ul>
                <li>All Premium features</li>
                <li>Advanced analytics</li>
                <li>Priority support</li>
              </ul>
              <button className="btn-primary">Choose Ultra</button>
            </div>
          </div>
        </motion.section>
      </main>

      <footer className="landing-footer">
        <div>©2026 Fast Budget. All rights reserved.</div>
        <div className="footer-links">
          <button className="footer-link">Terms of Service</button>
          <button className="footer-link">Privacy Policy</button>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
