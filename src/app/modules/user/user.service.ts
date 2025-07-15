import bcryptjs from 'bcryptjs';
import httpStatus from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import { envVars } from '../../config/env';
import AppError from '../../errorHelpers/appError';
import { IAuthProvider, IUser, Role } from './user.interface';
import { User } from './user.model';

// create User
const createUser = async (payload: Partial<IUser>) => {
    const { email, password, ...rest } = payload;

    const isUserExist = await User.findOne({ email });

    if (isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, 'User Already Exist');
    }

    const hashedPassword = await bcryptjs.hash(password as string, Number(envVars.BCRYPT_SALT_ROUND));

    // const isPasswordMatch = await bcryptjs.compare(password as string, hashedPassword)

    const authProvider: IAuthProvider = { provider: 'credentials', providerId: email as string };

    const user = await User.create({
        email,
        password: hashedPassword,
        auths: [authProvider],
        ...rest
    });

    return user;
};

// update User
const updateUser = async (userId: string, payload: Partial<IUser>, decodedToken: JwtPayload) => {

    const ifUserExist = await User.findById(userId);

    if (!ifUserExist) {
        throw new AppError(httpStatus.NOT_FOUND, "User Not Found")
    }

    // if (ifUserExist.isDeleted || ifUserExist.isActive === IsActive.BLOCKED) {
    //     throw new AppError(httpStatus.FORBIDDEN, 'This User can not be updated');
    // }

    /**
     * email - cannot update
     * name, phone, password, address
     * password - re hashing
     * only admin superadmin - role, isDeleted...
     *
     * promoting to superadmin
     */

    if (payload.role) {
        if (decodedToken.role === Role.USER || decodedToken.role === Role.GUIDE) {
            throw new AppError(httpStatus.FORBIDDEN, 'You are not authorized');
        }

        if (payload.role === Role.SUPER_ADMIN && decodedToken.role === Role.ADMIN) {
            throw new AppError(httpStatus.FORBIDDEN, 'You are not authorized');
        }
    }

    if (payload.isActive || payload.isDeleted || payload.isVerified) {
        if (decodedToken.role === Role.USER || decodedToken.role === Role.GUIDE) {
            throw new AppError(httpStatus.FORBIDDEN, 'You are not authorized');
        }
    }

    if (payload.password) {
        payload.password = await bcryptjs.hash(payload.password, envVars.BCRYPT_SALT_ROUND);
    }

    const newUpdatedUser = await User.findByIdAndUpdate(userId, payload, { new: true, runValidator: true })
    
    return newUpdatedUser

};

// get all users
const getAllUsers = async () => {
    const users = await User.find({});

    const totalUsers = await User.countDocuments();

    return {
        data: users,
        meta: {
            total: totalUsers
        }
    };
};

export const UserServices = {
    createUser,
    updateUser,
    getAllUsers
};
