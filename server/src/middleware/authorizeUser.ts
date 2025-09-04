import { Request, Response, NextFunction } from 'express';

export const authorizeUser = (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
        return res.status(403).json({ failed: true, code: "NOT_AUTHORIZED" });
    }

    next();
};
