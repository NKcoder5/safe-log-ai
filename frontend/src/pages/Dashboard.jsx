import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import UserTypeBadge from '../components/UserTypeBadge';
import {
  Send,
  Loader2,
  Sparkles,
  Shield,
  Eye,
  EyeOff,
  CheckCircle,
  Clock,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const { userType, teamId } = useAuth();
  const [rawLog, setRawLog] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [teamName, setTeamName] = useState('');
  const [showMasked, setShowMasked] = useState(false);

  useEffect(() => {
    if (userType === 'team' && teamId) {
      fetchTeamName();
    }
  }, [userType, teamId]);

  const fetchTeamName = async () => {
    try {
      const response = await api.get('/teams/my-team');
      setTeamName(response.data.team.name);
    } catch (err) {
      console.error('Failed to fetch team name:', err);
    }
  };

  const getCacheScopeInfo = () => {
    switch (userType) {
      case 'public':
        return {
          title: 'Public Cache',
          description: 'Solutions are shared with all public users globally',
          icon: '🌐',
          color: 'blue'
        };
      case 'team':
        return {
          title: 'Team Cache',
          description: `Solutions are shared only with ${teamName || 'your team'} members`,
          icon: '👥',
          color: 'green'
        };
      case 'private':
      default:
        return {
          title: 'Private Cache',
          description: 'Your solutions are completely private and never shared',
          icon: '🔒',
          color: 'purple'
        };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const response = await api.post('/logs/submit', { rawLog });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit log');
    } finally {
      setLoading(false);
    }
  };

  const cacheInfo = getCacheScopeInfo();

  return (
    <div className="dashboard">
      {/* Animated Background */}
      <div className="dashboard-bg">
        <div className="dashboard-blob dashboard-blob-1"></div>
        <div className="dashboard-blob dashboard-blob-2"></div>
      </div>

      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <div className="dashboard-header-content">
            <div className="dashboard-header-text">
              <h1 className="dashboard-title">
                <Shield className="w-8 h-8" />
                Submit Error Log
              </h1>
              <p className="dashboard-subtitle">
                Paste your error log below to get an AI-powered solution
              </p>
            </div>
            <UserTypeBadge userType={userType} teamName={teamName} />
          </div>
        </div>

        {/* Cache Scope Info */}
        <div className={`cache-scope-card ${cacheInfo.color}`}>
          <div className="cache-scope-icon">{cacheInfo.icon}</div>
          <div className="cache-scope-content">
            <h3 className="cache-scope-title">{cacheInfo.title}</h3>
            <p className="cache-scope-description">{cacheInfo.description}</p>
            {userType === 'team' && !teamId && (
              <Link to="/team" className="cache-scope-link">
                Create or join a team →
              </Link>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="dashboard-form">
          <div className="form-card">
            <label htmlFor="rawLog" className="form-label">
              <Sparkles className="w-5 h-5" />
              Error Log
            </label>
            <textarea
              id="rawLog"
              value={rawLog}
              onChange={(e) => setRawLog(e.target.value)}
              required
              placeholder="Paste your error log here...&#10;&#10;Example:&#10;Error: Cannot read property 'name' of undefined&#10;    at Object.getUserName (user.js:45:12)&#10;    at processUser (app.js:123:5)"
              rows={12}
              className="log-textarea"
            />
            <div className="form-footer">
              <span className="char-count">
                {rawLog.length} characters
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={loading || !rawLog.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Analyze Log</span>
              </>
            )}
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="error-card">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="results-section">
            {/* Result Header */}
            <div className="result-header">
              <h2 className="result-title">
                <Sparkles className="w-6 h-6" />
                Analysis Results
              </h2>
              <div className={`result-badge ${result.fromCache ? 'cached' : 'new'}`}>
                {result.fromCache ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Cached Result ({cacheInfo.title})
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    New AI Generated
                  </>
                )}
              </div>
            </div>

            {/* Original Log */}
            {(result.originalLog || result.maskedLog) && (
              <details className="log-details" open>
                <summary className="log-summary">
                  <Eye className="w-5 h-5" />
                  <span>Your Error Log</span>
                  <span className="log-toggle">Click to {showMasked ? 'collapse' : 'expand'}</span>
                </summary>
                <div className="log-content">
                  <pre className="log-display">{result.originalLog || result.maskedLog}</pre>
                </div>
              </details>
            )}

            {/* Masked Log */}
            {result.maskedLog && result.originalLog && result.maskedLog !== result.originalLog && (
              <details className="log-details masked">
                <summary className="log-summary">
                  <Shield className="w-5 h-5" />
                  <span>Masked Version (Sent to AI)</span>
                  <span className="log-toggle">Click to expand</span>
                </summary>
                <div className="log-content">
                  <p className="masked-hint">
                    This is the sanitized version sent to the AI with sensitive data removed:
                  </p>
                  <pre className="log-display masked">{result.maskedLog}</pre>
                </div>
              </details>
            )}

            {/* AI Solution */}
            <div className="solution-card">
              <h3 className="solution-title">
                <Sparkles className="w-5 h-5" />
                AI Solution
              </h3>
              <div className="solution-content">
                {result.solution || result.message}
              </div>
            </div>

            {/* Metadata */}
            {result.hitCount && (
              <div className="result-meta">
                <div className="meta-item">
                  <TrendingUp className="w-4 h-4" />
                  <span>Occurrence count: <strong>{result.hitCount}</strong></span>
                </div>
                {result.fromCache && (
                  <div className="meta-item">
                    <Clock className="w-4 h-4" />
                    <span className="cache-note">
                      {userType === 'public' && 'Shared from global public cache'}
                      {userType === 'team' && 'Shared from team cache'}
                      {userType === 'private' && 'Retrieved from your private cache'}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
