import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield,
  AlertCircle,
  Loader2,
  User,
  Users,
  Globe,
  Key
} from 'lucide-react';
import './Auth.css';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('private');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (userType === 'team' && !inviteCode.trim()) {
      setError('Invite code is required for team users');
      return;
    }

    setLoading(true);

    const result = await signup(email, password, userType, userType === 'team' ? inviteCode : null);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
  };

  const userTypes = [
    {
      value: 'private',
      icon: <User className="w-5 h-5" />,
      title: 'Private',
      description: 'Complete privacy - logs never shared',
      color: 'purple'
    },
    {
      value: 'public',
      icon: <Globe className="w-5 h-5" />,
      title: 'Public',
      description: 'Share solutions with all public users',
      color: 'blue'
    },
    {
      value: 'team',
      icon: <Users className="w-5 h-5" />,
      title: 'Team',
      description: 'Share solutions only with your team',
      color: 'green'
    }
  ];

  return (
    <div className="auth-page">
      {/* Animated Background */}
      <div className="auth-bg-blobs">
        <div className="auth-blob auth-blob-1"></div>
        <div className="auth-blob auth-blob-2"></div>
        <div className="auth-blob auth-blob-3"></div>
      </div>

      <div className="auth-container">
        {/* Logo and Header */}
        <div className="auth-header">
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="auth-title">
            Create Account
          </h1>
          <p className="auth-subtitle">
            Sign up to start using Safe Log AI
          </p>
        </div>

        {/* Main Form Card */}
        <div className="auth-card">
          <form onSubmit={handleSubmit} className="auth-form">
            {error && (
              <div className="auth-error">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <div className="input-wrapper">
                <div className="input-icon">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  className="form-input"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="input-wrapper">
                <div className="input-icon">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  minLength={6}
                  className="form-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              <small className="form-hint">Minimum 6 characters</small>
            </div>

            {/* User Type Selection */}
            <div className="form-group">
              <label className="form-label">Choose Your Account Type</label>
              <div className="user-type-grid">
                {userTypes.map((type) => (
                  <div
                    key={type.value}
                    className={`user-type-card ${userType === type.value ? 'selected' : ''} ${type.color}`}
                    onClick={() => setUserType(type.value)}
                  >
                    <input
                      type="radio"
                      id={type.value}
                      name="userType"
                      value={type.value}
                      checked={userType === type.value}
                      onChange={(e) => setUserType(e.target.value)}
                      className="user-type-radio"
                    />
                    <div className="user-type-icon">
                      {type.icon}
                    </div>
                    <div className="user-type-content">
                      <strong className="user-type-title">{type.title}</strong>
                      <span className="user-type-description">{type.description}</span>
                    </div>
                    <div className="user-type-check">
                      <div className="check-circle"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Invite Code */}
            {userType === 'team' && (
              <div className="form-group animate-fadeInUp">
                <label htmlFor="inviteCode" className="form-label">
                  Team Invite Code
                </label>
                <div className="input-wrapper">
                  <div className="input-icon">
                    <Key className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="inviteCode"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    required={userType === 'team'}
                    placeholder="Enter your team's invite code"
                    className="form-input"
                  />
                </div>
                <small className="form-hint">Get this code from your team admin</small>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="auth-submit-btn"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
            </button>
          </form>
        </div>

        {/* Login Link */}
        <div className="auth-footer-card">
          <p className="auth-footer-text">
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign in instead
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <div className="auth-back-link">
          <Link to="/" className="back-link">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
