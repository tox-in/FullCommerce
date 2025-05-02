const { prisma } = require('../utils/prisma');
const { AppError } = require('../middleware/errorHandler');

class CartController {
    static async getCart(req, res, next) {
        try {
            const cart = await prisma.cart.findUnique({
                where: { userId: req.user.id },
                include: {
                    items: {
                        include: {
                            product: true,
                        },
                    },
                },
            });

            if (!cart) {
                throw new AppError('Cart not found', 404);
            }

            res.status(200).json(cart);
        } catch (error) {
            next(error);
        }
    }


    static async addToCart(req, res, next) {
        try {
            const { productId, quantity } = req.body;

            if (!productId || !quantity) {
                throw new AppError('Product ID and quantity are required', 400);
            }

            const product = await prisma.product.findUnique({
                where: { id: productId },
            });

            if (!product) {
                throw new AppError('Product not found', 404);
            }

            if (product.stock < quantity) {
                throw new AppError('Insufficient stock', 400);
            }

            let cart = await prisma.cart.findUnique({
                where: { userId: req.user.id },
                include: { items: true },
            });

            if (!cart) {
                cart = await prisma.cart.create({
                    data: {
                        userId: req.user.id,
                    },
                    include: { items: true },
                });
            }

            const existingItem = cart.items.find(item => item.productId === productId);

            if (existingItem) {
                await prisma.cartItem.update({
                    where: { id: existingItem.id },
                    data: {
                        userId: req.user.id,
                    },
                    include: { items: true },
                });
            } else {
                await prisma.cartItem.create({
                    data: {
                        cartId: cart.id,
                        productId,
                        quantity,
                    },
                });
            }

            const updatedCart = await prisma.cart.findUnique({
                where: { id: cart.id },
                include: {
                    items: {
                        include: {
                            product: true,
                        },
                    },
                },
            });

            res.status(201).json(cart);
        } catch (error) {
            next(error);
        }
    }

    static async getCart(req, res, next) {
        try {
            const cart = await prisma.cart.findUnique({
                where: { userId: req.user.id },
                include: {
                    items: {
                        include: {
                            product: true,
                        },
                    },
                },
            });

            if (!cart) {
                throw new AppError('Cart not found', 404);
            }

            res.status(200).json(cart);
        } catch (error) {
            next(error);
        }
    }


    static async updateCartItem(req, res, next){
        try {
            const { itemId } = req.params;
            const { quantity } = req.body;

            if (!quantity || quantity <= 0) {
                throw new AppError('Quantity is required', 400);
            }

            const cart = await prisma.cart.findUnique({
                where: { userId: req.user.id },
                include: { items: { where: { id: itemId }, include: { product: true }, }, },
            });

            if ( !cart || !cart.items.length) {
                throw new AppError('Cart item not found', 404);
            }

            const item = cart.items[0];

            if (item.product.stock < quantity) {
                throw new AppError('Insufficient stock', 400);
            }

            await prisma.cartItem.update({
                where: { id: itemId },
                data: { quantity },
            });

            const updatedCart = await prisma.cart.findUnique({
                where: { id: cart.id },
                include: {
                    items: {
                        include: {
                            product: true,
                        },
                    },
                },
            });

            res.json(updatedCart);
        } catch (error) {
            next(error);
        }
    }


    static async removeFromCart(req, res, next) {
        try {
            const { itemId } = req.params;

            const cart = await prisma.cart.findUnique({
                where: { userId: req.user.id },
                include: { items: { where: { id: itemId }, include: { product: true }, }, },
            });

            if (!cart || !cart.items.length) {
                throw new AppError('Cart item not found', 404);
            }

            await prisma.cartItem.delete({
                where: { id: itemId },
            });

            const updatedCart = await prisma.cart.findUnique({
                where: { id: cart.id },
                include: {
                    items: {
                        include: {
                            product: true,
                        },
                    },
                },
            });

            res.status(204).json();
        } catch(error) {
            next(error);
        }
    }



    static async clearCart(req, res, next) {
        try {
            const cart = await prisma.cart.findUnique({
                where: { userId: req.user.id },
            });

            if (!cart) {
                throw new AppError('Cart not found', 404);
            }

            await prisma.cartItem.deleteMany({
                where: { cartId: cart.id },
            });

            const emptyCart = await prisma.cart.findUnique({
                where: { id: cart.id },
                include: {
                    items: {
                        include: {
                            product: true,
                        },
                    },
                },
            });

            res.json(emptyCart)
        } catch (error) {
            next(error);
        }
    }
}

module.exports = CartController;