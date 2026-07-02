import React from "react";
import { motion } from "framer-motion";

// Stat Card Component
export const StatCard = ({ icon, label, value, trend, color = "primary" }) => {
  const colorClasses = {
    primary: "from-primary/20 to-primary/5 border-primary/30",
    success: "from-success/20 to-success/5 border-success/30",
    danger: "from-danger/20 to-danger/5 border-danger/30",
    warning: "from-warning/20 to-warning/5 border-warning/30",
  };

  return (
    <motion.div
      whileHover={{ translateY: -4 }}
      className={`glass-panel p-6 bg-gradient-to-br ${colorClasses[color]}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="text-2xl">{icon}</div>
        {trend && (
          <div
            className={`text-xs font-semibold px-2 py-1 rounded-full ${
              trend > 0
                ? "bg-success/20 text-success"
                : "bg-danger/20 text-danger"
            }`}
          >
            {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-slate-400 text-sm font-medium mb-2">{label}</p>
      <p className="text-3xl font-bold text-slate-50">{value}</p>
    </motion.div>
  );
};

// Metric Card Component
export const MetricCard = ({ label, value, sublabel, icon }) => {
  return (
    <motion.div whileHover={{ scale: 1.02 }} className="glass-panel p-6 rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <span className="text-eyebrow">{label}</span>
        {icon && <span className="text-xl">{icon}</span>}
      </div>
      <p className="text-2xl font-bold text-slate-50 mb-1">{value}</p>
      {sublabel && <p className="text-sm text-slate-400">{sublabel}</p>}
    </motion.div>
  );
};

// Transaction Card Component
export const TransactionCard = ({ category, amount, date, type, icon }) => {
  const isIncome = type === "income";

  return (
    <motion.div
      whileHover={{ translateX: 4 }}
      className="glass-panel p-4 flex items-center justify-between rounded-lg"
    >
      <div className="flex items-center gap-4 flex-1">
        <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center text-lg">
          {icon}
        </div>
        <div>
          <p className="font-semibold text-slate-50">{category}</p>
          <p className="text-xs text-slate-400">{date}</p>
        </div>
      </div>
      <p className={`text-lg font-bold ${isIncome ? "text-success" : "text-danger"}`}>
        {isIncome ? "+" : "-"}Rs {amount.toLocaleString()}
      </p>
    </motion.div>
  );
};

// Chart Card Component
export const ChartCard = ({ title, subtitle, children, action }) => {
  return (
    <motion.div whileHover={{ y: -2 }} className="glass-panel p-6 rounded-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-50">{title}</h3>
          {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="min-h-64">{children}</div>
    </motion.div>
  );
};

// Button Component
export const Button = ({
  children,
  variant = "primary",
  size = "md",
  icon,
  ...props
}) => {
  const variantClasses = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    icon: "btn-icon",
  };

  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-6 py-3",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`${variantClasses[variant]} ${sizeClasses[size]} flex items-center gap-2`}
      {...props}
    >
      {icon && <span>{icon}</span>}
      {children}
    </motion.button>
  );
};

// Badge Component
export const Badge = ({ label, variant = "primary", icon }) => {
  const variantClasses = {
    primary: "bg-primary/20 text-primary border border-primary/30",
    success: "bg-success/20 text-success border border-success/30",
    danger: "bg-danger/20 text-danger border border-danger/30",
    warning: "bg-warning/20 text-warning border border-warning/30",
  };

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${variantClasses[variant]}`}>
      {icon && <span>{icon}</span>}
      {label}
    </span>
  );
};
