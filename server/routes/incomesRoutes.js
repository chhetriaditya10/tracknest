import express from "express";
import { addBalance, fetchBalance, topUpBalance } from "../controllers/incomesController.js";
import { verifyToken } from "../middlewares/middleware.js";

const router = express.Router();

router.post("/addBalance", verifyToken, addBalance);
router.patch("/", verifyToken, topUpBalance);
router.patch("/topup", verifyToken, topUpBalance);
router.get("/getBalances", verifyToken, fetchBalance);

export default router;
