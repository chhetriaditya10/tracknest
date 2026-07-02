import { jest } from '@jest/globals';

const findByIdAndUpdate = jest.fn();
const createIncome = jest.fn();
const createActivity = jest.fn();

jest.unstable_mockModule('../models/User.js', () => ({
  default: { findByIdAndUpdate },
}));

jest.unstable_mockModule('../models/Incomes.js', () => ({
  default: { create: createIncome },
}));

jest.unstable_mockModule('../models/Activities.js', () => ({
  default: { create: createActivity },
}));

const { topUpBalance } = await import('../controllers/incomesController.js');

describe('topUpBalance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates the user balance and returns the new balance for a valid top-up', async () => {
    findByIdAndUpdate.mockResolvedValue({ _id: 'user-123', balance: 1500 });
    createIncome.mockResolvedValue({});
    createActivity.mockResolvedValue({});

    const req = {
      body: { amount: 1500, note: 'Initial deposit', date: '2026-07-02' },
      user: { id: 'user-123' },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await topUpBalance(req, res);

    expect(findByIdAndUpdate).toHaveBeenCalledWith(
      'user-123',
      { $inc: { balance: 1500 } },
      { new: true }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, balance: 1500 })
    );
  });

  it('rejects non-positive amounts', async () => {
    const req = {
      body: { amount: 0 },
      user: { id: 'user-123' },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await topUpBalance(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'Amount must be greater than 0' })
    );
  });
});
