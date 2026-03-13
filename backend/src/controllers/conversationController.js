import asyncHandler from 'express-async-handler';
import Conversation from '../models/Conversation.js';
import User from '../models/User.js';

// @desc    Access or create a one-on-one chat
// @route   POST /api/chat
// @access  Private
const accessChat = asyncHandler(async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        console.log('UserId param not sent with request');
        return res.sendStatus(400);
    }

    // Check if chat exists
    let isChat = await Conversation.find({
        isGroupChat: false,
        $and: [
            { users: { $elemMatch: { $eq: req.user._id } } },
            { users: { $elemMatch: { $eq: userId } } },
        ],
    })
        .populate('users', '-password')
        .populate('latestMessage');

    isChat = await User.populate(isChat, {
        path: 'latestMessage.sender',
        select: 'name email',
    });

    if (isChat.length > 0) {
        res.send(isChat[0]);
    } else {
        // Create new chat
        const chatData = {
            chatName: 'sender',
            isGroupChat: false,
            users: [req.user._id, userId],
        };

        try {
            const createdChat = await Conversation.create(chatData);
            const FullChat = await Conversation.findOne({ _id: createdChat._id }).populate(
                'users',
                '-password'
            );
            res.status(200).json(FullChat);
        } catch (error) {
            res.status(400);
            throw new Error(error.message);
        }
    }
});

// @desc    Fetch all chats for a user
// @route   GET /api/chat
// @access  Private
const fetchChats = asyncHandler(async (req, res) => {
    let results = await Conversation.find({ users: { $elemMatch: { $eq: req.user._id } } })
        .populate('users', '-password')
        .populate('groupAdmin', '-password')
        .populate('latestMessage')
        .sort({ updatedAt: -1 });

    results = await User.populate(results, {
        path: 'latestMessage.sender',
        select: 'name email',
    });

    res.status(200).send(results);
});

// @desc    Create Group Chat
// @route   POST /api/chat/group
// @access  Private
const createGroupChat = asyncHandler(async (req, res) => {
    if (!req.body.name) {
        return res.status(400).send({ message: 'Group name is required' });
    }

    // Parse users array — may be empty for a fresh group
    let users = [];
    if (req.body.users) {
        try {
            users = JSON.parse(req.body.users);
        } catch (_) {
            users = [];
        }
    }

    // Always include the creator
    const creatorId = req.user._id.toString();
    const uniqueUserIds = [...new Set([...users.map(u => u.toString ? u.toString() : u), creatorId])];

    try {
        const groupChat = await Conversation.create({
            chatName: req.body.name,
            users: uniqueUserIds,
            isGroupChat: true,
            groupAdmin: req.user,
        });

        const fullGroupChat = await Conversation.findOne({ _id: groupChat._id })
            .populate('users', '-password')
            .populate('groupAdmin', '-password');

        res.status(200).json(fullGroupChat);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

// @desc    Rename Group
// @route   PUT /api/chat/rename
// @access  Private
const renameGroup = asyncHandler(async (req, res) => {
    const { chatId, chatName } = req.body;

    const updatedChat = await Conversation.findByIdAndUpdate(
        chatId,
        {
            chatName: chatName,
        },
        {
            new: true,
        }
    )
        .populate('users', '-password')
        .populate('groupAdmin', '-password');

    if (!updatedChat) {
        res.status(404);
        throw new Error('Chat Not Found');
    } else {
        res.json(updatedChat);
    }
});

// @desc    Add to Group
// @route   PUT /api/chat/groupadd
// @access  Private
const addToGroup = asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body;

    const added = await Conversation.findByIdAndUpdate(
        chatId,
        {
            $push: { users: userId },
        },
        {
            new: true,
        }
    )
        .populate('users', '-password')
        .populate('groupAdmin', '-password');

    if (!added) {
        res.status(404);
        throw new Error('Chat Not Found');
    } else {
        res.json(added);
    }
});

// @desc    Remove from Group
// @route   PUT /api/chat/groupremove
// @access  Private
const removeFromGroup = asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body;

    const removed = await Conversation.findByIdAndUpdate(
        chatId,
        {
            $pull: { users: userId },
        },
        {
            new: true,
        }
    )
        .populate('users', '-password')
        .populate('groupAdmin', '-password');

    if (!removed) {
        res.status(404);
        throw new Error('Chat Not Found');
    } else {
        res.json(removed);
    }
});

import multer from 'multer';

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 },
}).single('file');

// @desc    Upload attachment
// @route   POST /api/chat/upload
// @access  Private
const uploadAttachment = asyncHandler(async (req, res) => {
    await new Promise((resolve, reject) => {
        upload(req, res, (err) => {
            if (err) return reject(err);
            resolve();
        });
    }).catch((err) => {
        res.status(400);
        throw new Error(err.message || 'File upload failed');
    });

    if (!req.file) {
        res.status(400);
        throw new Error("No file selected");
    }

    res.json({
        url: `/uploads/${req.file.filename}`,
        type: req.file.mimetype.startsWith('image/') ? 'image' : 'file'
    });
});

export {
    accessChat,
    fetchChats,
    createGroupChat,
    renameGroup,
    addToGroup,
    removeFromGroup,
    uploadAttachment
};
