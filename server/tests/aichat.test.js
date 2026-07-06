import request from 'supertest';
import app from '../index.js';

describe('AI Chat route', () => {
  it('returns 401 or 503 without token (DB may be unavailable in test)', async () => {
    const res = await request(app).post('/api/aichat/message').send({ message: 'Hi' });
    expect([401, 503]).toContain(res.statusCode);
  }, 20000);
});
