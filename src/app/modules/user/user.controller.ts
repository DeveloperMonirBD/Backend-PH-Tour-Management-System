import { JwtPayload } from 'jsonwebtoken';
import { verifyToken, verifyToken } from './../../utils/jwt';
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes"
import { UserServices } from "./user.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { envVars } from '../../config/env';

// const createUserFunction = async (req: Request, res: Response) => {
    // const user = await UserServices.createUser(req.body);
    // res.status(httpStatus.CREATED).json({
    //     message: 'User Created Successfully',
    //     user
    // });
// }


 
// const createUser = async (req: Request, res: Response, next : NextFunction) => {
//     try {
//         // throw new Error ("Fake error")
//         // throw new AppError(httpStatus.BAD_REQUEST, 'fake error')
        
//         createUserFunction(req, res)

//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     } catch (err: any) {
//         console.log(err);
//         next(err)
//     }
// }

// Create User
const createUser = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
    const user = await UserServices.createUser(req.body);

    // res.status(httpStatus.CREATED).json({
    //     message: 'User Created Successfully',
    //     user
    // });
    
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: 'User Created Successfully',
        data: user
    });
});

// Update User
const updateUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    // const token = req.headers.authorization
    // const verifiedToken = verifyToken(token as string, envVars.JWT_ACCESS_SECRET) as JwtPayload
    const verifiedToken = req.user;

    const JwtPayload = req.body;
    
    const user = await UserServices.updateUser(userId, JwtPayload, verifiedToken);

    // res.status(httpStatus.CREATED).json({
    //     message: 'User Created Successfully',
    //     user
    // });
    
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: 'User Updated Successfully',
        data: user
    });
});


// Get All Users
const getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserServices.getAllUsers();

    // res.status(httpStatus.OK).json({
    //     success: true,
    //     message: "All Users Retrieved Successfully",
    //     data: users
    // })

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "All Users Retrieved Successfully",
        data: result.data,
        meta: result.meta
})
});

// function = try-catch => req-res function 

export const UserControllers = {
    createUser,
    getAllUsers,
    updateUser
}