export interface AuthForm {
    username: string;
    password: string;
    confirmPassword?: string;
}

export interface LoginResponse {
  failed: false
  token: string
  user_id: string
  username: string
}