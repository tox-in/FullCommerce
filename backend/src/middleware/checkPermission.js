const { AppError } = require('./errorHandler');
const { prisma } = require('../utils/prisma');
const { logger } = require('../utils/logger');

/**
 * Middleware to check if user has permission to access/modify a resource
 * @param {string} resource - The type of resource being accessed (e.g., 'order', 'product')
 * @param {string} action - The type of action being performed (e.g., 'read', 'write', 'delete')
 */

const ALLOWED_ACTIONS = ['read', 'write', 'delete', 'create', 'update'];

const checkPermission = (resource, action) => {
    return async (req, res, next) => {
        try {
            const userId = req.user.id;
            const resourceId = req.params.id;

            if (!ALLOWED_ACTIONS.includes(action)) {
                throw new AppError(`Invalid action: ${action}. Allowed actions are: ${ALLOWED_ACTIONS.join(', ')}`, 400);
            }

            if (!resourceId) {
                next();
                return;
            }

            let hasPermission = false;

            switch (resource) {
                case 'order':
                    const order = await prisma.order.findUnique({
                        where: { id: parseInt(resourceId) }
                    });
                    hasPermission = order?.userId === userId || req.user.role === 'ADMIN';
                    break;

                case 'product':
                    const product = await prisma.product.findUnique({
                        where: { id: resourceId }
                    });

                    hasPermission = product?.sellerId === userId ||
                        (req.user.role === 'ADMIN' && action === 'delete');
                    break;

                case 'user':
                    hasPermission = (resourceId === userId) ||
                        (req.user.role === 'ADMIN' && action === 'delete');
                    break;

                default:
                    throw new AppError(`Unknown resource type: ${resource}`, 400);
            }

            if (!hasPermission) {
                logger.warn({
                    message: 'Permission denied',
                    userId,
                    resource,
                    resourceId,
                    action
                });
                throw new AppError('You do not have permission to perform this action', 403);
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

module.exports = { checkPermission };