import mongoose from "mongoose";

const BudgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
  },
  budgetName: {
    type: String,
    required: true,
  },
  budgetType: {
    type: String,
    enum: ["category", "monthly", "custom"],
    default: "category",
  },
  category: String,
  limit: {
    type: Number,
    required: true,
  },
  spent: {
    type: Number,
    default: 0,
  },
  period: {
    type: String,
    enum: ["daily", "weekly", "month", "monthly", "quarterly", "yearly"],
    default: "monthly",
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: Date,
  alerts: [
    {
      threshold: Number, // Alert at 50%, 80%, 100%
      enabled: Boolean,
      notificationMethod: {
        type: String,
        enum: ["email", "app", "both"],
        default: "app",
      },
    },
  ],
  status: {
    type: String,
    enum: ["safe", "warning", "exceeded"],
    default: "safe",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Budget", BudgetSchema);
