import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Task from '../models/Task.js';
import Team from '../models/Team.js';
import Activity from '../models/Activity.js';
import { createNotifications } from '../utils/notificationService.js';

// ─── Batch helper: get stats for ALL members in 2 queries instead of N*2 ─────
const getBatchMemberStats = async (memberIds) => {
    try {
        if (!memberIds || memberIds.length === 0) return {};

        // Convert to ObjectIds if needed
        const objectIds = memberIds.map(id =>
            typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id
        );

        // Two aggregate queries instead of 2*N individual countDocuments
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

        // Initialize all members with 0
        objectIds.forEach(id => {
            statsMap[id.toString()] = { tasksAssigned: 0, tasksCompleted: 0 };
        });

        // Map assigned counts
        assignedCounts.forEach(item => {
            const key = item._id.toString();
            if (statsMap[key]) {
                statsMap[key].tasksAssigned = item.count;
            }
        });

        // Map completed counts
        completedCounts.forEach(item => {
            const key = item._id.toString();
            if (statsMap[key]) {
                statsMap[key].tasksCompleted = item.count;
            }
        });

        return statsMap;
    } catch (error) {
        console.error('Error getting batch member stats:', error);
        return {};
    }
};

// Legacy single-member helper (kept for addTeamMember endpoint)
const getMemberStats = async (memberId) => {
    try {
        if (!memberId) return { tasksAssigned: 0, tasksCompleted: 0 };
        const [tasksAssigned, tasksCompleted] = await Promise.all([
            Task.countDocuments({ assignedTo: memberId }),
            Task.countDocuments({ completedBy: memberId })
        ]);
        return { tasksAssigned, tasksCompleted };
    } catch (error) {
        console.error(`Error getting stats for member ${memberId}:`, error);
        return { tasksAssigned: 0, tasksCompleted: 0 };
    }
};

