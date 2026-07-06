import {
  getMonthlyAnalyticsForUser,
  getForecastForUser,
  getAnomaliesForUser,
} from "../utils/aiDataAdapters.js";

import { detectIntent } from "../utils/aiPromptEngine.js";
import * as aiAdvisorController from "../controllers/aiAdvisor.js";

// Lightweight chat handler that reuses existing analytics/forecast/anomaly functions
export const handleChatMessage = async ({ userId, message, sessionId, context = null }) => {
  // short-circuit contextual explain requests
  const explainReq = /^(why|explain|how can i|what should i do)\b/i.test((message || "").trim());

  // If user asks "Why?" or similar and we have previous context, create a focused reply
  if (explainReq && context) {
    try {
      // If context looks like recommendations
      if (Array.isArray(context) && context.length > 0) {
        const top = context[0];
        const reason = top.reason || top.title || top.description || '';
        return {
          type: 'explain',
          text: `Here's why: ${reason || 'These suggestions are based on your recent spending patterns, recurring subscriptions, and forecasted expenses.'}`,
          payload: top,
        };
      }

      // If context is an analytics payload
      if (context && context.totalExpense != null) {
        return {
          type: 'explain',
          text: `I looked at your recent transactions: total spent is Rs ${context.totalExpense.toLocaleString()}. This drives the advisor's recommendations to reduce variable expenses and review subscriptions.`,
          payload: context,
        };
      }
    } catch (err) {
      // fall through to normal handling
    }
  }

  // intent detection
  const intent = detectIntent(message);

  // reuse existing data sources where possible
  switch (intent) {
    case "Expense Summary": {
      const analytics = await getMonthlyAnalyticsForUser(userId);
      return {
        type: "expense_summary",
        text: `You spent Rs ${analytics.totalExpense.toLocaleString()} this month.`,
        payload: {
          totalExpense: analytics.totalExpense,
          topCategory: analytics.categoryExpenses?.[0] || null,
        },
      };
    }
    case "Forecast": {
      const forecast = await getForecastForUser(userId);
      if (!forecast) {
        return { type: "forecast", text: "I need a few more transactions before I can generate a reliable prediction." };
      }
      return { type: "forecast", text: `Next month forecast: Rs ${forecast.forecast.toLocaleString()}`, payload: forecast };
    }
    case "Anomalies": {
      const anomalies = await getAnomaliesForUser(userId);
      if (!anomalies || anomalies.length === 0) {
        return { type: "anomalies", text: "No unusual expenses detected recently." };
      }
      return { type: "anomalies", text: `Found ${anomalies.length} unusual expenses.`, payload: anomalies };
    }
    case "Recommendations": {
      // Reuse existing AI Advisor recommendation engine by invoking the controller handler
      try {
        const fakeReq = { user: { id: userId } };
        let captured = null;
        const fakeRes = {
          status(code) {
            this._status = code;
            return this;
          },
          json(payload) {
            captured = payload;
            return payload;
          },
        };

        // Call existing controller without changing it; it will write to our fakeRes
        await aiAdvisorController.getAdvice(fakeReq, fakeRes);

        const suggestions = captured?.suggestions || captured?.data?.suggestions || null;
        if (suggestions && suggestions.length > 0) {
          return { type: 'recommendations', text: 'Here are your personalized suggestions.', payload: suggestions };
        }
        return { type: 'recommendations', text: 'No personalized suggestions available yet.' };
      } catch (err) {
        return { type: 'recommendations', text: 'Unable to retrieve recommendations right now.' };
      }
    }
    default: {
      // generic fallback: try to answer with quick facts
      if (/spent this month/i.test(message)) {
        const analytics = await getMonthlyAnalyticsForUser(userId);
        return { type: "expense_summary", text: `You spent Rs ${analytics.totalExpense.toLocaleString()} this month.`, payload: analytics };
      }
      return { type: "unknown", text: "Sorry — I didn't understand that. Try asking about your monthly summary, forecast, or budgets." };
    }
  }
};
