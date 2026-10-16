import express from "express";
import { AuthController } from "../controllers/auth.controller";

const router = express.Router();

const { register, login, verifyEmail } = AuthController;

router.post('/register', register);
router.post('/login', login);
router.get('/verify', verifyEmail);

export default router;