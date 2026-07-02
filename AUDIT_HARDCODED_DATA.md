cd# TrackNest Dashboard Hardcoded Data Audit

**Date**: 2026-07-02  
**Status**: AUDIT COMPLETE - Ready for fixes

---

## 📋 SUMMARY

Total issues found: **23 instances** across **2 components** (Home.jsx, PremiumDashboard.jsx)
- 4 Forecast inconsistencies (different multipliers)
- 2 Hardcoded AI Insights (Entertainment 18%, Subscription Rs 1,800)
- 2 Calendar with 28 days of random mock data
- 6 Hardcoded calculations (Net worth +63000, Financial score formula, Predicted spend +1200, etc.)
- 3 Mock account balances and investments calculated with fixed percentages
- 6 Similar issues in PremiumDashboard.jsx

---

## 🔴 ISSUE #1: FORECAST INCONSISTENCY (CRITICAL)

### Problem
**Two different multipliers** used for the same "Forecasted spend" metric:

| Location | Multiplier | Formula | Result |
|----------|-----------|---------|--------|
| PremiumDashboard.jsx:318 | 1.08 (8%) | `monthlyTotalExpense * 1.08` | Rs 38 (approx) |
| Home.jsx:461 | 1.05 (5%) | `monthlyTotalExpense * 1.05` | Rs 37 (approx) |

### Root Cause
- No shared forecast utility function
- Each component implements its own logic
- Different multipliers create inconsistent predictions

### Files Affected
```
client/src/pages/Home.jsx
  - Line 461: Hardcoded forecast calculation

client/src/pages/PremiumDashboard.jsx
  - Line 318: Different hardcoded forecast calculation
```

---

## 🔴 ISSUE #2: AI INSIGHTS - HARDCODED DATA

### Problem: "Unusual expense" always shows same message

**Current Code** (Home.jsx:454-455, PremiumDashboard.jsx:416-417):
```jsx
<h4>Unusual expense</h4>
<p>Your entertainment spending rose 18% this month.</p>
```

**Issues:**
- Always shows "entertainment" regardless of actual data
- Always shows "18%" regardless of actual spike
- Doesn't query real transactions
- Shows same message even if no unusual spending exists

### Problem: "Saving tip" always shows same amount

**Current Code** (Home.jsx:458-459, PremiumDashboard.jsx:420-421):
```jsx
<h4>Saving tip</h4>
<p>Switch one subscription to save up to Rs 1,800.</p>
```

**Issues:**
- Always shows "Rs 1,800" regardless of user's actual subscriptions
- Doesn't analyze recurring transactions
- Shows same tip even if no subscriptions exist

### Problem: "Forecast" card uses inconsistent calculation

**Current Code** (Home.jsx:461, PremiumDashboard.jsx:?):
```jsx
<h4>Forecast</h4>
<p>Projected spend next month is Rs {Math.round(monthlyTotalExpense * 1.05).toLocaleString()}.</p>
```

