import { Loader2 } from 'lucide-react';
import './LoadingState.css';

const LoadingState = ({
    type = 'spinner',
    message = 'Loading...',
    size = 'medium'
}) => {
    if (type === 'skeleton') {
        return (
            <div className="loading-skeleton">
                <div className="skeleton-card">
                    <div className="skeleton-header">
                        <div className="skeleton-avatar"></div>
                        <div className="skeleton-lines">
                            <div className="skeleton-line"></div>
                            <div className="skeleton-line short"></div>
                        </div>
                    </div>
                    <div className="skeleton-content">
                        <div className="skeleton-line"></div>
                        <div className="skeleton-line"></div>
                        <div className="skeleton-line short"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (type === 'pulse') {
        return (
            <div className="loading-pulse">
                <div className="pulse-dot"></div>
                <div className="pulse-dot"></div>
                <div className="pulse-dot"></div>
            </div>
        );
    }

    // Default spinner
    return (
        <div className={`loading-spinner-container ${size}`}>
            <Loader2 className="loading-spinner" />
            {message && <p className="loading-message">{message}</p>}
        </div>
    );
};

export default LoadingState;
