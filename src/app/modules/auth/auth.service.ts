/* eslint-disable @typescript-eslint/no-non-null-assertion */
import bcryptjs from 'bcryptjs';
import httpStatus from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import { envVars } from '../../config/env';
import AppError from '../../errorHelpers/appError';
import { createNewAccessTokenWithRefreshToken, createUserTokens } from '../../utils/userToken';
import { IAuthProvider, IUser } from '../user/user.interface';
import { User } from '../user/user.model';

// credentialsLogin
const credentialsLogin = async (payload: Partial<IUser>) => {
    const { email, password } = payload;

    const isUserExist = await User.findOne({ email });

    if (!isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Email does not exist');
    }
    const isPasswordMatch = await bcryptjs.compare(password as string, isUserExist.password as string);

    if (!isPasswordMatch) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Incorrect password');
    }

    // const jwtPayload = {
    //     userId: isUserExist._id,
    //     email: isUserExist.email,
    //     role: isUserExist.role
    // };
    // const accessToken = generateToken(jwtPayload, envVars.JWT_ACCESS_SECRET, envVars.JWT_ACCESS_EXPIRES)
    // const refreshToken = generateToken(jwtPayload, envVars.JWT_REFRESH_SECRET, envVars.JWT_REFRESH_EXPIRES)

    const userTokens = createUserTokens(isUserExist);

    // delete isUserExist.password;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: pass, ...rest } = isUserExist.toObject();

    return {
        accessToken: userTokens.accessToken,
        refreshToken: userTokens.refreshToken,
        user: rest
    };
};

// get Access Token 
const getNewAccessToken = async (refreashToken: string) => {
    const newAccessToken = await createNewAccessTokenWithRefreshToken(refreashToken);

    return {
        accessToken: newAccessToken
    };
};

// reset Password 
const resetPassword = async (oldPassword: string, newPassword: string, decodedToken: JwtPayload) => {
    
    return {}

};

// set Password
const setPassword = async (userId: string, plainPassword: string) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError(404, "User not found")
    }

    if (user.password && user.auths.some(providerObject => providerObject.provider === "google")) {
        throw new AppError(httpStatus.BAD_REQUEST, "You have already set you password. Now you can change the password from your profile password update")
    }

    const hashedPassword = await bcryptjs.hash(
        plainPassword,
        Number(envVars.BCRYPT_SALT_ROUND)
    )

    const credentialProvider: IAuthProvider = {
        provider: "credentials",
        providerId: user.email
    }
    const auths: IAuthProvider[] = [...user.auths, credentialProvider]
    
    user.password = hashedPassword
    user.auths = auths

    await user.save()

};

// change password 
const changePassword = async (oldPassword: string, newPassword: string, decodedToken: JwtPayload) => {
    const user = await User.findById(decodedToken.userId);

    const isOldPasswordMatch = await bcryptjs.compare(oldPassword, user!.password as string);
    if (!isOldPasswordMatch) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'Old Password does not match');
    }

    user!.password = await bcryptjs.hash(newPassword, Number(envVars.BCRYPT_SALT_ROUND));
    user!.save();
};

//user - login - token (email, role, _id) - booking / payment / booking / payment cancel -

export const AuthServices = {
    credentialsLogin,
    getNewAccessToken,
    resetPassword,
    setPassword,
    changePassword
};
