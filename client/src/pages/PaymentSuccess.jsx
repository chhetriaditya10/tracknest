import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/ContextProvider";

const BASE_URL = import.meta.env?.VITE_API_BASE_URL || "http://localhost:5000";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, fetchSubscriptionStatus } = useAuth();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    let attempts = 0;
    let intervalId;

    const confirmSubscription = async () => {
      if (!sessionId) return;
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        await fetch(`${BASE_URL}/api/checkout/confirm-subscription?session_id=${sessionId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (err) {
        console.error("Subscription confirmation failed:", err.message);
      }

      intervalId = setInterval(async () => {
        attempts += 1;
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
          const response = await fetch(`${BASE_URL}/api/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await response.json();

          if (response.ok && data.success) {
            const plan = data.user?.plan;
            const status = data.user?.subscriptionStatus;
            const hasPremium =
              plan === "premium" ||
              plan === "ultra" ||
              ["active", "trialing"].includes(status);

            if (hasPremium) {
              await fetchSubscriptionStatus();
              clearInterval(intervalId);
              navigate("/home");
              return;
            }
          }
        } catch (fetchError) {
          console.error("Auth refresh failed:", fetchError.message);
        }

        if (attempts >= 12) {
          clearInterval(intervalId);
        }
      }, 2500);
    };

    confirmSubscription();
    return () => clearInterval(intervalId);
  }, [sessionId, fetchSubscriptionStatus, navigate]);

  return (
    <div className="page-center" style={{ padding: "40px", textAlign: "center" }}>
      <h1>Payment Successful</h1>
      <p>Your subscription payment was completed successfully. Thank you for upgrading!</p>
      <p>You now have access to premium features.</p>
      <button className="btn-primary" onClick={() => navigate("/home")}>Go to Dashboard</button>
    </div>
  );
};

export default PaymentSuccess;
