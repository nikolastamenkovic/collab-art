import { z } from "zod";

export const pictureSchema = z.object({
    name: z.string().min(1).max(42),
    picture_data: z.array(z.array(z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)))
        .min(1).max(24)
        .refine((matrix) => matrix.every(row => row.length === matrix.length)),
});

export const updatePictureSchema = pictureSchema.partial();