import { useState, useEffect } from 'react';
import { Sparkles, CheckCircle, Clock, Copy, Check } from 'lucide-react';
import './AISolutionCard.css';

const AISolutionCard = ({
    solution,
    fromCache = false,
    cacheScope = 'private',
    timestamp,
    showDelay = true
}) => {
    const [isRevealed, setIsRevealed] = useState(!showDelay);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (showDelay) {
            const timer = setTimeout(() => {
                setIsRevealed(true);
            }, 400);
            return () => clearTimeout(timer);
        }
    }, [showDelay]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(solution);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const getCacheScopeLabel = () => {
        switch (cacheScope) {
            case 'public':
                return 'Global Public Cache';
            case 'team':
                return 'Team Cache';
            case 'private':
            default:
                return 'Private Cache';
        }
    };

    if (!isRevealed) {
        return (
            <div className="ai-solution-card loading">
                <div className="ai-solution-header">
                    <div className="ai-solution-title">
                        <Sparkles size={20} className="ai-icon animate-pulse" />
                        <span>Generating AI Solution...</span>
                    </div>
                </div>
                <div className="ai-solution-skeleton">
                    <div className="skeleton-line"></div>
                    <div className="skeleton-line"></div>
                    <div className="skeleton-line short"></div>
                </div>
            </div>
        );
    }

    return (
        <div className={`ai-solution-card ${fromCache ? 'cached' : 'fresh'} animate-fadeInUp`}>
            {/* Header */}
            <div className="ai-solution-header">
                <div className="ai-solution-title">
                    {fromCache ? (
                        <>
                            <CheckCircle size={20} className="ai-icon cached" />
                            <span>Cached AI Solution</span>
                        </>
                    ) : (
                        <>
                            <Sparkles size={20} className="ai-icon fresh" />
                            <span>Fresh AI Solution</span>
                        </>
                    )}
                </div>

                <button
                    className="copy-btn"
                    onClick={handleCopy}
                    aria-label="Copy solution"
                >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
            </div>

            {/* Cache Info */}
            {fromCache && (
                <div className="cache-info">
                    <Clock size={14} />
                    <span>Retrieved from {getCacheScopeLabel()}</span>
                </div>
            )}

            {/* Solution Content */}
            <div className="ai-solution-content">
                {solution}
            </div>

            {/* Footer */}
            {timestamp && (
                <div className="ai-solution-footer">
                    <span className="ai-timestamp">
                        Generated {new Date(timestamp).toLocaleString()}
                    </span>
                </div>
            )}
        </div>
    );
};

export default AISolutionCard;
