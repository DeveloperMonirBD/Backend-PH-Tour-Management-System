/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status-codes';
import AppError from '../../errorHelpers/appError';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { setAuthCookie } from '../../utils/setCookie';
import { AuthServices } from './auth.service';

// credentials Login
const credentialsLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const loginInfo = await AuthServices.credentialsLogin(req.body);

    //  //set accessToken in the cookie
    // res.cookie("accessToken", loginInfo.accessToken, {
    //     httpOnly: true,
    //     secure: false
    // })

    // //set refreshToken in the cookie
    // res.cookie("refreshToken", loginInfo.refreshToken, {
    //     httpOnly: true,
    //     secure: false
    // })
    
    //set accessToken and refreshToken in the cookie
    setAuthCookie(res, loginInfo);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'User Logged in Successfully',
        data: loginInfo
    });
});

// getNewAccessToken
const getNewAccessToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        throw new AppError(httpStatus.BAD_REQUEST, 'No refresh token receieved from cookies');
    }
    const tokenInfo = await AuthServices.getNewAccessToken(refreshToken as string);

    // // set accessToken in the cookie
    // res.cookie('accessToken', tokenInfo.accessToken, {
    //     httpOnly: true,
    //     secure: false
    // });

    //set accessToken and refreshToken in the cookie
    setAuthCookie(res, tokenInfo);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'New Access Token Retrieved Successfully',
        data: tokenInfo
    });
});

// logout
const logout = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    })

    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    })

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'User Logged out Successfully',
        data: null
    });
});

export const AuthControllers = {
    credentialsLogin,
    getNewAccessToken,
    logout
};
