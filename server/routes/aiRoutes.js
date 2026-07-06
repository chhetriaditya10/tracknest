import express from "express";
import { getAdvice } from "../controllers/aiAdvisor.js";
import { verifyToken } from "../middlewares/middleware.js";

const router = express.Router();

router.get("/advice", verifyToken, getAdvice);

export default router;
