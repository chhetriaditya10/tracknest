import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/ContextProvider";
import "../styles/LandingPage.css";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const Pricing = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [billingPeriod, setBillingPeriod] = useState("year");
  const [checkoutLoading, setCheckoutLoading] = useState("");

  const freeFeatures = [
    "Expense & income tracking",
    "Monthly summary",
    "Recent activity",
    "Free onboarding",
  ];

  const premiumFeatures = [
    "AI-powered spending insights & anomaly detection",
    "Forecasting dashboards (predict next month's spend)",
    "Advanced analytics (category trends, performance alerts)",
    "CSV & PDF exports",
    "Recurring transaction automation",
    "Custom budget goals & alerts",
    "Priority support & onboarding",
    "Unlimited transaction history (vs. limited history on Free)",
  ];

  const planOptions = {
    year: {
      planKey: "premium_yearly",
      label: "Rs 1,999 / year",
      description: "Best value for long-term savings.",
      features: premiumFeatures,
    },
    month: {
      planKey: "premium_monthly",
      label: "Rs 299 / month",
      description: "Flexible monthly subscription.",
      features: premiumFeatures,
    },
  };

  const handleCheckout = async (planKey) => {
    if (!token) {
      navigate("/login");
      return;
    }

    setCheckoutLoading(planKey);
    try {
      const response = await axios.post(
        `${BASE_URL}/api/checkout/create-session`,
        { plan: planKey },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data?.url) {
        throw new Error("Unable to initiate payment session.");
      }

      window.location.href = response.data.url;
    } catch (error) {
      console.error("Pricing checkout error", error);
      toast.error("Unable to start the upgrade process.");
    } finally {
      setCheckoutLoading("");
    }
  };

  return (
    <div className="landing-page pricing-page dark-mode">
      <section className="section pricing-hero">
        <div className="section-title-row">
          <div>
            <p className="eyebrow">Choose your plan</p>
            <h1>Flexible plans for every finance journey.</h1>
            <p className="section-description">
              Start free today, or upgrade to Premium and unlock AI analytics, export tools, custom reporting, and subscription automation.
            </p>
          </div>
          <div>
            {user ? (
              <div className="plan-status-card">
                <p>Signed in as</p>
                <strong>{user.username}</strong>
                <span>{user.email}</span>
                <p className="current-plan">
                  Current plan: <strong>{user.role === "admin" ? "Admin" : user.plan || "Free"}</strong>
                </p>
                <button className="plan-btn plan-btn-secondary" onClick={() => navigate(user.role === "admin" ? "/admin" : "/dashboard")}>Go to dashboard</button>
              </div>
            ) : (
              <div className="plan-status-card">
                <p>Not signed in yet</p>
                <strong>Free access available</strong>
                <button className="plan-btn plan-btn-primary" onClick={() => navigate("/register")}>Create account</button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="section pricing-section">
        <div className="pricing-controls">
          <div className="billing-toggle">
            <button
              className={`billing-pill ${billingPeriod === "month" ? "active" : ""}`}
              type="button"
              onClick={() => setBillingPeriod("month")}
            >
              Monthly
            </button>
            <button
              className={`billing-pill ${billingPeriod === "year" ? "active" : ""}`}
              type="button"
              onClick={() => setBillingPeriod("year")}
            >
              Annual
            </button>
          </div>
        </div>

        <div className="pricing-cards">
          <article className="pricing-card free-card">
            <span className="pricing-label">Free</span>
            <h2 className="pricing-price">Rs 0</h2>
            <p>Basic tracking to manage expenses and stay on budget.</p>
            <ul className="feature-list free-features">
              {freeFeatures.map((feature) => (
                <li key={feature} className="feature-item">
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <button className="plan-btn plan-btn-secondary" onClick={() => navigate("/register")}>Start Free</button>
          </article>

          <article className="pricing-card premium-card highlighted premium-card-hero">
            <div className="popular-chip">Most Popular</div>
            <span className="pricing-label">Premium</span>
            <h2 className="pricing-price">{planOptions[billingPeriod].label}</h2>
            <p>{planOptions[billingPeriod].description}</p>
            <ul className="feature-list premium-features">
              {(planOptions[billingPeriod].features || []).map((feature) => (
                <li key={feature} className="feature-item">
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <button
              className="plan-btn plan-btn-primary"
              onClick={() => handleCheckout(planOptions[billingPeriod].planKey)}
              disabled={checkoutLoading === planOptions[billingPeriod].planKey}
            >
              {checkoutLoading === planOptions[billingPeriod].planKey ? "Processing..." : "Upgrade Now"}
            </button>
          </article>
        </div>
      </section>

      <section className="section feature-grid premium-grid simple-pricing-grid">
        <div className="feature-card premium-card">
          <h3>Fast onboarding</h3>
          <p>Setup your account and begin importing expenses in minutes.</p>
        </div>
        <div className="feature-card premium-card">
          <h3>Smart reporting</h3>
          <p>Get richer category analytics, trends, and performance alerts.</p>
        </div>
        <div className="feature-card premium-card">
          <h3>AI insights</h3>
          <p>Receive anomaly alerts and spending recommendations automatically.</p>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
