import React from "react";
import { useNavigate } from "react-router-dom";

const PaymentCancelled = () => {
  const navigate = useNavigate();

  return (
    <div className="page-center" style={{ padding: "40px", textAlign: "center" }}>
      <h1>Payment Cancelled</h1>
      <p>Your payment was not completed. You can try again or continue using the free version.</p>
      <button className="btn-secondary" onClick={() => navigate("/")}>Back to Pricing</button>
    </div>
  );
};

export default PaymentCancelled;
