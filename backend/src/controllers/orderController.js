const { prisma } = require('../utils/prisma');
const { AppError } = require('../middleware/errorHandler');
const {
    createOrderSchema,
    updateOrderStatusSchema,
    orderListResponseSchema,
} = require('../schemas/order.schema');

class OrderController {
    static async createOrder(req, res, next) {
        try {
            const { shippingAddress, billingAddress } = createOrderSchema.parse(req.body);
            const userId = req.user.id;

            const cart = await prisma.cart.findUnique({
                where: { userId },
                include: {
                    items: {
                        include: {
                            product: true,
                        },
                    },
                },
            });

            if (!cart || cart.items.length === 0) {
                throw new AppError('Cart is empty', 400);
            }

            let total = 0;
            for (const item of cart.items) {
                if (item.quantity > item.product.stock) {
                    throw new AppError(`Insufficient stock for product: ${item.product.name}`, 400);
                }
                total += item.quantity * item.product.price;
            }

            const order = await prisma.order.create({
                data: {
                    userId,
                    total,
                    status: 'PENDING',
                    items: {
                        create: cart.items.map(item => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.product.price,
                        })),
                    },
                    shippingAddress: {
                        create: shippingAddress,
                    },
                    billingAddress: {
                        create: billingAddress,
                    },
                },
                include: {
                    items: true,
                    shippingAddress: true,
                    billingAddress: true,
                },
            });

            for (const item of cart.items) {
                await prisma.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: {
                            decrement: item.quantity,
                        },
                    },
                });
            }

            await prisma.cartItem.deleteMany({
                where: { cartId: cart.id },
            });

            res.status(201).json(order);
        } catch (error) {
            next(error);
        }
    }


    static async getOrder(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const order = await prisma.order.findUnique({
                where: { id },
                include: {
                    items: {
                        include: {
                            product: true,
                        },
                    },
                    shippingAddress: true,
                    billingAddress: true,
                },
            });

            if (!order) {
                throw new AppError('Order not found', 404);
            }

            if (order.userId !== userId) {
                throw new AppError('Unauthorized access to order', 403);
            }

            res.json(order);
        } catch (error) {
            next(error);
        }
    }


    static async getUserOrders(req, res, next) {
        try {
            const userId = req.user.id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            const [orders, total] = await Promise.all([
                prisma.order.findMany({
                    where: { userId },
                    include: {
                        items: {
                            include: {
                                product: true,
                            },
                        },
                        shippingAddress: true,
                        billingAddress: true,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                    skip,
                    take: limit,
                }),
                prisma.order.count({
                    where: { userId },
                }),
            ]);

            res.json({
                orders,
                total,
                totalPages: Math.ceil(total / limit),
            });
        } catch (error) {
            next(error);
        }
    }


    static async updateOrderStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { status } = updateOrderStatusSchema.parse(req.body);
            const userId = req.user.id;

            const order = await prisma.order.findUnique({
                where: { id },
                include: {
                    items: true,
                },
            });

            if (!order) {
                throw new AppError('Order not found', 404);
            }

            if (order.userId !== userId) {
                throw new AppError('Unauthorized access to order', 403);
            }

            if (status === 'CANCELLED' && order.status !== 'CANCELLED') {
                for (const item of order.items) {
                    await prisma.product.update({
                        where: { id: item.productId },
                        data: {
                            stock: {
                                increment: item.quantity,
                            },
                        },
                    });
                }
            }

            const updatedOrder = await prisma.order.update({
                where: { id },
                data: { status },
                include: {
                    items: {
                        include: {
                            product: true,
                        },
                    },
                    shippingAddress: true,
                    billingAddress: true,
                },
            });

            res.json(updatedOrder);
        } catch (error) {
            next(error);
        }
    }


    static async getAllOrders(req, res, next) {
        try {
            if (req.user.role !== 'ADMIN') {
                throw new AppError('Unauthorized access', 403);
            }

            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const { status } = req.query;
            const skip = (page - 1) * limit;

            const where = status ? { status } : {};

            const [orders, total] = await Promise.all([
                prisma.order.findMany({
                    where,
                    include: {
                        items: {
                            include: {
                                product: true,
                            },
                        },
                        shippingAddress: true,
                        billingAddress: true,
                        user: {
                            select: {
                                id: true,
                                email: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                    skip,
                    take: limit,
                }),
                prisma.order.count({ where }),
            ]);

            res.json({
                orders,
                total,
                totalPages: Math.ceil(total / limit),
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = OrderController;