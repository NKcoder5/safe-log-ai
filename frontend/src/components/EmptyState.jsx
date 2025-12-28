import { FileX, Inbox, Search, Users, BarChart3 } from 'lucide-react';
import './EmptyState.css';

const EmptyState = ({
    type = 'general',
    title,
    description,
    action,
    onAction
}) => {
    const getEmptyStateConfig = () => {
        switch (type) {
            case 'logs':
                return {
                    icon: FileX,
                    defaultTitle: 'No logs yet',
                    defaultDescription: 'Submit your first error log to get started with AI-powered solutions'
                };
            case 'history':
                return {
                    icon: Inbox,
                    defaultTitle: 'No history found',
                    defaultDescription: 'Your submitted logs will appear here'
                };
            case 'search':
                return {
                    icon: Search,
                    defaultTitle: 'No results found',
                    defaultDescription: 'Try adjusting your search criteria'
                };
            case 'team':
                return {
                    icon: Users,
                    defaultTitle: 'No team members',
                    defaultDescription: 'Invite team members to collaborate on error logs'
                };
            case 'analytics':
                return {
                    icon: BarChart3,
                    defaultTitle: 'No data available',
                    defaultDescription: 'Analytics will appear once you have submitted logs'
                };
            default:
                return {
                    icon: Inbox,
                    defaultTitle: 'Nothing here',
                    defaultDescription: 'Get started by taking an action'
                };
        }
    };

    const config = getEmptyStateConfig();
    const Icon = config.icon;
    const displayTitle = title || config.defaultTitle;
    const displayDescription = description || config.defaultDescription;

    return (
        <div className="empty-state">
            <div className="empty-state-icon">
                <Icon size={48} />
            </div>
            <h3 className="empty-state-title">{displayTitle}</h3>
            <p className="empty-state-description">{displayDescription}</p>
            {action && onAction && (
                <button className="empty-state-action" onClick={onAction}>
                    {action}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
