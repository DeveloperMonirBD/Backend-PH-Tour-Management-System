import  httpStatus  from 'http-status-codes';
import { IUser } from "../user/user.interface"
import { User } from "../user/user.model";
import AppError from '../../errorHelpers/appError';
import bcryptjs from "bcryptjs";
import { createNewAccessTokenWithRefreshToken, createUserTokens } from '../../utils/userToken';

const credentialsLogin = async (payload: Partial<IUser>) => {
    const { email, password } = payload;

    const isUserExist = await User.findOne({ email });

    if (!isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Email does not exist');
    }
    const isPasswordMatch = await bcryptjs.compare(password as string, isUserExist.password as string)

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

    const userTokens = createUserTokens(isUserExist)

    // delete isUserExist.password;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {password: pass, ...rest} = isUserExist.toObject()

    return {
        accessToken : userTokens.accessToken,
        refreshToken : userTokens.refreshToken,
        user: rest
    }
}

const getNewAccessToken= async (refreashToken: string) => {
    const newAccessToken = await createNewAccessTokenWithRefreshToken(refreashToken);

    return {
        accessToken: newAccessToken
    };
}

//user - login - token (email, role, _id) - booking / payment / booking / payment cancel -

export const AuthServices = {
    credentialsLogin,
    getNewAccessToken
};