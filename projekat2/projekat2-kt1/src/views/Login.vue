<template>
    <AuthBox title = "Log in" @submit="handleLogin"/>
    <v-alert 
        v-if="errorMessage" 
        type="error" 
        closable
        @click:close="errorMessage = null"
        >{{ errorMessage }}</v-alert>
</template>

<script setup lang="ts">
    import AuthBox from "@/components/AuthBox.vue";
    import type { AuthForm } from "@/types/api";
    import { useRouter } from "vue-router";
    import { useAuthStore } from "@/stores/AuthStore";
    import { ref } from "vue";

    const router = useRouter();
    const authStore = useAuthStore();
    const errorMessage = ref<string | null>(null);

    async function handleLogin(formData: AuthForm) {
        const result = await authStore.login(formData);
        if (result.success) {
            router.push({ name: 'home' });
        } else {
            errorMessage.value = result.error as string;
        }
    }

</script>

<style scoped>
</style>
