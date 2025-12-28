import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Shield } from 'lucide-react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import './AuthDrawer.css';

const AuthDrawer = ({ isOpen, onClose, initialMode = 'login' }) => {
    const [mode, setMode] = useState(initialMode);
    const [isClosing, setIsClosing] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen) {
            setMode(initialMode);
            setIsClosing(false);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen, initialMode]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 300);
    };

    const handleSuccess = () => {
        handleClose();
        navigate('/dashboard');
    };

    if (!isOpen && !isClosing) return null;

    return (
        <div className={`auth-drawer-overlay ${isClosing ? 'closing' : ''}`} onClick={handleClose}>
            <div className="auth-drawer" onClick={(e) => e.stopPropagation()}>
                <div className="auth-drawer-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Shield size={24} className="text-accent-blue" stroke="#3b82f6" />
                        <h2 className="auth-drawer-title">
                            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                        </h2>
                    </div>
                    <button className="auth-drawer-close" onClick={handleClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="auth-drawer-tabs">
                    <button
                        className={`auth-drawer-tab ${mode === 'login' ? 'active' : ''}`}
                        onClick={() => setMode('login')}
                    >
                        Sign In
                    </button>
                    <button
                        className={`auth-drawer-tab ${mode === 'signup' ? 'active' : ''}`}
                        onClick={() => setMode('signup')}
                    >
                        Sign Up
                    </button>
                </div>

                <div className="auth-drawer-content">
                    {/* Wrap in auth-page to inherit input styles from Auth.css, but override layout in inline style */}
                    <div className="auth-page" style={{
                        minHeight: 'auto',
                        padding: 0,
                        display: 'block',
                        background: 'transparent',
                        width: '100%'
                    }}>
                        {mode === 'login' ? (
                            <LoginForm
                                onSuccess={handleSuccess}
                                onSwitchToSignup={() => setMode('signup')}
                            />
                        ) : (
                            <SignupForm
                                onSuccess={handleSuccess}
                                onSwitchToLogin={() => setMode('login')}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthDrawer;
