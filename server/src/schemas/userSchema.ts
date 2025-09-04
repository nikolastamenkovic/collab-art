import { z } from "zod";

export const userSchema = z.object({
    username: z.string().min(2).max(32),
    password: z.string().min(8).max(128),
});
