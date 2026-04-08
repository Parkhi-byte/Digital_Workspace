import asyncHandler from 'express-async-handler';
import Task from '../models/Task.js';
import Team from '../models/Team.js';
import Activity from '../models/Activity.js';

import { createNotifications, createNotification } from '../utils/notificationService.js';

// @desc    Get tasks (Visible to everyone in the team)
// @route   GET /api/tasks
// @access  Private
const getTasks = asyncHandler(async (req, res) => {
    // Find teams where user is owner or member
    const teams = await Team.find({
        $or: [
            { owner: req.user.id },
            { members: req.user.id }
        ]
    });

    const teamIds = teams.map(t => t._id);

    // Fetch tasks belonging to these teams
    // Also fetch legacy tasks created by this user (for backward compatibility)
    const tasks = await Task.find({
        $or: [
            { team: { $in: teamIds } },
            { user: req.user.id } // Legacy support
        ]
    })
        .populate('assignedTo', 'name email')
        .populate('completedBy', 'name email')
        .populate('lastModifiedBy', 'name email')
        .sort({ createdAt: -1 });

    res.status(200).json(tasks);
});

// @desc    Set task (Admin/Head only)
// @route   POST /api/tasks
// @access  Private
const setTask = asyncHandler(async (req, res) => {
    if (!req.body.title) {
        res.status(400);
        throw new Error('Please add a title field');
    }

    // Restrict creation to Team Head or Admin
    if (req.user.role === 'team_member') {
        res.status(403);
        throw new Error('Only Team Heads can create tasks');
    }

    // Require teamId
    // If user has old frontend code, they might not send teamId. 
    // We should try to gracefully handle it or force it.
    // Let's look for req.body.teamId
    let teamId = req.body.teamId;

    if (!teamId) {
        // Fallback: If no teamId provided, try to find the FIRST team owned by user (Legacy behavior)
        const team = await Team.findOne({ owner: req.user.id });
        if (!team) {
            res.status(404);
            throw new Error('You need to create a Team first');
        }
        teamId = team._id;
    }

    // Verify ownership of the team
    const team = await Team.findOne({ _id: teamId, owner: req.user.id });
    if (!team) {
        res.status(403);
        throw new Error('You can only create tasks for teams you own');
    }

    // If assigning to a user, verify they are in this team
    if (req.body.assignedTo) {
        // Fix: Check if member OR owner (Issues #2)
        const isMember = team.members.includes(req.body.assignedTo);
        const isOwner = team.owner.toString() === req.body.assignedTo;

        if (!isMember && !isOwner) {
            res.status(400);
            throw new Error('Assigned user is not a member of this team');
        }
    }

    const task = await Task.create({
        title: req.body.title,
        description: req.body.description,
        status: req.body.status || 'To Do',
        priority: req.body.priority || 'medium',
        tag: req.body.tag || 'General',
        user: req.user.id, // Creator
        team: team._id,
        assignedTo: req.body.assignedTo || null,
        dueDate: req.body.dueDate || null,
        lastModifiedBy: req.user.id, // Fix: Issue #3 - Track creator as first modifier
    });

    // Fix: Issue #1 - Log Activity
    await Activity.create({
        team: team._id,
        teamOwner: team.owner,
        text: `${req.user.name} created task "${task.title}"`,
        type: 'task_create'
    });

    const populatedTask = await Task.findById(task._id).populate('assignedTo', 'name email');

    // Notify team members (even if not explicitly assigned)
    const io = req.app.get('socketio');
    const teamMembers = [...team.members, team.owner]
        .filter(id => id.toString() !== req.user.id)
        .map(id => id.toString());

    if (teamMembers.length > 0) {
        await createNotifications(teamMembers, {
            sender: req.user.id,
            title: task.assignedTo ? 'New Task Assigned' : 'New Task Created',
            description: task.assignedTo 
                ? `${req.user.name} assigned a task to you: "${task.title}"`
                : `${req.user.name} created a new task: "${task.title}"`,
            type: 'task_assigned',
            link: '/kanban'
        }, io);
    }

    res.status(200).json(populatedTask);
});

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id);

    if (!task) {
        res.status(400);
        throw new Error('Task not found');
    }

    // Fetch team for activity logging
    const team = await Team.findById(task.team);
    const teamOwner = team ? team.owner : (req.user.role === 'team_head' ? req.user.id : null);

    if (!req.user) {
        res.status(401);
        throw new Error('User not found');
    }

    const isCreator = task.user.toString() === req.user.id;
    const isAssigned = task.assignedTo && task.assignedTo.toString() === req.user.id;
    const isHead = req.user.role === 'team_head' || req.user.role === 'admin';

    // 1. Team Head/Admin/Creator: Can update EVERYTHING
    if (isHead || isCreator) {
        // Add audit tracking
        req.body.lastModifiedBy = req.user.id;

        // If status is changing to "Done", track completedBy and completedAt
        if (req.body.status === 'Done' && task.status !== 'Done') {
            req.body.completedBy = req.user.id;
            req.body.completedAt = new Date();
        }

        // If status is changing FROM "Done" to something else, clear completion data
        if (req.body.status && req.body.status !== 'Done' && task.status === 'Done') {
            req.body.completedBy = null;
            req.body.completedAt = null;
        }

        // Activity Logging Logic
        if (teamOwner) {
            // 1. Reassignment
            if (req.body.assignedTo && task.assignedTo?.toString() !== req.body.assignedTo) {
                // Need to fetch user names? Or just store IDs for now? 
                // Activity model usually stores text. Ideally we want names.
                // For simplicity/speed, we'll genericize for now or just say "reassigned task".
                // Or fetch the new user's name?
                await Activity.create({
                    team: team._id,
                    teamOwner: teamOwner,
                    text: `${req.user.name} reassigned task "${task.title}"`,
                    type: 'task_reassign'
                });
            }

            // 2. Status Change
            if (req.body.status && req.body.status !== task.status) {
                const activityType = req.body.status === 'Done' ? 'task_complete' : 'task_status_change';
                const text = req.body.status === 'Done'
                    ? `${req.user.name} completed task "${task.title}"`
                    : `${req.user.name} moved task "${task.title}" to ${req.body.status}`;

                await Activity.create({
                    team: team._id,
                    teamOwner: teamOwner,
                    text: text,
                    type: activityType
                });
            }
        }

        const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        })
            .populate('assignedTo', 'name email')
            .populate('completedBy', 'name email')
            .populate('lastModifiedBy', 'name email');

        // Notify team or assigned user about update
        if (team && req.body.status && req.body.status !== task.status) {
            const teamMemberIds = [...team.members, team.owner]
                .filter(id => id.toString() !== req.user.id)
                .map(id => id.toString());

            if (teamMemberIds.length > 0) {
                await createNotifications(teamMemberIds, {
                    sender: req.user.id,
                    title: 'Task Updated',
                    description: `${req.user.name} updated task "${task.title}" to ${req.body.status}`,
                    type: 'task_updated',
                    link: '/kanban'
                }, req.app.get('socketio'));
            }
        }

        return res.status(200).json(updatedTask);
    }

    // 2. Member: Can ONLY update STATUS, and only if assigned to them
    if (req.user.role === 'team_member') {
        if (!isAssigned) {
            res.status(403);
            throw new Error('You can only update tasks assigned to you');
        }

        const { status } = req.body;

        if (!status) {
            res.status(403);
            throw new Error('Members can only update task status');
        }

        // Prepare update object with audit tracking
        const updateData = {
            status,
            lastModifiedBy: req.user.id
        };

        // If marking as "Done", track completion
        if (status === 'Done' && task.status !== 'Done') {
            updateData.completedBy = req.user.id;
            updateData.completedAt = new Date();
        }

        // If moving FROM "Done", clear completion data
        if (status && status !== 'Done' && task.status === 'Done') {
            updateData.completedBy = null;
            updateData.completedAt = null;
        }

        // Activity Logging
        if (teamOwner && status !== task.status) {
            const activityType = status === 'Done' ? 'task_complete' : 'task_status_change';
            const text = status === 'Done'
                ? `${req.user.name} completed task "${task.title}"`
                : `${req.user.name} moved task "${task.title}" to ${status}`;

            await Activity.create({
                team: team._id,
                teamOwner: teamOwner,
                text: text,
                type: activityType
            });
        }

        const updatedTask = await Task.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
        })
            .populate('assignedTo', 'name email')
            .populate('completedBy', 'name email')
            .populate('lastModifiedBy', 'name email');

        // Notify team about status change by member
        if (team && status !== task.status) {
            const teamMemberIds = [...team.members, team.owner]
                .filter(id => id.toString() !== req.user.id)
                .map(id => id.toString());

            if (teamMemberIds.length > 0) {
                await createNotifications(teamMemberIds, {
                    sender: req.user.id,
                    title: 'Task Status Updated',
                    description: `${req.user.name} moved task "${task.title}" to ${status}`,
                    type: 'task_updated',
                    link: '/kanban'
                }, req.app.get('socketio'));
            }
        }

        return res.status(200).json(updatedTask);
    }

    res.status(403);
    throw new Error('Not authorized to update this task');
});

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id);

    if (!task) {
        res.status(400);
        throw new Error('Task not found');
    }

    if (!req.user) {
        res.status(401);
        throw new Error('User not found');
    }

    // Only Creator (Head) or Admin can delete
    const isCreator = task.user.toString() === req.user.id;
    const isHead = req.user.role === 'team_head' || req.user.role === 'admin';

    if (!isCreator && !isHead) {
        res.status(403);
        throw new Error('Only Team Heads can delete tasks');
    }

    const team = await Team.findById(task.team);
    if (team) {
        // Activity Audit
        await Activity.create({
            team: team._id,
            teamOwner: team.owner,
            text: `${req.user.name} deleted task "${task.title}"`,
            type: 'task_delete'
        });

        // Notify Team
        const io = req.app.get('socketio');
        const teamMembers = [...team.members, team.owner]
            .filter(id => id.toString() !== req.user.id)
            .map(id => id.toString());

        if (teamMembers.length > 0) {
            await createNotifications(teamMembers, {
                sender: req.user.id,
                title: 'Task Removed',
                description: `${req.user.name} deleted task "${task.title}"`,
                type: 'task_updated',
                link: '/kanban'
            }, io);
        }
    }

    await task.deleteOne();

    res.status(200).json({ id: req.params.id });
});

export { getTasks, setTask, updateTask, deleteTask };
