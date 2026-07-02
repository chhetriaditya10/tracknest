import User from "../models/User.js";

const validRoles = ["free", "premium", "admin"];

export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeSubscriptions = await User.countDocuments({ subscriptionStatus: "active" });
    const canceledSubscriptions = await User.countDocuments({ subscriptionStatus: "canceled" });
    const pastDueSubscriptions = await User.countDocuments({ subscriptionStatus: "past_due" });
    const freeUsers = await User.countDocuments({ role: "free" });
    const adminUsers = await User.countDocuments({ role: "admin" });
    const premiumUsers = await User.countDocuments({ plan: "premium", subscriptionStatus: "active" });
    const ultraPlanUsers = await User.countDocuments({ plan: "ultra", subscriptionStatus: "active" });

    return res.json({
      totalUsers,
      activeSubscriptions,
      canceledSubscriptions,
      pastDueSubscriptions,
      freeUsers,
      adminUsers,
      premiumUsers,
      ultraPlanUsers,
    });
  } catch (error) {
    console.error("Admin stats error:", error.message);
    return res.status(500).json({ error: "Unable to load admin stats" });
  }
};

export const getAdminUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("username email role isAdmin subscriptionStatus plan subscriptionEndDate createdAt")
      .sort({ createdAt: -1 });

    return res.json({ users });
  } catch (error) {
    console.error("Admin users error:", error.message);
    return res.status(500).json({ error: "Unable to load users" });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, isAdmin } = req.body;

    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.role = role;
    if (role === "admin") {
      user.isAdmin = true;
    } else if (typeof isAdmin === "boolean") {
      user.isAdmin = isAdmin;
    } else {
      user.isAdmin = false;
    }

    await user.save();

    return res.json({
      message: "User role updated successfully",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error("Update user role error:", error.message);
    return res.status(500).json({ error: "Unable to update user role" });
  }
};
