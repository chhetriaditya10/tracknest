import React, { useState } from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProtectedRoute from "./components/ProtectedRoutes";

// Context
import ContextProvider from "./context/ContextProvider";

// Pages
import Register from "./pages/Register";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Expenses from "./pages/ExpensesRecord";
import Incomes from "./pages/IncomesRecord";
import Settings from "./pages/Settings";
import Analytics from "./pages/Analytics";
import Recurring from "./pages/Recurring";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancelled from "./pages/PaymentCancelled";
import AdminDashboard from "./pages/AdminDashboard";
import Home from "./pages/Home";
import PremiumDashboard from "./pages/PremiumDashboard";
import Pricing from "./pages/Pricing";
import PremiumRoute from "./components/PremiumRoute";
import AdminRoute from "./components/AdminRoute";
import ErrorBoundary from "./components/ErrorBoundary";

// Components
import Sidebar from "./components/Sidebar";
import AIAnalytics from "./components/AIAnalytics";

// Analytics
import { Analytics as VercelAnalytics } from "@vercel/analytics/react";

// --- Internal Layout Component ---
// This wrapper handles the Sidebar and Main Content area
const DashboardLayout = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "var(--bg-dark)",
      }}
    >
      {/* Sidebar */}
      <Sidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <main
        style={{
          flex: 1,
          marginLeft: "var(--sidebar-width, 280px)", // Pushes content to right of fixed sidebar
          width: "calc(100% - var(--sidebar-width, 280px))",
          padding: "20px",
          transition: "all 0.3s ease",
          position: "relative",
          zIndex: 1,
          backgroundColor: "var(--bg-dark)",
          color: "var(--text-main)",
        }}
        className="main-content-area" // Class for mobile css targeting
      >
        {/* Mobile Hamburger (Visible only on small screens) */}
        <div
          className="mobile-header"
          style={{ display: "none", marginBottom: "20px" }}
        >
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            style={{ background: "none", color: "white", fontSize: "24px" }}
          >
            ☰
          </button>
        </div>

        {/* Render the Page Content */}
        <Outlet />
      </main>

      {/* Mobile Responsive Styles Injector for Layout */}
      <style>{`
        @media (max-width: 900px) {
          .main-content-area {
            margin-left: 0 !important;
            width: 100% !important;
            padding-top: 70px !important; /* Space for mobile header */
          }
          .mobile-header {
            display: block !important;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 60px;
            background: var(--bg-surface);
            z-index: 40;
            padding: 15px;
            border-bottom: 1px solid var(--border-glass);
          }
        }
      `}</style>
    </div>
  );
}

function App() {
  return (
    <ContextProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-cancelled" element={<PaymentCancelled />} />

        {/* Protected Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            {/* Dashboard Routes */}
            <Route path="/home" element={<Home />} />
            <Route path="/dashboard" element={<Home />} />
            <Route path="/free" element={<Home />} />
            <Route path="/premium" element={<PremiumRoute />}>
              <Route index element={<PremiumDashboard />} />
            </Route>

            {/* Other Routes with Old Layout */}
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/incomes" element={<Incomes />} />
            <Route path="/analytics" element={
              <ErrorBoundary>
                <Analytics />
              </ErrorBoundary>
            } />
            <Route path="/recurring" element={<Recurring />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/ai-analytics" element={<PremiumRoute />}>
              <Route
                index
                element={
                  <ErrorBoundary>
                    <AIAnalytics />
                  </ErrorBoundary>
                }
              />
            </Route>
            <Route path="/admin" element={<AdminRoute />}>
              <Route index element={<AdminDashboard />} />
            </Route>
          </Route>
        </Route>
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="dark"
        toastStyle={{ backgroundColor: "#1e293b", color: "#fff" }}
      />
    </ContextProvider>
  );
}

export default App;
