// Updated User.js
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    role: { type: String, enum: ["free", "premium", "admin"], default: "free" },
    isAdmin: { type: Boolean, default: false },
    verificationCode: { type: String },
    codeExpires: { type: Date },
    profilePicture: { type: String, default: "" },
    theme: { type: String, enum: ["light", "dark"], default: "dark" },
    preferences: {
      currency: { type: String, default: "NPR" },
      dateFormat: { type: String, default: "DD/MM/YYYY" },
      timeZone: { type: String, default: "Asia/Kathmandu" },
    },
    subscriptionStatus: { type: String, enum: ["none", "active", "canceled", "past_due"], default: "none" },
    stripeCustomerId: { type: String, default: "" },
    stripeSubscriptionId: { type: String, default: "" },
    balance: { type: Number, default: 0 },
    plan: { type: String, enum: ["free", "premium", "ultra", "admin"], default: "free" },
    premiumExpiresAt: { type: Date },
    monthlyBudget: { type: Number, default: null },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
export default User;
