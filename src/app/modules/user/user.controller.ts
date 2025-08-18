import { JwtPayload } from 'jsonwebtoken';
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status-codes';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { UserServices } from './user.service';

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
const createUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
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

    const user = await UserServices.updateUser(userId, JwtPayload, verifiedToken as JwtPayload);

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
        message: 'All Users Retrieved Successfully',
        data: result.data,
        meta: result.meta
    });
});

// Get Single User
const getSingleUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const result = await UserServices.getSingleUser(id);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: 'User Retrieved Successfully',
        data: result.data
    });
});


// Get Me Users
const getMe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;
    const result = await UserServices.getMe(decodedToken.userId);

    // res.status(httpStatus.OK).json({
    //     success: true,
    //     message: "All Users Retrieved Successfully",
    //     data: users
    // })

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: 'Your profile Retrieved Successfully',
        data: result.data
    });
});


// function = try-catch => req-res function

export const UserControllers = {
    createUser,
    getAllUsers,
    getSingleUser,
    updateUser,
    getMe
};
