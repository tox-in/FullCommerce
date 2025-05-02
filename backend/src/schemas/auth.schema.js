const { z } = require('zod');

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    phone: z.string().optional(),
    address: z.object({
        street: z.string(),
        city: z.string(),
        state: z.string(),
        country: z.string(),
        zipCode: z.string(),
    }).optional(),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

const forgotPasswordSchema = z.object({
    email: z.string().email(),
});

const resetPasswordSchema = z.object({
    token: z.string(),
    password: z.string().min(8),
});

//Response schemas
const addressSchema = z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    country: z.string(),
    zipCode: z.string(),
});

const sellerProfileSchema = z.object({
    id: z.string().uuid(),
    storeName: z.string().nullable(),
    storeDescription: z.string().nullable(),
    storeLogo: z.string().nullable(),
    storeBanner: z.string().nullable(),
    isVerified: z.boolean(),
    verificationDocuments: z.array(z.string()),
});

const preferencesSchema = z.object({
    id: z.string().uuid(),
    emailNotifications: z.boolean(),
    marketingEmails: z.boolean(),
});

const userResponseSchema = z.object({
    id: z.string().uuid(),
    email: z.string().email().nonempty("Email is required"),
    firstName: z.string(),
    lastName: z.string(),
    role: z.enum(['ADMIN', 'CUSTOMER', 'SELLER', 'SUPER_ADMIN']),
    isEmailVerified: z.boolean(),
    phone: z.string().nullable(),
    address: addressSchema.nullable(),
    sellerProfile: sellerProfileSchema.nullable(),
    preferences: preferencesSchema.nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

const authResponseSchema = z.object({
    token: z.string(),
    user: userResponseSchema,
});

// OpenAPI/Swagger documentation
const authDocs = {
    register: {
        summary: 'Register a new user',
        tags: ['Auth'],
        requestBody: {
            required: true,
            content: {
                'application/json': {
                    schema: registerSchema,
                },
            },
        },
        responses: {
            201: {
                description: 'User registered successfully',
                content: {
                    'application/json': {
                        schema: authResponseSchema,
                    },
                },
            },
            400: {
                description: 'Invalid input or email already exists',
            },
        },
    },
    login: {
        summary: 'Login user',
        tags: ['Auth'],
        requestBody: {
            required: true,
            content: {
                'application/json': {
                    schema: loginSchema,
                },
            },
        },
        responses: {
            200: {
                description: 'Login successful',
                content: {
                    'application/json': {
                        schema: authResponseSchema,
                    },
                },
            },
            400: {
                description: 'Invalid credentials',
            },
        },
    },
    forgotPassword: {
        summary: 'Request password reset',
        tags: ['Auth'],
        requestBody: {
            required: true,
            content: {
                'application/json': {
                    schema: forgotPasswordSchema,
                },
            },
        },
        responses: {
            200: {
                description: 'Password reset email sent',
            },
            404: {
                description: 'User not found',
            },
        },
    },
    resetPassword: {
        summary: 'Reset password',
        tags: ['Auth'],
        requestBody: {
            required: true,
            content: {
                'application/json': {
                    schema: resetPasswordSchema,
                },
            },
        },
        responses: {
            200: {
                description: 'Password reset successful',
            },
            400: {
                description: 'Invalid or expired token',
            },
        },
    },
};

module.exports = {
    schemas: {
        registerSchema,
        loginSchema,
        forgotPasswordSchema,
        resetPasswordSchema,
        userResponseSchema,
        authResponseSchema,
        addressSchema,
        sellerProfileSchema,
        preferencesSchema,
    },
    docs: authDocs,
}; 