const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');

            req.user = await User.findById(decoded.id).select('-password');

            next();
        } catch (error) {
            console.error(error);
            if (process.env.DEMO_MODE === 'true') {
                req.user = await User.findOne({ email: 'admin@example.com' }).select('-password');
                if (!req.user) {
                     req.user = await User.findOne({ role: 'admin' }).select('-password');
                }
                if (!req.user) {
                    req.user = {
                        _id: '507f1f77bcf86cd799439011',
                        name: 'Demo Admin',
                        email: 'admin@demo.com',
                        role: 'admin'
                    };
                }
                return next();
            }
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    }

    if (!token) {
        if (process.env.DEMO_MODE === 'true') {
            req.user = await User.findOne({ email: 'admin@example.com' }).select('-password');
            if (!req.user) {
                 req.user = await User.findOne({ role: 'admin' }).select('-password');
            }
            
            // Fallback mock user if database is empty
            if (!req.user) {
                req.user = {
                    _id: '507f1f77bcf86cd799439011',
                    name: 'Demo Admin',
                    email: 'admin@demo.com',
                    role: 'admin'
                };
            }
            return next();
        }

        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(401);
        throw new Error('Not authorized as an admin');
    }
};

module.exports = { protect, admin };