// @desc    Get all teams (Owned + Participating)
// @route   GET /api/team
// @access  Private
const getTeamMembers = asyncHandler(async (req, res) => {
    // 1. Migration Check: Only run once — skip if user already has teams
    const ownedTeamsCount = await Team.countDocuments({ owner: req.user._id });

    if (ownedTeamsCount === 0 && (req.user.role === 'team_head' || req.user.role === 'admin')) {
        // Check if legacy data exists before querying User fully
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

    // 2. Fetch Owned Teams
    const ownedTeams = await Team.find({ owner: req.user._id })
        .populate('members', 'name email role');

    // 3. Fetch Participating Teams (exclude owned to avoid duplicates)
    const participatingTeams = await Team.find({
        members: req.user._id,
        owner: { $ne: req.user._id }
    })
        .populate('owner', 'name email role')
        .populate('members', 'name email role');

    // 4. Collect ALL unique member IDs across all teams for a single batch query
    const allMemberIds = new Set();

    // Add the current user (owner of owned teams)
    allMemberIds.add(req.user._id.toString());

    for (const team of ownedTeams) {
        team.members.filter(m => m !== null).forEach(m => allMemberIds.add(m._id.toString()));
    }

    for (const team of participatingTeams) {
        if (team.owner?._id) allMemberIds.add(team.owner._id.toString());
        team.members.filter(m => m !== null).forEach(m => allMemberIds.add(m._id.toString()));
    }

    // 5. Single batch stats query (2 DB queries instead of N*2)
    const statsMap = await getBatchMemberStats([...allMemberIds]);

    const resultTeams = [];

    // ── Process Owned Teams ──────────────────────────────────────────────────
    for (const team of ownedTeams) {
        const membersWithStats = team.members.filter(m => m !== null).map(m => ({
            _id: m._id,
            name: m.name,
            email: m.email,
            role: m.role,
            tasksAssigned: statsMap[m._id.toString()]?.tasksAssigned || 0,
            tasksCompleted: statsMap[m._id.toString()]?.tasksCompleted || 0,
        }));

        // Add the team owner (current user) at the top if not already included
        const ownerAlreadyIncluded = membersWithStats.some(
            m => m._id.toString() === req.user._id.toString()
        );

        if (!ownerAlreadyIncluded) {
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
    }

    // ── Process Participating Teams (FIX: include team owner in member list) ─
    for (const team of participatingTeams) {
        const membersWithStats = team.members.filter(m => m !== null).map(m => ({
            _id: m._id,
            name: m.name,
            email: m.email,
            role: m.role,
            tasksAssigned: statsMap[m._id.toString()]?.tasksAssigned || 0,
            tasksCompleted: statsMap[m._id.toString()]?.tasksCompleted || 0,
        }));

        // FIX: Add team owner to the member list so members can see the full team
        if (team.owner?._id) {
            const ownerAlreadyIncluded = membersWithStats.some(
                m => m._id.toString() === team.owner._id.toString()
            );

            if (!ownerAlreadyIncluded) {
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
        }

        resultTeams.push({
            id: team._id.toString(),
            name: team.name,
            description: team.description,
            members: membersWithStats,
            isOwner: false,
            ownerName: team.owner?.name || team.owner?.email || 'Unknown'
        });
    }

    res.json(resultTeams);
});

// @desc    Create a new team
// @route   POST /api/team/create
// @access  Private (Team Head only)
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
// @access  Private (Owner only)
const addTeamMember = asyncHandler(async (req, res) => {
    const { email, teamId } = req.body;

    if (!email) {
        res.status(400);
        throw new Error('Please provide an email');
    }

    let targetTeam;

    if (teamId) {
        targetTeam = await Team.findOne({ _id: teamId, owner: req.user._id });
    } else {
        targetTeam = await Team.findOne({ owner: req.user._id });

        if (!targetTeam) {
            targetTeam = await Team.create({
                name: 'My Team',
                description: 'Team managed by you',
                owner: req.user._id,
                members: []
            });
        }
    }

    if (!targetTeam) {
        res.status(404);
        throw new Error('Team not found or you are not the owner');
    }

    const userToAdd = await User.findOne({ email });

    if (!userToAdd) {
        res.status(404);
        throw new Error('User not found with that email. They must register first.');
    }

    if (userToAdd._id.equals(req.user._id)) {
        res.status(400);
        throw new Error('You cannot add yourself to your team');
    }

    // BUG FIX: .includes() doesn't work with ObjectIds — use .some() with .toString()
    const alreadyMember = targetTeam.members.some(
        id => id && id.toString() === userToAdd._id.toString()
    );
    if (alreadyMember) {
        res.status(400);
        throw new Error('User already in this team');
    }

    targetTeam.members.push(userToAdd._id);
    await targetTeam.save();

    // Trigger Notification for the team
    const io = req.app.get('socketio');
    const recipientIds = [...targetTeam.members, targetTeam.owner]
        .filter(id => id != null)
        .map(id => id.toString())
        .filter(id => id !== req.user._id.toString());

    if (recipientIds.length > 0) {
        await createNotifications(recipientIds, {
            title: 'New Team Member',
            description: `${userToAdd.name} has joined the team "${targetTeam.name}"`,
            type: 'team_update',
            sender: req.user._id,
            link: '/team'
        }, io);
    }

    // Log Activity
    await Activity.create({
        teamOwner: req.user._id,
        team: targetTeam._id,
        text: `Added ${userToAdd.name} to team ${targetTeam.name}`,
        type: 'member_add'
    });

    // Return the updated member list (including the owner so they don't vanish from UI)
    const populatedTeam = await Team.findById(targetTeam._id)
        .populate('members', 'name email role')
        .populate('owner', 'name email role');

    const allIds = [
        populatedTeam.owner._id,
        ...populatedTeam.members.filter(m => m !== null).map(m => m._id)
    ];
    const statsMap = await getBatchMemberStats(allIds);

    // Owner first, then members
    const updatedMembers = [];

    // Add owner at the top
    updatedMembers.push({
        _id: populatedTeam.owner._id,
        name: populatedTeam.owner.name,
        email: populatedTeam.owner.email,
        role: populatedTeam.owner.role || 'team_head',
        tasksAssigned: statsMap[populatedTeam.owner._id.toString()]?.tasksAssigned || 0,
        tasksCompleted: statsMap[populatedTeam.owner._id.toString()]?.tasksCompleted || 0,
        isOwner: true
    });

    // Add members (skip if same as owner)
    populatedTeam.members.filter(m => m !== null).forEach(m => {
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

    if (!teamId || !memberId) {
        res.status(400);
        throw new Error('Invalid request parameters');
    }

    const team = await Team.findOne({ _id: teamId, owner: req.user._id });

    if (!team) {
        res.status(404);
        throw new Error('Team not found or you are not the owner');
    }

    // BUG FIX: .includes() doesn't work with ObjectIds — use .some() with .toString()
    const memberExists = team.members.some(id => id && id.toString() === memberId);
    if (!memberExists) {
        res.status(404);
        throw new Error('Member not found in this team');
    }

    team.members = team.members.filter(id => id && id.toString() !== memberId);
    await team.save();

    // Trigger Notification for the remaining team
    const io = req.app.get('socketio');
    const recipientIds = [...team.members, team.owner]
        .filter(id => id != null)
        .map(id => id.toString())
        .filter(id => id !== req.user._id.toString());

    if (recipientIds.length > 0) {
        await createNotifications(recipientIds, {
            title: 'Team Update',
            description: `A member was removed from the team "${team.name}"`,
            type: 'team_update',
            sender: req.user._id,
            link: '/team'
        }, io);
    }

    await Activity.create({
        teamOwner: req.user._id,
        team: team._id,
        text: `Removed member from team ${team.name}`,
        type: 'member_remove'
    });

    return res.status(200).json({ id: memberId, teamId: team._id });
});

// @desc    Update team details (name, description)
// @route   PUT /api/team
const updateTeamDetails = asyncHandler(async (req, res) => {
    const { name, description, teamId } = req.body;

    let team;
    if (teamId) {
        team = await Team.findOne({ _id: teamId, owner: req.user._id });
    } else {
        team = await Team.findOne({ owner: req.user._id });
    }

    if (!team) {
        res.status(404);
        throw new Error('Team not found');
    }

    if (name) team.name = name;
    if (description !== undefined) team.description = description;

    await team.save();

    // Notify Team about metadata changes
    const io = req.app.get('socketio');
    const recipientIds = [...team.members, team.owner]
        .filter(id => id != null)
        .map(id => id.toString())
        .filter(id => id !== req.user._id.toString());

    if (recipientIds.length > 0) {
        await createNotifications(recipientIds, {
            title: 'Team Profile Updated',
            description: `${req.user.name} updated the details for team "${team.name}"`,
            type: 'team_update',
            sender: req.user._id,
            link: '/team'
        }, io);
    }

    res.json({
        teamName: team.name,
        teamDescription: team.description,
        id: team._id
    });
});

// @desc    Get team activity
// @route   GET /api/team/activity/:teamId
// @access  Private
const getTeamActivity = asyncHandler(async (req, res) => {
    const { teamId } = req.params;

    const team = await Team.findById(teamId);
    if (!team) {
        res.status(404);
        throw new Error('Team not found');
    }

    const isOwner = team.owner.toString() === req.user._id.toString();
    const isMember = team.members.some(m => m && m.toString() === req.user._id.toString());

    if (!isOwner && !isMember) {
        res.status(403);
        throw new Error('Not authorized to view this team\'s activity');
    }

    const activities = await Activity.find({
        $or: [
            { team: teamId },
            { teamOwner: team.owner, team: { $exists: false } }
        ]
    })
        .sort({ createdAt: -1 })
        .limit(20);

    res.json(activities);
});

// @desc    Delete a team
// @route   DELETE /api/team/:teamId
// @access  Private (Owner only)
const deleteTeam = asyncHandler(async (req, res) => {
    const { teamId } = req.params;

    const team = await Team.findOne({ _id: teamId, owner: req.user._id });

    if (!team) {
        res.status(404);
        throw new Error('Team not found or you are not the owner');
    }

    // Notify team before deletion
    const io = req.app.get('socketio');
    const recipientIds = [...team.members] // owner already knows
        .filter(id => id != null)
        .map(id => id.toString());

    if (recipientIds.length > 0) {
        await createNotifications(recipientIds, {
            title: 'Team Deleted',
            description: `The team "${team.name}" has been deleted by the owner`,
            type: 'team_update',
            sender: req.user._id,
            link: '/dashboard'
        }, io);
    }

    await team.deleteOne();
    await Activity.deleteMany({ team: teamId });

    res.status(200).json({ id: teamId, message: 'Team deleted' });
});

export { getTeamMembers, createNewTeam, addTeamMember, removeTeamMember, getTeamActivity, updateTeamDetails, deleteTeam };
