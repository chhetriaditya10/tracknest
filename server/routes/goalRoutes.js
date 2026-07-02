import express from "express";
import { verifyToken } from "../middlewares/middleware.js";
import { addGoal, fetchGoals, updateGoal, completeGoal, getGoalSummary } from "../controllers/goalsController.js";

const router = express.Router();

router.post("/addGoal", verifyToken, addGoal);
router.get("/getGoals", verifyToken, fetchGoals);
router.put("/updateGoal/:id", verifyToken, updateGoal);
router.put("/completeGoal/:id", verifyToken, completeGoal);
router.get("/getGoalSummary", verifyToken, getGoalSummary);

export default router;
