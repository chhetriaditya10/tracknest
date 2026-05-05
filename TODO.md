# Fix Account Creation Issue - TODO

## Root Cause
- `BASE_URL` in `Register.jsx` has no fallback: `import.meta.env.VITE_API_BASE_URL` becomes `undefined` if env var is not set
- Silent error handling: `err.response?.data?.message` is `undefined` for network errors, so no error shown to user

## Files to Fix
- [x] TODO.md created
- [ ] client/src/pages/Register.jsx - Add BASE_URL fallback + better error message
- [ ] client/src/pages/Login.jsx - Add BASE_URL fallback + better error message
- [ ] client/src/context/ContextProvider.jsx - Add BASE_URL fallback
- [ ] client/src/pages/ExpensesRecord.jsx - Add BASE_URL fallback
- [ ] client/src/pages/IncomesRecord.jsx - Add BASE_URL fallback
- [ ] client/src/components/Profile.jsx - Add BASE_URL fallback
- [ ] client/src/components/NavBar.jsx - Add BASE_URL fallback
- [ ] client/src/components/ForgotPassModal.jsx - Add BASE_URL fallback
- [ ] client/src/components/EditProfileModal.jsx - Add BASE_URL fallback
- [ ] client/src/components/ChangePassModal.jsx - Add BASE_URL fallback
- [ ] client/src/components/ChangeEmailModal.jsx - Add BASE_URL fallback
- [ ] client/src/components/aiBot.jsx - Add BASE_URL fallback
- [ ] Test the fix

