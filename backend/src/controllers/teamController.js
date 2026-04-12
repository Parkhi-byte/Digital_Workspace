import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Task from '../models/Task.js';
import Team from '../models/Team.js';
import Activity from '../models/Activity.js';
import { createNotifications, emitTeamUpdate } from '../utils/notificationService.js';

const getBatchMemberStats = async (memberIds) => {
    try {
        if (!memberIds || memberIds.length === 0) return {};

        const objectIds = memberIds.map(id =>
            typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id
        );

        const [assignedCounts, completedCounts] = await Promise.all([
            Task.aggregate([
                { $match: { assignedTo: { $in: objectIds } } },
                { $group: { _id: '$assignedTo', count: { $sum: 1 } } }
            ]),
            Task.aggregate([
                { $match: { completedBy: { $in: objectIds } } },
                { $group: { _id: '$completedBy', count: { $sum: 1 } } }
            ])
        ]);

        const statsMap = {};
        objectIds.forEach(id => {
            statsMap[id.toString()] = { tasksAssigned: 0, tasksCompleted: 0 };
        });

        assignedCounts.forEach(item => {
            if (statsMap[item._id.toString()]) statsMap[item._id.toString()].tasksAssigned = item.count;
        });

        completedCounts.forEach(item => {
            if (statsMap[item._id.toString()]) statsMap[item._id.toString()].tasksCompleted = item.count;
        });

        return statsMap;
    } catch (error) {
        console.error('Error getting batch member stats:', error);
        return {};
    }
};

// @desc    Get all teams (Owned + Participating)
// @route   GET /api/team
const getTeamMembers = asyncHandler(async (req, res) => {
    const ownedTeamsCount = await Team.countDocuments({ owner: req.user._id });

    if (ownedTeamsCount === 0 && (req.user.role === 'team_head' || req.user.role === 'admin')) {
        const user = await User.findById(req.user._id).select('teamMembers teamName teamDescription');
        if (user) {
            await Team.create({
                name: user.teamName || 'My Team',
                description: user.teamDescription || 'Team managed by you',
                owner: req.user._id,
                members: user.teamMembers || []
            });
        }
    }

    const [ownedTeams, participatingTeams] = await Promise.all([
        Team.find({ owner: req.user._id }).populate('members', 'name email role'),
        Team.find({ members: req.user._id, owner: { $ne: req.user._id } })
            .populate('owner', 'name email role')
            .populate('members', 'name email role')
    ]);

    const allMemberIds = new Set([req.user._id.toString()]);
    ownedTeams.forEach(t => t.members.filter(m => m).forEach(m => allMemberIds.add(m._id.toString())));
    participatingTeams.forEach(t => {
        if (t.owner?._id) allMemberIds.add(t.owner._id.toString());
        t.members.filter(m => m).forEach(m => allMemberIds.add(m._id.toString()));
    });

    const statsMap = await getBatchMemberStats([...allMemberIds]);
    const resultTeams = [];

    ownedTeams.forEach(team => {
        const membersWithStats = team.members.filter(m => m).map(m => ({
            _id: m._id,
            name: m.name,
            email: m.email,
            role: m.role,
            tasksAssigned: statsMap[m._id.toString()]?.tasksAssigned || 0,
            tasksCompleted: statsMap[m._id.toString()]?.tasksCompleted || 0,
        }));

        if (!membersWithStats.some(m => m._id.toString() === req.user._id.toString())) {
            membersWithStats.unshift({
                _id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role || 'team_head',
                tasksAssigned: statsMap[req.user._id.toString()]?.tasksAssigned || 0,
                tasksCompleted: statsMap[req.user._id.toString()]?.tasksCompleted || 0,
                isOwner: true
            });
        }

        resultTeams.push({
            id: team._id.toString(),
            name: team.name,
            description: team.description,
            members: membersWithStats,
            isOwner: true,
            ownerName: 'You'
        });
    });

    participatingTeams.forEach(team => {
        const membersWithStats = team.members.filter(m => m).map(m => ({
            _id: m._id,
            name: m.name,
            email: m.email,
            role: m.role,
            tasksAssigned: statsMap[m._id.toString()]?.tasksAssigned || 0,
            tasksCompleted: statsMap[m._id.toString()]?.tasksCompleted || 0,
        }));

        if (team.owner?._id && !membersWithStats.some(m => m._id.toString() === team.owner._id.toString())) {
            membersWithStats.unshift({
                _id: team.owner._id,
                name: team.owner.name,
                email: team.owner.email,
                role: team.owner.role || 'team_head',
                tasksAssigned: statsMap[team.owner._id.toString()]?.tasksAssigned || 0,
                tasksCompleted: statsMap[team.owner._id.toString()]?.tasksCompleted || 0,
                isOwner: true
            });
        }

        resultTeams.push({
            id: team._id.toString(),
            name: team.name,
            description: team.description,
            members: membersWithStats,
            isOwner: false,
            ownerName: team.owner?.name || team.owner?.email || 'Unknown'
        });
    });

    res.json(resultTeams);
});

