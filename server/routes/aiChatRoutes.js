import express from "express";
import { postMessage } from "../controllers/aiChatController.js";
import { verifyToken } from "../middlewares/middleware.js";

const router = express.Router();

// POST /api/aichat/message
router.post("/message", verifyToken, postMessage);

export default router;
