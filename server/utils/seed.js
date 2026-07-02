import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import User from "../models/User.js";
import Account from "../models/Account.js";
import ExpenseModel from "../models/Expenses.js";
import IncomeModel from "../models/Incomes.js";
import Budget from "../models/Budget.js";
import ActivityModel from "../models/Activities.js";
import bcrypt from "bcrypt";

const __filename = fileURLToPath(import.meta.url);

dotenv.config();

const connectToDb = async (mongoUri = process.env.MONGO_URL) => {
  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    throw error;
  }
};

const seedData = async ({ closeConnection = true } = {}) => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Account.deleteMany({});
    await ExpenseModel.deleteMany({});
    await IncomeModel.deleteMany({});
    await Budget.deleteMany({});
    await ActivityModel.deleteMany({});

    console.log("🧹 Cleared existing data");

    // Create users
    const hashedPassword = await bcrypt.hash("password123", 10);

    const users = [
      {
        username: "john_doe",
        email: "john@example.com",
        password: hashedPassword,
        isVerified: true,
        role: "premium",
        profilePicture: "",
        theme: "light",
        preferences: {
          currency: "USD",
          dateFormat: "MM/DD/YYYY",
          timeZone: "America/New_York",
        },
        subscriptionStatus: "active",
        plan: "premium",
        balance: 4200,
        stripeCustomerId: "cus_john_doe",
        stripeSubscriptionId: "sub_john_premium",
        premiumExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      },
      {
        username: "jane_smith",
        email: "jane@example.com",
        password: hashedPassword,
        isVerified: true,
        role: "free",
        profilePicture: "",
        theme: "dark",
        preferences: {
          currency: "USD",
          dateFormat: "MM/DD/YYYY",
          timeZone: "America/Los_Angeles",
        },
        subscriptionStatus: "none",
        plan: "free",
        balance: 1800,
      },
      {
        username: "admin_user",
        email: "admin@tracknest.com",
        password: hashedPassword,
        isVerified: true,
        role: "admin",
        isAdmin: true,
        profilePicture: "",
        theme: "light",
        preferences: {
          currency: "USD",
          dateFormat: "MM/DD/YYYY",
          timeZone: "America/Chicago",
        },
        subscriptionStatus: "active",
        plan: "ultra",
        balance: 12000,
        stripeCustomerId: "cus_admin_user",
        stripeSubscriptionId: "sub_admin_ultra",
        premiumExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    ];

    const createdUsers = await User.insertMany(users);
    console.log("👥 Created users:", createdUsers.length);

    // Create accounts for each user
    const accounts = [];
    for (const user of createdUsers) {
      accounts.push(
        {
          userId: user._id,
          accountName: "Main Wallet",
          accountType: "wallet",
          currency: "USD",
          balance: 1500.00,
          isDefault: true,
          color: "#3b82f6",
          icon: "💰",
          description: "Primary wallet for daily expenses",
        },
        {
          userId: user._id,
          accountName: "Bank Account",
          accountType: "bank",
          currency: "USD",
          balance: 5000.00,
          isDefault: false,
          color: "#10b981",
          icon: "🏦",
          description: "Savings and checking account",
        },
        {
          userId: user._id,
          accountName: "Credit Card",
          accountType: "credit_card",
          currency: "USD",
          balance: -250.00,
          isDefault: false,
          color: "#ef4444",
          icon: "💳",
          description: "Credit card for purchases",
        }
      );
    }

    const createdAccounts = await Account.insertMany(accounts);
    console.log("🏦 Created accounts:", createdAccounts.length);

    // Create expenses
    const expenseCategories = ["Food & Dining", "Transportation", "Entertainment", "Shopping", "Bills & Utilities", "Healthcare", "Education", "Travel"];
    const expenses = [];

    for (const user of createdUsers) {
      for (let i = 0; i < 20; i++) {
        const randomDays = Math.floor(Math.random() * 90); // Last 3 months
        const date = new Date(Date.now() - randomDays * 24 * 60 * 60 * 1000);
        const category = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
        const amount = Math.floor(Math.random() * 200) + 10; // $10 to $210

        expenses.push({
          userId: user._id,
          category,
          amount,
          date,
          month: date.toLocaleString('default', { month: 'long' }),
        });
      }

      // Add a couple of explicit outliers so anomaly detection can trigger
      const anomalyDates = [
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      ];

      expenses.push(
        {
          userId: user._id,
          category: "Travel",
          amount: 1200,
          date: anomalyDates[0],
          month: anomalyDates[0].toLocaleString('default', { month: 'long' }),
        },
        {
          userId: user._id,
          category: "Shopping",
          amount: 900,
          date: anomalyDates[1],
          month: anomalyDates[1].toLocaleString('default', { month: 'long' }),
        }
      );
    }

    const createdExpenses = await ExpenseModel.insertMany(expenses);
    console.log("💸 Created expenses:", createdExpenses.length);

    // Create incomes
    const incomeCategories = ["Salary", "Freelance", "Investment", "Business", "Gift", "Other"];
    const incomes = [];

    for (const user of createdUsers) {
      for (let i = 0; i < 10; i++) {
        const randomDays = Math.floor(Math.random() * 90);
        const date = new Date(Date.now() - randomDays * 24 * 60 * 60 * 1000);
        const category = incomeCategories[Math.floor(Math.random() * incomeCategories.length)];
        const amount = Math.floor(Math.random() * 3000) + 500; // $500 to $3500

        incomes.push({
          userId: user._id,
          category,
          amount,
          date,
          month: date.toLocaleString('default', { month: 'long' }),
        });
      }
    }

    const createdIncomes = await IncomeModel.insertMany(incomes);
    console.log("💰 Created incomes:", createdIncomes.length);

    // Create budgets
    const budgets = [];
    for (const user of createdUsers) {
      budgets.push(
        {
          userId: user._id,
          budgetName: "Monthly Food Budget",
          budgetType: "category",
          category: "Food & Dining",
          limit: 600,
          spent: 0,
          period: "month",
          startDate: new Date(),
          alerts: [
            { threshold: 50, enabled: true, notificationMethod: "app" },
            { threshold: 80, enabled: true, notificationMethod: "email" },
            { threshold: 100, enabled: true, notificationMethod: "both" },
          ],
          status: "safe",
          isActive: true,
        },
        {
          userId: user._id,
          budgetName: "Transportation Budget",
          budgetType: "category",
          category: "Transportation",
          limit: 300,
          spent: 0,
          period: "month",
          startDate: new Date(),
          alerts: [
            { threshold: 75, enabled: true, notificationMethod: "app" },
            { threshold: 100, enabled: true, notificationMethod: "both" },
          ],
          status: "safe",
          isActive: true,
        },
        {
          userId: user._id,
          budgetName: "Overall Monthly Budget",
          budgetType: "monthly",
          limit: 2500,
          spent: 0,
          period: "month",
          startDate: new Date(),
          alerts: [
            { threshold: 60, enabled: true, notificationMethod: "app" },
            { threshold: 90, enabled: true, notificationMethod: "email" },
          ],
          status: "safe",
          isActive: true,
        }
      );
    }

    const createdBudgets = await Budget.insertMany(budgets);
    console.log("📊 Created budgets:", createdBudgets.length);

    // Create activities (combining expenses and incomes)
    const activities = [];

    // Add expense activities
    for (const expense of createdExpenses.slice(0, 50)) { // Limit to avoid too many
      activities.push({
        userId: expense.userId,
        type: "expense",
        category: expense.category,
        amount: expense.amount,
        date: expense.date,
      });
    }

    // Add income activities
    for (const income of createdIncomes.slice(0, 30)) {
      activities.push({
        userId: income.userId,
        type: "income",
        category: income.category,
        amount: income.amount,
        date: income.date,
      });
    }

    const createdActivities = await ActivityModel.insertMany(activities);
    console.log("📈 Created activities:", createdActivities.length);

    console.log("🎉 Database seeded successfully!");
    console.log("Sample login credentials:");
    console.log("Username: john_doe, Password: password123");
    console.log("Username: jane_smith, Password: password123");
    console.log("Username: admin_user, Password: password123");

  } catch (error) {
    console.error("❌ Error seeding data:", error);
  } finally {
    if (closeConnection) {
      mongoose.connection.close();
    }
  }
};

export { connectToDb, seedData };