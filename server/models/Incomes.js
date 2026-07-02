import mongoose from "mongoose";

const incomeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: { type: String, required: true },
    description: { type: String, default: "" },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    month: String,
    isRecurring: { type: Boolean, default: false },
    frequency: {
      type: String,
      enum: ["weekly", "monthly", "yearly"],
      default: null,
    },
    nextDueDate: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

const IncomeModel = mongoose.model("Income", incomeSchema);
export default IncomeModel;
