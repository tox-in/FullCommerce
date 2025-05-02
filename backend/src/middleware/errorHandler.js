const { logger } = require('../utils/logger');

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // This is an operational error, meaning it was expected and handled by the application

    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if(process.env.NODE_ENV === 'development') {
        logger.error({
            message: err.message,
            stack: err.stack,
            path: err.path,
            method: err.method,
        });

        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            stack: err.stack,
        });
    } else {
        // In production, don't leak stack traces to the client
        if (err.isOperational) {
            res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
            });
        } else {
            logger.error({
                message: 'Something went wrong!💥',
                error: err,
            });

            res.status(500).json({
                status: 'error',
                message: 'Something went very wrong!',
            });
        }
    }
};

module.exports = {
    AppError,
    errorHandler,
}