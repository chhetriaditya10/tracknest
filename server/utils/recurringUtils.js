export const validRecurringFrequencies = [
  "weekly",
  "monthly",
  "yearly",
];

export const calculateNextDueDate = (baseDate, frequency) => {
  const date = new Date(baseDate);

  switch (frequency) {
    case "weekly":
      date.setDate(date.getDate() + 7);
      break;
    case "monthly":
      date.setMonth(date.getMonth() + 1);
      break;
    case "yearly":
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      date.setMonth(date.getMonth() + 1);
      break;
  }

  return date;
};

export const convertToMonthlyAmount = (amount, frequency) => {
  const numericAmount = Number(amount) || 0;
  switch (frequency) {
    case "weekly":
      return numericAmount * 4.33;
    case "monthly":
      return numericAmount;
    case "yearly":
      return numericAmount / 12;
    default:
      return numericAmount;
  }
};

export const generateProjectedOccurrences = (transaction, horizonDays = 90, maxOccurrences = 5) => {
  if (!transaction || !transaction.nextDueDate || !transaction.frequency) {
    return [];
  }

  const occurrences = [];
  let nextDate = new Date(transaction.nextDueDate);
  const horizon = new Date();
  horizon.setDate(horizon.getDate() + horizonDays);
  let count = 0;

  while (count < maxOccurrences && nextDate <= horizon) {
    occurrences.push({
      occurrenceId: `${transaction._id}-${count}`,
      _id: transaction._id,
      category: transaction.category,
      description: transaction.description,
      amount: transaction.amount,
      type: transaction.type,
      frequency: transaction.frequency,
      nextDueDate: new Date(nextDate),
      isRecurring: transaction.isRecurring,
      originalStartDate: transaction.startDate,
    });

    nextDate = calculateNextDueDate(nextDate, transaction.frequency);
    count += 1;
  }

  return occurrences;
};

export const getUpcomingRecurringOccurrences = (transactions, horizonDays = 90, limit = 10) => {
  const allOccurrences = transactions.flatMap((transaction) =>
    generateProjectedOccurrences(transaction, horizonDays, 3)
  );

  return allOccurrences
    .sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate))
    .slice(0, limit);
};
