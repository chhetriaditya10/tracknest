import axios from 'axios';

const BASE_URL = import.meta.env?.VITE_API_BASE_URL || "http://localhost:5000";

export const fetchAiAdvice = async (token) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await axios.get(`${BASE_URL}/api/ai/advice`, { headers });
  return res.data;
};
