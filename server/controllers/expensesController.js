import ExpenseModel from "../models/Expenses.js";
import ActivityModel from "../models/Activities.js";
import BudgetModel from "../models/Budget.js";
import RecurringTransaction from "../models/RecurringTransaction.js";

// Add Expense
export const addExpense = async (req, res) => {
  try {
    const { expense } = req.body;

    // Validate fields (amount, date, etc.)
    if (!expense || !expense.category || !expense.amount || !expense.date) {
      return res
        .status(400)
        .json({ success: false, message: "Missing fields" });
    }

    // Save expense
    const expenseDate = new Date(expense.date);
    const newExpense = new ExpenseModel({
      ...expense,
      userId: req.user.id,
      date: expenseDate,
      month: `${expenseDate.getFullYear()}-${expenseDate.getMonth() + 1}`,
      createdAt: expenseDate,
      isRecurring: expense.isRecurring || false,
      frequency: expense.isRecurring ? expense.frequency : null,
      nextDueDate: expense.isRecurring ? new Date(expense.nextDueDate) : null,
    });

    const savedExpense = await newExpense.save();

    const activeBudgets = await BudgetModel.find({ userId: req.user.id, isActive: true });
    const expenseAmount = Number(expense.amount || 0);

    if (activeBudgets.length > 0) {
      await Promise.all(
        activeBudgets.map((budget) =>
          BudgetModel.findByIdAndUpdate(
            budget._id,
            { $inc: { spent: expenseAmount } },
            { new: true }
          )
        )
      );
    }

    // ✅ Create activity record (server-side)
    const newActivity = new ActivityModel({
      userId: req.user.id,
      type: "expense",
      category: expense.category,
      amount: expense.amount,
      date: expense.date,
      referenceId: savedExpense._id,
    });

    await newActivity.save();

    return res.status(201).json({
      success: true,
      data: savedExpense,
    });
  } catch (error) {
    console.error("Error in addExpense:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Fetch Expense
export const fetchExpense = async (req, res) => {
  try {
    const expenses = await ExpenseModel.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    return res.status(200).json({ success: true, expenses });
  } catch (error) {
    console.log("Server error during fetching expenses:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error during fetching of expense",
    });
  }
};
