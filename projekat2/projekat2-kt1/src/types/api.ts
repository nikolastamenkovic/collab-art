import type { ZodIssue } from "zod";

export type APIErrorCommon = {
    failed: true;
    code: ErrorCode;
    extra?: ZodIssue[];
};

export interface AuthForm {
    username: string;
    password: string;
    confirmPassword?: string;
}

export interface LoginResponse {
  failed: false;
  token: string;
  user_id: string;
  username: string;
}

export interface RegisterResponse {
    failed: false;
    user_id: string;
}

type ErrorCode =
| "DUPLICATE_USERNAME"
| "BAD_PICTURE_DATA"
| "LOGGED_IN"
| "INCORRECT_CREDENTIALS"
| "INVALID_DATA"
| "NO_SUCH_ENTITY"
| "NOT_YOURS"
| "NOT_AUTHENTICATED"
| "INTERNAL_ERROR";

export function getErrorMessage(error: APIErrorCommon): string {
    switch (error.code) {
        case "DUPLICATE_USERNAME":
            return "Username already exists.";
        case "BAD_PICTURE_DATA":
            return "The provided picture data is invalid.";
        case "LOGGED_IN":
            return "You are already logged in.";
        case "INCORRECT_CREDENTIALS":
            return "Incorrect username or password.";
        case "INVALID_DATA":
            return "The provided data is invalid.";
        case "NO_SUCH_ENTITY":
            return "The requested entity does not exist.";
        case "NOT_YOURS":
            return "You do not have permission to access this entity.";
        case "NOT_AUTHENTICATED":
            return "You must be logged in to perform this action.";
        case "INTERNAL_ERROR":
            return "An internal server error occurred. Please try again later.";
        default:
            return "An unknown error occurred.";
    }
}