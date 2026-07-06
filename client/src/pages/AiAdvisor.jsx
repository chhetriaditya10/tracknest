import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/ContextProvider';
import { fetchAiAdvice } from '../lib/api/ai';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AiAdvisorOverview from '../components/AiAdvisorOverview';
import AiAdvisorRecommendations from '../components/AiAdvisorRecommendations';
import AiAdvisorAnomalies from '../components/AiAdvisorAnomalies';
import AiAdvisorTrendCard from '../components/AiAdvisorTrendCard';
import DataQuality from '../components/DataQuality';
import '../styles/AiAdvisor.css';

export default function AiAdvisor() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    fetchAiAdvice(token)
      .then((res) => setData(res))
      .catch((err) => setError(err.response?.data || err.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (!token) return <div>Please log in to view AI Advisor insights.</div>;
  if (loading) return <div>Loading AI Advisor...</div>;
  if (error) return <div>Error: {JSON.stringify(error)}</div>;
  if (!data) return <div>No AI Advisor data is available yet.</div>;

  const summary = {
    prediction: data.summary?.prediction ?? null,
    predictionConfidence: data.summary?.predictionConfidence ?? 0,
    trend: data.summary?.trend ?? "Stable",
    outliersCount: data.outliers?.length ?? 0,
  };

  return (
    <div className="ai-advisor-container">
      <div className="ai-advisor-header">
        <div>
          <h2>AI Financial Advisor</h2>
          <p>Actionable predictions and financial recommendations tailored to your spending behavior.</p>
        </div>
        <div>
          <button onClick={() => navigate('/ai-chat')} className="ai-badge">Ask AI</button>
        </div>
      </div>

      <AiAdvisorOverview summary={summary} suggestions={data.suggestions || []} />

      <div className="ai-report-grid">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <AiAdvisorTrendCard summary={data.summary} metadata={data.metadata} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <AiAdvisorRecommendations suggestions={data.suggestions} />
        </motion.div>
      </div>

      <div className="ai-footer-grid">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <DataQuality metadata={data.metadata} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <AiAdvisorAnomalies anomalies={data.outliers || []} />
        </motion.div>
      </div>
    </div>
  );
}
