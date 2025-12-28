import { User, Users, Globe, Shield } from 'lucide-react';
import './UserTypeBadge.css';

const UserTypeBadge = ({ userType, teamName }) => {
    const getBadgeConfig = () => {
        switch (userType) {
            case 'public':
                return {
                    label: 'Public',
                    className: 'badge-public',
                    icon: <Globe size={16} />,
                    description: 'Solutions shared globally with all public users'
                };
            case 'team':
                return {
                    label: teamName || 'Team',
                    className: 'badge-team',
                    icon: <Users size={16} />,
                    description: 'Solutions shared only with team members'
                };
            case 'private':
            default:
                return {
                    label: 'Private',
                    className: 'badge-private',
                    icon: <Shield size={16} />,
                    description: 'Solutions are completely private and never shared'
                };
        }
    };

    const config = getBadgeConfig();

    return (
        <div className={`user-type-badge badge ${config.className}`} title={config.description}>
            {config.icon}
            <span>{config.label}</span>
        </div>
    );
};

export default UserTypeBadge;
