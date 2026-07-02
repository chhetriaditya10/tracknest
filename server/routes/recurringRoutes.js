import express from "express";
import RecurringTransaction from "../models/RecurringTransaction.js";
import Expenses from "../models/Expenses.js";
import Incomes from "../models/Incomes.js";
import { verifyToken } from "../middlewares/middleware.js";
import {
  calculateNextDueDate,
  getUpcomingRecurringOccurrences,
} from "../utils/recurringUtils.js";

console.log("Loaded recurringRoutes.js");
const router = express.Router();

// Get all recurring transactions
router.get("/getRecurring", verifyToken, async (req, res) => {
  try {
    const [expenseRecurring, incomeRecurring] = await Promise.all([
      Expenses.find({ userId: req.user.id, isRecurring: true }),
      Incomes.find({ userId: req.user.id, isRecurring: true }),
    ]);

    const recurring = [...expenseRecurring, ...incomeRecurring]
      .map((item) => ({
        _id: item._id,
        type: item.type || (item.amount >= 0 ? "expense" : "income"),
        category: item.category,
        description: item.description,
        amount: item.amount,
        frequency: item.frequency,
        nextDueDate: item.nextDueDate,
        isRecurring: item.isRecurring,
      }))
      .sort((a, b) => new Date(a.nextDueDate || a.date) - new Date(b.nextDueDate || b.date));

    res.status(200).json({ recurring });
  } catch (err) {
    res.status(500).json({ message: "Error fetching recurring transactions", error: err.message });
  }
});

// Get upcoming recurring activity for dashboard
router.get("/upcoming", verifyToken, async (req, res) => {
  try {
    const [expenseRecurring, incomeRecurring] = await Promise.all([
      Expenses.find({ userId: req.user.id, isRecurring: true }),
      Incomes.find({ userId: req.user.id, isRecurring: true }),
    ]);

    const allRecurring = [...expenseRecurring, ...incomeRecurring];
    const upcoming = getUpcomingRecurringOccurrences(allRecurring, 90, 10);

    if (!upcoming.length) {
      return res.status(200).json({
        success: true,
        upcoming: [],
        message: "No upcoming activity — add a recurring bill to get started.",
      });
    }

    res.status(200).json({ success: true, upcoming });
  } catch (err) {
    res.status(500).json({ message: "Error fetching upcoming activity", error: err.message });
  }
});

// Create recurring transaction
router.post("/createRecurring", verifyToken, async (req, res) => {
  try {
    const { type, amount, category, description, frequency, startDate } = req.body;

    const nextDueDate = calculateNextDueDate(startDate, frequency);

    const newRecurring = new RecurringTransaction({
      userId: req.user.id,
      type,
      amount,
      category,
      description,
      frequency,
      startDate: new Date(startDate),
      nextDueDate,
      isActive: true,
    });

    await newRecurring.save();
    res.status(201).json({ message: "Recurring transaction created", recurring: newRecurring });
  } catch (err) {
    res.status(500).json({ message: "Error creating recurring transaction", error: err.message });
  }
});

// Update recurring transaction
router.put("/updateRecurring/:id", verifyToken, async (req, res) => {
  try {
    const recurring = await RecurringTransaction.findById(req.params.id);
    if (!recurring || recurring.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { amount, category, description, frequency, isActive } = req.body;

    if (amount !== undefined) recurring.amount = amount;
    if (category) recurring.category = category;
    if (description) recurring.description = description;
    if (frequency) recurring.frequency = frequency;
    if (isActive !== undefined) recurring.isActive = isActive;

    await recurring.save();
    res.status(200).json({ message: "Recurring transaction updated", recurring });
  } catch (err) {
    res.status(500).json({ message: "Error updating recurring transaction", error: err.message });
  }
});

// Delete recurring transaction
router.delete("/deleteRecurring/:id", verifyToken, async (req, res) => {
  try {
    const recurring = await RecurringTransaction.findById(req.params.id);
    if (!recurring || recurring.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await RecurringTransaction.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Recurring transaction deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting recurring transaction", error: err.message });
  }
});

// Pay a specific recurring bill/transaction and advance the next due date
router.post("/pay/:id", verifyToken, async (req, res) => {
  try {
    const transaction = await RecurringTransaction.findById(req.params.id);
    if (!transaction || transaction.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const now = new Date();
    if (transaction.type === "expense") {
      const newExpense = new Expenses({
        userId: req.user.id,
        category: transaction.category,
        amount: transaction.amount,
        description: transaction.description || `Recurring: ${transaction.description}`,
        date: now,
      });
      await newExpense.save();
    } else {
      const newIncome = new Incomes({
        userId: req.user.id,
        category: transaction.category,
        amount: transaction.amount,
        description: transaction.description || `Recurring: ${transaction.description}`,
        date: now,
      });
      await newIncome.save();
    }

    transaction.lastExecutedDate = now;
    transaction.nextDueDate = calculateNextDueDate(now, transaction.frequency);
    await transaction.save();

    return res.status(200).json({ message: "Recurring transaction paid", transaction });
  } catch (err) {
    res.status(500).json({ message: "Error paying recurring transaction", error: err.message });
  }
});

// Execute due recurring transactions
router.post("/executeDue", verifyToken, async (req, res) => {
  try {
    const now = new Date();
    const dueTransactions = await RecurringTransaction.find({
      userId: req.user.id,
      isActive: true,
      nextDueDate: { $lte: now },
    });

    const results = [];

    for (const transaction of dueTransactions) {
      try {
        if (transaction.type === "expense") {
          const newExpense = new Expenses({
            userId: req.user.id,
            category: transaction.category,
            amount: transaction.amount,
            description: transaction.description || `Recurring: ${transaction.description}`,
            date: now,
          });
          await newExpense.save();
        } else {
          const newIncome = new Incomes({
            userId: req.user.id,
            category: transaction.category,
            amount: transaction.amount,
            description: transaction.description || `Recurring: ${transaction.description}`,
            date: now,
          });
          await newIncome.save();
        }

        // Update next due date
        transaction.lastExecutedDate = now;
        transaction.nextDueDate = calculateNextDueDate(now, transaction.frequency);
        await transaction.save();

        results.push({ id: transaction._id, status: "executed" });
      } catch (error) {
        results.push({ id: transaction._id, status: "failed", error: error.message });
      }
    }

    res.status(200).json({ message: "Recurring transactions executed", results });
  } catch (err) {
    res.status(500).json({ message: "Error executing recurring transactions", error: err.message });
  }
});

export default router;
