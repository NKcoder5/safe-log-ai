import { Shield, Info } from 'lucide-react';
import './MaskedDataIndicator.css';

const MaskedDataIndicator = ({
    type = 'general',
    count = 1,
    showTooltip = true
}) => {
    const getTypeInfo = () => {
        switch (type) {
            case 'email':
                return { label: 'Email', icon: '📧' };
            case 'phone':
                return { label: 'Phone', icon: '📱' };
            case 'password':
                return { label: 'Password', icon: '🔑' };
            case 'api-key':
                return { label: 'API Key', icon: '🔐' };
            case 'token':
                return { label: 'Token', icon: '🎫' };
            case 'credit-card':
                return { label: 'Credit Card', icon: '💳' };
            case 'ssn':
                return { label: 'SSN', icon: '🆔' };
            case 'ip':
                return { label: 'IP Address', icon: '🌐' };
            case 'url':
                return { label: 'URL', icon: '🔗' };
            default:
                return { label: 'Sensitive Data', icon: '🛡️' };
        }
    };

    const typeInfo = getTypeInfo();

    return (
        <div className="masked-data-indicator" title={showTooltip ? `${count} ${typeInfo.label} masked` : ''}>
            <Shield size={12} className="masked-icon" />
            <span className="masked-label">
                {typeInfo.icon} {typeInfo.label}
                {count > 1 && <span className="masked-count"> ×{count}</span>}
            </span>
        </div>
    );
};

export default MaskedDataIndicator;
