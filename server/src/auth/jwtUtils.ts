import jwt, { Secret, SignOptions } from "jsonwebtoken";

const JWT_SECRET: Secret = process.env.JWT_SECRET || "tajnikljucxd";
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || "1h";

export const generateToken = (userId: string, username: string): string => {
  return jwt.sign({ id: userId, username: username }, JWT_SECRET as Secret, { expiresIn: JWT_EXPIRATION } as SignOptions);
};

export const verifyToken = (token: string): { id: string, username: string } | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string, username: string };
  } catch (error) {
    return null;
  }
};
