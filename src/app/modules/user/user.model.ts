import { model, Schema } from 'mongoose';
import { IAuthProvider, IsActive, IUser, Role } from './user.interface';

const authProviderSchema = new Schema<IAuthProvider>(
    {
        provider: {
            type: String,
            required: true
        },
        providerId: {
            type: String,
            required: true
        },
        accessToken: String,
        refreshToken: String,
        expiresIn: Number,
        scope: String,
        tokenType: String,
        idToken: String,
        email: String,
        emailVerified: Boolean,
        phoneNumber: String
    },
    {
        versionKey: false,
        _id: false,
        timestamps: false
    }
);

const userSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },
        password: {
            type: String
        },
        age: Number,
        role: {
            type: String,
            enum: Object.values(Role),
            default: Role.USER
        },
        phone: {
            type: String,
            unique: true,
            sparse: true
        },
        picture: {
            type: String
        },
        address: {
            type: String
        },
        isDeleted: {
            type: Boolean,
            default: false
        },
        isActive: {
            type: String,
            enum: Object.values(IsActive),
            default: IsActive.ACTIVE
        },
        isVerified: {
            type: String,
            default: false
        },
        auths: [authProviderSchema]
    },
    {
        timestamps: true,
        versionKey: false
    }
);

export const User = model<IUser>('User', userSchema);
