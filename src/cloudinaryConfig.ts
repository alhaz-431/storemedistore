import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

cloudinary.config({
  cloud_name: 'da55p8fpm',
  api_key: 'আপনার_API_KEY_এখানে', // Cloudinary থেকে কপি করে দিন
  api_secret: 'আপনার_API_SECRET_এখানে' // Cloudinary থেকে কপি করে দিন
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'medistore_images',
    format: async () => 'jpg',
    public_id: () => Date.now().toString(),
  } as any,
});

export const upload = multer({ storage: storage });