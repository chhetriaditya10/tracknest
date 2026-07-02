import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/ContextProvider";
import { ClipLoader } from "react-spinners";

const AdminRoute = () => {
  const { user, token, loading } = useAuth();
  const isAdminUser = Boolean(user?.isAdmin || user?.role === "admin");

  if (loading) {
    return <ClipLoader color="#8b5cf6" size={24} />;
  }

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdminUser) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
