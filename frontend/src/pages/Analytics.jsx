import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Activity, Clock } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import api from '../utils/api';
import './Analytics.css';

const Analytics = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await api.get('/logs/analytics');
                setStats(response.data);
            } catch (err) {
                console.error("Failed to fetch analytics:", err);
                setError("Failed to load analytics data");
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (loading) return <LoadingState />;

    if (!stats || stats.totalLogs === 0) {
        return (
            <div className="analytics-page">
                <div className="analytics-container">
                    <header className="analytics-header">
                        <h1 className="analytics-title">
                            <BarChart3 size={32} />
                            Analytics
                        </h1>
                    </header>
                    <EmptyState
                        type="analytics"
                        title="No Analytics Data Yet"
                        description="Start submitting your error logs to see detailed insights and performance metrics"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="analytics-page">
            <div className="analytics-container">
                <header className="analytics-header">
                    <h1 className="analytics-title">
                        <BarChart3 size={32} />
                        Analytics
                    </h1>
                    <p className="analytics-subtitle">
                        Track error trends and cache performance across your logs
                    </p>
                </header>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">
                            <Activity size={24} />
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.totalLogs}</div>
                            <div className="stat-label">Total Unique Logs</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            <TrendingUp size={24} />
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.cacheHitRate}%</div>
                            <div className="stat-label">Cache Hit Rate</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            <Clock size={24} />
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.thisWeekLogs}</div>
                            <div className="stat-label">Logs (Last 7 Days)</div>
                        </div>
                    </div>
                </div>

                <div className="analytics-details">
                    <div className="detail-pane">
                        <h3>Performance Breakdown</h3>
                        <div className="performance-stat">
                            <span>Cache Savings</span>
                            <div className="stat-bar">
                                <div className="bar-fill" style={{ width: `${stats.cacheHitRate}%` }}></div>
                            </div>
                            <span>{stats.cacheHits} Hits prevented {stats.cacheHits} AI calls</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
