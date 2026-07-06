// Simple rule-based intent detection for AI Chat
export const detectIntent = (text = "") => {
  const t = (text || "").toLowerCase();

  if (/forecast|predict|next month|prediction/.test(t)) return "Forecast";
  if (/anomal|unusual|outlier|strange expense/.test(t)) return "Anomalies";
  if (/recommend|suggest|advice|how can i|saving|reduce/.test(t)) return "Recommendations";
  if (/spent this month|how much did i spend|total expense|spent this month/i.test(text)) return "Expense Summary";
  if (/budget|remaining budget|budget status|overspend|over ?spend/.test(t)) return "Budget Status";
  if (/income|how much did i earn|total income/.test(t)) return "Income Summary";
  if (/save|savings|saving rate|savings rate/.test(t)) return "Savings";
  if (/health|financial health|health score/.test(t)) return "Health Score";
  if (/goal|goals|progress/.test(t)) return "Goals";

  return "Unknown";
};
