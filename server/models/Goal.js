import mongoose from "mongoose";

const GoalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    category: { type: String, default: "Savings" },
    targetAmount: { type: Number, required: true },
    savedAmount: { type: Number, default: 0 },
    dueDate: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
    description: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

const GoalModel = mongoose.model("Goal", GoalSchema);
export default GoalModel;
