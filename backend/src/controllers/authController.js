const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { prisma } = require('../utils/prisma');
const { AppError } = require('../middleware/errorHandler');
const { sendEmail } = require('../utils/email');
const { schemas } = require('../schemas/auth.schema');


class AuthController {
    static async register(req, res, next) {
        try {
            const { email, password, firstName, lastName } = schemas.registerSchema.parse(req.body);

            const existingUser = await prisma.user.findUnique({ where: { email } });

            if (existingUser) {
                return next(new AppError('Email already exists', 400));
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '5h' });

            const user = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    firstName,
                    lastName,
                    emailVerificationToken: verificationToken,
                },
            });

            await sendEmail({
                to: email,
                subject: 'Verify your email',
                html: `Click <a href="${process.env.FRONTEND_URL}/verify-email/${verificationToken}">here</a> or use this code: ${verificationToken} to verify your email.`,
            });

            const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });

            res.status(201).json(schemas.authResponseSchema.parse({
                token,
                user
            }));
        } catch (error) {
            next(error);
        }
    }

    static async login(req, res, next) {
        try {
            const { email, password } = schemas.loginSchema.parse(req.body);

            const user = await prisma.user.findUnique({ where: { email } });

            if (!user) {
                throw new AppError('Invalid email or password', 401);
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                return next(new AppError('Invalid email or password', 401));
            }

            const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });

            res.status(200).json(schemas.authResponseSchema.parse({
                token,
                user
            }));
        } catch (error) {
            next(error);
        }
    }


    static async forgotPassword(req, res, next) {
        try {
            const { email } = schemas.forgotPasswordSchema.parse(req.body);

            const user = await prisma.user.findUnique({
                where: { email }
            });

            if (!user) {
                throw new AppError('User not found', 404);
            }

            const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '2h' });

            await prisma.user.update({
                where: { id: user.id },
                data: { passwordResetToken: resetToken }
            });

            await sendEmail({
                to: email,
                subject: 'Reset your password',
                html: `Click <a href="${process.env.FRONTEND_URL}/reset-password/${resetToken}">here</a> or use this code: ${resetToken} to reset your password.`,
            });

            res.json({ message: 'Password reset email sent' });
        } catch (error) {
            next(error);
        }
    }

    static async resetPassword(req, res, next) {
        try {
            const { token, password } = schemas.resetPasswordSchema.parse(req.body);

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const user = await prisma.user.findUnique({
                where: { id: decoded.id }
            });

            if (!user || user.passwordResetToken !== token) {
                throw new AppError('Invalid or expired token', 400);
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            await prisma.user.update({
                where: { id: user.id },
                data: {
                    password: hashedPassword,
                    passwordResetToken: null
                }
            });

            res.json({ message: 'Password reset successful' });
        } catch (error) {
            next(error);
        }
    }

    static async verifyEmail(req, res, next) {
        try {
            const { token } = req.params;

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const user = await prisma.user.findFirst({
                where: { email: decoded.email, emailVerificationToken: token }
            });

            if (!user) {
                throw new AppError('Invalid or expired token', 400);
            }

            await prisma.user.update({
                where: { id: user.id },
                data: { isEmailVerified: true, emailVerificationToken: null }
            });

            res.json({ message: 'Email verified successfully' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = AuthController;