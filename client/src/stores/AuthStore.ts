import { defineStore } from "pinia";
import { ref } from "vue";
import type { LoginResponse, APIErrorCommon, AuthForm, RegisterResponse } from "@/types/api";
import { API_ENDPOINTS, getErrorMessage } from "@/types/api";


export const useAuthStore = defineStore("auth", () => {
    const token = ref<string | null>(localStorage.getItem("token"));
    const username = ref<string | null>(localStorage.getItem("username"));
    const userId = ref<string | null>(localStorage.getItem("userId"));
    const isAuthenticated = ref<boolean>(!!token.value);

    async function login(credentials: AuthForm): Promise<{ success: boolean; error?: string }> {
        try {
            const response = await fetch(API_ENDPOINTS.AUTH_LOGIN, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(credentials),
            });
            const data: LoginResponse | APIErrorCommon = await response.json();

            if(response.ok  && !data.failed) {
                const loginData = data as LoginResponse;
                token.value = loginData.token;
                username.value = loginData.username;
                userId.value = loginData.user_id;
                isAuthenticated.value = true;

                localStorage.setItem("token", loginData.token);
                localStorage.setItem("username", loginData.username);
                localStorage.setItem("userId", loginData.user_id);

                return { success: true };
            }

            const errorData = data as APIErrorCommon;
            const message = getErrorMessage(errorData);
            return { success: false, error: message };
        } catch (error) {
            return { success: false, error: "Network error occurred." };
        }
    }

    async function register(credentials: AuthForm): Promise<{ success: boolean; error?: string }> {
        try {
            const response = await fetch(API_ENDPOINTS.AUTH_REGISTER, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(credentials),
            });
            const data: RegisterResponse | APIErrorCommon = await response.json();

            if (response.ok && !data.failed) 
                return { success: true };

            const errorData = data as APIErrorCommon;
            const message = getErrorMessage(errorData);
            return { success: false, error: message };
        } catch (error) {
            return { success: false, error: "Network error occurred." };
        }
    }

    function logout() {
        token.value = null;
        username.value = null;
        userId.value = null;
        isAuthenticated.value = false;

        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("userId");
    }

    return {
        token,
        username,
        userId,
        isAuthenticated,
        login,
        register,
        logout
    };
})