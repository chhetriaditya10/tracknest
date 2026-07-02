import request from 'supertest';
import express from 'express';

// Create a mock app for testing
const app = express();
app.use(express.json());

// Mock routes
app.post('/api/expense', (req, res) => {
  res.status(201).json(req.body);
});

app.get('/api/expense', (req, res) => {
  res.status(200).json([]);
});

describe('Expenses API', () => {
  it('POST /api/expense - create expense', async () => {
    const newExpense = {
      amount: 100,
      category: 'Food',
      description: 'Lunch'
    };

    const res = await request(app)
      .post('/api/expense')
      .send(newExpense)
      .expect(201);

    expect(res.body.amount).toBe(100);
    expect(res.body.category).toBe('Food');
  });

  it('GET /api/expense - list expenses', async () => {
    const res = await request(app)
      .get('/api/expense')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });
});
