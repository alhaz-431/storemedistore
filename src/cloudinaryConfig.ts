import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

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
    // আন্ডারস্কোর (_) দিয়ে বোঝালাম যে এই প্যারামিটারগুলো অব্যবহৃত
    public_id: (_req: any, _file: any) => Date.now().toString(),
  } as any,
});

export const upload = multer({ storage: storage });