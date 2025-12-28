import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import UserTypeBadge from '../components/UserTypeBadge';
import AISolutionCard from '../components/AISolutionCard';
import LogCard from '../components/LogCard';
import LoadingState from '../components/LoadingState';
import Toggle from '../components/Toggle';
import {
  Send,
  Sparkles,
  Shield,
  TrendingUp,
  AlertCircle,
  FileText,
  Zap
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const { userType, teamId } = useAuth();
  const [rawLog, setRawLog] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [teamName, setTeamName] = useState('');
  const [isMultiError, setIsMultiError] = useState(false);

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
          color: 'public'
        };
      case 'team':
        return {
          title: 'Team Cache',
          description: `Solutions are shared only with ${teamName || 'your team'} members`,
          icon: '👥',
          color: 'team'
        };
      case 'private':
      default:
        return {
          title: 'Private Cache',
          description: 'Your solutions are completely private and never shared',
          icon: '🔒',
          color: 'private'
        };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const response = await api.post('/logs/submit', {
        rawLog,
        multiError: isMultiError
      });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit log');
    } finally {
      setLoading(false);
    }
  };

  const formatMultiErrorSolution = (item) => {
    if (typeof item === 'string') return item;
    return `### ${item.summary || 'Error Details'}

**Root Cause:**
${item.rootCause}

**Solution:**
${item.solution}

**Preventive Measures:**
${item.preventiveMeasures}`;
  };

  const renderSolutions = () => {
    if (!result) return null;

    let solutions = [];
    let isMulti = result.isMultiError;

    if (isMulti) {
      try {
        const parsed = typeof result.solution === 'string' ? JSON.parse(result.solution) : result.solution;
        if (Array.isArray(parsed)) {
          solutions = parsed;
        } else {
          // If fallback or single object
          solutions = [parsed];
        }
      } catch (e) {
        // AI returned plain text despite prompt
        solutions = [{ solution: result.solution }];
        isMulti = false;
      }
    } else {
      solutions = [{ solution: result.solution || result.message }];
    }

    if (isMulti && solutions.length > 0) {
      return (
        <div className="results-section">
          <div className="result-header">
            <h2 className="result-title">
              <Sparkles size={24} />
              Analysis Results
            </h2>
            {result.hitCount && (
              <div className="result-badge">
                <TrendingUp size={16} />
                <span>{result.hitCount} occurrence{result.hitCount > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>

          {(result.originalLog || result.maskedLog) && (
            <LogCard
              log={{
                originalLog: result.originalLog,
                maskedLog: result.maskedLog,
                timestamp: new Date().toISOString(),
                fingerprint: result.fingerprint,
                hitCount: result.hitCount
              }}
              showMasked={true}
              isExpanded={false}
            />
          )}

          <div className="multi-solution-grid" style={{ display: 'grid', gap: '1.5rem' }}>
            {solutions.map((item, idx) => (
              <AISolutionCard
                key={idx}
                solution={formatMultiErrorSolution(item)}
                fromCache={result.fromCache}
                cacheScope={userType}
                timestamp={new Date().toISOString()}
                showDelay={!result.fromCache && idx === 0} // Only show delay for first for UX? Or all? Let's show for first.
              />
            ))}
          </div>
        </div>
      );
    }

    // Single solution
    return (
      <div className="results-section">
        <div className="result-header">
          <h2 className="result-title">
            <Sparkles size={24} />
            Analysis Results
          </h2>
          {result.hitCount && (
            <div className="result-badge">
              <TrendingUp size={16} />
              <span>{result.hitCount} occurrence{result.hitCount > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {(result.originalLog || result.maskedLog) && (
          <LogCard
            log={{
              originalLog: result.originalLog,
              maskedLog: result.maskedLog,
              timestamp: new Date().toISOString(),
              fingerprint: result.fingerprint,
              hitCount: result.hitCount
            }}
            showMasked={true}
            isExpanded={false}
          />
        )}

        <AISolutionCard
          solution={solutions[0].solution}
          fromCache={result.fromCache}
          cacheScope={userType}
          timestamp={new Date().toISOString()}
          showDelay={!result.fromCache}
        />
      </div>
    );
  };

  const cacheInfo = getCacheScopeInfo();

  return (
    <div className="dashboard-page">
      <div className={`dashboard-container ${!result && !loading ? 'full-height-input' : ''}`}>
        {/* Header */}
        <header className="dashboard-header">
          <div className="dashboard-header-content">
            <div>
              <h1 className="dashboard-title">
                <Shield size={32} />
                Error Log Analysis
              </h1>
              <p className="dashboard-subtitle">
                Submit your error logs for AI-powered analysis and solutions
              </p>
            </div>
            <UserTypeBadge userType={userType} teamName={teamName} />
          </div>
        </header>

        {/* Cache Scope Info */}
        <div className={`cache-scope-banner badge-${cacheInfo.color}`}>
          <div className="cache-scope-icon">{cacheInfo.icon}</div>
          <div className="cache-scope-content">
            <strong>{cacheInfo.title}:</strong> {cacheInfo.description}
            {userType === 'team' && !teamId && (
              <Link to="/team" className="cache-scope-link">
                Create or join a team →
              </Link>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="dashboard-form">
          <div className="form-group">
            <label htmlFor="rawLog" className="form-label">
              <Sparkles size={18} />
              <span>Error Log</span>
            </label>
            <textarea
              id="rawLog"
              value={rawLog}
              onChange={(e) => setRawLog(e.target.value)}
              placeholder="Paste your error log here...&#10;&#10;Example:&#10;Error: Cannot read property 'name' of undefined&#10;    at Object.getUserName (user.js:45:12)&#10;    at processUser (app.js:123:5)"
              rows={8}
              className="log-textarea"
            />
            <div className="form-meta">
              <Toggle
                label="Treat as independent separate errors"
                checked={isMultiError}
                onChange={setIsMultiError}
              />
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
                <div className="loading-spinner" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Send size={20} />
                <span>Analyze Log</span>
              </>
            )}
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="error-banner">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="loading-section">
            <LoadingState type="pulse" message={isMultiError ? "Analyzing multiple errors..." : "Processing your error log..."} />
          </div>
        )}

        {/* Results */}
        {result && !loading && renderSolutions()}
      </div>
    </div>
  );
};

export default Dashboard;
