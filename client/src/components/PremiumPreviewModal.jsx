import React from "react";
import "../styles/Modal.css";

const PremiumPreviewModal = ({ onClose, onConfirm }) => {
  const benefits = [
    "AI-driven spending insights",
    "Advanced analytics dashboards",
    "Recurring transaction automation",
    "CSV and PDF exports",
    "Priority support and onboarding",
  ];

  return (
    <div className="modalBackground">
      <div className="modalWrapper premiumPreviewModal">
        <div className="topSection">
          <div>
            <h3>Upgrade to Premium</h3>
            <p className="modalDescription">
              Unlock the full TrackNest experience and get smarter finance decisions faster.
            </p>
          </div>
          <button className="closeBtn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="inputs">
          <div className="premium-benefits-list">
            {benefits.map((item) => (
              <div key={item} className="benefit-item">
                <span>✔</span>
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="pricing-section">
            <p className="section-label">Pricing</p>
            <div className="pricing-grid">
              <div className="pricing-card">
                <p>Annual</p>
                <strong>Rs 1,999</strong>
                <span>Save 20%</span>
              </div>
              <div className="pricing-card">
                <p>Monthly</p>
                <strong>Rs 299</strong>
                <span>Flexible monthly plan</span>
              </div>
            </div>
          </div>

          <button className="saveBtn premiumConfirmBtn" onClick={onConfirm}>
            View pricing
          </button>
        </div>
      </div>
    </div>
  );
};

export default PremiumPreviewModal;
