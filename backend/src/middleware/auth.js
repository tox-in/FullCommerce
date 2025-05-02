const jwt = require('jsonwebtoken');
const { AppError } = require('../utils/errorHandler');
const { prisma } = require('../utils/prisma');

const authenticate = (req, res, next) => {
    try {
        const token =req.headers.authorization?.split(' ')[1];

        if (!token) {
            return next(new AppError('No token provided', 401));
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        next(new AppError('Authentication failed', 401));
    }
};

const authorize = (roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)) {
            throw new AppError('You do not have permission to perform this action', 403);
        }
        next();
    };
};

module.exports = {
    authenticate,
    authorize
};