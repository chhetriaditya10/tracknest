import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import "../styles/LandingPage.css";
import { useAuth } from "../context/ContextProvider";

const LandingPage = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [activeFaq, setActiveFaq] = useState("premium");

  const BASE_URL = import.meta.env?.VITE_API_BASE_URL || "http://localhost:5000";

  const lineData = [
    { name: "Mon", value: 46 },
    { name: "Tue", value: 55 },
    { name: "Wed", value: 53 },
    { name: "Thu", value: 68 },
    { name: "Fri", value: 78 },
    { name: "Sat", value: 72 },
    { name: "Sun", value: 88 },
  ];

  const pieData = [
    { name: "Food", value: 34 },
    { name: "Travel", value: 22 },
    { name: "Shopping", value: 18 },
    { name: "Bills", value: 16 },
    { name: "Other", value: 10 },
  ];

  const barData = [
    { name: "Jan", income: 42, expense: 29 },
    { name: "Feb", income: 55, expense: 33 },
    { name: "Mar", income: 68, expense: 44 },
    { name: "Apr", income: 71, expense: 49 },
  ];

  const features = [
    {
      icon: "🧠",
      title: "AI Expense Categorization",
      description: "Automatically group expenses into intelligent, searchable categories.",
    },
    {
      icon: "📈",
      title: "Budget Planning",
      description: "Create budgets, set targets, and stay ahead of overspending.",
    },
    {
      icon: "🎯",
      title: "Savings Goals",
      description: "Track goals with progress meters and personalized milestones.",
    },
    {
      icon: "📊",
      title: "Smart Reports",
      description: "Generate clear reports that highlight your cash flow trends.",
    },
    {
      icon: "🔁",
      title: "Recurring Bills",
      description: "Automate regular expenses and never miss a payment again.",
    },
    {
      icon: "☁️",
      title: "Cloud Backup",
      description: "Securely save your transactions and access them from any device.",
    },
    {
      icon: "📱",
      title: "Multi-Device Sync",
      description: "Keep your accounts, budgets and stats synced everywhere.",
    },
    {
      icon: "📄",
      title: "PDF / Excel Export",
      description: "Download statements and reports instantly for sharing.",
    },
    {
      icon: "🔔",
      title: "Smart Notifications",
      description: "Receive alerts for overspending, milestones, and more.",
    },
  ];

  const testimonials = [
    {
      name: "Maya Chen",
      title: "Founder, Finrise",
      quote: "Tracknest transformed our finance workflow — the dashboard feels magical and reliable.",
      stars: 5,
    },
    {
      name: "Aaron Patel",
      title: "Operations Lead",
      quote: "The UI is crisp, fast, and the analytics feel premium. It's exactly what we needed.",
      stars: 5,
    },
    {
      name: "Sara Kline",
      title: "Product Designer",
      quote: "A beautifully designed finance experience that makes every metric easy to understand.",
      stars: 5,
    },
  ];

  const faqs = [
    {
      key: "premium",
      question: "What do I get with Premium?",
      answer:
        "Premium gives you AI categorization, advanced analytics, exports, budget planning, multi-device sync, and priority support.",
    },
    {
      key: "sync",
      question: "Can I sync multiple accounts?",
      answer:
        "Yes. Tracknest syncs across devices and supports multiple bank, card, and wallet accounts in one view.",
    },
    {
      key: "cancel",
      question: "How do I cancel my subscription?",
      answer:
        "Cancel anytime from your settings page. Your premium access remains active until the end of the billing cycle.",
    },
  ];

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleCheckout = async (plan) => {
    if (!token) {
      navigate("/login");
      return;
    }

    setCheckoutLoading(plan);
    try {
      const response = await axios.post(
        `${BASE_URL}/api/checkout/create-session`,
        { plan },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data.url) {
        throw new Error("Unable to initiate payment session.");
      }

      window.location.href = response.data.url;
    } catch (error) {
      console.error("Checkout error", error);
    } finally {
      setCheckoutLoading(null);
    }
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={`landing-page ${darkMode ? "dark-mode" : "light-mode"}`}>
      <nav className={`landing-nav ${isScrolled ? "scrolled" : ""}`}>
        <div className="nav-content">
          <button className="brand-button" onClick={() => navigate("/")}>
            <motion.div
              className="brand-icon"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              ⌘
            </motion.div>
            <span className="brand-name">Tracknest</span>
          </button>

          <div className="nav-links">
            <button className="nav-link" onClick={() => scrollToSection("features")}>Features</button>
            <button className="nav-link" onClick={() => scrollToSection("dashboard-preview")}>Preview</button>
            <button className="nav-link" onClick={() => navigate("/pricing")}>Pricing</button>
            <button className="nav-link" onClick={() => scrollToSection("faq")}>FAQ</button>
            <button className="nav-icon" onClick={() => setDarkMode((mode) => !mode)}>
              {darkMode ? "🌙" : "☀️"}
            </button>
            <button className="nav-link" onClick={() => navigate("/login")}>Login</button>
            <button className="nav-cta" onClick={() => navigate("/register")}>Sign Up</button>
          </div>
        </div>
      </nav>

      <main className="landing-main">
        <section className="hero-section">
          <motion.div
            className="hero-copy"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="hero-pill">Next-gen finance for ambitious people</span>
            <h1>Build wealth with clarity, confidence, and premium finance tools.</h1>
            <p>
              Tracknest is the modern expense tracker designed for high-growth professionals. Plan budgets, analyze spending, and forecast savings in one elegant platform.
            </p>
            <div className="hero-buttons">
              <button className="btn-primary" onClick={() => navigate("/register")}>Get Started Free</button>
              <button className="btn-secondary" onClick={() => scrollToSection("dashboard-preview")}>Watch Demo</button>
            </div>
            <div className="hero-meta">
              <div>
                <strong>200K+</strong>
                <span>Active users</span>
              </div>
              <div>
                <strong>4.9/5</strong>
                <span>App Store rating</span>
              </div>
              <div>
                <strong>99.98%</strong>
                <span>Uptime</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="hero-preview"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="preview-shell">
              <div className="preview-topbar">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <div className="preview-content">
                <div className="balance-panel">
                  <span>Portfolio Balance</span>
                  <strong>Rs 182,490</strong>
                  <div className="balance-change">+14.2% this month</div>
                </div>
                <div className="mini-charts">
                  <div className="chart-card line-chart">
                    <span>Spending</span>
                    <div className="chart-graph">
                      <ResponsiveContainer width="100%" height={140}>
                        <LineChart data={lineData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                          <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.1)" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.65)", fontSize: 12 }} />
                          <YAxis hide domain={[20, 100]} />
                          <Tooltip contentStyle={{ background: "rgba(15, 23, 42, 0.95)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff" }} cursor={{ stroke: "rgba(255,255,255,0.18)", strokeWidth: 2 }} />
                          <Line type="monotone" dataKey="value" stroke="#a855f7" strokeWidth={4} dot={{ r: 0 }} activeDot={{ r: 5, fill: "#fff" }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="chart-card pie-chart">
                    <span>Categories</span>
                    <div className="chart-donut">
                      <ResponsiveContainer width="100%" height={160}>
                        <PieChart>
                          <Pie data={pieData} dataKey="value" innerRadius={36} outerRadius={64} paddingAngle={4}>
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={["#8b5cf6", "#6366f1", "#38bdf8", "#f97316", "#facc15"][index % 5]} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
                <div className="summary-row">
                  <div className="summary-card">
                    <p>Income</p>
                    <strong>Rs 68,900</strong>
                  </div>
                  <div className="summary-card">
                    <p>Expenses</p>
                    <strong>Rs 42,750</strong>
                  </div>
                  <div className="summary-card">
                    <p>Savings</p>
                    <strong>Rs 25,640</strong>
                  </div>
                </div>
              </div>
            </div>
            <div className="floating-widgets">
              <motion.div
                className="widget-card widget-1"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <span>Expense Split</span>
                <strong>48% Transport</strong>
              </motion.div>
              <motion.div
                className="widget-card widget-2"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <span>Weekly Trend</span>
                <strong>+12%</strong>
              </motion.div>
            </div>
          </motion.div>
        </section>

        <section className="section feature-section" id="features">
          <div className="section-title-row">
            <div>
              <p className="eyebrow">Premium features</p>
              <h2>Everything you need for next-level money control.</h2>
              <p className="section-description">
                Modern finance tools for budgets, reports, savings, and automation — all wrapped in a luxury experience.
              </p>
            </div>
          </div>
          <div className="feature-grid premium-grid">
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                className="feature-card premium-card"
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 220, damping: 18 }}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="section dashboard-preview-section" id="dashboard-preview">
          <div className="section-title-row">
            <div>
              <p className="eyebrow">Dashboard preview</p>
              <h2>See your finance experience before you sign up.</h2>
            </div>
            <button className="btn-secondary" onClick={() => navigate("/register")}>Start Free</button>
          </div>
          <div className="dashboard-grid">
            <div className="dashboard-card analytics-card">
              <div className="card-head">
                <span>Income vs Expense</span>
                <strong>Rs 26,150</strong>
              </div>
              <div className="bar-chart-wrap">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={barData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.65)", fontSize: 12 }} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ background: "rgba(15, 23, 42, 0.95)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff" }} cursor={{ fill: "rgba(255,255,255,0.08)" }} />
                    <Bar dataKey="income" radius={[16, 16, 0, 0]} fill="#8b5cf6" />
                    <Bar dataKey="expense" radius={[16, 16, 0, 0]} fill="#38bdf8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="dashboard-card insights-card">
              <div className="card-head">
                <span>Top insights</span>
                <strong>+24% savings</strong>
              </div>
              <ul>
                <li>Subscriptions decreased by 18%</li>
                <li>Savings target is on track</li>
                <li>Recurring bill schedule optimized</li>
              </ul>
            </div>
            <div className="dashboard-card calendar-card">
              <div className="card-head">
                <span>Today</span>
                <strong>Upcoming</strong>
              </div>
              <div className="calendar-grid">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="calendar-cell">{index + 9}</div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section comparison-section">
          <div className="section-title-row">
            <div>
              <p className="eyebrow">Free vs Premium</p>
              <h2>Choose the plan that matches your financial ambitions.</h2>
            </div>
          </div>
          <div className="comparison-grid">
            <div className="comparison-card free-card">
              <span className="badge soft">Free</span>
              <h3>Essential</h3>
              <p className="price">Rs 0 / month</p>
              <ul>
                <li>Basic budgeting</li>
                <li>Expense tracking</li>
                <li>Recent transactions</li>
              </ul>
              <button className="plan-btn plan-btn-secondary" onClick={() => navigate("/register")}>Start Free</button>
            </div>
            <div className="comparison-card premium-card highlighted">
              <div className="popular-chip">Most Popular</div>
              <h3>Premium</h3>
              <p className="price">Rs 1,999 / year</p>
              <ul>
                <li>Advanced analytics</li>
                <li>AI categorization</li>
                <li>Multi-device sync</li>
                <li>Export PDF / Excel</li>
              </ul>
              <button className="plan-btn plan-btn-primary" onClick={() => handleCheckout("premium")} disabled={checkoutLoading === "premium"}>
                {checkoutLoading === "premium" ? "Processing..." : "Upgrade Now"}
              </button>
            </div>
          </div>
        </section>

        <section className="section testimonials-section">
          <div className="section-title-row">
            <div>
              <p className="eyebrow">Loved by teams</p>
              <h2>Trusted by product leaders and finance teams worldwide.</h2>
            </div>
          </div>
          <div className="testimonial-grid">
            {testimonials.map((testimonial) => (
              <motion.div
                key={testimonial.name}
                className="testimonial-card"
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 220, damping: 18 }}
              >
                <div className="testimonial-avatar">{testimonial.name.charAt(0)}</div>
                <p>{testimonial.quote}</p>
                <div className="testimonial-meta">
                  <span>{testimonial.name}</span>
                  <small>{testimonial.title}</small>
                </div>
                <div className="testimonial-stars">{Array.from({ length: testimonial.stars }).map((_, idx) => "★")}</div>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="section faq-section" id="faq">
          <div className="section-title-row">
            <div>
              <p className="eyebrow">Frequently asked</p>
              <h2>Everything you need to know before you upgrade.</h2>
            </div>
          </div>
          <div className="faq-grid">
            {faqs.map((faq) => (
              <div key={faq.key} className={`faq-item ${activeFaq === faq.key ? "open" : ""}`}>
                <button className="faq-question" onClick={() => setActiveFaq(faq.key)}>
                  <span>{faq.question}</span>
                  <span>{activeFaq === faq.key ? "−" : "+"}</span>
                </button>
                <div className="faq-answer">{faq.answer}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="section newsletter-section">
          <div className="newsletter-panel">
            <div>
              <p className="eyebrow">Stay updated</p>
              <h2>Receive premium product announcements and finance tips.</h2>
            </div>
            <form className="newsletter-form" onSubmit={(event) => event.preventDefault()}>
              <input type="email" placeholder="Enter your email" aria-label="Email address" />
              <button className="btn-primary">Subscribe</button>
            </form>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="footer-brand">
          <span className="footer-logo">⌘</span>
          <div>
            <strong>Tracknest</strong>
            <p>Premium finance experience for modern teams.</p>
          </div>
        </div>
        <div className="footer-links-group">
          <div>
            <h4>Product</h4>
            <button onClick={() => scrollToSection("features")}>Features</button>
            <button onClick={() => scrollToSection("pricing")}>Pricing</button>
          </div>
          <div>
            <h4>Company</h4>
            <button onClick={() => scrollToSection("faq")}>FAQ</button>
            <button onClick={() => navigate("/login")}>Login</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
