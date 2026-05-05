import express from "express";
import Account from "../models/Account.js";
import { verifyToken } from "../middlewares/middleware.js";

const router = express.Router();

// Get all accounts for user
router.get("/getAccounts", verifyToken, async (req, res) => {
  try {
    const accounts = await Account.find({ userId: req.user.id });
    res.status(200).json({ accounts });
  } catch (err) {
    res.status(500).json({ message: "Error fetching accounts", error: err.message });
  }
});

// Get single account
router.get("/getAccount/:id", verifyToken, async (req, res) => {
  try {
    const account = await Account.findById(req.params.id);
    if (!account || account.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    res.status(200).json({ account });
  } catch (err) {
    res.status(500).json({ message: "Error fetching account", error: err.message });
  }
});

// Create new account
router.post("/createAccount", verifyToken, async (req, res) => {
  try {
    const { accountName, accountType, currency, balance, color, icon, description } = req.body;

    const newAccount = new Account({
      userId: req.user.id,
      accountName,
      accountType,
      currency,
      balance,
      color: color || "#3b82f6",
      icon: icon || "💰",
      description,
    });

    await newAccount.save();
    res.status(201).json({ message: "Account created successfully", account: newAccount });
  } catch (err) {
    res.status(500).json({ message: "Error creating account", error: err.message });
  }
});

// Update account
router.put("/updateAccount/:id", verifyToken, async (req, res) => {
  try {
    const account = await Account.findById(req.params.id);
    if (!account || account.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { accountName, balance, color, icon, description, isDefault } = req.body;
    
    if (accountName) account.accountName = accountName;
    if (balance !== undefined) account.balance = balance;
    if (color) account.color = color;
    if (icon) account.icon = icon;
    if (description) account.description = description;
    if (isDefault !== undefined) {
      if (isDefault) {
        // Set all other accounts to non-default
        await Account.updateMany({ userId: req.user.id }, { isDefault: false });
      }
      account.isDefault = isDefault;
    }

    account.updatedAt = Date.now();
    await account.save();
    res.status(200).json({ message: "Account updated successfully", account });
  } catch (err) {
    res.status(500).json({ message: "Error updating account", error: err.message });
  }
});

// Delete account
router.delete("/deleteAccount/:id", verifyToken, async (req, res) => {
  try {
    const account = await Account.findById(req.params.id);
    if (!account || account.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Account.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting account", error: err.message });
  }
});

// Set default account
router.post("/setDefaultAccount/:id", verifyToken, async (req, res) => {
  try {
    const account = await Account.findById(req.params.id);
    if (!account || account.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Set all accounts to non-default
    await Account.updateMany({ userId: req.user.id }, { isDefault: false });

    // Set this account as default
    account.isDefault = true;
    await account.save();

    res.status(200).json({ message: "Default account set", account });
  } catch (err) {
    res.status(500).json({ message: "Error setting default account", error: err.message });
  }
});

export default router;

