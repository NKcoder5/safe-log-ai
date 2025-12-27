import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './Team.css';
import './TeamInviteCode.css';

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

    console.log('🎯 TeamDashboard render - teamId:', teamId, 'team:', team?.name);

    const fetchTeamInfo = useCallback(async () => {
        console.log('📡 Fetching team info for teamId:', teamId);
        setLoading(true);
        try {
            const response = await api.get('/teams/my-team');
            console.log('✅ Team info fetched:', response.data.team);
            setTeam(response.data.team);
            setMembers(response.data.members);
            setError('');
        } catch (err) {
            console.error('❌ Failed to fetch team:', err);
            setError(err.response?.data?.error || 'Failed to load team info');
            setTeam(null);
            setMembers([]);
        } finally {
            setLoading(false);
        }
    }, [teamId]);

    useEffect(() => {
        console.log('🔄 useEffect triggered - teamId:', teamId);
        if (teamId) {
            fetchTeamInfo();
        } else {
            console.log('⚠️  No teamId, clearing team state');
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
            console.log('🚀 Creating team:', teamName);
            const response = await api.post('/teams/create', {
                name: teamName,
                description: teamDescription
            });

            console.log('✅ Team creation response:', response.data);
            console.log('   - Team:', response.data.team);
            console.log('   - User:', response.data.user);
            console.log('   - Token:', response.data.token ? 'present' : 'MISSING');

            // Update auth context with new token
            if (response.data.token) {
                console.log('🔄 Calling refreshAuth...');
                refreshAuth(response.data.token);
            } else {
                console.error('❌ NO TOKEN IN RESPONSE!');
            }

            // Set team data immediately
            const teamData = response.data.team;
            const userData = response.data.user;

            setTeam(teamData);

            // Initialize members
            if (userData && userData.id) {
                setMembers([{
                    _id: userData.id,
                    email: userData.email,
                    teamRole: userData.teamRole || 'admin',
                    createdAt: new Date().toISOString()
                }]);
            }

            setShowCreateForm(false);
            setTeamName('');
            setTeamDescription('');

            console.log('✅ Team creation complete!');

        } catch (err) {
            console.error('❌ Team creation error:', err);
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
        console.log('⏳ Showing loading state');
        return <div className="team-dashboard"><div className="loading">Loading...</div></div>;
    }

    // No team - show create form
    if (!teamId) {
        console.log('📝 Showing create form (no teamId)');
        return (
            <div className="team-dashboard">
                <div className="team-container">
                    <h1>Team Management</h1>
                    <p className="team-subtitle">Create a team to collaborate with others</p>

                    {error && <div className="error-message">{error}</div>}

                    {!showCreateForm ? (
                        <div className="no-team">
                            <p>You're not part of any team yet.</p>
                            <button onClick={() => setShowCreateForm(true)} className="btn btn-primary">
                                Create Team
                            </button>
                            <p className="hint">Or ask your team admin for an invite code during signup</p>
                        </div>
                    ) : (
                        <form onSubmit={handleCreateTeam} className="team-form">
                            <div className="form-group">
                                <label htmlFor="teamName">Team Name</label>
                                <input
                                    type="text"
                                    id="teamName"
                                    value={teamName}
                                    onChange={(e) => setTeamName(e.target.value)}
                                    required
                                    placeholder="Engineering Team"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="teamDescription">Description (Optional)</label>
                                <textarea
                                    id="teamDescription"
                                    value={teamDescription}
                                    onChange={(e) => setTeamDescription(e.target.value)}
                                    placeholder="Describe your team..."
                                    rows={3}
                                />
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="btn btn-primary" disabled={creating}>
                                    {creating ? 'Creating...' : 'Create Team'}
                                </button>
                                <button type="button" onClick={() => setShowCreateForm(false)} className="btn btn-secondary">
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
    console.log('👥 Showing team view');
    return (
        <div className="team-dashboard">
            <div className="team-container">
                <div className="team-header">
                    <div>
                        <h1>{team?.name || 'Loading...'}</h1>
                        <p className="team-subtitle">{team?.description || 'No description'}</p>
                    </div>
                    <div className="team-role-badge">
                        {teamRole === 'admin' ? '👑 Admin' : '👤 Member'}
                    </div>
                </div>

                {error && <div className="error-message">{error}</div>}

                {/* Debug Info - Commented out for production
                <div style={{ background: '#f0f0f0', padding: '10px', marginBottom: '10px', fontSize: '12px' }}>
                    <strong>Debug Info:</strong><br />
                    teamId from context: {teamId || 'null'}<br />
                    team state: {team ? team.name : 'null'}<br />
                    inviteCode: {team?.inviteCode || 'not loaded'}<br />
                    localStorage teamId: {localStorage.getItem('teamId') || 'not set'}
                </div>
                */}

                {/* Prominent Invite Code Section - ADMIN ONLY */}
                {teamRole === 'admin' && (
                    <div className="invite-code-section-prominent">
                        <div className="invite-code-header">
                            <h2>🔑 Team Invite Code</h2>
                            <p className="invite-hint">Share this code with others to invite them to your team</p>
                        </div>
                        {team?.inviteCode ? (
                            <div className="invite-code-box">
                                <div className="invite-code-large">{team.inviteCode}</div>
                                <button onClick={handleCopyInviteCode} className="btn-copy">
                                    {copySuccess ? '✓ Copied!' : '📋 Copy Code'}
                                </button>
                            </div>
                        ) : (
                            <div className="loading">Loading invite code...</div>
                        )}
                    </div>
                )}

                {/* Team Members */}
                <div className="team-members-section">
                    <h2>Team Members ({members.length})</h2>
                    <div className="members-list">
                        {members && members.length > 0 ? (
                            members.map((member) => (
                                member && member._id ? (
                                    <div key={member._id} className="member-card">
                                        <div className="member-info">
                                            <div className="member-email">{member.email || 'Unknown'}</div>
                                            <div className="member-meta">
                                                <span className={`role-badge ${member.teamRole}`}>
                                                    {member.teamRole === 'admin' ? '👑 Admin' : '👤 Member'}
                                                </span>
                                                <span className="join-date">
                                                    Joined {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : 'Recently'}
                                                </span>
                                            </div>
                                        </div>
                                        {teamRole === 'admin' && member._id !== userId && (
                                            <button
                                                onClick={() => handleRemoveMember(member._id)}
                                                className="btn btn-danger btn-sm"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                ) : null
                            ))
                        ) : (
                            <div className="loading">Loading members...</div>
                        )}
                    </div>
                </div>

                {/* Leave Team */}
                <div className="team-actions">
                    <button onClick={handleLeaveTeam} className="btn btn-danger">
                        Leave Team
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TeamDashboard;
