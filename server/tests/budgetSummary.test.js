import { jest } from '@jest/globals';

const BudgetFind = jest.fn();
const ExpenseFind = jest.fn();
const calculateBudgetThreshold = jest.fn((totalSpent, totalLimit) => {
  const percentage = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;
  const status = totalSpent > totalLimit ? 'Exceeded' : percentage >= 80 ? 'Warning' : 'Safe';
  return {
    budgetStatus: status,
    warningMessage: status === 'Exceeded' ? `Budget exceeded by Rs ${totalSpent - totalLimit}` : `You have used ${percentage}% of your budget`,
    thresholdPercentage: percentage,
    warningThreshold: 80,
    remainingBudget: Math.max(totalLimit - totalSpent, 0),
    exceededAmount: Math.max(totalSpent - totalLimit, 0),
  };
});

jest.unstable_mockModule('../models/Budget.js', () => ({
  default: {
    find: BudgetFind,
  },
}));

jest.unstable_mockModule('../models/Expenses.js', () => ({
  default: {
    find: ExpenseFind,
  },
}));

jest.unstable_mockModule('../utils/budgetThreshold.js', () => ({
  calculateBudgetThreshold,
}));

const { getBudgetSummaryHandler } = await import('../routes/budgetRoutes.js');

describe('Budget summary handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    BudgetFind.mockImplementation(() => ({ lean: jest.fn().mockResolvedValue([]) }));
    ExpenseFind.mockImplementation(() => ({ lean: jest.fn().mockResolvedValue([
      { amount: 1000, date: new Date().toISOString() },
      { amount: 2000, date: new Date().toISOString() },
    ]) }));
  });

  it('returns summary from monthlyBudget and current expenses when user has no budgets', async () => {
    const req = {
      user: {
        id: '64dcd2fd5b8b1e4b2c9f0f1a',
        monthlyBudget: 10000,
      },
    };
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const res = { status };

    await getBudgetSummaryHandler(req, res);

    expect(BudgetFind).toHaveBeenCalledWith({});
    expect(ExpenseFind).toHaveBeenCalledWith({
      userId: expect.any(Object),
      date: expect.objectContaining({ $gte: expect.any(Date), $lt: expect.any(Date) }),
    });
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({
      summary: expect.objectContaining({
        totalLimit: 10000,
        totalSpent: 3000,
        thresholdPercentage: 30,
        budgetStatus: 'Safe',
        remainingBudget: 7000,
        exceededAmount: 0,
      }),
    });
  });
});
