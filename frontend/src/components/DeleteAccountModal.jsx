import { useState } from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './DeleteAccountModal.css';

const DeleteAccountModal = ({ isOpen, onClose }) => {
    const { logout } = useAuth();
    const [confirmText, setConfirmText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handleDelete = async () => {
        if (confirmText !== 'delete') return;

        setLoading(true);
        setError(null);
        try {
            await api.delete('/auth/delete-account');
            logout(); // Redirects to login/home usually
        } catch (err) {
            setError(err.response?.data?.error || "Failed to delete account");
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content danger-theme">
                <button className="modal-close" onClick={onClose}>
                    <X size={20} />
                </button>

                <h2 className="modal-title text-error">
                    <Trash2 size={24} />
                    Delete Account
                </h2>

                <p className="modal-description">
                    This action is <strong className="text-white">irreversible</strong>. This will permanently delete your account and all associated data.
                </p>

                {error && (
                    <div className="modal-alert error">
                        <AlertTriangle size={16} />
                        {error}
                    </div>
                )}

                <div className="form-group margin-top-4">
                    <label>Type <strong>delete</strong> to confirm:</label>
                    <div className="input-wrapper">
                        <input
                            type="text"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            placeholder="delete"
                            className="input-danger"
                        />
                    </div>
                </div>

                <div className="modal-actions">
                    <button className="btn-cancel" onClick={onClose} disabled={loading}>
                        Cancel
                    </button>
                    <button
                        className="btn-delete-confirm"
                        onClick={handleDelete}
                        disabled={loading || confirmText !== 'delete'}
                    >
                        {loading ? 'Deleting...' : 'Permanently Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteAccountModal;
