/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';
import { envVars } from '../config/env';
import AppError from '../errorHelpers/appError';
import { handleCastError } from '../helpers/handleCastError';
import { handleDuplicateError } from '../helpers/handleDuplicateError';
import { handleValidationError } from '../helpers/handleValidationError';
import { handleZodError } from '../helpers/handleZodError';
import { TErrorSources } from '../interfaces/error.types';
import { deleteImageFromCloudinary } from '../config/cloudinary.config';

export const globalErrorHandler = async(err: any, req: Request, res: Response, next: NextFunction) => {
    if (envVars.NODE_ENV === 'development') {
        console.log(err);
    }

    if (req.file) {
        await deleteImageFromCloudinary(req.file.path)
    }

    if (req.files && Array.isArray(req.files) && req.files.length) {
        const imageUrls = (req.files as Express.Multer.File[]).map(file => file.path)
        
        await Promise.all(imageUrls.map(url => deleteImageFromCloudinary(url)));
    }

    let errorSources: TErrorSources[] = [];

    let statusCode = 500;
    let message = 'Something went Wrong!!';

    // Duplicate error
    if (err.code === 11000) {
        const simplifiedError = handleDuplicateError(err);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
    }
    // Object ID error / Cast Error
    else if (err.name === 'CastError') {
        const simplifiedError = handleCastError(err);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
    } else if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
    }
    // Zod error
    else if (err.name === 'ZodError') {
        const simplifiedError = handleZodError(err);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        errorSources = simplifiedError.errorSources as TErrorSources[];
    }

    //Mongoose Validation Error
    else if (err.name === 'ValidationError') {
        const simplifiedError = handleValidationError(err);
        statusCode = simplifiedError.statusCode;
        errorSources = simplifiedError.errorSources as TErrorSources[];
        message = simplifiedError.message;
    } else if (err instanceof Error) {
        statusCode = 500;
        message = err.message;
    }

    res.status(statusCode).json({
        success: false,
        message,
        errorSources,
        err: envVars.NODE_ENV === 'development' ? err : null,
        stack: envVars.NODE_ENV === 'development' ? err.stack : null
    });
};
