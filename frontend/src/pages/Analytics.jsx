import { BarChart3, TrendingUp, Activity, Clock } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import './Analytics.css';

const Analytics = () => {
    // Placeholder - will be implemented with actual analytics data
    return (
        <div className="analytics-page">
            <div className="analytics-container">
                <header className="analytics-header">
                    <h1 className="analytics-title">
                        <BarChart3 size={32} />
                        Analytics
                    </h1>
                    <p className="analytics-subtitle">
                        Track error trends and cache performance
                    </p>
                </header>

                {/* Placeholder Stats */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">
                            <Activity size={24} />
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">0</div>
                            <div className="stat-label">Total Logs</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            <TrendingUp size={24} />
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">0%</div>
                            <div className="stat-label">Cache Hit Rate</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            <Clock size={24} />
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">0</div>
                            <div className="stat-label">This Week</div>
                        </div>
                    </div>
                </div>

                <EmptyState
                    type="analytics"
                    title="Analytics Coming Soon"
                    description="Detailed analytics and insights will be available here once you start submitting logs"
                />
            </div>
        </div>
    );
};

export default Analytics;