**Issues:**
- Uses 1.05 multiplier (different from stat card's 1.08)
- No shared function
- Hardcoded logic

### Files Affected
```
client/src/pages/Home.jsx
  - Lines 454-461: Hardcoded unusual expense, saving tip, forecast

client/src/pages/PremiumDashboard.jsx
  - Lines 416-425: Same hardcoded messages
```

---

## 🔴 ISSUE #3: CALENDAR - 28 RANDOM DAYS (MOCK DATA)

### Problem: "Upcoming activity" shows 28 random reminder/invoice entries

**Current Code** (Home.jsx:168-170):
```javascript
const calendarDays = Array.from({ length: 28 }).map((_, index) => ({
  day: index + 1,
  spent: Math.round(Math.random() * 2200),
}));
```

**And** (Home.jsx:546-553):
```jsx
<h3>Upcoming activity</h3>
{calendarDays.map((item, index) => (
  <div key={index}>
    <strong>Day {item.day}</strong>
    <p>{item.day % 3 === 0 ? "Invoice due" : "Reminder"}</p>
    <span>Rs {item.spent.toLocaleString()}</span>
  </div>
))}
```

**Issues:**
- Generates 28 random days every time component renders
- Uses `Math.random()` to create fake amounts (0 - Rs 2,200)
- Pattern: Every 3rd day = "Invoice due", others = "Reminder"
- **No connection to real recurring bills or upcoming transactions**
- Even if user has no bills, still shows 28 fake entries

### Similar Issue in PremiumDashboard.jsx (Lines 508-519):
```javascript
<div className="calendar-grid">
  {Array.from({ length: 28 }).map((_, idx) => (
    <div key={idx} className="calendar-event-card">
      <strong>Day {idx + 1}</strong>
      <p>{(idx + 1) % 3 === 0 ? "Invoice due" : "Reminder"}</p>
      <span>Rs {Math.round(Math.random() * 2200).toLocaleString()}</span>
    </div>
  ))}
</div>
```

### Files Affected
```
client/src/pages/Home.jsx
  - Line 168-170: Generate 28 random calendar days
  - Lines 546-553: Render calendar with mock data

client/src/pages/PremiumDashboard.jsx
  - Lines 508-519: Same calendar mock data structure
```

---

## 🟡 ISSUE #4: OTHER HARDCODED CALCULATIONS

### 4.1 - Net Worth always adds 63,000

**Current Code** (Home.jsx:175):
```javascript
const netWorth = Math.max(currentBalance + 63000, 0);
```

**Issue:** Hardcoded +63,000 offset added to balance. Where does this 63,000 come from?

### 4.2 - Predicted Spending always adds 1,200

**Current Code** (Home.jsx:173):
```javascript
const predictedSpending = Math.max(monthlyTotalExpense + 1200, monthlyTotalExpense);
```

**Issue:** Hardcoded +1,200 added to monthly expense. Should use forecast algorithm instead.

### 4.3 - Financial Score uses hardcoded formula

**Current Code** (Home.jsx:174):
```javascript
const financialScore = Math.min(100, Math.max(50, 70 - Math.round(budgetPercent * 0.25)));
```

**Issues:**
- Hardcoded base score of 70
- Hardcoded multiplier of 0.25
- Hardcoded range 50-100
- Not based on real financial metrics

### 4.4 - Account balances calculated as fixed percentages

**Current Code** (Home.jsx:149-152):
```javascript
const accountBalances = [
  { name: "Main Wallet", balance: Math.max(currentBalance * 0.45, 0) },
  { name: "Savings Vault", balance: Math.max(currentBalance * 0.27, 0) },
  { name: "Travel Fund", balance: Math.max(currentBalance * 0.16, 0) },
  { name: "Investments", balance: Math.max(currentBalance * 0.12, 0) },
];
```

**Issues:**
- Not fetching real accounts from database
- Using fixed percentage distribution (45%, 27%, 16%, 12%)
- Totals 100% which is suspicious
- Account model exists but not being used

### 4.5 - Investment list calculated as fixed percentages

**Current Code** (Home.jsx:162-166):
```javascript
const investmentList = [
  { name: "Savings", value: Math.round(Math.max(currentBalance * 0.18, 0)), change: 8 },
  { name: "Stocks", value: Math.round(Math.max(currentBalance * 0.15, 0)), change: -4 },
  { name: "Crypto", value: Math.round(Math.max(currentBalance * 0.1, 0)), change: 12 },
];
```

**Issues:**
- Not fetching real investments from database
- Using fixed percentage distribution (18%, 15%, 10%)
- Hardcoded change percentages (8%, -4%, 12%)
- Investment model exists but not being used

### Files Affected
```
client/src/pages/Home.jsx
  - Line 149-152: Account balances
  - Line 162-166: Investment list
  - Line 173: Predicted spending
  - Line 174: Financial score
  - Line 175: Net worth
```

---

## 📊 BACKEND STATUS

### ✅ Existing Utilities Available

**Algorithms** (`server/utils/algorithms.js`):
- ✅ `detectAnomalies()` - Z-score based anomaly detection
- ✅ `weightedMovingAverage()` - WMA forecasting
- ✅ `exponentialSmoothing()` - Exponential smoothing forecasting
- ✅ `linearRegressionForecast()` - Linear regression forecasting
- ✅ `monthlyForecast()` - Wrapped forecast method
- ✅ `categoryForecast()` - Category-based forecasting

**Controllers** (`server/controllers/analyticsController.js`):
- ✅ `analyzeAnomalies()` - GET /api/analytics/anomalies
- ✅ `forecastExpenses()` - GET /api/analytics/forecast
- ✅ `getInsights()` - GET /api/analytics/insights

**Routes** (`server/routes/recurringRoutes.js`):
- ✅ `GET /recurring/getRecurring` - Fetch recurring transactions
- ✅ `POST /recurring/createRecurring` - Create recurring transaction
- ✅ `PUT /recurring/updateRecurring/:id` - Update recurring transaction

**Models**:
- ✅ `RecurringTransaction` model with `nextDueDate` field (perfect for upcoming activity)
- ✅ `Investment` model exists but not used in frontend
- ✅ `Account` model exists but not used in frontend

### ⚠️ Issues with Existing Backend

The `getInsights()` endpoint returns generic insights but doesn't return:
- Specific category that had the spike (only generic "unusual expenses detected")
- Specific subscription/recurring transactions for saving tips
- No category comparison data (this month vs last month)

---

## 🎯 SOLUTION PLAN

### Phase 1: Create Shared Utilities

1. **Server-side utility** (`server/utils/dashboardCalculations.js`):
   - `calculateForecastedSpend(userId, method='wma')` - Single source of truth for forecast
   - `calculateNetWorth(userId)` - Real net worth from accounts + investments
   - `calculateFinancialScore(userId)` - Based on real metrics
   - `calculateCategorySpike(userId, days=30)` - Real category comparison
   - `detectSavingOpportunities(userId)` - Real subscriptions analysis

2. **Frontend utility** (`client/src/utils/dashboardCalculations.js`):
   - `useSharedForecast(userId)` - Hook to fetch forecast once, use everywhere
   - `useRealInvestments(userId)` - Hook to fetch real investments
   - `useRealAccounts(userId)` - Hook to fetch real accounts

### Phase 2: New/Enhanced Backend Endpoints

1. Enhance `/api/analytics/insights` to return:
   - Category with spike (if exists)
   - Spike percentage (if > 15%)
   - Top recurring transactions for savings tips
   - Forecast value with method used

2. New endpoint `/api/recurring/upcoming?limit=10`:
   - Return next upcoming recurring transactions sorted by dueDate
   - Include type (bill/invoice/reminder)
   - Include amount
   - Filter to active only

### Phase 3: Update Frontend Components

1. **Home.jsx** & **PremiumDashboard.jsx**:
   - Replace hardcoded forecast with API call
   - Replace hardcoded unusual expense with real category spike
   - Replace hardcoded saving tip with real subscriptions
   - Replace 28-day random calendar with real upcoming bills
   - Fetch real accounts instead of percentage calculations
   - Fetch real investments instead of percentage calculations
   - Calculate net worth from real data
   - Remove financial score calculation (or make it real)

2. Add loading states and error messages
3. Add "No data" empty states where appropriate

---

## 📝 DATABASE READINESS

✅ All required models exist:
- RecurringTransaction (with nextDueDate for upcoming activity)
- Investment (for investment portfolio)
- Account (for account balances)
- Expense (for category analysis)
- Income (for financial metrics)

✅ Required API endpoints exist:
- GET /api/analytics/forecast
- GET /api/analytics/insights
- GET /api/analytics/anomalies
- GET /recurring/getRecurring

---

## 🚀 NEXT STEPS

1. ✅ Audit complete
2. **Create backend utility functions** for consistent calculations
3. **Enhance analytics endpoints** with real data
4. **Create new upcoming bills endpoint** using RecurringTransaction
5. **Update Frontend components** to use real data APIs
6. **Add loading and empty states**
7. **Test and verify** all calculations match across components
