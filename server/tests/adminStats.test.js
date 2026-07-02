import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { getAdminStats } from '../controllers/adminController.js';

describe('getAdminStats', () => {
  let mongoServer;
  let mongoAvailable = true;

  beforeAll(async () => {
    try {
      mongoServer = await MongoMemoryServer.create();
      await mongoose.connect(mongoServer.getUri());
    } catch (_error) {
      mongoAvailable = false;
    }
  });

  afterAll(async () => {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  beforeEach(async () => {
    if (!mongoAvailable) {
      return;
    }
    await User.deleteMany({});
  });

  it('counts premium and ultra users from plan and subscription status', async () => {
    if (!mongoAvailable) {
      return;
    }

    const hashedPassword = await bcrypt.hash('password123', 10);

    await User.create([
      {
        username: 'premium-active',
        email: 'premium-active@example.com',
        password: hashedPassword,
        role: 'free',
        plan: 'premium',
        subscriptionStatus: 'active',
      },
      {
        username: 'ultra-active',
        email: 'ultra-active@example.com',
        password: hashedPassword,
        role: 'free',
        plan: 'ultra',
        subscriptionStatus: 'active',
      },
      {
        username: 'premium-canceled',
        email: 'premium-canceled@example.com',
        password: hashedPassword,
        role: 'free',
        plan: 'premium',
        subscriptionStatus: 'canceled',
      },
      {
        username: 'admin-user',
        email: 'admin-user@example.com',
        password: hashedPassword,
        role: 'admin',
        plan: 'ultra',
        isAdmin: true,
        subscriptionStatus: 'active',
      },
    ]);

    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await getAdminStats({}, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      totalUsers: 4,
      premiumUsers: 1,
      ultraPlanUsers: 2,
      activeSubscriptions: 3,
      canceledSubscriptions: 1,
    }));
  });
});
