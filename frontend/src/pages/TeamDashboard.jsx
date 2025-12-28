import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import {
    Users,
    Crown,
    UserPlus,
    Copy,
    Check,
    Trash2,
    LogOut,
    Shield
} from 'lucide-react';
import './Team.css';

const TeamDashboard = () => {
    const { userType, teamId, teamRole, userId, refreshAuth } = useAuth();
    const navigate = useNavigate();
    const [team, setTeam] = useState(null);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [teamName, setTeamName] = useState('');
    const [teamDescription, setTeamDescription] = useState('');
    const [creating, setCreating] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);

    const fetchTeamInfo = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/teams/my-team');
            setTeam(response.data.team);
            setMembers(response.data.members);
            setError('');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load team info');
            setTeam(null);
            setMembers([]);
        } finally {
            setLoading(false);
        }
    }, [teamId]);

    useEffect(() => {
        if (teamId) {
            fetchTeamInfo();
        } else {
            setLoading(false);
            setTeam(null);
            setMembers([]);
        }
    }, [teamId, fetchTeamInfo]);

    const handleCreateTeam = async (e) => {
        e.preventDefault();
        setCreating(true);
        setError('');

        try {
            const response = await api.post('/teams/create', {
                name: teamName,
                description: teamDescription
            });

            if (response.data.token) {
                refreshAuth(response.data.token);
            }

            setTeam(response.data.team);
            if (response.data.user) {
                setMembers([{
                    _id: response.data.user.id,
                    email: response.data.user.email,
                    teamRole: response.data.user.teamRole || 'admin',
                    createdAt: new Date().toISOString()
                }]);
            }

            setShowCreateForm(false);
            setTeamName('');
            setTeamDescription('');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create team');
        } finally {
            setCreating(false);
        }
    };

    const handleCopyInviteCode = () => {
        if (team?.inviteCode) {
            navigator.clipboard.writeText(team.inviteCode);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        }
    };

    const handleLeaveTeam = async () => {
        if (!confirm('Are you sure you want to leave this team?')) return;

        try {
            const response = await api.delete('/teams/leave');
            if (response.data.token) {
                refreshAuth(response.data.token);
            }
            setTeam(null);
            setMembers([]);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to leave team');
        }
    };

    const handleRemoveMember = async (memberId) => {
        if (!confirm('Are you sure you want to remove this member?')) return;

        try {
            await api.delete(`/teams/${teamId}/remove/${memberId}`);
            fetchTeamInfo();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to remove member');
        }
    };

    if (loading) {
        return (
            <div className="team-page">
                <LoadingState size="large" message="Loading team information..." />
            </div>
        );
    }

    // No team - show create form
    if (!teamId) {
        return (
            <div className="team-page">
                <div className="team-container">
                    <header className="team-header">
                        <h1 className="team-title">
                            <Users size={32} />
                            Team Management
                        </h1>
                        <p className="team-subtitle">Create a team to collaborate with others</p>
                    </header>

                    {error && (
                        <div className="error-banner">
                            <p>{error}</p>
                        </div>
                    )}

                    {!showCreateForm ? (
                        <EmptyState
                            type="team"
                            title="No Team Yet"
                            description="Create a team to share error logs and solutions with your colleagues"
                            action="Create Team"
                            onAction={() => setShowCreateForm(true)}
                        />
                    ) : (
                        <form onSubmit={handleCreateTeam} className="team-form">
                            <div className="form-group">
                                <label htmlFor="teamName" className="form-label">
                                    <Users size={18} />
                                    <span>Team Name</span>
                                </label>
                                <input
                                    type="text"
                                    id="teamName"
                                    value={teamName}
                                    onChange={(e) => setTeamName(e.target.value)}
                                    required
                                    placeholder="Engineering Team"
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="teamDescription" className="form-label">
                                    <span>Description (Optional)</span>
                                </label>
                                <textarea
                                    id="teamDescription"
                                    value={teamDescription}
                                    onChange={(e) => setTeamDescription(e.target.value)}
                                    placeholder="Describe your team..."
                                    rows={3}
                                    className="form-textarea"
                                />
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="btn-primary" disabled={creating}>
                                    {creating ? 'Creating...' : 'Create Team'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateForm(false)}
                                    className="btn-secondary"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        );
    }

    // Has team - show team info
    return (
        <div className="team-page">
            <div className="team-container">
                {/* Header */}
                <header className="team-header">
                    <div>
                        <h1 className="team-title">
                            <Users size={32} />
                            {team?.name || 'Loading...'}
                        </h1>
                        <p className="team-subtitle">{team?.description || 'No description'}</p>
                    </div>
                    <div className={`role-badge ${teamRole}`}>
                        {teamRole === 'admin' ? (
                            <>
                                <Crown size={16} />
                                <span>Admin</span>
                            </>
                        ) : (
                            <>
                                <Shield size={16} />
                                <span>Member</span>
                            </>
                        )}
                    </div>
                </header>

                {error && (
                    <div className="error-banner">
                        <p>{error}</p>
                    </div>
                )}

                {/* Invite Code Section - Admin Only */}
                {teamRole === 'admin' && (
                    <div className="invite-section">
                        <div className="invite-header">
                            <h2 className="invite-title">
                                <UserPlus size={24} />
                                Team Invite Code
                            </h2>
                            <p className="invite-description">
                                Share this code with others to invite them to your team
                            </p>
                        </div>
                        {team?.inviteCode ? (
                            <div className="invite-code-box">
                                <code className="invite-code">{team.inviteCode}</code>
                                <button onClick={handleCopyInviteCode} className="copy-btn">
                                    {copySuccess ? (
                                        <>
                                            <Check size={18} />
                                            <span>Copied!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy size={18} />
                                            <span>Copy Code</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        ) : (
                            <LoadingState type="pulse" message="Loading invite code..." />
                        )}
                    </div>
                )}

                {/* Team Members */}
                <div className="members-section">
                    <h2 className="members-title">
                        <Users size={24} />
                        Team Members ({members.length})
                    </h2>
                    <div className="members-grid">
                        {members && members.length > 0 ? (
                            members.map((member) =>
                                member && member._id ? (
                                    <div key={member._id} className="member-card">
                                        <div className="member-avatar">
                                            {member.email?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <div className="member-info">
                                            <div className="member-email">{member.email || 'Unknown'}</div>
                                            <div className="member-meta">
                                                <span className={`member-role ${member.teamRole}`}>
                                                    {member.teamRole === 'admin' ? (
                                                        <>
                                                            <Crown size={12} />
                                                            Admin
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Shield size={12} />
                                                            Member
                                                        </>
                                                    )}
                                                </span>
                                                <span className="member-joined">
                                                    Joined {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : 'Recently'}
                                                </span>
                                            </div>
                                        </div>
                                        {teamRole === 'admin' && member._id !== userId && (
                                            <button
                                                onClick={() => handleRemoveMember(member._id)}
                                                className="remove-btn"
                                                aria-label="Remove member"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                ) : null
                            )
                        ) : (
                            <LoadingState type="pulse" message="Loading members..." />
                        )}
                    </div>
                </div>

                {/* Leave Team */}
                <div className="team-actions">
                    <button onClick={handleLeaveTeam} className="btn-danger">
                        <LogOut size={18} />
                        <span>Leave Team</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TeamDashboard;