// @desc    Create a new team
// @route   POST /api/team/create
const createNewTeam = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    if (!name) {
        res.status(400);
        throw new Error('Team name is required');
    }

    const team = await Team.create({
        name,
        description: description || '',
        owner: req.user._id,
        members: []
    });

    res.status(201).json(team);
});

// @desc    Add member to a specific team
// @route   POST /api/team
const addTeamMember = asyncHandler(async (req, res) => {
    const { email, teamId } = req.body;
    if (!email) {
        res.status(400);
        throw new Error('Please provide an email');
    }

    let targetTeam = teamId 
        ? await Team.findOne({ _id: teamId, owner: req.user._id })
        : await Team.findOne({ owner: req.user._id });

    if (!targetTeam && !teamId) {
        targetTeam = await Team.create({
            name: 'My Team',
            description: 'Team managed by you',
            owner: req.user._id,
            members: []
        });
    }

    if (!targetTeam) {
        res.status(404);
        throw new Error('Team not found or you are not the owner');
    }

    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
        res.status(404);
        throw new Error('User not found. They must register first.');
    }

    if (userToAdd._id.equals(req.user._id)) {
        res.status(400);
        throw new Error('You cannot add yourself');
    }

    if (targetTeam.members.some(id => id?.toString() === userToAdd._id.toString())) {
        res.status(400);
        throw new Error('User already in this team');
    }

    targetTeam.members.push(userToAdd._id);
    await targetTeam.save();

    const io = req.app.get('socketio');
    const recipientIds = [...targetTeam.members, targetTeam.owner]
        .filter(id => id && id.toString() !== req.user._id.toString())
        .map(id => id.toString());

    if (recipientIds.length > 0) {
        await createNotifications(recipientIds, {
            title: 'New Team Member',
            description: `${userToAdd.name} has joined the team "${targetTeam.name}"`,
            type: 'team_update',
            sender: req.user._id,
            link: '/team'
        }, io);
    }

    emitTeamUpdate(io, targetTeam._id, 'MEMBER_ADD');
    await Activity.create({ teamOwner: req.user._id, team: targetTeam._id, text: `Added ${userToAdd.name} to team ${targetTeam.name}`, type: 'member_add' });

    const populatedTeam = await Team.findById(targetTeam._id).populate('members', 'name email role').populate('owner', 'name email role');
    const allIds = [populatedTeam.owner._id, ...populatedTeam.members.filter(m => m).map(m => m._id)];
    const statsMap = await getBatchMemberStats(allIds);

    const updatedMembers = [{
        _id: populatedTeam.owner._id,
        name: populatedTeam.owner.name,
        email: populatedTeam.owner.email,
        role: populatedTeam.owner.role || 'team_head',
        tasksAssigned: statsMap[populatedTeam.owner._id.toString()]?.tasksAssigned || 0,
        tasksCompleted: statsMap[populatedTeam.owner._id.toString()]?.tasksCompleted || 0,
        isOwner: true
    }];

    populatedTeam.members.filter(m => m).forEach(m => {
        if (m._id.toString() !== populatedTeam.owner._id.toString()) {
            updatedMembers.push({
                _id: m._id,
                name: m.name,
                email: m.email,
                role: m.role,
                tasksAssigned: statsMap[m._id.toString()]?.tasksAssigned || 0,
                tasksCompleted: statsMap[m._id.toString()]?.tasksCompleted || 0,
            });
        }
    });

    res.status(200).json(updatedMembers);
});

