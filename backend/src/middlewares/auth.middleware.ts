import jwt from "jsonwebtoken";
import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../types/index.js";
import { db } from "../prisma/db.js";

const authenticateJwt = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = authHeader.split(" ")[1]!;

    try {

        const secret = process.env["JWT_SECRET"];

        if (!secret) {
            throw new Error("JWT_SECRET is not defined in environment variables");
        }

        const decoded = jwt.verify(token, secret) as { userId: string; role: string; type?: string };

        if (decoded.type !== "access") {
            return res.status(401).json({ message: "Invalid access token" });
        }

        const user = await db.orm.public.User.where({ id: decoded.userId }).first();

        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        req.user = { userId: user.id, role: user.role };
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

const authorizeRoles = (...roles: string[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Forbidden: You are not authorized to access this resource." });
        }

        next();
    }
};

export { authenticateJwt, authorizeRoles };
