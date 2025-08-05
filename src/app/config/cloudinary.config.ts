// Frontend ->  Form Data with image file ->  Multer ->  Form data ->  Req (Body + File)

import { v2 as cloudinary } from 'cloudinary';
import { envVars } from './env';

// Amader Folder ->  image ->  form data ->  file -> Multer ->  Nijer akta folder(temporary) -> Req.file

// req.file -> cloudinary(req.file) -> mongoose -> mongodb

 // Configuration
cloudinary.config({
    cloud_name: envVars.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
    api_key: envVars.CLOUDINARY.CLOUDINARY_API_KEY,
    api_secret: envVars.CLOUDINARY.CLOUDINARY_API_SECRET
});


export const cloudinaryUpload = cloudinary

// const uploadToCloudinary = cloudinary.uploader()