import mongoose from "mongoose";

const RecurringTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
  },
  type: {
    type: String,
    enum: ["income", "expense"],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  category: String,
  description: String,
  frequency: {
    type: String,
    enum: ["daily", "weekly", "biweekly", "monthly", "quarterly", "yearly"],
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: Date,
  isActive: {
    type: Boolean,
    default: true,
  },
  lastExecutedDate: Date,
  nextDueDate: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("RecurringTransaction", RecurringTransactionSchema);
