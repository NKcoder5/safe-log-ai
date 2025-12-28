import { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, Hash, TrendingUp, Shield, Sparkles } from 'lucide-react';
import './LogCard.css';

const LogCard = ({
    log,
    showMasked = false,
    onExpand,
    isExpanded = false
}) => {
    const [expanded, setExpanded] = useState(isExpanded);

    const toggleExpand = () => {
        setExpanded(!expanded);
        if (onExpand) onExpand(!expanded);
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const truncateFingerprint = (fingerprint) => {
        if (!fingerprint) return 'N/A';
        return fingerprint.length > 12
            ? `${fingerprint.substring(0, 12)}...`
            : fingerprint;
    };

    return (
        <div className={`log-card ${expanded ? 'expanded' : ''}`}>
            {/* Card Header - Always Visible */}
            <div className="log-card-header" onClick={toggleExpand}>
                <div className="log-card-title">
                    <Shield size={18} className="log-card-icon" />
                    <span className="log-card-preview">
                        {log.originalLog?.substring(0, 80) || log.maskedLog?.substring(0, 80) || 'Error log'}
                        {(log.originalLog?.length > 80 || log.maskedLog?.length > 80) && '...'}
                    </span>
                </div>

                <button className="log-card-toggle" aria-label={expanded ? 'Collapse' : 'Expand'}>
                    {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
            </div>

            {/* Card Metadata - Always Visible */}
            <div className="log-card-meta">
                {log.createdAt && (
                    <div className="log-meta-item">
                        <Clock size={14} />
                        <span>{formatTimestamp(log.createdAt)}</span>
                    </div>
                )}

                {log.fingerprint && (
                    <div className="log-meta-item">
                        <Hash size={14} />
                        <span title={log.fingerprint}>{truncateFingerprint(log.fingerprint)}</span>
                    </div>
                )}

                {log.hitCount && (
                    <div className="log-meta-item">
                        <TrendingUp size={14} />
                        <span>{log.hitCount} occurrence{log.hitCount > 1 ? 's' : ''}</span>
                    </div>
                )}
            </div>

            {/* Expanded Content */}
            {expanded && (
                <div className="log-card-content">
                    {/* AI Solution */}
                    {log.aiSolution && (
                        <div className="log-section solution">
                            <div className="log-section-header">
                                <Sparkles size={16} className="solution-icon" />
                                <span className="log-section-title">AI Solution</span>
                            </div>
                            <div className="solution-display">
                                {log.aiSolution}
                            </div>
                        </div>
                    )}

                    {/* Original Log */}
                    {log.originalLog && (
                        <div className="log-section">
                            <div className="log-section-header">
                                <span className="log-section-title">Original Log</span>
                            </div>
                            <pre className="log-display">{log.originalLog}</pre>
                        </div>
                    )}

                    {/* Masked Log */}
                    {showMasked && log.maskedLog && log.maskedLog !== log.originalLog && (
                        <div className="log-section masked">
                            <div className="log-section-header">
                                <span className="log-section-title">
                                    <Shield size={16} />
                                    Masked Version (Sent to AI)
                                </span>
                            </div>
                            <div className="masked-hint">
                                Sensitive data has been removed for security
                            </div>
                            <pre className="log-display masked">{log.maskedLog}</pre>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default LogCard;
