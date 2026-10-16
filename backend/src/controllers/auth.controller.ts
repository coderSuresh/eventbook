import type { Request, Response } from "express";
import { db } from "../prisma/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Resend } from "resend";
import crypto from "crypto";

const FRONTEND_URL = process.env["CORS_ORIGIN"] || "http://localhost:3000";

export class AuthController {

    private static generateJwtToken(userId: string, email: string): string {
        const payload = { userId, email };
        const secretKey = process.env["JWT_SECRET"];

        if (!secretKey) {
            throw new Error("JWT_SECRET is not defined");
        }

        // for demo purpose
        // better if aToken with short ttl and rToken with long ttl used
        // with axios interceptor to refresh the token when expired

        const token = jwt.sign(payload, secretKey, { expiresIn: "1d" });
        return token;
    }

    private static generateRandomToken(email: string): string {
        return crypto.createHash("sha256").update(email + Date.now().toString()).digest("hex")
    }

    private static async sendVerificationEmail(email: string, token: string) {
        const resendApiKey = process.env["RESEND_API_KEY"];

        if (!resendApiKey) {
            throw new Error("RESEND_API_KEY is not defined");
        }

        const verificationLink = `${FRONTEND_URL}/verify?token=${token}`;

        const resend = new Resend(resendApiKey);

        // better use template and queue for sending email
        await resend.emails.send({
            from: 'hi@sureshdahal.com.np',
            to: email,
            subject: 'Verify your email address',
            html: `<p>Click <a href="${verificationLink}">here</a> to verify your email address.</p>`
        });
    }

    static async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;

            const user = await db.orm.public.User.where({
                email: email,
            }).first();

            if (!user) {
                res.status(401).json({ message: "Invalid email or password" });
                return;
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                res.status(401).json({ message: "Invalid email or password" });
                return;
            }

            const token = AuthController.generateJwtToken(user.id, user.email);

            res.json({ token });

        } catch (error) {
            console.error("Error during login:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    static async register(req: Request, res: Response) {
        try {
            const { name, email, password } = req.body;

            const existingUser = await db.orm.public.User.where({
                email: email,
            }).first();

            if (existingUser) {

                if (existingUser.isVerified) {
                    res.status(400).json({ message: "Email already exists" });
                    return;
                }

                if (existingUser.token) {
                    res.status(400).json({ message: "Email already exists. Check your email for a verification link." });
                    return;
                }

                const token = AuthController.generateRandomToken(email);
                AuthController.sendVerificationEmail(email, token);

                await db.orm.public.User.where({ id: existingUser.id }).update({
                    token,
                });

                res.status(400).json({ message: "Email already exists. Check your email for a verification link." });
                return;
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const token = AuthController.generateRandomToken(email);
            AuthController.sendVerificationEmail(email, token);

            const newUser = await db.orm.public.User.create({
                name,
                email,
                password: hashedPassword,
                token,
            });

            res.status(201).json({ message: "User registered successfully", newUser });
        } catch (error) {
            console.error("Error during registration:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    static async verifyEmail(req: Request, res: Response) {
        try {
            const { token } = req.query;

            if (!token || typeof token !== "string") {
                res.status(400).json({ message: "Invalid token" });
                return;
            }

            const user = await db.orm.public.User.where({
                token,
            }).first();

            if (!user) {
                res.status(400).json({ message: "Invalid token" });
                return;
            }

            user.isVerified = true;
            user.token = null;

            await db.orm.public.User.where({ id: user.id }).update(user);

            res.json({ message: "Email verified successfully" });
        } catch (error) {
            console.error("Error during email verification:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
}