import express from "express";
import { verifyToken, verifyAdmin } from "../middlewares/middleware.js";
import { getAdminStats, getAdminUsers, updateUserRole } from "../controllers/adminController.js";

const router = express.Router();

router.use(verifyToken, verifyAdmin);

router.get("/stats", getAdminStats);
router.get("/users", getAdminUsers);
router.put("/users/:id/role", updateUserRole);

export default router;
