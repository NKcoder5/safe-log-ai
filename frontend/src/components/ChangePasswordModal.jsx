import { useState } from 'react';
import { X, Lock, AlertTriangle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import api from '../utils/api';
import './ChangePasswordModal.css';

const ChangePasswordModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (formData.newPassword !== formData.confirmPassword) {
            setError("New passwords do not match");
            return;
        }

        if (formData.newPassword.length < 6) {
            setError("Password must be at least 6 characters long");
            return;
        }

        setLoading(true);
        try {
            await api.put('/auth/update-password', {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });
            setSuccess("Password updated successfully!");
            setTimeout(() => {
                onSuccess();
                onClose();
                setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setSuccess(null);
            }, 1000);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to update password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close" onClick={onClose}>
                    <X size={20} />
                </button>

                <h2 className="modal-title">
                    <Lock size={20} />
                    Change Password
                </h2>

                {error && (
                    <div className="modal-alert error">
                        <AlertTriangle size={16} />
                        {error}
                    </div>
                )}

                {success && (
                    <div className="modal-alert success">
                        <CheckCircle2 size={16} />
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label>Current Password</label>
                        <div className="input-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                required
                            />
                            <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>New Password</label>
                        <div className="input-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Confirm New Password</label>
                        <div className="input-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-save" disabled={loading}>
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordModal;
