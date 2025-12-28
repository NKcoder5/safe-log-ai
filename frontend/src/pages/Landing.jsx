import { Link } from 'react-router-dom';
import { useUI } from '../context/UIContext';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  Sparkles,
  Zap,
  Lock,
  Brain,
  TrendingUp,
  ChevronRight,
  CheckCircle,
  Rocket,
  Database,
  Users,
  ArrowRight
} from 'lucide-react';
import './Landing.css';

const Landing = () => {
  const { openAuthDrawer } = useUI();
  const { isAuthenticated } = useAuth();
  const features = [
    {
      icon: Shield,
      title: "Secure Log Masking",
      description: "Advanced Presidio-powered masking automatically detects and protects PII, API keys, and sensitive data"
    },
    {
      icon: Brain,
      title: "AI-Powered Solutions",
      description: "Get instant, intelligent error analysis and solutions powered by NVIDIA's advanced AI models"
    },
    {
      icon: Database,
      title: "Smart Caching",
      description: "Intelligent cache system reduces costs and provides instant responses for recurring issues"
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Share solutions within your team while keeping data private and secure"
    }
  ];

  const benefits = [
    "Automatic PII detection and masking",
    "Root cause analysis with AI",
    "Step-by-step solution guides",
    "Cost-optimized with smart caching",
    "Team and private modes",
    "Real-time error tracking"
  ];

  return (
    <div className="landing">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={16} />
            <span>Powered by AI & Advanced Security</span>
          </div>

          <h1 className="hero-title">
            Secure Your Logs.
            <br />
            <span className="hero-highlight">Solve Errors.</span>
            <br />
            Stay Protected.
          </h1>

          <p className="hero-description">
            Safe Log AI automatically masks sensitive information from your error logs
            and provides AI-powered solutions to help you debug and resolve issues faster—without compromising security.
          </p>

          <div className="hero-actions">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-hero-primary">
                <Rocket size={20} />
                <span>Go to Dashboard</span>
                <ArrowRight size={20} />
              </Link>
            ) : (
              <>
                <button onClick={() => openAuthDrawer('signup')} className="btn-hero-primary">
                  <Rocket size={20} />
                  <span>Start Free Today</span>
                  <ArrowRight size={20} />
                </button>
                <button onClick={() => openAuthDrawer('login')} className="btn-hero-secondary">
                  Sign In
                </button>
              </>
            )}
          </div>

          <div className="hero-trust">
            <div className="trust-item">
              <Shield size={16} />
              <span>100% Secure</span>
            </div>
            <div className="trust-item">
              <Zap size={16} />
              <span>Lightning Fast</span>
            </div>
            <div className="trust-item">
              <Lock size={16} />
              <span>Enterprise Grade</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <div className="section-badge">
            <Sparkles size={16} />
            <span>Core Features</span>
          </div>
          <h2 className="section-title">
            Everything You Need to Debug Securely
          </h2>
          <p className="section-description">
            Powerful features built with cutting-edge technology to protect your data
            and accelerate your debugging workflow.
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  <Icon size={32} />
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <div className="benefits-content">
          <div className="benefits-text">
            <h2 className="benefits-title">
              Why Choose <span className="highlight">Safe Log AI</span>?
            </h2>
            <p className="benefits-description">
              Our platform combines enterprise-grade security with intelligent AI
              to give you the best debugging experience without compromising on privacy.
            </p>
            <div className="benefits-list">
              {benefits.map((benefit, index) => (
                <div key={index} className="benefit-item">
                  <CheckCircle size={20} />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="benefits-visual">
            <div className="visual-card">
              <TrendingUp size={64} />
              <h3>Boost Productivity</h3>
              <p>Resolve errors 10x faster with AI-powered insights</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-card">
          <div className="cta-badge">
            <Rocket size={16} />
            <span>Ready to Get Started?</span>
          </div>
          <h2 className="cta-title">
            Start Debugging Securely Today
          </h2>
          <p className="cta-description">
            Join developers who trust Safe Log AI to protect their sensitive data
            while getting instant AI-powered solutions to their errors.
          </p>
          <div className="cta-actions">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-cta-primary">
                <Rocket size={20} />
                <span>Go to Dashboard</span>
              </Link>
            ) : (
              <>
                <button onClick={() => openAuthDrawer('signup')} className="btn-cta-primary">
                  <Rocket size={20} />
                  <span>Create Free Account</span>
                </button>
                <button onClick={() => openAuthDrawer('login')} className="btn-cta-secondary">
                  Sign In Instead
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <Shield size={32} />
            <div>
              <h4>Safe Log AI</h4>
              <p>Secure. Intelligent. Fast.</p>
            </div>
          </div>
          <p className="footer-tagline">
            Debug securely. Solve intelligently. Protect always.
          </p>
          <div className="footer-bottom">
            <div className="footer-copyright">
              © 2025 Safe Log AI. Built with ❤️ for developers.
            </div>
            <div className="footer-powered">
              <span>Powered by</span>
              <Sparkles size={16} />
              <span>AI Technology</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
