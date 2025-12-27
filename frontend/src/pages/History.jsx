import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
  Clock,
  Trash2,
  Eye,
  Sparkles,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2,
  Search,
  Filter,
  Calendar
} from 'lucide-react';
import './History.css';

const History = () => {
  const { userType } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/logs/history');
      setLogs(response.data.logs || []);
    } catch (err) {
      setError('Failed to fetch history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this log?')) return;

    try {
      await api.delete(`/logs/${id}`);
      setLogs(logs.filter(log => log.id !== id));
      if (selectedLog?.id === id) {
        setSelectedLog(null);
      }
    } catch (err) {
      alert('Failed to delete log');
      console.error(err);
    }
  };

  const filteredLogs = logs.filter(log =>
    log.maskedLog?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.solution?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="history-page">
      {/* Animated Background */}
      <div className="history-bg">
        <div className="history-blob history-blob-1"></div>
        <div className="history-blob history-blob-2"></div>
      </div>

      <div className="history-container">
        {/* Header */}
        <div className="history-header">
          <div className="history-header-content">
            <h1 className="history-title">
              <Clock className="w-8 h-8" />
              Log History
            </h1>
            <p className="history-subtitle">
              View and manage your previously analyzed error logs
            </p>
          </div>

          {/* Search Bar */}
          <div className="search-bar">
            <div className="search-icon">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="search-clear"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <Loader2 className="w-12 h-12 animate-spin" />
            <p>Loading your history...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="error-state">
            <AlertCircle className="w-12 h-12" />
            <p>{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredLogs.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">
              <Clock className="w-16 h-16" />
            </div>
            <h2>No Logs Found</h2>
            <p>
              {searchTerm
                ? 'No logs match your search criteria'
                : 'You haven\'t analyzed any error logs yet'}
            </p>
          </div>
        )}

        {/* Logs Grid */}
        {!loading && !error && filteredLogs.length > 0 && (
          <div className="logs-grid">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className={`log-card ${selectedLog?.id === log.id ? 'selected' : ''}`}
                onClick={() => setSelectedLog(log)}
              >
                <div className="log-card-header">
                  <div className="log-card-icon">
                    {log.fromCache ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Sparkles className="w-5 h-5" />
                    )}
                  </div>
                  <div className="log-card-meta">
                    <div className="log-card-date">
                      <Calendar className="w-4 h-4" />
                      {formatDate(log.createdAt)}
                    </div>
                    {log.fromCache && (
                      <div className="log-card-badge cached">
                        Cached
                      </div>
                    )}
                  </div>
                </div>

                <div className="log-card-content">
                  <p className="log-preview">
                    {log.maskedLog?.substring(0, 150)}
                    {log.maskedLog?.length > 150 && '...'}
                  </p>
                </div>

                <div className="log-card-footer">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedLog(log);
                    }}
                    className="log-card-btn view"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(log.id);
                    }}
                    className="log-card-btn delete"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Selected Log Modal */}
        {selectedLog && (
          <div className="log-modal-overlay" onClick={() => setSelectedLog(null)}>
            <div className="log-modal" onClick={(e) => e.stopPropagation()}>
              <div className="log-modal-header">
                <h2 className="log-modal-title">
                  <Shield className="w-6 h-6" />
                  Log Details
                </h2>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="log-modal-close"
                >
                  ×
                </button>
              </div>

              <div className="log-modal-content">
                <div className="log-modal-section">
                  <h3 className="log-modal-section-title">
                    <Eye className="w-5 h-5" />
                    Error Log
                  </h3>
                  <pre className="log-modal-display">{selectedLog.maskedLog}</pre>
                </div>

                <div className="log-modal-section">
                  <h3 className="log-modal-section-title">
                    <Sparkles className="w-5 h-5" />
                    AI Solution
                  </h3>
                  <div className="log-modal-solution">{selectedLog.solution}</div>
                </div>

                <div className="log-modal-meta">
                  <div className="log-modal-meta-item">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(selectedLog.createdAt)}</span>
                  </div>
                  {selectedLog.fromCache && (
                    <div className="log-modal-meta-item">
                      <CheckCircle className="w-4 h-4" />
                      <span>Cached Result</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="log-modal-footer">
                <button
                  onClick={() => handleDelete(selectedLog.id)}
                  className="log-modal-btn delete"
                >
                  <Trash2 className="w-5 h-5" />
                  Delete Log
                </button>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="log-modal-btn close"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
