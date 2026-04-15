import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChatContext } from '../../context/ChatContext';

// ─── Token helper ────────────────────────────────────────────────────────────
const getToken = (user) =>
    user?.token || JSON.parse(localStorage.getItem('user'))?.token;

// ─── Cache helpers ───────────────────────────────────────────────────────────
const CACHE_KEY = 'aurora_team_cache';
const AUTO_CLEAR_MS = 3000;

const getCachedData = () => {
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            const { teams, currentTeamId, activities } = JSON.parse(cached);
            if (Array.isArray(teams) && teams.length > 0) return { teams, currentTeamId, activities: activities || [] };
        }
    } catch { }
    return null;
};



export const useTeamManagement = () => {
    const { user } = useAuth();
    const { socketRef, socketConnected } = useChatContext();

    // ── Initialize from cache for instant render ─────────────────────────────
    const cached = useRef(getCachedData()).current;

    // ── Core state ───────────────────────────────────────────────────────────
    const [teams, setTeams] = useState(cached?.teams || []);
    const [currentTeamId, setCurrentTeamId] = useState(cached?.currentTeamId || null);
    const [activities, setActivities] = useState(cached?.activities || []);
    const [loading, setLoading] = useState(!cached);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Sync cache whenever state changes
    useEffect(() => {
        if (teams.length > 0) {
            try {
                localStorage.setItem(CACHE_KEY, JSON.stringify({ teams, currentTeamId, activities }));
            } catch { }
        }
    }, [teams, currentTeamId, activities]);

    // ── Input state ──────────────────────────────────────────────────────────
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteName, setInviteName] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [hoveredMember, setHoveredMember] = useState(null);

    // ── Dropdown state ───────────────────────────────────────────────────────
    const [allUsers, setAllUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);

    // ── Refs ─────────────────────────────────────────────────────────────────
    const debounceTimerRef = useRef(null);
    const successTimerRef = useRef(null);

    // Auto-clear success messages, cleaning up on unmount
    const showSuccess = useCallback((msg) => {
        setSuccess(msg);
        if (successTimerRef.current) clearTimeout(successTimerRef.current);
        successTimerRef.current = setTimeout(() => setSuccess(''), AUTO_CLEAR_MS);
    }, []);

    useEffect(() => () => {
        if (successTimerRef.current) clearTimeout(successTimerRef.current);
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    }, []);

    // ── Fetch teams (silently refreshes in background if cache exists) ───────
    const fetchTeams = useCallback(async () => {
        try {
            // Only show loading spinner if there's no cached data to display
            if (!getCachedData()) setLoading(true);

            const token = getToken(user);
            const isMaster = user?.role === 'master_admin';
            const endpoint = isMaster ? '/api/admin/teams' : '/api/team';

            const res = await fetch(endpoint, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.message || 'Failed to fetch teams');
                return;
            }

            let fetchedTeams = Array.isArray(data) ? data : [];

            // Normalize data: ensure id is set and isOwner reflects master_admin status
            fetchedTeams = fetchedTeams.map(t => {
                const members = t.members || [];
                const owner = t.owner;
                const ownerInMembers = owner && members.some(m => (m._id || m) === (owner._id || owner));
                
                return {
                    ...t,
                    id: t.id || t._id,
                    isOwner: isMaster ? true : (t.isOwner || owner?._id === user._id),
                    totalMemberCount: members.length + (ownerInMembers ? 0 : 1)
                };
            });

            if (fetchedTeams.length === 0) {
                fetchedTeams = [{
                    id: 'default',
                    name: 'My View',
                    description: 'No teams found',
                    members: [],
                    isOwner: false
                }];
            }

            setTeams(fetchedTeams);

            setCurrentTeamId(prev => {
                const params = new URLSearchParams(window.location.search);
                const queryId = params.get('teamId');
                
                if (queryId && fetchedTeams.some(t => t.id === queryId)) return queryId;

                const isMaster = user?.role === 'master_admin';
                if (isMaster && !prev) return null; // Let master admin see the grid first
                
                const nextId = (prev && fetchedTeams.some(t => t.id === prev))
                    ? prev
                    : (isMaster ? null : fetchedTeams[0]?.id ?? null);
                return nextId;
            });
        } catch {
            setError('Network error fetching teams');
        } finally {
            setLoading(false);
        }
    }, [user]);

    // ── Fetch activities ─────────────────────────────────────────────────────
    const fetchActivities = useCallback(async (teamId) => {
        if (!teamId || teamId === 'default') return;
        try {
            const token = getToken(user);
            const res = await fetch(`/api/team/activity/${teamId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setActivities(data);
        } catch {
            // Silently fail — activities are non-critical
        }
    }, [user]);

    // ── Effects ──────────────────────────────────────────────────────────────
    useEffect(() => { if (user) fetchTeams(); }, [user, fetchTeams]);
    useEffect(() => { if (currentTeamId) fetchActivities(currentTeamId); }, [currentTeamId, fetchActivities]);

    // ── Real-time Updates ───────────────────────────────────────────────────
    useEffect(() => {
        if (!socketRef?.current || !socketConnected) return;

        // Stability Fix: Join specifically only the rooms I care about
        const teamIds = teams.map(t => t.id || t._id).filter(id => id && id !== 'default');
        if (teamIds.length > 0) {
            socketRef.current.emit('setup_dashboard', { teamIds });
        }

        const handleTeamUpdate = (payload) => {
            console.log('[useTeamManagement] Real-time Update Received:', payload);
            fetchTeams();
            if (currentTeamId && payload.teamId === currentTeamId) {
                fetchActivities(currentTeamId);
            }
        };

        const handlePlatformUpdate = (payload) => {
            console.log('[useTeamManagement] Global Platform Update:', payload);
            fetchTeams();
        };

        socketRef.current.on('team_update', handleTeamUpdate);
        socketRef.current.on('platform_update', handlePlatformUpdate);

        return () => {
            socketRef.current?.off('team_update', handleTeamUpdate);
            socketRef.current?.off('platform_update', handlePlatformUpdate);
        };
    }, [socketRef, socketConnected, fetchTeams, fetchActivities, currentTeamId, teams]);

    // ── Derived state ────────────────────────────────────────────────────────
    const currentTeam = useMemo(
        () => teams.find(t => t.id === currentTeamId) || teams[0],
        [teams, currentTeamId]
    );
    const isMasterAdmin = user?.role === 'master_admin';
    const teamMembers = useMemo(() => {
        if (!currentTeam) return [];
        const members = [...(currentTeam.members || [])];
        const owner = currentTeam.owner;

        if (owner && !members.some(m => m._id === owner._id)) {
            // Ensure owner is at the top and has a clear owner flag
            members.unshift({
                ...owner,
                isOwner: true,
                role: owner.role === 'team_member' ? 'team_head' : owner.role // Fallback to team_head if role is generic member
            });
        } else if (owner) {
            // If already in members, mark them as owner for UI badges
            return members.map(m => m._id === owner._id ? { ...m, isOwner: true } : m);
        }
        return members;
    }, [currentTeam]);

    const isTeamOwner = isMasterAdmin ? true : (currentTeam?.isOwner || false);
    const isAdmin = user?.role === 'admin' || isMasterAdmin;

    const currentTeamRef = useRef(currentTeam);
    currentTeamRef.current = currentTeam;

    // ── Fetch registered users (for invite dropdown) ─────────────────────────
    const fetchAllUsers = useCallback(async (searchQuery = '') => {
        try {
            setUsersLoading(true);
            const token = getToken(user);
            const res = await fetch(
                `/api/auth/users?search=${encodeURIComponent(searchQuery)}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            const data = await res.json();
            if (res.ok) {
                const memberIds = new Set(
                    (currentTeamRef.current?.members || []).map(m => m._id)
                );
                setAllUsers(data.filter(u => !memberIds.has(u._id)));
            }
        } catch {
            // Silently fail — dropdown is non-critical
        } finally {
            setUsersLoading(false);
        }
    }, [user]);

    const searchUsers = useCallback((query) => {
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = setTimeout(() => fetchAllUsers(query), 300);
    }, [fetchAllUsers]);

    // ── Filtered members ─────────────────────────────────────────────────────
    const filteredMembers = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return teamMembers
            .map(m => ({
                ...m,
                tasksAssigned: m.tasksAssigned || 0,
                tasksCompleted: m.tasksCompleted || 0,
                productivity: m.productivity || 0
            }))
            .filter(m =>
                (m.name?.toLowerCase() || '').includes(term) ||
                (m.email?.toLowerCase() || '').includes(term)
            );
    }, [teamMembers, searchTerm]);

    // ── Stats ────────────────────────────────────────────────────────────────
    const stats = useMemo(() => {
        const totalTasks = filteredMembers.reduce((a, m) => a + m.tasksAssigned, 0);
        const completedTasks = filteredMembers.reduce((a, m) => a + m.tasksCompleted, 0);

        return {
            adminCount: teamMembers.filter(m => m.role === 'admin' || m.role === 'team_head' || m.isOwner).length,
            memberCount: teamMembers.length,
            total: teamMembers.length,
            totalTasks,
            completedTasks,
            productivity: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
        };
    }, [teamMembers, filteredMembers]);

    // ── Actions ──────────────────────────────────────────────────────────────

    const handleInvite = useCallback(async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const email = inviteEmail.trim();
        if (!email) { setError('Please enter an email address'); return; }
        if (!isTeamOwner) { setError('Only the team owner can invite members.'); return; }

        setLoading(true);
        try {
            const isMaster = user?.role === 'master_admin';
            const endpoint = isMaster ? `/api/admin/teams/${currentTeamId}/members` : '/api/team';
            
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken(user)}`
                },
                body: JSON.stringify({ email, teamId: currentTeamId })
            });
            const data = await res.json();

            if (res.ok) {
                // Determine the correct member data based on response format
                // Admin endpoint returns the updated member list directly
                const updatedMembers = isMaster ? data : data; // Standardizing to data for now
                
                setTeams(prev => prev.map(t =>
                    t.id === currentTeamId
                        ? { ...t, members: (isMaster ? data : data).map(m => ({ ...m, tasksAssigned: m.tasksAssigned || 0, tasksCompleted: m.tasksCompleted || 0 })) }
                        : t
                ));
                showSuccess(isMaster ? `${email} added to team successfully!` : `Invited ${email} successfully!`);
                setInviteEmail('');
                setInviteName('');
                fetchActivities(currentTeamId);
            } else {
                setError(data.message || 'Failed to invite member');
            }
        } catch {
            setError('Network error during invite');
        } finally {
            setLoading(false);
        }
    }, [inviteEmail, isTeamOwner, user, currentTeamId, showSuccess, fetchActivities]);

    const handleRemoveMember = useCallback(async (memberId) => {
        if (!isTeamOwner) { alert('Only the team owner can remove members.'); return; }
        if (!window.confirm('Are you sure you want to remove this member?')) return;

        // Optimistic update: Remove from UI immediately
        const previousTeams = teams;
        setTeams(prev => prev.map(t =>
            t.id === currentTeamId
                ? { ...t, members: t.members.filter(m => m._id !== memberId) }
                : t
        ));

        try {
            const res = await fetch(`/api/team/${currentTeamId}/member/${memberId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${getToken(user)}` }
            });

            if (res.ok) {
                showSuccess('Member removed from team.');
                fetchActivities(currentTeamId);
            } else {
                // Revert on failure
                setTeams(previousTeams);
                const data = await res.json();
                setError(data.message || 'Failed to remove member');
            }
        } catch {
            // Revert on network error
            setTeams(previousTeams);
            setError('Network error removing member');
        }
    }, [isTeamOwner, currentTeamId, user, showSuccess, fetchActivities, teams]);

    const createTeam = useCallback(async (teamName, ownerId) => {
        if (!teamName?.trim()) return;

        try {
            const isMaster = user?.role === 'master_admin';
            const endpoint = isMaster ? '/api/admin/teams' : '/api/team/create';
            const body = isMaster ? { name: teamName, description: 'New Team', ownerId } : { name: teamName, description: 'New Team' };

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken(user)}`
                },
                body: JSON.stringify(body)
            });
            const data = await res.json();

            if (res.ok) {
                const newTeam = { 
                    id: data._id, 
                    name: data.name, 
                    description: data.description, 
                    members: [], 
                    isOwner: true,
                    owner: data.owner // For master admin view
                };
                setTeams(prev => [...prev, newTeam]);
                if (!isMaster) setCurrentTeamId(newTeam.id);
                showSuccess('New team created successfully');
            } else {
                setError(data.message || 'Failed to create team');
            }
        } catch {
            setError('Network error creating team');
        }
    }, [user, showSuccess]);

    const updateTeamDetails = useCallback(async (name, description, teamIdOverride) => {
        if (!isTeamOwner) { setError('Only team owner can update details'); return; }

        const targetTeamId = teamIdOverride || currentTeamId;
        if (!targetTeamId) return;

        try {
            const isMaster = user?.role === 'master_admin';
            const endpoint = isMaster ? `/api/admin/teams/${targetTeamId}` : '/api/team';
            const method = isMaster ? 'PUT' : 'PUT';
            const body = isMaster ? { name, description } : { name, description, teamId: targetTeamId };

            const res = await fetch(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken(user)}`
                },
                body: JSON.stringify(body)
            });
            const data = await res.json();

            if (res.ok) {
                setTeams(prev => prev.map(t =>
                    t.id === targetTeamId
                        ? { ...t, name: data.name || data.teamName, description: data.description || data.teamDescription }
                        : t
                ));
                showSuccess('Team updated');
            } else {
                setError(data.message || 'Failed to update team details');
            }
        } catch {
            setError('Network error updating team');
        }
    }, [isTeamOwner, user, currentTeamId, showSuccess]);

    const deleteTeam = useCallback(async (teamId) => {
        if (!isTeamOwner) return;
        if (!window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) return;

        try {
            const isMaster = user?.role === 'master_admin';
            const endpoint = isMaster ? `/api/admin/teams/${teamId}` : `/api/team/delete/${teamId}`;

            const res = await fetch(endpoint, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${getToken(user)}` }
            });

            if (res.ok) {
                setTeams(prev => {
                    const updated = prev.filter(t => t.id !== teamId);
                    if (currentTeamId === teamId) {
                        setCurrentTeamId(updated[0]?.id || null);
                    }
                    return updated;
                });
                showSuccess('Team deleted successfully');
            } else {
                const data = await res.json();
                setError(data.message || 'Failed to delete team');
            }
        } catch {
            setError('Network error deleting team');
        }
    }, [isTeamOwner, user, currentTeamId, showSuccess, fetchActivities, teams]);

    const handleUpdateUserAdmin = useCallback(async (formData) => {
        if (user?.role !== 'master_admin') return;
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/users/${formData.userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken(user)}`
                },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (res.ok) {
                // Determine which team we're looking at to refresh
                const targetTeamId = currentTeamId;
                if (targetTeamId) {
                    fetchActivities(targetTeamId);
                    // Also refresh the team members list by re-fetching teams or manually updating
                    setTeams(prev => prev.map(t => {
                        if (t.id === targetTeamId) {
                            return {
                                ...t,
                                members: t.members.map(m => m._id === formData.userId ? { ...m, name: formData.name, email: formData.email } : m)
                            };
                        }
                        return t;
                    }));
                }
                showSuccess('User profile updated successfully!');
                return true;
            } else throw new Error(data.message || 'Failed to update user');
        } catch (err) {
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    }, [user, currentTeamId, showSuccess, fetchActivities]);

    // ── Return ───────────────────────────────────────────────────────────────
    return {
        user, isAdmin, isTeamOwner, isMasterAdmin,
        currentTeamId,
        inviteEmail, setInviteEmail,
        inviteName, setInviteName,
        searchTerm, setSearchTerm,
        error, setError,
        success, setSuccess,
        loading,
        hoveredMember, setHoveredMember,
        teamMembers, filteredMembers, stats,
        teams, currentTeam, setCurrentTeamId,
        createTeam, handleInvite, handleRemoveMember,
        updateTeamDetails, deleteTeam,
        updateUserAdmin: handleUpdateUserAdmin,
        activities,
        allUsers, usersLoading, searchUsers, fetchAllUsers
    };
};
