import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// এখানে তোমার আসল ভ্যালুগুলো বসিয়ে দিয়েছি
cloudinary.config({
  cloud_name: 'da55p8fpm',
  api_key: '563446485239195',
  api_secret: 'o9zkb5OUqaNeVAnn3f9b5VYGvJo'
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