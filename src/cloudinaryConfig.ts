import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express'; // এক্সপ্রেস থেকে Request টাইপটি ইমপোর্ট করুন

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'medistore_images',
    format: async () => 'jpg',
    // এখানে টাইপগুলো স্পষ্টভাবে বলে দিলাম
    public_id: (_req: Request, _file: Express.Multer.File) => Date.now().toString(),
  } as any,
});

export const upload = multer({ storage: storage });