import { Types } from 'mongoose';

export enum Role {
    SUPER_ADMIN = 'SUPER_ADMIN',
    USER = 'USER',
    ADMIN = 'ADMIN',
    GUIDE = 'GUIDE'
}

export enum IsActive {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    PENDING = 'PENDING',
    BLOCKED = 'BLOCKED',
    DELETED = 'DELETED',
    VERIFIED = 'VERIFIED'
}

export interface IAuthProvider {
    provider: 'google' | 'credentials';
    providerId: string;
    accessToken?: string;
    refreshToken?: string;
    expiresIn?: number;
    scope?: string;
    tokenType?: string;
    idToken?: string;
    email?: string;
    emailVerified?: boolean;
    phoneNumber?: string;
}

export interface IUser {
    _id?: Types.ObjectId;
    name: string;
    age: number;
    email: string;
    password?: string;
    phone?: string;
    picture?: string;
    address?: string;
    isDeleted?: boolean;
    isActive?: IsActive;
    isVerified?: boolean;
    auths: IAuthProvider[];
    role: Role;
    bookings?: Types.ObjectId[];
    guides?: Types.ObjectId[];
}
