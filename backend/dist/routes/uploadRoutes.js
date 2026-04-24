import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';
import { uploadSolutionFiles } from '../controllers/upload.controller.js';
const router = Router();
router.post('/solution', authenticate, upload.array('files', 3), uploadSolutionFiles);
export default router;
