import express from "express";
import { verifyToken } from "../middlewares/middleware.js";
import { addInvestment, fetchInvestments, fetchInvestmentSummary } from "../controllers/investmentsController.js";

const router = express.Router();

router.post("/addInvestment", verifyToken, addInvestment);
router.get("/getInvestments", verifyToken, fetchInvestments);
router.get("/getInvestmentSummary", verifyToken, fetchInvestmentSummary);

export default router;
