import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { APIErrorCommon } from '../types/error';
import { pictureSchema, updatePictureSchema } from '../schemas/pictureSchema';

export const validateSchema = 
    (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errorResponse: APIErrorCommon = {
                    failed: true,
                    code: "INVALID_DATA",
                    extra: error.issues
                };
                return res.status(400).json(errorResponse);
            } else {
                return res.status(500).json({ failed: true, code: "INTERNAL_ERROR" });
            }
        }
    };

export const validatePictureSchema = 
    (update: boolean) => (req: Request, res: Response, next: NextFunction) => {
        try {
            const schema = update ? updatePictureSchema : pictureSchema;
            schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const hasBadPictureData = error.issues.some(issue => 
                    issue.path.length > 0 && issue.path[0] === 'picture_data'
                );

                const errorResponse: APIErrorCommon = {
                    failed: true,
                    code: hasBadPictureData ? "BAD_PICTURE_DATA" : "INVALID_DATA",
                    extra: hasBadPictureData ? error.issues : undefined
                };
                return res.status(400).json(errorResponse);
            } else {
                return res.status(500).json({ failed: true, code: "INTERNAL_ERROR" });
            }
        }
    };