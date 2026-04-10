import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            if (!process.env.JWT_SECRET) {
                console.error('JWT_SECRET is not defined in environment variables');
                res.status(500);
                throw new Error('Server configuration error');
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                res.status(401);
                throw new Error('User not found');
            }

            if (req.user.status === 'suspended') {
                res.status(401);
                throw new Error('Not authorized, account has been suspended by the master admin');
            }

            if (req.user.status === 'pending') {
                res.status(403);
                throw new Error('Not authorized, account is pending approval');
            }

            return next();
        } catch (error) {
            console.error('Auth Error:', error.message);
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

const admin = (req, res, next) => {
    if (req.user && (req.user.role === 'team_head' || req.user.role === 'admin' || req.user.role === 'master' || req.user.role === 'master_admin')) {
        next();
    } else {
        res.status(401);
        throw new Error('Not authorized as an admin');
    }
};

const masterAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'master_admin') {
        next();
    } else {
        res.status(401);
        throw new Error('Not authorized as a master admin');
    }
};

export { protect, admin, masterAdmin };
