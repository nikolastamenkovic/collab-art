import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../auth/jwtUtils';
import { APIErrorCommon } from '../types/error';

export const authenticate = (
    req: Request, res: Response, next: NextFunction
) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        const error: APIErrorCommon = {
            failed: true,
            code: "NOT_AUTHENTICATED"
        }
        return res.status(401).json(error);
    }
    
    const token = authHeader.split(" ")[1];
    if (!token) {
        const error: APIErrorCommon = {
            failed: true,
            code: "NOT_AUTHENTICATED"
        }
        return res.status(401).json(error);
    }

    const payload = verifyToken(token);
    if (!payload) {
        const error: APIErrorCommon = {
            failed: true,
            code: "NOT_AUTHENTICATED"
        }
        return res.status(401).json(error);
    }

    req.user = {
        id: payload.id,
        username: payload.username
    };
    next();
};