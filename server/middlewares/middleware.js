import jwt from "jsonwebtoken";
import User from "../models/User.js";

const jwtSecret = process.env.JWT_SECRET || "your_super_secret_jwt_key_change_in_production";

export const verifyToken = async (req, res, next) => {
  try {
    console.log("Authorization header:", req.headers.authorization);

    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, jwtSecret);
    console.log("Decoded token:", decoded);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    req.user = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      isAdmin: user.isAdmin,
      subscriptionStatus: user.subscriptionStatus,
      plan: user.plan,
      premiumExpiresAt: user.premiumExpiresAt,
      monthlyBudget: user.monthlyBudget,
    };
    console.log("Authenticated User ID:", user._id.toString());
    next();
  } catch (error) {
    console.error("Middleware error:", error.message);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired" });
    }
    return res
      .status(500)
      .json({ success: false, message: "Authentication failed" });
  }
};

export const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, jwtSecret);
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (err) {
      return res.status(401).json({ message: "Not authorized" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "No token, access denied" });
  }
};

export const verifyAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== "admin" && !req.user.isAdmin)) {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }
  next();
};

export const verifyPremium = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "User authentication required" });
  }

  const isPremiumUser =
    req.user.role === "admin" ||
    req.user.plan === "premium" ||
    req.user.plan === "ultra" ||
    ["active", "trialing"].includes(req.user.subscriptionStatus);

  if (isPremiumUser) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "Premium subscription required to access this resource.",
  });
};
