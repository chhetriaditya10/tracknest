import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/ContextProvider";
import { ClipLoader } from "react-spinners";

const PremiumRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <ClipLoader color="#8b5cf6" size={24} />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const hasPremiumAccess =
    user.role === "admin" ||
    user.plan === "premium" ||
    user.plan === "ultra" ||
    ["active", "trialing"].includes(user.subscriptionStatus);

  if (!hasPremiumAccess) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
};

export default PremiumRoute;
