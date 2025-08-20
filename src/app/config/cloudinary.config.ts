/* eslint-disable @typescript-eslint/no-explicit-any */
// Frontend ->  Form Data with image file ->  Multer ->  Form data ->  Req (Body + File)

import { v2 as cloudinary } from 'cloudinary';
import { envVars } from './env';
import AppError from '../errorHelpers/appError';

// Amader Folder ->  image ->  form data ->  file -> Multer ->  Nijer akta folder(temporary) -> Req.file

// req.file -> cloudinary(req.file) -> mongoose -> mongodb

 // Configuration
cloudinary.config({
    cloud_name: envVars.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
    api_key: envVars.CLOUDINARY.CLOUDINARY_API_KEY,
    api_secret: envVars.CLOUDINARY.CLOUDINARY_API_SECRET
});

export const uploadBufferToCloudinary

export const deleteImageFromCloudinary = async (url: string) => {

    try {
        const regex = /\/v\d+\/(.*?)\.(jpg|jpeg|png|gif|webp)$/i;

        const match = url.match(regex);

        if (match && match[1]) {
            const public_id = match[1];
            await cloudinary.uploader.destroy(public_id);
            console.log(`File ${public_id} is deleted from cloudinary`);
        }
    } catch (error: any) {
        throw new AppError(401, "Cloudinary image deletion failed", error.message)
    }
}

export const cloudinaryUpload = cloudinary

// const uploadToCloudinary = cloudinary.uploader()