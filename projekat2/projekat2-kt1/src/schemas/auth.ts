import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required').min(3, 'Username must be at least 3 characters').refine (s => s.match(/^[a-zA-Z0-9_]+$/), "Username must contain only letters, numbers, and underscores."),
  password: z.string().min(1, 'Password is required').min(6, 'Password must be at least 6 characters')
});

export const registerSchema = loginSchema.extend({
  confirmPassword: z.string().min(1, 'Please confirm your password')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// export type LoginForm = z.infer<typeof loginSchema>;
// export type RegisterForm = z.infer<typeof registerSchema>;

// export type AuthForm = LoginForm | RegisterForm;