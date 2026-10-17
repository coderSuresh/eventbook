import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        role: string;
    };
}

const authenticateJwt = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = authHeader.split(" ")[1]!;

    try {
        const decoded = jwt.verify(token, process.env["JWT_SECRET"] || "") as { userId: string; role: string };
        req.user = decoded;
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
