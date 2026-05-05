import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/AIBot.css";

const key = import.meta.env?.VITE_GEMINI_KEY;

const AIBot = ({ expenses = [], incomes = [], currentBalance = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Hi! I'm TrackNest AI 🤖. I can analyze your transaction history. Ask me anything!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Quick suggestions for complex queries
  const suggestions = [
    "📅 Expenses last week",
    "🍔 Spent on Food this month",
    "💰 Recent income",
    "📉 Highest expense ever",
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const getFinancialContext = () => {
    const safeExpenses = Array.isArray(expenses) ? expenses : [];
    const safeIncomes = Array.isArray(incomes) ? incomes : [];
    const today = new Date();

    // Helper to format dates clearly for the AI
    const formatDate = (dateStr) =>
      new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

    // 1. Sort data by date (newest first)
    const sortedExpenses = [...safeExpenses].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
    const sortedIncomes = [...safeIncomes].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    // 2. Generate Raw Transaction Logs (Last 50 items)
    // This allows the AI to "see" individual records to answer "last week", "specific date", etc.
    const expenseLog = sortedExpenses
      .slice(0, 50)
      .map((e) => `- ${formatDate(e.date)}: ${e.category} (Rs${e.amount})`)
      .join("\n");

    const incomeLog = sortedIncomes
      .slice(0, 50)
      .map((i) => `- ${formatDate(i.date)}: ${i.category} (Rs${i.amount})`)
      .join("\n");

    // 3. Calculate Category Summaries (All time)
    const categoryTotals = safeExpenses.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {});
    const categorySummary = Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)
      .map(([cat, total]) => `${cat}: Rs${total}`)
      .join(", ");

    // 4. Construct the Master Context
    return `
      CONTEXT FOR AI ANALYSIS:
      ------------------------
      TODAY'S DATE: ${today.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })}
      
      CURRENT WALLET BALANCE: Rs${currentBalance.toLocaleString()}

      SPENDING BY CATEGORY (ALL TIME):
      ${categorySummary || "No data"}

      RECENT EXPENSE LOG (Analyze this for time-based questions):
      ${expenseLog || "No expenses recorded."}

      RECENT INCOME LOG:
      ${incomeLog || "No incomes recorded."}
    `;
  };

  const handleSend = async (textOverride = null) => {
    const textToSend = typeof textOverride === "string" ? textOverride : input;
    if (!textToSend.trim()) return;

    const userMessage = { role: "user", text: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      console.log("Generating financial context...");
      const context = getFinancialContext();
      const apiKey = key;

      if (!apiKey) throw new Error("API Key is missing.");

      const systemPrompt = `
        You are TrackNest AI, an advanced financial analyst.
        
        DATA PROVIDED:
        ${context}

        INSTRUCTIONS:
        1. Answer the user's question based STRICTLY on the provided logs.
        2. If asked about "last week" or "this month", calculate it based on TODAY'S DATE provided in the context.
        3. Be precise with numbers. Use the Rs symbol.
        4. If the user asks for something not in the last 50 transactions, simply say you only have access to recent records.
        5. Keep answers short, friendly, and insightful.
      `;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: textToSend }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
          }),
        }
      );

      if (!response.ok) throw new Error(`API Error: ${response.status}`);

      const data = await response.json();
      const botResponseText =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "I couldn't analyze that right now.";

      setMessages((prev) => [...prev, { role: "bot", text: botResponseText }]);
    } catch (error) {
      console.error("AI Bot Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "I'm having trouble processing that. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-bot-container">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="ai-chat-window"
            initial={{ opacity: 0, scale: 0.8, y: 20, x: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20, x: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="chat-header">
              <h3>🤖 TrackNest Assistant</h3>
              <button className="close-chat" onClick={() => setIsOpen(false)}>
                ×
              </button>
            </div>

            <div className="chat-messages">
              {messages.map((msg, idx) => (
                <div key={idx} className={`message ${msg.role}`}>
                  {msg.text}
                </div>
              ))}

              {!loading && messages.length < 3 && (
                <div className="suggestions-container">
                  {suggestions.map((question, idx) => (
                    <button
                      key={idx}
                      className="suggestion-chip"
                      onClick={() => handleSend(question)}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              )}

              {loading && (
                <div className="message bot">
                  <span className="typing-indicator">Thinking...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area">
              <input
                type="text"
                className="chat-input"
                placeholder="Ask about your finances..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
              />
              <button
                className="send-button"
                onClick={() => handleSend()}
                disabled={loading}
              >
                ➤
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        className="ai-bot-button"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="11" width="18" height="10" rx="2"></rect>
          <circle cx="12" cy="5" r="2"></circle>
          <path d="M12 7v4"></path>
          <line x1="8" y1="16" x2="8" y2="16"></line>
          <line x1="16" y1="16" x2="16" y2="16"></line>
        </svg>
      </motion.button>
    </div>
  );
};

export default AIBot;
