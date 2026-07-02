import mongoose from "mongoose";

const InvestmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    category: { type: String, default: "Investments" },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    description: { type: String, default: "" },
    type: { type: String, default: "investment" },
  },
  {
    timestamps: true,
  }
);

const InvestmentModel = mongoose.model("Investment", InvestmentSchema);
export default InvestmentModel;
