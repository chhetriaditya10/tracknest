import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/ContextProvider.jsx";
import { ClipLoader } from "react-spinners";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <ClipLoader color="#8b5cf6" size={18} />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
