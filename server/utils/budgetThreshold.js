export function calculateBudgetThreshold(totalSpent, totalLimit, warningThreshold = 80) {
  const spent = Number(totalSpent) || 0;
  const limit = Number(totalLimit) || 0;
  const thresholdPercentage = limit > 0 ? Math.round((spent / limit) * 100) : 0;

  let budgetStatus = "Safe";
  let warningMessage = `You have used ${thresholdPercentage}% of your budget`;
  let remainingBudget = 0;
  let exceededAmount = 0;

  if (limit <= 0) {
    if (spent > 0) {
      budgetStatus = "Exceeded";
      exceededAmount = spent;
      remainingBudget = 0;
      warningMessage = `Budget exceeded by Rs ${exceededAmount}`;
    } else {
      budgetStatus = "Safe";
      remainingBudget = 0;
      warningMessage = `You have used ${thresholdPercentage}% of your budget`;
    }
  } else if (spent > limit) {
    budgetStatus = "Exceeded";
    exceededAmount = spent - limit;
    remainingBudget = 0;
    warningMessage = `Budget exceeded by Rs ${exceededAmount}`;
  } else if (thresholdPercentage >= warningThreshold) {
    budgetStatus = "Warning";
    remainingBudget = limit - spent;
  } else {
    budgetStatus = "Safe";
    remainingBudget = limit - spent;
  }

  return {
    budgetStatus,
    warningMessage,
    thresholdPercentage,
    remainingBudget,
    exceededAmount,
    warningThreshold,
  };
}
