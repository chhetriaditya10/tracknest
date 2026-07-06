import IncomeModel from "../models/Incomes.js";
import ActivityModel from "../models/Activities.js";
import User from "../models/User.js";

export const topUpBalance = async (req, res) => {
  try {
    const requestBody = req.body?.balance || req.body?.income || req.body || {};
    const { amount: rawAmount, note, date: rawDate, category } = requestBody;
    const amount = Number(rawAmount);

    if (rawAmount === undefined || rawAmount === null || Number.isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0",
      });
    }

    const parsedDate = rawDate ? new Date(rawDate) : new Date();
    if (rawDate && Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $inc: { balance: amount } },
      { new: true }
    );

    console.log("Updated user after balance inc:", updatedUser?._id, "balance=", updatedUser?.balance);

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const incomeCategory = category || note || "Income";
    const incomeDescription = note || "Balance top-up";

    const savedIncome = await IncomeModel.create({
      userId: req.user.id,
      category: incomeCategory,
      description: incomeDescription,
      amount,
      date: parsedDate,
      createdAt: parsedDate,
      month: `${parsedDate.getFullYear()}-${parsedDate.getMonth() + 1}`,
    });

    if (process.env.NODE_ENV !== "production") {
      console.log("topUpBalance request body:", requestBody, "user:", req.user?.id);
    }
    console.log("Created income record:", savedIncome?._id, "amount=", savedIncome?.amount, "category=", savedIncome?.category);

    await ActivityModel.create({
      userId: req.user.id,
      type: "income",
      category: incomeCategory,
      amount,
      date: parsedDate,
      createdAt: new Date(),
      status: "completed",
      note,
      referenceId: savedIncome._id,
    });

    if (process.env.NODE_ENV !== "production") {
      console.log("topUpBalance response:", { success: true, balance: updatedUser.balance, incomeId: savedIncome?._id });
    }

    return res.status(200).json({
      success: true,
      balance: updatedUser.balance,
      income: savedIncome,
      message: "Balance updated successfully",
    });
  } catch (error) {
    console.error("Error in topUpBalance:", error);
    console.error("topUpBalance payload:", req.body);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


export const fetchBalance = async (req, res) => {
  try {
    const balances = await IncomeModel.find({ userId: req.user.id })
      .select("category amount date createdAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, balances });
  } catch (error) {
    console.log("Server error during fetching balances:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error during fetching balances",
    });
  }
};
