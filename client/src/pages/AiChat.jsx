import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/ContextProvider';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AiAdvisorRecommendations from '../components/AiAdvisorRecommendations';
import '../styles/AiChat.css';

const BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5000';

export default function AiChat() {
  const { token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  const navigate = useNavigate();

  const STORAGE_KEY = 'tracknest.aiChat.messages';

  // Restore from sessionStorage
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) setMessages(JSON.parse(raw));
    } catch (e) {
      console.warn('Failed to restore chat', e);
    }
  }, []);

  // Persist to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      // ignore
    }
  }, [messages]);

  useEffect(() => {
    if (!containerRef.current) return;
    // Auto-scroll to bottom when messages change
    const el = containerRef.current;
    requestAnimationFrame(() => {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    });
  }, [messages, isTyping]);

  const sendMessage = async (text, contextOverride = null) => {
    const toSend = (typeof text === 'string' ? text : input) || '';
    if (!toSend.trim()) return;

    // create user message with timestamp and id
    const id = Date.now() + Math.random().toString(36).slice(2, 7);
    const userMsg = { id, sender: 'user', text: toSend, time: new Date().toISOString() };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);
    setIsTyping(true);

    try {
      const lastAssistant = [...messages].reverse().find((x) => x.sender === 'assistant');
      const res = await axios.post(
        `${BASE_URL}/api/aichat/message`,
        { message: toSend, context: contextOverride ?? lastAssistant?.payload ?? null },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const assistantMsg = res.data?.success
        ? { sender: 'assistant', text: res.data.data.text, payload: res.data.data.payload, type: res.data.data.type, time: new Date().toISOString(), linkedTo: id }
        : { sender: 'assistant', text: 'Sorry, I could not process that.', time: new Date().toISOString(), linkedTo: id };

      setMessages((m) => [...m, assistantMsg]);
    } catch (err) {
      // Provide clearer feedback depending on error type, but avoid dumping raw JSON
      console.error('AI Chat request failed', err);
      let userText = 'Server error. Please try again later.';
      if (err.response) {
        const status = err.response.status;
        const remoteMsg = err.response.data?.message || err.response.statusText || null;
        if (status === 401 || status === 403) userText = 'Authentication error. Please log in again.';
        else if (status >= 500) userText = 'AI service temporarily unavailable. Try again shortly.';
        else if (remoteMsg) userText = `Error: ${remoteMsg}`;
        else userText = `Server returned status ${status}`;
      } else if (err.request) {
        userText = 'Network error: cannot reach AI service. Is the backend running?';
      } else if (err.message) {
        userText = `Request error: ${err.message}`;
      }

      setMessages((m) => [...m, { sender: 'assistant', text: userText, time: new Date().toISOString(), linkedTo: id }]);
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  const quickQuestions = [
    'Monthly Summary',
    'Budget Status',
    'Savings Tips',
    'Highest Expense',
    'Spending Trend',
    'Recent Anomalies',
    'Forecast Next Month',
    'Financial Health',
    'Recommended Budget',
  ];

  // small markdown -> html renderer (very limited, safe-ish)
  const renderMarkdown = (md) => {
    if (!md) return '';
    // escape HTML
    const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    // code block
    let out = esc(md);
    out = out.replace(/```([\s\S]*?)```/g, (m, code) => `<pre class="md-code">${esc(code)}</pre>`);
    // bold
    out = out.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // italics
    out = out.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // headings
    out = out.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    out = out.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    out = out.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    // unordered lists
    out = out.replace(/(^|\n)\* (.*)(?=\n|$)/g, (m, p1, p2) => `${p1}<li>${p2}</li>`);
    out = out.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
    // ordered lists
    out = out.replace(/(^|\n)\d+\. (.*)(?=\n|$)/g, (m, p1, p2) => `${p1}<li>${p2}</li>`);
    out = out.replace(/(<li>.*<\/li>)/gs, '<ol>$1</ol>');
    // paragraphs
    out = out.replace(/\n\n+/g, '</p><p>');
    out = `<p>${out}</p>`;
    return out;
  };

  const clearConversation = () => {
    if (!window.confirm('Clear conversation? This will remove messages for this session.')) return;
    setMessages([]);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // optional: small visual feedback could be added
    } catch (e) {
      console.warn('copy failed', e);
    }
  };

  const regenerateLast = async (assistantIndex) => {
    // find last assistant message and its linked user
    const assistant = messages.slice().reverse().find((m) => m.sender === 'assistant');
    if (!assistant) return;
    const linkedUser = messages.slice().reverse().find((m) => m.sender === 'user' && m.id && assistant.linkedTo === m.id) || messages.slice().reverse().find((m) => m.sender === 'user');
    if (!linkedUser) return;
    // remove the assistant message we're regenerating
    setMessages((ms) => ms.filter((m) => m !== assistant));
    await sendMessage(linkedUser.text, assistant.payload ?? null);
  };

  if (!token) return <div>Please log in to use the AI Chat Assistant.</div>;

  return (
    <div className="ai-chat-container">
      <div className="ai-chat-panel">
        <div className="ai-chat-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3>AI Chat Assistant</h3>
              <p>Ask about your spending, budgets, and forecasts.</p>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button onClick={() => navigate('/ai-advisor')} className="chip">Back to Advisor</button>
              <button onClick={clearConversation} className="chip">Clear Conversation</button>
            </div>
          </div>
        </div>

        <div className="ai-chat-body" ref={containerRef}>
          {messages.length === 0 && (
            <div className="welcome-card">
              <h4>Welcome to AI Chat</h4>
              <p>Ask questions about your spending, budgets, and forecasts. Try: <strong>Monthly Summary</strong></p>
            </div>
          )}

          <div className="messages-list">
            <AnimatePresence initial={false}>
              {messages.map((m, i) => (
                <motion.div key={m.time || i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`message-row ${m.sender === 'user' ? 'row-right' : 'row-left'}`}>
                  <div className={`chat-bubble ${m.sender}`}>
                    <div className="bubble-content" dangerouslySetInnerHTML={{ __html: m.sender === 'assistant' ? renderMarkdown(m.text) : renderMarkdown(m.text) }} />
                    <div className="bubble-meta">
                      <small className="time">{new Date(m.time || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                      {m.sender === 'assistant' && (
                        <div className="actions">
                          <button title="Copy response" onClick={() => copyToClipboard(m.text)} className="action-btn">Copy</button>
                          <button title="Regenerate" onClick={() => regenerateLast(i)} className="action-btn">Regenerate</button>
                        </div>
                      )}
                    </div>
                  </div>

                  {m.sender === 'assistant' && Array.isArray(m.payload) && m.type === 'recommendations' ? (
                    <div style={{ marginTop: 8 }}>
                      <AiAdvisorRecommendations suggestions={m.payload} />
                    </div>
                  ) : null}
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <div className="typing-row">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
            )}
          </div>
        </div>

        <div className="ai-chat-footer">
          <div className="quick-chips">
            {quickQuestions.map((q) => (
              <button key={q} onClick={() => sendMessage(q)} className="chip">{q}</button>
            ))}
          </div>
          <div className="input-row">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about your finances..." onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} />
            <button onClick={() => sendMessage()} disabled={loading} className="send-btn">{loading ? '...' : 'Send'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
