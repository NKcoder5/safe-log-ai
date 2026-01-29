import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    AlertCircle,
    User,
    Users,
    Globe,
    Key
} from 'lucide-react';
import './Auth.css';

const SignupForm = ({ onSuccess, onSwitchToLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [userType, setUserType] = useState('private');
    const [inviteCode, setInviteCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (userType === 'team' && !inviteCode.trim()) {
            setError('Invite code is required for team users');
            return;
        }

        setLoading(true);

        const result = await signup(email, password, userType, userType === 'team' ? inviteCode : null);
        setLoading(false);

        if (result.success) {
            if (onSuccess) {
                onSuccess();
            } else {
                navigate('/dashboard');
            }
        } else {
            setError(result.error);
        }
    };

    const userTypes = [
        {
            value: 'private',
            icon: User,
            title: 'Private',
            description: 'Complete privacy - logs never shared'
        },
        {
            value: 'public',
            icon: Globe,
            title: 'Public',
            description: 'Share solutions with all public users'
        },
        {
            value: 'team',
            icon: Users,
            title: 'Team',
            description: 'Share solutions only with your team'
        }
    ];

    return (
        <form onSubmit={handleSubmit} className="auth-form">
            {error && (
                <div className="auth-error">
                    <AlertCircle size={20} />
                    <p>{error}</p>
                </div>
            )}

            <div className="form-group">
                <label htmlFor="signup-email" className="form-label">
                    Email Address
                </label>
                <div className="input-wrapper">
                    <Mail size={20} className="input-icon" />
                    <input
                        type="email"
                        id="signup-email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="your@email.com"
                        className="form-input"
                        autoComplete="off"
                    />
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="signup-password" className="form-label">
                    Password
                </label>
                <div className="input-wrapper">
                    <Lock size={20} className="input-icon" />
                    <input
                        type={showPassword ? 'text' : 'password'}
                        id="signup-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        minLength={6}
                        className="form-input"
                        autoComplete="off"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="password-toggle"
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
                <small style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    Minimum 6 characters
                </small>
            </div>

            <div className="form-group">
                <label className="form-label">Choose Your Account Type</label>
                <div className="user-type-selection">
                    {userTypes.map((type) => {
                        const Icon = type.icon;
                        return (
                            <div
                                key={type.value}
                                className={`user-type-option ${type.value} ${userType === type.value ? 'selected' : ''}`}
                                onClick={() => setUserType(type.value)}
                            >
                                <div className="user-type-header">
                                    <div className="user-type-icon">
                                        <Icon size={20} />
                                    </div>
                                    <div>
                                        <div className="user-type-title">{type.title}</div>
                                        <div className="user-type-description">{type.description}</div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {userType === 'team' && (
                <div className="form-group animate-fadeInUp">
                    <label htmlFor="inviteCode" className="form-label">
                        Team Invite Code
                    </label>
                    <div className="input-wrapper">
                        <Key size={20} className="input-icon" />
                        <input
                            type="text"
                            id="inviteCode"
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value)}
                            required={userType === 'team'}
                            placeholder="Enter your team's invite code"
                            className="form-input"
                        />
                    </div>
                    <small style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                        Get this code from your team admin
                    </small>
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="auth-submit-btn"
            >
                {loading ? (
                    <>
                        <div className="loading-spinner" />
                        <span>Creating Account...</span>
                    </>
                ) : (
                    <span>Create Account</span>
                )}
            </button>

            {onSwitchToLogin && (
                <div className="auth-footer" style={{ marginTop: '1rem', background: 'transparent', border: 'none' }}>
                    <p>
                        Already have an account?{' '}
                        <button
                            type="button"
                            className="auth-link"
                            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'inherit' }}
                            onClick={onSwitchToLogin}
                        >
                            Sign in instead
                        </button>
                    </p>
                </div>
            )}
        </form>
    );
};

export default SignupForm;
