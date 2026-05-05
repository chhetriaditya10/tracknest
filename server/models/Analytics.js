import mongoose from "mongoose";

const AnalyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  month: String, // "2026-05"
  year: Number,
  totalIncome: {
    type: Number,
    default: 0,
  },
  totalExpense: {
    type: Number,
    default: 0,
  },
  categoryExpenses: [
    {
      category: String,
      amount: Number,
      percentage: Number,
    },
  ],
  categoryIncomes: [
    {
      category: String,
      amount: Number,
      percentage: Number,
    },
  ],
  accountBreakdown: [
    {
      accountId: mongoose.Schema.Types.ObjectId,
      accountName: String,
      balance: Number,
    },
  ],
  dailySpending: [
    {
      date: Date,
      amount: Number,
    },
  ],
  netSavings: {
    type: Number,
    default: 0,
  },
  savingsRate: Number,
  topExpenseCategory: String,
  topIncomeCategory: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Analytics", AnalyticsSchema);
