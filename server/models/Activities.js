import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: { type: String, required: true }, // 'expense', 'income', 'balance_topup'
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "completed", // FIX: transactions are instant, so default to completed
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Activity", activitySchema);