import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import LoadingState from './LoadingState';
import './Auth.css';

const LoginForm = ({ onSuccess, onSwitchToSignup }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(email, password);
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

    return (
        <form onSubmit={handleSubmit} className="auth-form">
            {error && (
                <div className="auth-error">
                    <AlertCircle size={20} />
                    <p>{error}</p>
                </div>
            )}

            <div className="form-group">
                <label htmlFor="login-email" className="form-label">
                    Email Address
                </label>
                <div className="input-wrapper">
                    <Mail size={20} className="input-icon" />
                    <input
                        type="email"
                        id="login-email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="your@email.com"
                        className="form-input"
                    />
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="login-password" className="form-label">
                    Password
                </label>
                <div className="input-wrapper">
                    <Lock size={20} className="input-icon" />
                    <input
                        type={showPassword ? 'text' : 'password'}
                        id="login-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        minLength={6}
                        className="form-input"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="password-toggle"
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="auth-submit-btn"
            >
                {loading ? (
                    <>
                        <div className="loading-spinner" />
                        <span>Signing In...</span>
                    </>
                ) : (
                    <span>Sign In</span>
                )}
            </button>

            {onSwitchToSignup && (
                <div className="auth-footer" style={{ marginTop: '1rem', background: 'transparent', border: 'none' }}>
                    <p>
                        Don't have an account?{' '}
                        <button
                            type="button"
                            className="auth-link"
                            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'inherit' }}
                            onClick={onSwitchToSignup}
                        >
                            Create one now
                        </button>
                    </p>
                </div>
            )}
        </form>
    );
};

export default LoginForm;
