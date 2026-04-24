import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const getTokenFromRequest = (req) => {
    const auth = req.headers.authorization;
    if (auth?.startsWith('Bearer ')) {
        return auth.split(' ')[1];
    }
    return null;
};

/**
 * Requires a valid JWT. Sets req.user (without password).
 */
export const protect = async (req, res, next) => {
    try {
        const token = getTokenFromRequest(req);
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized — no token',
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found',
            });
        }

        req.user = user;
        next();
    } catch {
        return res.status(401).json({
            success: false,
            message: 'Not authorized — invalid or expired token',
        });
    }
};

/**
 * Use after protect. Restricts to given roles (e.g. authorize('admin')).
 */
export const authorize =
    (...roles) =>
    (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized',
            });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden — insufficient permissions',
            });
        }
        next();
    };
