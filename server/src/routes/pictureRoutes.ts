import { Router } from 'express';
import { getPictures, createPicture, deletePicture, updatePicture, getPictureById } from '../controllers/pictureController'
import { authenticate } from '../middleware/authMiddleware';
import { validatePictureSchema } from '../middleware/zodValidation';

const router = Router();

router.get("/", getPictures);
router.get("/:id", getPictureById);
router.post("/", authenticate, validatePictureSchema(false), createPicture);
router.delete("/:id", authenticate, deletePicture);
router.patch("/:id", authenticate, validatePictureSchema(true), updatePicture);

export default router;
