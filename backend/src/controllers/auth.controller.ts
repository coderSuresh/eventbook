import type { Request, Response } from "express";
import { db } from "../prisma/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Resend } from "resend";
import crypto from "crypto";
import { REFRESH_TOKEN_COOKIE, refreshCookieOptions } from "../constants/auth.js";

const FRONTEND_URL = process.env["CORS_ORIGIN"] || "http://localhost:3000";

export class AuthController {

    private static generateJwtToken(userId: string, role: string): string {
        const secretKey = process.env["JWT_SECRET"];

        if (!secretKey) {
            throw new Error("JWT_SECRET is not defined");
        }

        const token = jwt.sign({ userId, role, type: "access" }, secretKey, { expiresIn: "15m" });
        return token;
    }

    private static generateRefreshToken(userId: string, role: string): string {
        const secretKey = process.env["JWT_SECRET"];

        if (!secretKey) {
            throw new Error("JWT_SECRET is not defined");
        }

        return jwt.sign({ userId, role, type: "refresh" }, secretKey, { expiresIn: "7d" });
    }

    private static hashRefreshToken(token: string): string {
        return crypto.createHash("sha256").update(token).digest("hex");
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
            const { email, password } = req.body || {};

            const user = await db.orm.public.User.where({
                email: email,
            }).first();

            if (!user) {
                return res.status(401).json({ message: "Invalid email or password" });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                return res.status(401).json({ message: "Invalid email or password" });
            }

            if (!user.isVerified) {
                if (user.token) {
                    return res.status(401).json({ message: "Email not verified. Check your email for a verification link." });
                }

                const token = AuthController.generateRandomToken(email);

                await db.orm.public.User.where({ id: user.id }).update({
                    token,
                });

                await AuthController.sendVerificationEmail(email, token);

                return res.status(401).json({ message: "Email not verified. Check your email for a verification link." });
            }

            const token = AuthController.generateJwtToken(user.id, user.role);
            const refreshToken = AuthController.generateRefreshToken(user.id, user.role);

            await db.orm.public.User.where({ id: user.id }).update({
                refreshTokenHash: AuthController.hashRefreshToken(refreshToken),
            });

            res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, refreshCookieOptions);

            res.json({ token });

        } catch (error) {
            console.error("Error during login:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    static async refresh(req: Request, res: Response) {
        try {
            const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];

            if (!refreshToken) {
                return res.status(401).json({ message: "Refresh token missing" });
            }

            const secretKey = process.env["JWT_SECRET"];
            if (!secretKey) {
                throw new Error("JWT_SECRET is not defined");
            }

            const decoded = jwt.verify(refreshToken, secretKey) as { userId: string; role: string; type?: string };
            if (decoded.type !== "refresh") {
                return res.status(401).json({ message: "Invalid refresh token" });
            }

            const user = await db.orm.public.User.where({ id: decoded.userId }).first();
            const refreshTokenHash = AuthController.hashRefreshToken(refreshToken);

            if (!user || !user.isActive || user.refreshTokenHash !== refreshTokenHash) {
                return res.status(401).json({ message: "Invalid refresh token" });
            }

            const nextRefreshToken = AuthController.generateRefreshToken(user.id, user.role);
            await db.orm.public.User.where({ id: user.id }).update({
                refreshTokenHash: AuthController.hashRefreshToken(nextRefreshToken),
            });

            res.cookie(REFRESH_TOKEN_COOKIE, nextRefreshToken, refreshCookieOptions);
            return res.json({ token: AuthController.generateJwtToken(user.id, user.role) });
        } catch (error) {
            console.error("Error refreshing access token:", error);
            return res.status(401).json({ message: "Invalid or expired refresh token" });
        }
    }

    static logout(_: Request, res: Response) {
        res.clearCookie(REFRESH_TOKEN_COOKIE, refreshCookieOptions);
        return res.json({ message: "Logged out successfully" });
    }

    static async register(req: Request, res: Response) {
        try {
            const { name, email, password } = req.body || {};

            const existingUser = await db.orm.public.User.where({
                email: email,
            }).first();

            if (existingUser) {
                if (existingUser.isVerified) {
                    return res.status(400).json({ message: "Email already exists" });
                }

                if (existingUser.token) {
                    return res.status(400).json({ message: "Email already exists. Check your email for a verification link." });
                }

                const token = AuthController.generateRandomToken(email);

                await db.orm.public.User.where({ id: existingUser.id }).update({
                    token,
                });

                await AuthController.sendVerificationEmail(email, token);

                return res.status(400).json({ message: "Email already exists. Check your email for a verification link." });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const token = AuthController.generateRandomToken(email);

            const newUser = await db.orm.public.User.create({
                name,
                email,
                password: hashedPassword,
                token,
            });

            await AuthController.sendVerificationEmail(email, token);

            return res.status(201).json({ message: "User registered successfully", newUser });
        } catch (error) {
            console.error("Error during registration:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    static async verifyEmail(req: Request, res: Response) {
        try {
            const { token } = req.query;

            if (!token || typeof token !== "string") {
                return res.status(400).json({ message: "Invalid token" });
            }

            const user = await db.orm.public.User.where({
                token,
            }).first();

            if (!user) {
                return res.status(400).json({ message: "Invalid token" });
            }

            user.isVerified = true;
            user.token = null;

            await db.orm.public.User.where({ id: user.id }).update(user);

            res.json({ message: "Email verified successfully" });
        } catch (error) {
            console.error("Error during email verification:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }
}