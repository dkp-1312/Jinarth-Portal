import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';
import { uploadSolutionFiles, uploadProfileImage } from '../controllers/upload.controller.js';

const router = Router();

router.post('/solution', authenticate, upload.array('files', 3), uploadSolutionFiles);
router.post('/profile-image', authenticate, upload.single('file'), uploadProfileImage);

export default router;
