import  httpStatus  from 'http-status-codes';
import { IUser } from "../user/user.interface"
import { User } from "../user/user.model";
import AppError from '../../errorHelpers/appError';
import bcryptjs from "bcryptjs";
import  Jwt  from 'jsonwebtoken';
import { generateToken } from '../../utils/jwt';
import { envVars } from '../../config/env';

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

    const jwtPayload = {
        userId: isUserExist._id,
        email: isUserExist.email,
        role: isUserExist.role
    };

    // const accessToken = Jwt.sign(jwtPayload, "secret", {
    //     expiresIn: "1d"
    // });

    const accessToken = generateToken(jwtPayload, envVars.JWT_ACCESS_SECRET, envVars.JWT_ACCESS_EXPIRES)

    return {
        accessToken
    }

    // const { password, ...rest } = isUserExist;

     return {
         email: isUserExist.email
        //  ...rest
    }
}

//user - login - token (email, role, _id) - booking / payment / booking / payment cancel -

export const AuthServices = {
    credentialsLogin
}