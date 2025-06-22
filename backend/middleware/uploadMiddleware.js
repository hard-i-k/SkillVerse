// middleware/uploadMiddleware.js
import multer from 'multer';

const storage = multer.memoryStorage();

export const upload = multer({ storage }).fields([
  { name: 'video', maxCount: 1 },
  { name: 'pdf', maxCount: 1 }
]);

export const uploadAvatar = multer({ storage }).single('avatar');
