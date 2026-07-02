import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/ContextProvider";
import { motion, AnimatePresence } from "framer-motion";

const iconSize = 18;

const LightDashboardSidebar = ({ isOpen, isCollapsed, onClose, onToggleCollapse }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navSections = [
    {
      title: "GENERAL",
      links: [
        {
          path: "/home",
          label: "Dashboard",
          icon: (
            <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5Z" />
              <path d="M9 22V12h6v10" />
            </svg>
          ),
        },
        {
          path: "/expenses",
          label: "All Expenses",
          icon: (
            <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 7h16M7 11h10M9 15h6" />
              <rect x="3" y="3" width="18" height="18" rx="4" />
            </svg>
          ),
        },
        {
          path: "/recurring",
          label: "Bill & Subscription",
          icon: (
            <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 7h16M4 17h16" />
              <rect x="3" y="7" width="18" height="10" rx="3" />
              <path d="M8 7V4h8v3" />
            </svg>
          ),
        },
        {
          path: "/investments",
          label: "Investment",
          icon: (
            <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 20h16M7 15l5-5 5 5" />
              <path d="M7 11l5-3 5 3" />
            </svg>
          ),
        },
        {
          path: "/goals",
          label: "Goals",
          icon: (
            <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </svg>
          ),
        },
      ],
    },
    {
      title: "Tools",
      links: [
        {
          path: "/ai-analytics",
          label: "Insight",
          icon: (
            <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a7 7 0 0 1 7 7c0 3.87-3.13 7-7 7s-7-3.13-7-7a7 7 0 0 1 7-7Z" />
              <path d="M12 10v4" />
              <path d="M12 18h.01" />
            </svg>
          ),
        },
        {
          path: "/analytics",
          label: "Analytics",
          icon: (
            <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19h16" />
              <path d="M4 15l4-4 4 4 4-8 4 8" />
            </svg>
          ),
        },
      ],
    },
    {
      title: "Other",
      links: [
        {
          path: "/settings",
          label: "Settings",
          icon: (
            <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
            </svg>
          ),
        },
        {
          path: "/support",
          label: "Support",
          icon: (
            <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 18a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z" />
              <path d="M7 9a5 5 0 0 1 10 0c0 1.73-1 2.9-2.5 3.5L12 16l-2.5-3.5C8 11.9 7 10.73 7 9Z" />
            </svg>
          ),
        },
      ],
    },
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm md:hidden"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={{ x: -320, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -320, opacity: 0 }}
        transition={{ duration: 0.25 }}
        className={`fixed left-0 top-0 z-50 flex h-full flex-col border-r border-slate-200 bg-white shadow-[0_25px_60px_-30px_rgba(15,23,42,0.3)] md:relative md:shadow-none ${
          isOpen ? "block w-72" : "hidden md:block"
        } ${isCollapsed ? "md:w-20" : "md:w-56"}`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 md:px-5">
          <div className={`flex items-center gap-3 ${isCollapsed ? "justify-center md:justify-start w-full" : ""}`}>
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-600 text-white text-lg font-bold">
              T
            </div>
            {!isCollapsed && (
              <div>
                <p className="text-lg font-semibold text-slate-900">TrackNest</p>
                <p className="text-xs text-slate-500">Your finance hub</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleCollapse}
              className="hidden rounded-2xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-200 md:inline-flex"
            >
              {isCollapsed ? "Expand" : "Collapse"}
            </button>
            <button
              onClick={onClose}
              className="rounded-2xl bg-slate-100 p-2 text-slate-600 md:hidden"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6">
          {navSections.map((section) => (
            <div key={section.title} className="mb-6">
              <div className={`sidebar-section-title ${isCollapsed ? "hidden" : "block"}`}>{section.title}</div>
              <div className="space-y-2">
                {section.links.map((item) => (
                  <NavLink
                    key={item.path + item.label}
                    to={item.path}
                    onClick={() => onClose?.()}
                    title={item.label}
                    className={({ isActive }) =>
                      `group flex items-center ${isCollapsed ? "justify-center" : "justify-start"} gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                        isActive
                          ? "bg-violet-50 text-violet-700 font-semibold"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`
                    }
                  >
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                      {item.icon}
                    </span>
                    <span className={`${isCollapsed ? "hidden" : "inline"}`}>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-200 p-5">
          <div className="rounded-[18px] bg-violet-50/80 p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">Upgrade to Pro</p>
            <p className="mt-2 text-sm text-slate-500">Unlock premium insights and smart automation.</p>
            <button
              onClick={() => {
                navigate("/pricing");
                onClose?.();
              }}
              className="mt-4 w-full rounded-2xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700"
            >
              Upgrade now
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default LightDashboardSidebar;
