/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import bcryptjs from 'bcryptjs';
import httpStatus from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import { envVars } from '../../config/env';
import AppError from '../../errorHelpers/appError';
import { createNewAccessTokenWithRefreshToken, createUserTokens } from '../../utils/userToken';
import { IAuthProvider, IsActive, IUser } from '../user/user.interface';
import { User } from '../user/user.model';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../../utils/sendEmail';

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

// forgot Password
const forgotPassword = async (email: string) => {
    const isUserExist = await User.findOne({ email });

    if (!isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, 'User does not exist');
    }
    if (!isUserExist.isVerified) {
        throw new AppError(httpStatus.BAD_REQUEST, 'User is not verified');
    }
    if (isUserExist.isActive === IsActive.BLOCKED || isUserExist.isActive === IsActive.INACTIVE) {
        throw new AppError(httpStatus.BAD_REQUEST, `User is ${isUserExist.isActive}`);
    }
    if (isUserExist.isDeleted) {
        throw new AppError(httpStatus.BAD_REQUEST, 'User is deleted');
    }

    const jwtPayload = {
        userId: isUserExist._id,
        email: isUserExist.email,
        role: isUserExist.role
    };

    const resetToken = jwt.sign(jwtPayload, envVars.JWT_ACCESS_SECRET, {
        expiresIn: '10m'
    });

    const resetUILink = `${envVars.FRONTEND_URL}/reset-password?id=${isUserExist._id}&token=${resetToken}`;

    sendEmail({
        to: isUserExist.email,
        subject: 'Password Reset',
        templateName: 'forgetPassword',
        templateData: {
            name: isUserExist.name,
            resetUILink
        }
    });

    /**
     * http://localhost:5173/reset-password?id=68a2b4dd3d1a14264df7af77&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGEyYjRkZDNkMWExNDI2NGRmN2FmNzciLCJlbWFpbCI6Im1vbmlyZGV2ZWxvcGVyMDVAZ21haWwuY29tIiwicm9sZSI6IlVTRVIiLCJpYXQiOjE3NTU0OTc4OTQsImV4cCI6MTc1NTQ5ODQ5NH0.8Y9DkEcwVRhl8tvj190Biumg2rE_MHiMiOwreLmjnXI
     */
};

// reset Password 
const resetPassword = async (payload: Record<string, any>, decodedToken: JwtPayload) => {
    if (payload.id != decodedToken.userId) {
        throw new AppError(401, 'You can not reset your password');
    }

    const isUserExist = await User.findById(decodedToken.userId);
    if (!isUserExist) {
        throw new AppError(401, 'User does not exist');
    }

    const hashedPassword = await bcryptjs.hash(payload.newPassword, Number(envVars.BCRYPT_SALT_ROUND));

    isUserExist.password = hashedPassword;

    await isUserExist.save();
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
    changePassword,
    forgotPassword
};
