import { jest } from '@jest/globals';

const saveExpense = jest.fn();
const saveActivity = jest.fn();
const budgetFind = jest.fn();
const budgetUpdate = jest.fn();

const ExpenseMock = jest.fn().mockImplementation((data) => ({ ...data, save: saveExpense }));
const ActivityMock = jest.fn().mockImplementation((data) => ({ ...data, save: saveActivity }));

jest.unstable_mockModule('../models/Expenses.js', () => ({
  default: ExpenseMock,
}));

jest.unstable_mockModule('../models/Activities.js', () => ({
  default: ActivityMock,
}));

jest.unstable_mockModule('../models/Budget.js', () => ({
  default: {
    find: budgetFind,
    findByIdAndUpdate: budgetUpdate,
  },
}));

const { addExpense } = await import('../controllers/expensesController.js');

describe('addExpense', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('increments active budget spent without changing the budget limit', async () => {
    saveExpense.mockResolvedValue({ _id: 'exp-1', amount: 1000 });
    saveActivity.mockResolvedValue({});
    budgetFind.mockResolvedValue([{ _id: 'budget-1', limit: 10000, spent: 0, isActive: true }]);
    budgetUpdate.mockResolvedValue({ _id: 'budget-1', limit: 10000, spent: 1000, isActive: true });

    const req = {
      body: {
        expense: {
          category: 'Food',
          amount: 1000,
          date: '2026-07-02',
        },
      },
      user: { id: 'user-1' },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await addExpense(req, res);

    expect(budgetFind).toHaveBeenCalledWith({ userId: 'user-1', isActive: true });
    expect(budgetUpdate).toHaveBeenCalledWith('budget-1', { $inc: { spent: 1000 } }, { new: true });
    expect(res.status).toHaveBeenCalledWith(201);
  });
});
