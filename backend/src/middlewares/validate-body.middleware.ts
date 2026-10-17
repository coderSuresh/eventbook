import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const validateBody = (schema: z.ZodType) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body || {});

        if (!result.success) {
            const errors = result.error.issues.map((issue: z.core.$ZodIssue) => ({
                field: issue.path.join(''),
                message: issue.message,
            }));

            return res.status(400).json({ errors });
        }

        req.body = result.data;
        next();
    }
};

export { validateBody };