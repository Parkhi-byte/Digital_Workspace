
import asyncHandler from 'express-async-handler';
import Event from '../models/eventModel.js';
import Team from '../models/Team.js';
import { createNotifications } from '../utils/notificationService.js';

// @desc    Get all events for a user
// @route   GET /api/events
// @access  Private
const getEvents = asyncHandler(async (req, res) => {
    // Find teams where user is owner or member
    const teams = await Team.find({
        $or: [
            { owner: req.user._id },
            { members: req.user._id }
        ]
    });
    const teamIds = teams.map(t => t._id);

    const events = await Event.find({
        $or: [
            { user: req.user._id },
            { team: { $in: teamIds } }
        ]
    }).sort({ start: 1 });

    res.json(events);
});

// @desc    Create a new event
// @route   POST /api/events
// @access  Private
const createEvent = asyncHandler(async (req, res) => {
    const { title, start, end, allDay, description, color, teamId } = req.body;

    if (!title || !start || !end) {
        res.status(400);
        throw new Error('Please provide title, start, and end dates');
    }

    const event = await Event.create({
        user: req.user._id,
        team: teamId || null,
        title,
        start,
        end,
        allDay,
        description,
        color,
    });

    // Notify team members if teamId is provided
    if (teamId) {
        const team = await Team.findById(teamId);
        if (team) {
            const recipientIds = [...team.members, team.owner].filter(
                id => id.toString() !== req.user.id
            ).map(id => id.toString());

            if (recipientIds.length > 0) {
                await createNotifications(recipientIds, {
                    sender: req.user.id,
                    title: 'New Event Scheduled',
                    description: `A new event "${title}" has been scheduled for ${new Date(start).toLocaleDateString()}`,
                    type: 'event_created',
                    link: '/calendar'
                }, req.app.get('socketio'));
            }
        }
    }

    res.status(201).json(event);
});

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private
const updateEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    // Check for user
    if (!req.user) {
        res.status(401);
        throw new Error('User not found');
    }

    // Make sure the logged in user matches the event user
    if (event.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }


    const { title, start, end, allDay, description, color } = req.body;

    event.title = title || event.title;
    event.start = start || event.start;
    event.end = end || event.end;
    event.description = description !== undefined ? description : event.description;
    event.color = color || event.color;
    event.allDay = allDay !== undefined ? allDay : event.allDay;

    const updatedEvent = await event.save();

    // Notify team if event is linked to a team
    if (event.team) {
        const team = await Team.findById(event.team);
        if (team) {
            const io = req.app.get('socketio');
            const recipientIds = [...team.members, team.owner]
                .filter(id => id.toString() !== req.user.id.toString())
                .map(id => id.toString());

            if (recipientIds.length > 0) {
                await createNotifications(recipientIds, {
                    sender: req.user.id,
                    title: 'Event Updated',
                    description: `${req.user.name} updated the event "${event.title}"`,
                    type: 'team_update', // Or event_created?
                    link: '/calendar'
                }, io);
            }
        }
    }

    res.json(updatedEvent);
});

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private
const deleteEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    // Check for user
    if (!req.user) {
        res.status(401);
        throw new Error('User not found');
    }

    // Make sure the logged in user matches the event user
    if (event.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    await event.deleteOne();

    // Notify team if event was linked to a team
    if (event.team) {
        const team = await Team.findById(event.team);
        if (team) {
            const io = req.app.get('socketio');
            const recipientIds = [...team.members, team.owner]
                .filter(id => id.toString() !== req.user.id.toString())
                .map(id => id.toString());

            if (recipientIds.length > 0) {
                await createNotifications(recipientIds, {
                    sender: req.user.id,
                    title: 'Event Cancelled',
                    description: `${req.user.name} cancelled the event "${event.title}"`,
                    type: 'team_update',
                    link: '/calendar'
                }, io);
            }
        }
    }

    res.json({ id: req.params.id });
});

export { getEvents, createEvent, updateEvent, deleteEvent };
