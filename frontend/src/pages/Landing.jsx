import { Link } from 'react-router-dom';
import {
  Shield,
  Sparkles,
  Zap,
  Lock,
  Brain,
  TrendingUp,
  ChevronRight,
  CheckCircle,
  Eye,
  Rocket,
  Database,
  Clock,
  Users
} from 'lucide-react';
import './Landing.css';

const Landing = () => {
  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure Log Masking",
      description: "Advanced Presidio-powered masking automatically detects and protects PII, API keys, and sensitive data",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI-Powered Solutions",
      description: "Get instant, intelligent error analysis and solutions powered by NVIDIA's advanced AI models",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <Database className="w-8 h-8" />,
      title: "Smart Caching",
      description: "Intelligent cache system reduces costs and provides instant responses for recurring issues",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Team Collaboration",
      description: "Share solutions within your team while keeping data private and secure",
      color: "from-orange-500 to-red-500"
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

  const stats = [
    { number: "100%", label: "Secure", icon: <Lock className="w-6 h-6" /> },
    { number: "AI-Powered", label: "Solutions", icon: <Brain className="w-6 h-6" /> },
    { number: "Instant", label: "Analysis", icon: <Zap className="w-6 h-6" /> },
    { number: "24/7", label: "Available", icon: <Clock className="w-6 h-6" /> }
  ];

  return (
    <div className="landing">
      {/* Animated Background Elements */}
      <div className="landing-bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      {/* Header */}
      <header className="landing-header">
        <div className="landing-header-content">
          <div className="landing-logo">
            <Shield className="w-8 h-8 text-purple-600" />
            <span className="landing-logo-text">Safe Log AI</span>
          </div>
          <div className="landing-header-actions">
            <Link to="/login" className="landing-header-link">
              Sign In
              <span className="link-underline"></span>
            </Link>
            <Link to="/signup" className="landing-header-btn">
              <Rocket className="w-4 h-4" />
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero-content">
          {/* Hero Badge */}
          <div className="hero-badge">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span>Powered by AI & Advanced Security</span>
            <div className="status-dot"></div>
          </div>

          <h1 className="hero-title">
            Secure Your Logs.{' '}
            <span className="gradient-text">
              Solve Errors.
            </span>
            <br />
            <span className="gradient-text-pink">
              Stay Protected.
            </span>
          </h1>

          <p className="hero-description">
            Safe Log AI automatically masks sensitive information from your error logs
            and provides <span className="text-highlight">AI-powered solutions</span> to help you
            debug and resolve issues faster—without compromising security.
          </p>

          <div className="hero-cta">
            <Link to="/signup" className="btn-primary-gradient">
              <Rocket className="w-5 h-5" />
              Start Free Today
              <ChevronRight className="w-5 h-5 btn-arrow" />
            </Link>
            <Link to="/login" className="btn-secondary-outline">
              <Eye className="w-5 h-5" />
              View Demo
            </Link>
          </div>

          {/* Floating Icons */}
          <div className="floating-icon floating-icon-1">
            <div className="icon-box icon-box-blue">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="floating-icon floating-icon-2">
            <div className="icon-box icon-box-purple">
              <Brain className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="floating-icon floating-icon-3">
            <div className="icon-box icon-box-pink">
              <Lock className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="floating-icon floating-icon-4">
            <div className="icon-box icon-box-green">
              <Zap className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="landing-features">
        <div className="landing-container">
          <div className="section-header">
            <div className="section-badge">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Core Features</span>
            </div>
            <h2 className="section-title">
              Everything You Need to{' '}
              <span className="gradient-text">Debug Securely</span>
            </h2>
            <p className="section-description">
              Powerful features built with cutting-edge technology to protect your data
              and accelerate your debugging workflow.
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className={`feature-icon bg-gradient-to-br ${feature.color}`}>
                  {feature.icon}
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="landing-benefits">
        <div className="landing-container">
          <div className="benefits-content">
            <div className="benefits-text">
              <h2 className="benefits-title">
                Why Choose{' '}
                <span className="gradient-text-purple">Safe Log AI</span>?
              </h2>
              <p className="benefits-description">
                Our platform combines enterprise-grade security with intelligent AI
                to give you the best debugging experience without compromising on privacy.
              </p>
              <div className="benefits-list">
                {benefits.map((benefit, index) => (
                  <div key={index} className="benefit-item">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="benefits-visual">
              <div className="visual-card">
                <div className="visual-icon">
                  <TrendingUp className="w-16 h-16 text-purple-600" />
                </div>
                <h3 className="visual-title">Boost Productivity</h3>
                <p className="visual-description">
                  Resolve errors 10x faster with AI-powered insights
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="landing-stats">
        <div className="stats-bg-pattern"></div>
        <div className="landing-container">
          <h3 className="stats-title">Trusted by Developers Worldwide</h3>
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing-cta-section">
        <div className="landing-container">
          <div className="cta-card">
            <div className="cta-badge">
              <Rocket className="w-4 h-4 text-green-600" />
              <span>Ready to Get Started?</span>
            </div>
            <h2 className="cta-title">
              Start Debugging{' '}
              <span className="gradient-text">Securely Today</span>
            </h2>
            <p className="cta-description">
              Join developers who trust Safe Log AI to protect their sensitive data
              while getting instant AI-powered solutions to their errors.
            </p>
            <div className="cta-buttons">
              <Link to="/signup" className="btn-primary-gradient">
                <Rocket className="w-5 h-5" />
                Create Free Account
                <Sparkles className="w-5 h-5 btn-sparkle" />
              </Link>
              <Link to="/login" className="btn-secondary-white">
                <Eye className="w-5 h-5" />
                Sign In Instead
              </Link>
            </div>
            <div className="cta-trust">
              <div className="trust-item">
                <Shield className="w-4 h-4" />
                <span>Secure & Private</span>
              </div>
              <div className="trust-item">
                <Zap className="w-4 h-4" />
                <span>Lightning Fast</span>
              </div>
              <div className="trust-item">
                <Lock className="w-4 h-4" />
                <span>Enterprise Grade</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="footer-content">
            <div className="footer-brand">
              <Shield className="w-8 h-8 text-purple-400" />
              <div>
                <h4 className="footer-brand-title">Safe Log AI</h4>
                <p className="footer-brand-subtitle">Secure. Intelligent. Fast.</p>
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
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="footer-ai-text">AI Technology</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
