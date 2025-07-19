/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';
import { envVars } from '../config/env';
import AppError from '../errorHelpers/appError';
import path from 'path';

export const globalErrorHandler =
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (err: any, req: Request, res: Response, next: NextFunction) => {
        /**
         * Mongoose
         * Zod
         */

        /**
         * Mongoose
         * - duplicate
         * - cast error
         * -validation error
         */

        const errorSources: any = [
            //     {
            //     path: "isDeleted",
            //     message: "Cast failed"
            // }
        ];

        let statusCode = 500;
        let message = 'Something went Wrong!!';

        // Duplicate error
        if (err.code === 11000) {
            const matchedArray = err.message.match(/"([^"]*)"/);
            statusCode = 400;
            message = `${matchedArray[1]} already exists!!`;
        }
        // Object ID error / Cast Error
        else if (err.name === 'CastError') {
            statusCode = 400;
            message = 'Invalid MongoDB ObjectID. Please provide a valid id';
        } else if (err instanceof AppError) {
            statusCode = err.statusCode;
            message = err.message;
        } else if (err.name === 'ZodError') {
            statusCode = 400
            message = 'Zod Error';

            console.log(err.issues);
            err.issues.forEach((issue: any) => {
                errorSources.push({
                    path: issue.path[issue.path.length - 1],
                    message: issue.message
                })
            });
        }

        //Mongoose Validation Error
        else if (err.name === 'ValidationError') {
            statusCode = 400;
            const errors = Object.values(err.errors);

            errors.forEach((errorObject: any) =>
                errorSources.push({
                    path: errorObject.path,
                    message: errorObject.message
                })
            );

            message = 'Validation Error';
        } else if (err instanceof Error) {
            statusCode = 500;
            message = err.message;
        }

        res.status(statusCode).json({
            success: false,
            message,
            errorSources,
            err,
            stack: envVars.NODE_ENV === 'development' ? err.stack : null
        });
    };
