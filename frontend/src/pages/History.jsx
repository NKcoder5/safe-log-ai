import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import LogCard from '../components/LogCard';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import { History as HistoryIcon, Search, Filter, Grid, List } from 'lucide-react';
import './History.css';

const History = () => {
  const { userType } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'frequent', 'oldest'

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/logs/history');
      const data = response.data;
      setLogs(Array.isArray(data) ? data : (data.logs || []));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch history');
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs
    .filter(log => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        log.originalLog?.toLowerCase().includes(searchLower) ||
        log.maskedLog?.toLowerCase().includes(searchLower) ||
        log.aiSolution?.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'frequent':
          return (b.hitCount || 0) - (a.hitCount || 0);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'recent':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

  return (
    <div className="history-page">
      <div className="history-container">
        {/* Header */}
        <header className="history-header">
          <div>
            <h1 className="history-title">
              <HistoryIcon size={32} />
              Log History
            </h1>
            <p className="history-subtitle">
              View and manage your submitted error logs
            </p>
          </div>
        </header>

        {/* Controls */}
        <div className="history-controls">
          {/* Search */}
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Filters */}
          <div className="filter-group">
            <div className="sort-select">
              <Filter size={18} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="select-input"
              >
                <option value="recent">Most Recent</option>
                <option value="oldest">Oldest First</option>
                <option value="frequent">Most Frequent</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="view-toggle">
              <button
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                aria-label="List view"
              >
                <List size={20} />
              </button>
              <button
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
              >
                <Grid size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <LoadingState type="skeleton" />
        ) : error ? (
          <div className="error-banner">
            <p>{error}</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <EmptyState
            type={searchTerm ? 'search' : 'history'}
            action={searchTerm ? undefined : 'Go to Dashboard'}
            onAction={searchTerm ? undefined : () => window.location.href = '/dashboard'}
          />
        ) : (
          <>
            {/* Results Count */}
            <div className="results-count">
              Showing {filteredLogs.length} log{filteredLogs.length !== 1 ? 's' : ''}
            </div>

            {/* Logs Grid/List */}
            <div className={`logs-container ${viewMode}`}>
              {filteredLogs.map((log, index) => (
                <LogCard
                  key={log._id || index}
                  log={log}
                  showMasked={true}
                  isExpanded={false}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default History;
