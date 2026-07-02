import cron from "node-cron";
import RecurringTransaction from "../models/RecurringTransaction.js";
import Expenses from "../models/Expenses.js";
import Incomes from "../models/Incomes.js";
import { calculateNextDueDate } from "../utils/recurringUtils.js";

export const startRecurringJob = () => {
  cron.schedule("0 1 * * *", async () => {
    try {
      console.log("[RecurringJob] Running daily recurring transaction executor");
      const now = new Date();
      const dueTransactions = await RecurringTransaction.find({
        isActive: true,
        nextDueDate: { $lte: now },
      });

      for (const transaction of dueTransactions) {
        try {
          const recordData = {
            userId: transaction.userId,
            category: transaction.category,
            amount: transaction.amount,
            description: transaction.description || `${transaction.type} recurring transaction`,
            date: transaction.nextDueDate,
          };

          if (transaction.type === "expense") {
            await new Expenses({ ...recordData, month: `${transaction.nextDueDate.getFullYear()}-${transaction.nextDueDate.getMonth() + 1}`, isRecurring: true, frequency: transaction.frequency, nextDueDate: transaction.nextDueDate }).save();
          } else {
            await new Incomes({ ...recordData, month: `${transaction.nextDueDate.getFullYear()}-${transaction.nextDueDate.getMonth() + 1}`, isRecurring: true, frequency: transaction.frequency, nextDueDate: transaction.nextDueDate }).save();
          }

          transaction.lastExecutedDate = transaction.nextDueDate;
          transaction.nextDueDate = calculateNextDueDate(transaction.nextDueDate, transaction.frequency);
          await transaction.save();
        } catch (innerError) {
          console.error("[RecurringJob] Failed to execute transaction", transaction._id, innerError);
        }
      }
    } catch (error) {
      console.error("[RecurringJob] Error running scheduled job", error);
    }
  });
};
