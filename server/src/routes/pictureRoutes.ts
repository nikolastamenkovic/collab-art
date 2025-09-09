import { Router } from 'express';
import { getPictures, createPicture, deletePicture, updatePicture, getPictureById, likePicture, dislikePicture, commentPicture, deleteComment } from '../controllers/pictureController'
import { authenticate } from '../middleware/authMiddleware';
import { validatePictureSchema, validateSchema } from '../middleware/zodValidation';
import { commentSchema } from '../schemas/commentSchema';

const router = Router();

router.get("/", getPictures);
router.get("/:id", getPictureById);
router.post("/", authenticate, validatePictureSchema(false), createPicture);
router.delete("/:id", authenticate, deletePicture);
router.patch("/:id", authenticate, validatePictureSchema(true), updatePicture);
router.put("/:id/like", authenticate, likePicture);
router.put("/:id/dislike", authenticate, dislikePicture);
router.post("/:id/comment", authenticate, validateSchema(commentSchema), commentPicture);
router.delete("/comment/:id", authenticate, deleteComment);

export default router;
