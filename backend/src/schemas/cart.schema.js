const { z } = require('zod');

const addToCartSchema = z.object({
    productId: z.string().uuid(),
    quantity: z.number().min(1, "Quantity must be at least 1").int().positive(),
});

const updateCartItemSchema = z.object({
    quantity: z.number().min(1, "Quantity must be at least 1").int().positive(),
});

//Response schemas
const cartItemSchema = z.object({
    id: z.string().uuid(),
    cartId: z.string().uuid(),
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

const cartSchema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    items: z.array(cartItemSchema),
    createdAt: z.date(),
    updatedAt: z.date(),
});

//OpenAPI
const cartDocs = {
    getCart: {
        summary: 'Get user cart',
        tags: ['Cart'],
        responses: {
            200: {
                description: 'Cart retrieved successfully',
                content: {
                    'application/json': {
                        schema: cartSchema,
                    },
                },
            },
        },
    },
    addToCart: {
        summary: 'Add item to cart',
        tags: ['Cart'],
        requestBody: {
            required: true,
            content: {
                'application/json': {
                    schema: addToCartSchema,
                },
            },
        },
        responses: {
            201: {
                description: 'Item added to cart successfully',
                content: {
                    'application/json': {
                        schema: cartSchema,
                    },
                },
            },
            400: {
                description: 'Invalid input or product not found',
            },
        },
    },
    updateCartItem: {
        summary: 'Update cart item quantity',
        tags: ['Cart'],
        parameters: [
            {
                name: 'itemId',
                in: 'path',
                required: true,
                schema: {
                    type: 'string',
                    format: 'uuid',
                },
            },
        ],
        requestBody: {
            required: true,
            content: {
                'application/json': {
                    schema: updateCartItemSchema,
                },
            },
        },
        responses: {
            200: {
                description: 'Cart item updated successfully',
                content: {
                    'application/json': {
                        schema: cartSchema,
                    },
                },
            },
            400: {
                description: 'Invalid input or item not found',
            },
        },
    },
    removeFromCart: {
        summary: 'Remove item from cart',
        tags: ['Cart'],
        parameters: [
            {
                name: 'itemId',
                in: 'path',
                required: true,
                schema: {
                    type: 'string',
                    format: 'uuid',
                },
            },
        ],
        responses: {
            200: {
                description: 'Item removed from cart successfully',
                content: {
                    'application/json': {
                        schema: cartSchema,
                    },
                },
            },
            400: {
                description: 'Item not found in cart',
            },
        },
    },
    clearCart: {
        summary: 'Clear user cart',
        tags: ['Cart'],
        responses: {
            200: {
                description: 'Cart cleared successfully',
                content: {
                    'application/json': {
                        schema: cartSchema,
                    },
                },
            },
        },
    },
};

module.exports = {
    schemas: {
        addToCartSchema,
        updateCartItemSchema,
        cartItemSchema,
        cartSchema,
    },
    docs: cartDocs,
};