// @desc    Remove team member
// @route   DELETE /api/team/:teamId/member/:memberId
const removeTeamMember = asyncHandler(async (req, res) => {
    const { teamId, memberId } = req.params;
    const team = await Team.findOne({ _id: teamId, owner: req.user._id });

    if (!team) {
        res.status(404);
        throw new Error('Team not found');
    }

    if (!team.members.some(id => id?.toString() === memberId)) {
        res.status(404);
        throw new Error('Member not found');
    }

    team.members = team.members.filter(id => id?.toString() !== memberId);
    await team.save();

    const io = req.app.get('socketio');
    const recipientIds = [...team.members, team.owner]
        .filter(id => id && id.toString() !== req.user._id.toString())
        .map(id => id.toString());

    if (recipientIds.length > 0) {
        await createNotifications(recipientIds, {
            title: 'Team Update',
            description: `A member was removed from "${team.name}"`,
            type: 'team_update',
            sender: req.user._id,
            link: '/team'
        }, io);
    }

    emitTeamUpdate(io, team._id, 'MEMBER_REMOVE');
    await Activity.create({ teamOwner: req.user._id, team: team._id, text: `Removed member from team ${team.name}`, type: 'member_remove' });

    res.status(200).json({ id: memberId, teamId: team._id });
});

// @desc    Update team details (name, description)
// @route   PUT /api/team
const updateTeamDetails = asyncHandler(async (req, res) => {
    const { name, description, teamId } = req.body;
    const team = teamId 
        ? await Team.findOne({ _id: teamId, owner: req.user._id })
        : await Team.findOne({ owner: req.user._id });

    if (!team) {
        res.status(404);
        throw new Error('Team not found');
    }

    if (name) team.name = name;
    if (description !== undefined) team.description = description;
    await team.save();

    const io = req.app.get('socketio');
    const recipientIds = [...team.members, team.owner]
        .filter(id => id && id.toString() !== req.user._id.toString())
        .map(id => id.toString());

    if (recipientIds.length > 0) {
        await createNotifications(recipientIds, {
            title: 'Team Profile Updated',
            description: `${req.user.name} updated "${team.name}"`,
            type: 'team_update',
            sender: req.user._id,
            link: '/team'
        }, io);
    }

    emitTeamUpdate(io, team._id, 'TEAM_METADATA_UPDATE');
    res.json({ teamName: team.name, teamDescription: team.description, id: team._id });
});

// @desc    Get team activity
// @route   GET /api/team/activity/:teamId
const getTeamActivity = asyncHandler(async (req, res) => {
    const { teamId } = req.params;
    const team = await Team.findById(teamId);
    if (!team) {
        res.status(404);
        throw new Error('Team not found');
    }

    const isMember = team.owner.toString() === req.user._id.toString() || team.members.some(m => m?.toString() === req.user._id.toString()) || req.user.role === 'master_admin';
    if (!isMember) {
        res.status(403);
        throw new Error('Not authorized');
    }

    const activities = await Activity.find({ $or: [{ team: teamId }, { teamOwner: team.owner, team: { $exists: false } }] })
        .sort({ createdAt: -1 })
        .limit(20);

    res.json(activities);
});

// @desc    Delete a team
// @route   DELETE /api/team/:teamId
const deleteTeam = asyncHandler(async (req, res) => {
    const { teamId } = req.params;
    const team = await Team.findOne({ _id: teamId, owner: req.user._id });

    if (!team) {
        res.status(404);
        throw new Error('Team not found');
    }

    const io = req.app.get('socketio');
    const recipientIds = team.members.filter(id => id).map(id => id.toString());

    if (recipientIds.length > 0) {
        await createNotifications(recipientIds, {
            title: 'Team Deleted',
            description: `Team "${team.name}" was deleted`,
            type: 'team_update',
            sender: req.user._id,
            link: '/dashboard'
        }, io);
    }

    emitTeamUpdate(io, null, 'TEAM_DELETE');
    await team.deleteOne();
    await Activity.deleteMany({ team: teamId });

    res.status(200).json({ id: teamId, message: 'Team deleted' });
});

export { getTeamMembers, createNewTeam, addTeamMember, removeTeamMember, getTeamActivity, updateTeamDetails, deleteTeam };
