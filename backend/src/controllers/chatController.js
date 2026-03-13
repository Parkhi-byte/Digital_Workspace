import asyncHandler from 'express-async-handler';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import mongoose from 'mongoose';

// @desc    Get chat history for a room
// @route   GET /api/chat/:room
// @access  Private
const getChatHistory = asyncHandler(async (req, res) => {
    const { room } = req.params;

    // Validation
    if (!room || typeof room !== 'string') {
        res.status(400);
        throw new Error('Invalid room ID');
    }

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(room)) {
        res.status(400);
        throw new Error('Invalid room ID format');
    }

    // Pagination support
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 50, 100); // Max 100 messages
    const skip = (page - 1) * limit;

    // Fetch messages with pagination
    const messages = await Message.find({ chat: room })
        .populate('sender', 'name email')
        .sort({ createdAt: -1 }) // Newest first for pagination
        .skip(skip)
        .limit(limit);

    // Get total count for pagination metadata
    const totalMessages = await Message.countDocuments({ chat: room });

    res.json({
        messages: messages.reverse(), // Reverse to show oldest first in UI
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalMessages / limit),
            totalMessages,
            hasMore: skip + messages.length < totalMessages
        }
    });
});

// @desc    Send a message (HTTP endpoint for async messaging)
// @route   POST /api/chat/message
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
    const { chatId, text, type } = req.body;

    // Validation
    if (!chatId || !text) {
        res.status(400);
        throw new Error('ChatId and text are required');
    }

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
        res.status(400);
        throw new Error('Invalid chat ID format');
    }

    // Create message
    const newMessage = await Message.create({
        chat: chatId,
        text,
        sender: req.user._id,
        type: type || 'text'
    });

    // Populate sender info + chat users for socket fan-out
    const populatedMessage = await Message.findById(newMessage._id)
        .populate('sender', 'name email')
        .populate({
            path: 'chat',
            populate: { path: 'users', select: '-password' }
        });

    // Update latest message in conversation
    await Conversation.findByIdAndUpdate(chatId, {
        latestMessage: newMessage._id
    });

    res.status(201).json(populatedMessage);
});

export { getChatHistory, sendMessage };
