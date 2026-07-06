import app from './index.js';
import mongoose from 'mongoose';
import request from 'supertest';

const waitForDb = async () => {
  const max = 10000;
  const interval = 100;
  let waited = 0;
  while (mongoose.connection.readyState !== 1 && waited < max) {
    await new Promise((resolve) => setTimeout(resolve, interval));
    waited += interval;
  }
  if (mongoose.connection.readyState !== 1) {
    throw new Error('DB not connected');
  }
};

(async () => {
  try {
    await waitForDb();
    console.log('DB connected');
    for (const url of ['/api/balance', '/api/balance/addIncome', '/api/balance/getBalances']) {
      const res = await request(app).post(url).send({ amount: 1 }).set('Authorization', 'Bearer invalidtoken');
      console.log('POST', url, 'status', res.status, 'body', res.text);
    }
    const res2 = await request(app).get('/api/balance/getBalances').set('Authorization', 'Bearer invalidtoken');
    console.log('GET /api/balance/getBalances', res2.status, res2.text);
  } catch (err) {
    console.error(err);
  }
})();