import { User, Users, Globe, Shield } from 'lucide-react';
import './UserTypeBadge.css';

const UserTypeBadge = ({ userType, teamName }) => {
    const getBadgeConfig = () => {
        switch (userType) {
            case 'public':
                return {
                    label: 'Public User',
                    className: 'badge-public',
                    icon: <Globe className="w-4 h-4" />,
                    description: 'Sharing solutions globally'
                };
            case 'team':
                return {
                    label: teamName || 'Team User',
                    className: 'badge-team',
                    icon: <Users className="w-4 h-4" />,
                    description: 'Sharing with team members'
                };
            case 'private':
            default:
                return {
                    label: 'Private User',
                    className: 'badge-private',
                    icon: <User className="w-4 h-4" />,
                    description: 'Complete privacy'
                };
        }
    };

    const config = getBadgeConfig();

    return (
        <div className={`user-type-badge ${config.className}`} title={config.description}>
            <div className="badge-icon-wrapper">
                {config.icon}
            </div>
            <div className="badge-content">
                <span className="badge-label">{config.label}</span>
                <span className="badge-description">{config.description}</span>
            </div>
            <div className="badge-glow"></div>
        </div>
    );
};

export default UserTypeBadge;
