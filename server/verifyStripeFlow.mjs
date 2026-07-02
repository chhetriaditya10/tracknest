import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import User from './models/User.js';

const BASE_URL = 'http://127.0.0.1:5000/api';
const testUser = {
  username: 'stripe_test_user',
  email: 'stripe_test_user@example.com',
  password: 'Test1234',
};

const register = async () => {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testUser),
  });
  return res;
};

const login = async () => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: testUser.email, password: testUser.password }),
  });
  const data = await res.json();
  return { res, data };
};

const createSession = async (token) => {
  const res = await fetch(`${BASE_URL}/checkout/create-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ plan: 'premium' }),
  });
  const data = await res.json();
  return { res, data };
};

const main = async () => {
  console.log('Verifying Stripe checkout session creation for backend...');

  const registerResponse = await register();
  if (registerResponse.ok) {
    console.log('Test user registered successfully.');
  } else {
    const text = await registerResponse.text();
    if (registerResponse.status === 400) {
      console.log('Test user already exists.');
    } else {
      console.error('Register failed:', registerResponse.status, text);
      process.exit(1);
    }
  }

  const { res: loginRes, data: loginData } = await login();
  if (!loginRes.ok) {
    console.error('Login failed:', loginRes.status, loginData);
    process.exit(1);
  }

  const token = loginData.token;
  console.log('Login succeeded, token length:', token?.length);

  const { res: sessionRes, data: sessionData } = await createSession(token);
  console.log('Create session response status:', sessionRes.status);
  console.log('Create session response body:', sessionData);

  if (!sessionRes.ok) {
    process.exit(1);
  }

  console.log('Stripe checkout session creation test passed.');
};

main().catch((error) => {
  console.error('Error verifying Stripe flow:', error);
  process.exit(1);
});
