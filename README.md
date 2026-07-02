## 💸 TrackNest v2 – Smart Expense Tracker
d
**TrackNest** is a modern web application built to help users track their spending and income efficiently. Now powered by a **smart AI assistant**, SpenSyd goes beyond simple tracking—it analyzes your financial data to give you instant insights. With a clean UI, secure authentication, and intuitive categorization, SpenSyd gives you the control to manage your finances with confidence.

## ✨ Features

- 🤖 **AI Financial Assistant**: Ask questions about your spending, get monthly summaries, and receive financial insights powered by Google Gemini.
- ✅ Add **Expenses** with categories
- ✅ Add **Incomes** with categories
- ✅ View and manage detailed **Transaction Records**
- ✅ Organize all entries using **Category Labels**
- ✅ Responsive and modern UI
- ✅ Reset data

---
## 📸 Screenshots

![Screenshot](https://github.com/user-attachments/assets/c:\\Users\\chhet\\OneDrive\\Pictures\\Screenshots\\Screenshot%202026-05-05%20140853.png)
![Screenshot](https://github.com/user-attachments/assets/c:\\Users\\chhet\\OneDrive\\Pictures\\Screenshots\\Screenshot%202026-05-05%20140759.png)
![Screenshot](https://github.com/user-attachments/assets/c:\\Users\\chhet\\OneDrive\\Pictures\\Screenshots\\Screenshot%202026-05-05%20140931.png)
![Screenshot](https://github.com/user-attachments/assets/c:\\Users\\chhet\\OneDrive\\Pictures\\Screenshots\\Screenshot%202026-05-05%20141013.png)

## 🔧 Tech Stack

- **Frontend**: React, React Router, Framer Motion, CSS
- **Backend**: Node.js, Express
- **Database**: MongoDB

## 🧪 Testing Guide (NEW!)

### Unit Testing

**Frontend (Vitest + RTL)**:
```
cd client
npm test          # Run tests
npm run test:ui   # UI mode
npm run coverage  # Coverage report
```

**Backend (Jest + Supertest)**:
```
cd server
npm test          # Run tests + coverage
npm run test:watch # Watch mode
```

### System/E2E Testing (Cypress)
```
npx cypress open  # Interactive GUI
npm run test:e2e  # Headless run
```
Start servers first: `server dev` (backend:3000), `client dev` (frontend:5173).

### All Tests
```
npm run test:all
```

**Example Tests Added**:
- `client/src/components/__tests__/NavBar.test.jsx`
- `server/tests/expenses.test.js`
- `cypress/e2e/expenses.cy.js`

Extend with more tests! Coverage reports generated automatically.

## 🚀 Quick Start

1. Backend: `cd server && npm run dev`
2. Frontend: `cd client && npm run dev`
3. Test: See above!

## 📂 Project Structure
```
Tracknest/
├── client/          # React frontend + Vitest
├── server/          # Express backend + Jest
├── cypress/         # E2E tests
├── TODO.md          # Testing progress
└── README.md
