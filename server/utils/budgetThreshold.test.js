import { calculateBudgetThreshold } from "./budgetThreshold.js";

describe("calculateBudgetThreshold", () => {
  test("returns Safe when spent is below warning threshold", () => {
    const result = calculateBudgetThreshold(4000, 10000);
    expect(result.budgetStatus).toBe("Safe");
    expect(result.thresholdPercentage).toBe(40);
    expect(result.remainingBudget).toBe(6000);
    expect(result.exceededAmount).toBe(0);
    expect(result.warningMessage).toBe("You have used 40% of your budget");
  });

  test("returns Warning when spent is at or above 80% and below or equal limit", () => {
    const result = calculateBudgetThreshold(8500, 10000);
    expect(result.budgetStatus).toBe("Warning");
    expect(result.thresholdPercentage).toBe(85);
    expect(result.remainingBudget).toBe(1500);
    expect(result.exceededAmount).toBe(0);
    expect(result.warningMessage).toBe("You have used 85% of your budget");
  });

  test("returns Exceeded when spent exceeds limit", () => {
    const result = calculateBudgetThreshold(23000, 20000);
    expect(result.budgetStatus).toBe("Exceeded");
    expect(result.thresholdPercentage).toBe(115);
    expect(result.remainingBudget).toBe(0);
    expect(result.exceededAmount).toBe(3000);
    expect(result.warningMessage).toBe("Budget exceeded by Rs 3000");
  });

  test("handles zero limit correctly when spent is positive", () => {
    const result = calculateBudgetThreshold(500, 0);
    expect(result.budgetStatus).toBe("Exceeded");
    expect(result.thresholdPercentage).toBe(0);
    expect(result.remainingBudget).toBe(0);
    expect(result.exceededAmount).toBe(500);
    expect(result.warningMessage).toBe("Budget exceeded by Rs 500");
  });
});
