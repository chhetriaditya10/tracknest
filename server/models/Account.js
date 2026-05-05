import mongoose from "mongoose";

const AccountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  accountName: {
    type: String,
    required: true, // e.g., "Main Wallet", "Bank Account", "Credit Card"
  },
  accountType: {
    type: String,
    enum: ["wallet", "bank", "credit_card"],
    default: "wallet",
    required: true,
  },
  currency: {
    type: String,
    default: "USD",
  },
  balance: {
    type: Number,
    default: 0,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  color: {
    type: String,
    default: "#3b82f6",
  },
  icon: {
    type: String,
    default: "💰",
  },
  description: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Account", AccountSchema);
