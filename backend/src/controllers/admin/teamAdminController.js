import asyncHandler from 'express-async-handler';
import Team from '../../models/Team.js';
import Task from '../../models/Task.js';
import AuditLog from '../../models/AuditLog.js';
import Activity from '../../models/Activity.js';
import { emitTeamUpdate } from '../../utils/notificationService.js';
import User from '../../models/User.js';

export const getAllTeamsAdmin = asyncHandler(async (req, res) => {
    const teams = await Team.find({}).populate('owner', 'name email role').populate('members', 'name email role').sort({ createdAt: -1 });

    const enrichedTeams = await Promise.all(teams.map(async (team) => {
        const teamObj = team.toObject();
        
        const getUserStats = async (userId) => {
            if (!userId) return { assigned: 0, completed: 0 };
            try {
                const [assigned, completed] = await Promise.all([
                    Task.countDocuments({ team: team._id, assignedTo: userId }),
                    Task.countDocuments({ team: team._id, assignedTo: userId, status: 'Done' })
                ]);
                return { assigned, completed };
            } catch (err) {
                console.error(`Error fetching stats for user ${userId}:`, err);
                return { assigned: 0, completed: 0 };
            }
        };

        if (teamObj.owner && teamObj.owner._id) {
            const stats = await getUserStats(teamObj.owner._id);
            teamObj.owner.tasksAssigned = stats.assigned;
            teamObj.owner.tasksCompleted = stats.completed;
        }

        if (teamObj.members && Array.isArray(teamObj.members)) {
            teamObj.members = await Promise.all(teamObj.members.map(async (member) => {
                if (!member || !member._id) return member;
                const stats = await getUserStats(member._id);
                return { ...member, tasksAssigned: stats.assigned, tasksCompleted: stats.completed };
            }));
        }
        return teamObj;
    }));

    res.json(enrichedTeams);
});

export const deleteTeamAdmin = asyncHandler(async (req, res) => {
    const { teamId } = req.params;
    const team = await Team.findById(teamId);

    if (!team) {
        res.status(404);
        throw new Error('Team not found');
    }

    await team.deleteOne();
    await Activity.deleteMany({ team: teamId });
    await AuditLog.create({ admin: req.user._id, action: 'TEAM_DELETED', details: `Deleted team ${team.name}` });

    res.json({ message: 'Team removed' });
});

export const addMemberToTeamAdmin = asyncHandler(async (req, res) => {
    const { teamId } = req.params;
    const { email } = req.body;

    const team = await Team.findById(teamId);
    if (!team) {
        res.status(404);
        throw new Error('Team not found');
    }

    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
        res.status(404);
        throw new Error('User not found');
    }

    if (team.members.includes(userToAdd._id) || team.owner.toString() === userToAdd._id.toString()) {
        res.status(400);
        throw new Error('User is already a member or owner');
    }

    team.members.push(userToAdd._id);
    await team.save();

    await AuditLog.create({ admin: req.user._id, action: 'TEAM_MEMBER_ADDED', targetTeam: team._id, targetUser: userToAdd._id, details: `Added ${userToAdd.email} to ${team.name}` });
    emitTeamUpdate(req.app.get('socketio'), team._id, 'MEMBER_ADD');

    const updatedTeam = await Team.findById(teamId).populate('owner', 'name email role').populate('members', 'name email role');
    res.json(updatedTeam.members);
});

export const removeMemberFromTeamAdmin = asyncHandler(async (req, res) => {
    const { teamId, memberId } = req.params;
    const team = await Team.findById(teamId);

    if (!team) {
        res.status(404);
        throw new Error('Team not found');
    }

    team.members = team.members.filter(mId => mId.toString() !== memberId);
    await team.save();

    await AuditLog.create({ admin: req.user._id, action: 'TEAM_MEMBER_REMOVED', targetTeam: team._id, targetUser: memberId, details: `Removed user from ${team.name}` });
    emitTeamUpdate(req.app.get('socketio'), team._id, 'MEMBER_REMOVE');

    res.json({ message: 'User removed from team' });
});

export const transferTeamOwnership = asyncHandler(async (req, res) => {
    const { teamId } = req.params;
    const { newOwnerId } = req.body;
    const team = await Team.findById(teamId);

    if (!team) {
        res.status(404);
        throw new Error('Team not found');
    }

    team.owner = newOwnerId;
    await team.save();

    await AuditLog.create({ admin: req.user._id, action: 'TEAM_OWNERSHIP_TRANSFERRED', targetTeam: team._id, targetUser: newOwnerId, details: `Transferred ${team.name}` });
    res.json(team);
});

export const createTeamAdmin = asyncHandler(async (req, res) => {
    const { name, description, ownerId } = req.body;
    const team = await Team.create({ name, description, owner: ownerId, members: [] });

    await AuditLog.create({ admin: req.user._id, action: 'TEAM_CREATED', targetTeam: team._id, details: `Created team ${team.name}` });
    res.status(201).json(team);
});

export const updateTeamDetailsAdmin = asyncHandler(async (req, res) => {
    const { teamId } = req.params;
    const { name, description } = req.body;
    const team = await Team.findById(teamId);

    if (!team) {
        res.status(404);
        throw new Error('Team not found');
    }

    team.name = name || team.name;
    team.description = description !== undefined ? description : team.description;
    await team.save();

    await AuditLog.create({ admin: req.user._id, action: 'TEAM_DETAILS_UPDATED', targetTeam: team._id, details: `Updated ${team.name}` });
    res.json(team);
});
