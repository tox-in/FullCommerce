const { z } = require('zod');

const addressSchema = z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    country: z.string().min(1),
    zipCode: z.string().min(1),
});

const orderItemSchema = z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
    price: z.number().positive(),
});

const orderStatusEnum = z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']);

const createOrderSchema = z.object({
    shippingAddress: addressSchema,
    billingAddress: addressSchema,
});

const updateOrderStatusSchema = z.object({
    status: orderStatusEnum,
});

const orderListResponseSchema = z.object({
    orders: z.array(z.object({
        id: z.string().uuid(),
        userId: z.string().uuid(),
        total: z.number().positive(),
        status: orderStatusEnum,
        items: z.array(orderItemSchema),
        shippingAddress: addressSchema,
        billingAddress: addressSchema,
        createdAt: z.date(),
        updatedAt: z.date(),
    })),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
});

const orderDocs = {
    components: {
        schemas: {
            Address: {
                type: 'object',
                required: ['street', 'city', 'state', 'country', 'zipCode'],
                properties: {
                    street: { type: 'string', description: 'Street address' },
                    city: { type: 'string', description: 'City name' },
                    state: { type: 'string', description: 'State or province' },
                    country: { type: 'string', description: 'Country name' },
                    zipCode: { type: 'string', description: 'Postal/ZIP code' }
                }
            },
            OrderItem: {
                type: 'object',
                required: ['productId', 'quantity', 'price'],
                properties: {
                    productId: { type: 'string', format: 'uuid', description: 'ID of the product' },
                    quantity: { type: 'integer', minimum: 1, description: 'Quantity of the product' },
                    price: { type: 'number', minimum: 0, description: 'Price per unit' }
                }
            },
            Order: {
                type: 'object',
                required: ['userId', 'total', 'status', 'shippingAddress', 'billingAddress'],
                properties: {
                    id: { type: 'string', format: 'uuid', description: 'Order ID' },
                    userId: { type: 'string', format: 'uuid', description: 'ID of the user who placed the order' },
                    total: { type: 'number', minimum: 0, description: 'Total order amount' },
                    status: {
                        type: 'string',
                        enum: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
                        description: 'Current status of the order'
                    },
                    shippingAddress: { $ref: '#/components/schemas/Address' },
                    billingAddress: { $ref: '#/components/schemas/Address' },
                    items: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/OrderItem' }
                    },
                    createdAt: { type: 'string', format: 'date-time', description: 'Order creation timestamp' },
                    updatedAt: { type: 'string', format: 'date-time', description: 'Last update timestamp' }
                }
            },
            OrderStatus: {
                type: 'object',
                required: ['status'],
                properties: {
                    status: {
                        type: 'string',
                        enum: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
                        description: 'New status for the order'
                    }
                }
            },
            OrderList: {
                type: 'object',
                properties: {
                    orders: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Order' }
                    },
                    total: { type: 'integer', description: 'Total number of orders' },
                    totalPages: { type: 'integer', description: 'Total number of pages' }
                }
            }
        }
    }
};

module.exports = {
    schemas: {
        addressSchema,
        orderItemSchema,
        orderStatusEnum,
        createOrderSchema,
        updateOrderStatusSchema,
        orderListResponseSchema,
    },
    docs: orderDocs,
}; 