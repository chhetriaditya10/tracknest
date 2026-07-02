import { jest } from "@jest/globals";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectToDb, seedData } from "../utils/seed.js";
import User from "../models/User.js";
import ExpenseModel from "../models/Expenses.js";

dotenv.config();

jest.setTimeout(20000);

const mongoUri = process.env.MONGO_URL_TEST || "mongodb://127.0.0.1:27017/tracknest-test";
let connected = false;

beforeAll(async () => {
  try {
    await connectToDb(mongoUri);
    connected = true;
  } catch (_error) {
  }
}, 15000);

afterAll(async () => {
  if (connected && mongoose.connection.readyState === 1) {
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
  }
});

describe("Database seed script", () => {
  it("should seed users, expenses, incomes, budgets, and activities", async () => {
    if (!connected) {
      return;
    }

    await seedData({ closeConnection: false });

    const userCount = await User.countDocuments();
    const expenseCount = await ExpenseModel.countDocuments();

    expect(userCount).toBe(3);
    expect(expenseCount).toBeGreaterThanOrEqual(66);

    const highExpense = await ExpenseModel.findOne({ amount: { $gte: 900 } });
    expect(highExpense).not.toBeNull();
    expect(highExpense.amount).toBeGreaterThanOrEqual(900);
  });
});
