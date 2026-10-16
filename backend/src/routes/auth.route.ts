import express from "express";
import { AuthController } from "../controllers/auth.controller";
import validateBody from "../middlewares/validate-body.middleware";
import { loginSchema, registerSchema } from "../zod-schemas/auth.schema";

const router = express.Router();

const { register, login, verifyEmail } = AuthController;
    
router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.get('/verify', verifyEmail);

export default router;