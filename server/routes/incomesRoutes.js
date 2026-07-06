import express from "express";
import fs from "fs";
import path from "path";
import { fetchBalance, topUpBalance } from "../controllers/incomesController.js";
import { verifyToken } from "../middlewares/middleware.js";

const router = express.Router();

// FIX: was calling the broken `addBalance` function, which never updated
// the user's actual balance. Now points to `topUpBalance`, which correctly
// runs $inc on User.balance.
// Capture minimal, non-sensitive request info to a log file in non-production
const captureIncomeRequest = (req, res, next) => {
	try {
		if (process.env.NODE_ENV !== "production") {
			const safeBody = req.body?.balance || req.body?.income || req.body || {};
			const logEntry = {
				time: new Date().toISOString(),
				userId: req.user?.id || null,
				method: req.method,
				path: req.path,
				body: {
					category: safeBody.category || safeBody.note || null,
					amount: safeBody.amount || null,
					date: safeBody.date || null,
				},
			};
			const logDir = path.join(process.cwd(), "server", "logs");
			if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
			fs.appendFileSync(path.join(logDir, "income_requests.log"), JSON.stringify(logEntry) + "\n");
		}
	} catch (e) {
		console.error("Capture income request logging failed", e);
	}
	next();
};

// Lightweight router-level logger to help trace incoming requests
router.use((req, res, next) => {
	if (process.env.NODE_ENV !== "production") {
		console.log(`[income-router] ${req.method} ${req.path}`);
	}
	next();
});

// Accept POST to the router root so clients posting to `/api/balance` succeed
router.post("/", verifyToken, captureIncomeRequest, topUpBalance);

// Keep the named alias and add a lowercase alias as well
router.post("/addIncome", verifyToken, captureIncomeRequest, topUpBalance);
router.post("/addincome", verifyToken, captureIncomeRequest, topUpBalance);
router.post("/addbalance", verifyToken, captureIncomeRequest, topUpBalance);

// Keep patch for partial update operations on the router root
router.patch("/", verifyToken, topUpBalance);
router.get("/getBalances", verifyToken, fetchBalance);

// Read recent income request logs (non-production). Returns last `n` entries.
router.get("/request-logs", verifyToken, (req, res) => {
	try {
		if (process.env.NODE_ENV === "production") {
			return res.status(403).json({ success: false, message: "Not available in production" });
		}
		const n = Number(req.query.n) || 50;
		const logPath = path.join(process.cwd(), "server", "logs", "income_requests.log");
		if (!fs.existsSync(logPath)) return res.status(200).json({ success: true, logs: [] });
		const content = fs.readFileSync(logPath, "utf8");
		const lines = content.trim().split(/\r?\n/).filter(Boolean);
		const last = lines.slice(-n).map((l) => {
			try {
				return JSON.parse(l);
			} catch (e) {
				return { raw: l };
			}
		});
		return res.status(200).json({ success: true, logs: last });
	} catch (err) {
		console.error("Failed to read income request logs:", err);
		return res.status(500).json({ success: false, message: "Failed to read logs" });
	}
});

export default router;