<template>
    <div class="login">
        <AuthBox title = "Log in" @submit="handleLogin"/>
        <v-alert 
            v-if="errorMessage" 
            type="error" 
            closable
            @click:close="errorMessage = null"
            >{{ errorMessage }}</v-alert>
    </div>
</template>

<script setup lang="ts">
    import AuthBox from "@/components/AuthBox.vue";
    import type { AuthReq } from "@/types/api";
    import { useRouter, useRoute } from "vue-router";
    import { useAuthStore } from "@/stores/AuthStore";
    import { ref } from "vue";

    const router = useRouter();
    const route = useRoute();
    const authStore = useAuthStore();
    const errorMessage = ref<string | null>(null);

    async function handleLogin(formData: AuthReq) {
        const result = await authStore.login(formData);
        if (result.success) {
            const returnTo = route.query.returnTo as string;
            const save = route.query.save as string;
            
            if (returnTo) {
                router.push({ 
                    name: returnTo, 
                    query: save ? { save } : {} 
                });
            } else {
                router.push({ name: 'home' });
            }
        } else {
            errorMessage.value = result.error as string;
        }
    }

</script>

<style scoped>
.login {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    padding: 1rem;
}
</style>
