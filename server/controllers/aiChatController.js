import { handleChatMessage } from "../services/aiChatService.js";

export const postMessage = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { message, sessionId } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    const reply = await handleChatMessage({ userId, message, sessionId });

    return res.json({ success: true, data: reply });
  } catch (err) {
    console.error("aiChatController error:", err?.message || err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
