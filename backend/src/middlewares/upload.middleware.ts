import multer from 'multer';

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024,
  },
  // Accept all mime types. Validation for count and cumulative size is done in controller.
  fileFilter: (_req, _file, cb) => cb(null, true),
});
