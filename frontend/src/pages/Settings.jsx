import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Toggle from '../components/Toggle';
import api from '../utils/api';
import { Shield, User, Users, AlertTriangle, LogOut, CheckCircle2 } from 'lucide-react';
import ChangePasswordModal from '../components/ChangePasswordModal';
import DeleteAccountModal from '../components/DeleteAccountModal';
import './Settings.css';

const Settings = () => {
    const { userType, userEmail, teamRole, refreshAuth } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Preferences State
    const [preferences, setPreferences] = useState({
        lastPasswordChange: null
    });

    // Modals State
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const isInTeam = userType === 'team';
    const isPublic = userType === 'public';

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await api.get('/auth/settings');
            setPreferences(res.data.settings);
        } catch (err) {
            console.error("Failed to fetch settings", err);
        }
    };

    const handleRoleChange = async (isChecked) => {
        const newRole = isChecked ? 'public' : 'private';
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const res = await api.put('/auth/update-role', { userType: newRole });
            refreshAuth(res.data.token);
            setSuccess(`Profile visibility updated to ${newRole}`);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update user role');
        } finally {
            setLoading(false);
        }
    };

    const handlePreferenceChange = async (key, value) => {
        // Optimistic update
        setPreferences(prev => ({ ...prev, [key]: value }));

        try {
            await api.put('/auth/update-preferences', { [key]: value });
        } catch (err) {
            // Revert on error
            setPreferences(prev => ({ ...prev, [key]: !value }));
            setError('Failed to update preference');
        }
    };

    const handleLeaveTeam = async () => {
        if (!window.confirm("Are you sure you want to leave the team? You will become a private user.")) return;

        setLoading(true);
        setError(null);
        try {
            const res = await api.delete('/teams/leave');
            refreshAuth(res.data.token);
            setSuccess("You have left the team and are now a private user.");
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to leave team');
        } finally {
            setLoading(false);
        }
    };

    const handleDisperseTeam = async () => {
        if (!window.confirm("WARNING: This will delete the team completely and convert all members to private users. This action CANNOT be undone. Are you sure?")) return;

        setLoading(true);
        setError(null);
        try {
            const res = await api.delete('/teams/disperse');
            refreshAuth(res.data.token);
            setSuccess("Team dispersed successfully. You are now a private user.");
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to disperse team');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="settings-page">
            <div className="settings-container">
                <header className="settings-header">
                    <div className="profile-card">
                        <div className="profile-avatar-section">
                            <div className="profile-avatar">
                                {userEmail?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="profile-status-indicator online"></div>
                        </div>
                        <div className="profile-details">
                            <h2 className="profile-email">{userEmail}</h2>
                            <div className="profile-badges">
                                <span className={`role-badge ${userType}`}>
                                    {userType === 'team' ? 'Team Member' : userType === 'public' ? 'Public Profile' : 'Private Profile'}
                                </span>
                                {teamRole && <span className="role-badge team-role">{teamRole}</span>}
                            </div>
                        </div>
                    </div>
                </header>

                {error && (
                    <div className="settings-alert error">
                        <AlertTriangle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="settings-alert success">
                        <CheckCircle2 size={20} />
                        <span>{success}</span>
                    </div>
                )}

                <div className="settings-grid">
                    {/* Column 1: Core Settings */}
                    <div className="settings-column">
                        {/* Profile Visibility Section */}
                        <section className="settings-section">
                            <div className="section-header">
                                <div className="header-icon-wrapper">
                                    <Shield size={20} className="section-icon" />
                                </div>
                                <div>
                                    <h2 className="section-title">Visibility</h2>
                                    <p className="section-description">
                                        Control your solution sharing preferences.
                                    </p>
                                </div>
                            </div>

                            <div className="section-content">
                                {isInTeam ? (
                                    <div className="team-lock-message">
                                        <Users size={18} />
                                        <p>
                                            Managed by your Team. Leave team to change.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="visibility-control">
                                        <Toggle
                                            label={isPublic ? "Public Profile" : "Private Profile"}
                                            checked={isPublic}
                                            onChange={handleRoleChange}
                                        />
                                        <p className="visibility-hint">
                                            {isPublic
                                                ? "Your solutions are shared globally with the community."
                                                : "Your solutions are private and visible only to you."}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Preferences Section */}
                        <section className="settings-section">
                            <div className="section-header">
                                <div className="header-icon-wrapper info">
                                    <CheckCircle2 size={20} className="section-icon text-info" />
                                </div>
                                <div>
                                    <h2 className="section-title">Preferences</h2>
                                    <p className="section-description">
                                        Customize your application experience.
                                    </p>
                                </div>
                            </div>
                            <div className="section-content">
                                <div className="setting-item">
                                    <label>Appearance</label>
                                    <Toggle
                                        label={theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                                        checked={theme === 'dark'}
                                        onChange={toggleTheme}
                                    />
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Column 2: Security & Advanced */}
                    <div className="settings-column">
                        {/* Security Section */}
                        <section className="settings-section">
                            <div className="section-header">
                                <div className="header-icon-wrapper warning">
                                    <Shield size={20} className="section-icon text-warning" />
                                </div>
                                <div>
                                    <h2 className="section-title">Security</h2>
                                    <p className="section-description">
                                        Manage your account security settings.
                                    </p>
                                </div>
                            </div>
                            <div className="section-content">
                                <div className="setting-row">
                                    <div className="setting-info">
                                        <span className="setting-name">Password</span>
                                        <span className="setting-status">
                                            Last changed {formatDate(preferences.lastPasswordChange)}
                                        </span>
                                    </div>
                                    <button
                                        className="btn-secondary"
                                        onClick={() => setIsPasswordModalOpen(true)}
                                    >
                                        Update
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* Team Management Section (Only visible if in a team) */}
                        {isInTeam && (
                            <section className="settings-section danger-zone">
                                <div className="section-header">
                                    <div className="header-icon-wrapper danger">
                                        <Users size={20} className="section-icon text-error" />
                                    </div>
                                    <div>
                                        <h2 className="section-title text-error">Team</h2>
                                        <p className="section-description">
                                            Manage your team membership.
                                        </p>
                                    </div>
                                </div>

                                <div className="section-content">
                                    {teamRole === 'admin' ? (
                                        <div className="admin-actions">
                                            <p className="danger-text">
                                                Dispersing will delete the team for everyone.
                                            </p>
                                            <button
                                                className="btn-danger"
                                                onClick={handleDisperseTeam}
                                                disabled={loading}
                                            >
                                                {loading ? '...' : 'Disperse Team'}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="member-actions">
                                            <p className="danger-text">
                                                Leave to become a private user.
                                            </p>
                                            <button
                                                className="btn-danger"
                                                onClick={handleLeaveTeam}
                                                disabled={loading}
                                            >
                                                {loading ? '...' : 'Leave Team'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}

                        {/* Account Actions Section */}
                        <section className="settings-section">
                            <div className="section-header">
                                <div className="header-icon-wrapper danger">
                                    <LogOut size={20} className="section-icon text-error" />
                                </div>
                                <div>
                                    <h2 className="section-title text-error">Danger Zone</h2>
                                    <p className="section-description">
                                        Irreversible account actions.
                                    </p>
                                </div>
                            </div>
                            <div className="section-content">
                                <div className="setting-row">
                                    <div className="setting-info">
                                        <span className="setting-name text-error">Delete Account</span>
                                    </div>
                                    <button
                                        className="btn-danger-outline"
                                        onClick={() => setIsDeleteModalOpen(true)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

                {/* Modals */}
                <ChangePasswordModal
                    isOpen={isPasswordModalOpen}
                    onClose={() => setIsPasswordModalOpen(false)}
                    onSuccess={() => {
                        setSuccess("Password changed successfully");
                        fetchSettings(); // refresh last changed date
                    }}
                />

                <DeleteAccountModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                />

            </div>
        </div>
    );
};

export default Settings;
