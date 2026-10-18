import express from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { loginSchema, registerSchema } from "../zod-schemas/auth.schema.js";
import { validateBody } from "../middlewares/validate-body.middleware.js";

const router = express.Router();

const { register, login, refresh, logout, verifyEmail } = AuthController;

router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/verify', verifyEmail);

export default router;