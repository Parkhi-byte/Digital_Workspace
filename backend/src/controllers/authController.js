import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        let isValidRole = false;

        if (user.role === role) {
            isValidRole = true;
        } else if (user.role === 'admin' && role === 'team_head') {
            isValidRole = true;
        }

        if (role && !isValidRole) {
            res.status(401);
            throw new Error('Invalid role selected.');
        }

        if (user.status === 'pending') {
            res.status(403);
            throw new Error('Your account is awaiting Master Admin approval. Please check back later.');
        }

        if (user.status === 'suspended') {
            res.status(403);
            throw new Error('Your account has been suspended. Please contact the administrator.');
        }

        // Update lastLogin
        user.lastLogin = new Date();
        await user.save();

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    if (role === 'master_admin') {
        res.status(400);
        throw new Error('Cannot register as master admin');
    }

    const user = await User.create({
        name,
        email,
        password,
        role: role || 'team_member',
        // Team heads require Master Admin approval before they can log in
        status: (role === 'team_head' || role === 'admin') ? 'pending' : 'active',
    });

    if (user) {
        // Team heads get a pending response — no token yet
        if (user.status === 'pending') {
            return res.status(201).json({
                pending: true,
                message: 'Registration submitted! Your Team Head account is awaiting Master Admin approval. You will be able to log in once approved.',
            });
        }

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Get all users (searchable)
// @route   GET /api/auth/users?search=...
// @access  Private
const getAllUsers = asyncHandler(async (req, res) => {
    const keyword = req.query.search
        ? {
            $or: [
                { name: { $regex: req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } },
                { email: { $regex: req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } },
            ],
        }
        : {};

    // Find users except current user
    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } }).select('-password');
    res.send(users);
});

export { authUser, registerUser, getUserProfile, getAllUsers };
