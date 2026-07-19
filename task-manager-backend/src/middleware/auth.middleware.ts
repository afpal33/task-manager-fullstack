import type { Request, Response, NextFunction} from "express";
import jwt from "jsonwebtoken";

type JwtPayload = {
    userId: number;
    email: string;
};

export const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({message: "Missing or invalid token"});
        }

        const token = authHeader.split(" ")[1];
        const secret = process.env.JWT_SECRET;

        if (!secret) {
            return res.status(500).json({message: "JWT_SECRET is not configured"});
        }

        // @ts-ignore
        const decoded = jwt.verify(token, secret) as JwtPayload;

        req.user = {
            userId: decoded.userId,
            email: decoded.email,
        };

        next();
    } catch {
        return res.status(401).json({message: "Invalid or expired token"});
    }
};