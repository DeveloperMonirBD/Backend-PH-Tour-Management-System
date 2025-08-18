/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status-codes';
import AppError from '../../errorHelpers/appError';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { setAuthCookie } from '../../utils/setCookie';
import { createUserTokens } from '../../utils/userToken';
import { envVars } from '../../config/env';
import { JwtPayload } from 'jsonwebtoken';
import passport from 'passport';
import { AuthServices } from './auth.service';

// credentials Login
const credentialsLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // const loginInfo = await AuthServices.credentialsLogin(req.body);

    //set accessToken and refreshToken in the cookie
    passport.authenticate('local', async (err: any, user: any, info: any) => {

        if (err) {
            // ❌❌❌❌❌
            // throw new AppError(401, "Some error")
            // next(err)
            // return new AppError(401, err)

            // ✅✅✅✅✅
            // return next(err)
            return next(new AppError(err.statusCode || 401, err.message))
        }

        if (!user) {
            // return new AppError(401, err)
             return next(new AppError(401, info.message));
        }

        const userTokens = await createUserTokens(user)

        // delete user.toObject().password
        const {password: pass, ...rest} = user.toObject()

        setAuthCookie(res, userTokens);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: 'User Logged in Successfully',
            data: {
                accessToken: userTokens.accessToken,
                refreshToken: userTokens.refreshToken,
                user : rest
            }
        });
    })(req, res, next);

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

    // //set accessToken and refreshToken in the cookie
    // setAuthCookie(res, loginInfo);

    // sendResponse(res, {
    //     success: true,
    //     statusCode: httpStatus.OK,
    //     message: 'User Logged in Successfully',
    //     data: loginInfo
    // });
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
    res.clearCookie('accessToken', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax'
    });

    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax'
    });

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'User Logged out Successfully',
        data: null
    });
});

// set Password
const setPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;
    const { password } = req.body;

    await AuthServices.setPassword(decodedToken.userId, password);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Password Changed Successfully',
        data: null
    });
});

// change Password
const changePassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const newPassword = req.body.newPassword;
    const oldPassword = req.body.oldPassword;
    const decodedToken = req.user;

    await AuthServices.changePassword(oldPassword, newPassword, decodedToken as JwtPayload);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Password Changed Successfully',
        data: null
    });
});

// forgot Password
const forgotPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    await AuthServices.forgotPassword(email);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Email sent Successfully',
        data: null
    });
});

// reset Password
const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user;

    await AuthServices.resetPassword(req.body, decodedToken as JwtPayload);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Password Changed Successfully',
        data: null
    });
});

// googleCallbackController
const googleCallbackController = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let redirectTo = req.query.state ? (req.query.state as string) : ''; 

    if (redirectTo.startsWith('/')) {
        redirectTo = redirectTo.slice(1);
    }



    const user = req.user;
    console.log("user", user)

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User Not Found")
    }

    const tokenInfo = createUserTokens(user)

    setAuthCookie(res, tokenInfo)

    // sendResponse(res, {
    //     success: true,
    //     statusCode: httpStatus.OK,
    //     message: 'Password Changed Successfully',
    //     data: null
    // });

    res.redirect(`${envVars.FRONTEND_URL}/${redirectTo}`);
})



export const AuthControllers = {
    credentialsLogin,
    getNewAccessToken,
    logout,
    resetPassword,
    setPassword,
    changePassword,
    googleCallbackController,
    forgotPassword
};
