"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const cloudinary_1 = require("cloudinary");
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const multer_1 = __importDefault(require("multer"));
cloudinary_1.v2.config({
    cloud_name: 'da55p8fpm',
    api_key: 'আপনার_API_KEY_এখানে', // Cloudinary থেকে কপি করে দিন
    api_secret: 'আপনার_API_SECRET_এখানে' // Cloudinary থেকে কপি করে দিন
});
const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.v2,
    params: {
        folder: 'medistore_images',
        format: async () => 'jpg',
        public_id: () => Date.now().toString(),
    },
});
exports.upload = (0, multer_1.default)({ storage: storage });
