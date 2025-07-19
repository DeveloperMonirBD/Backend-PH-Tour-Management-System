/* eslint-disable @typescript-eslint/no-unused-vars */
import mongoose from "mongoose";
import { TGenericErrorResponse } from "../interfaces/error.types";

// Object ID error / Cast Error
export const handleCastError = (err: mongoose.Error.CastError): TGenericErrorResponse => {
    return {
        statusCode: 400,
        message: 'Invalid MongoDB ObjectID. Please provide a valid id'
    };
};