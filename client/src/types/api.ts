import type { ZodIssue } from "zod/v3";
import type { PictureDto } from "./picture";

export type APIErrorCommon = {
    failed: true;
    code: ErrorCode;
    extra?: ZodIssue[];
};

export type AuthForm = {
    username: string;
    password: string;
    confirmPassword?: string;
}

export type AuthReq = {
    username: string;
    password: string;
}

export type LoginResponse = {
  failed: false;
  token: string;
  user_id: string;
  username: string;
}

export type RegisterResponse = {
    failed: false;
    user_id: string;
}

export type NewPictureRes = {
failed: false;
picture_id: string;
}

export type PictureQueryParams = {
  limit?: number;
  page?: number;
  user_id?: string;
  older_first?: boolean;
}

export type UpdatePictureRes = {
failed: false;
}

export type DeletePictureRes = {
failed: false;
}

export interface PictureListingPage {
pictures: PictureDto[];
total: number;
}

export type GetPictureRes = {
failed: false;
picture: PictureDto;
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
        case "INVALID_DATA": {
            const issues = error.extra || [];
            if (issues.length) {
                return `The provided data is invalid: ${issues.map(issue => issue.message).join(", ")}`;
            }
            return "The provided data is invalid.";
        }
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