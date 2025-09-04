import { Router } from "express";
import { login, register } from "../controllers/authController";
import { userSchema } from "../schemas/userSchema";
import { validateSchema } from "../middleware/zodValidation";

const router = Router();

router.post("/login", validateSchema(userSchema), login);
router.post("/register", validateSchema(userSchema), register);

export default router;
