<template>
    <div class="register">
        <AuthBox title = "Register" @submit="handleRegister"/>
        <v-alert 
            v-if="errorMessage" 
            type="error" 
            closable
            @click:close="errorMessage = null"
            >{{ errorMessage }}</v-alert>
        <v-alert
            v-if="successMessage"
            type="success"
        >{{ successMessage }}</v-alert>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/AuthStore';
import type { AuthReq } from '@/types/api';
import { useRouter } from 'vue-router';
import AuthBox from '@/components/AuthBox.vue';

const router = useRouter();
const authStore = useAuthStore();
const errorMessage = ref<string | null>(null);
const successMessage = ref<string | null>(null);

async function handleRegister(credentials: AuthReq) {
    const { success, error } = await authStore.register(credentials);
    if (!success && error) {
        errorMessage.value = error;
        return;
    }
    
    successMessage.value = "Registration successful!";
    setTimeout(() => {
      successMessage.value = null;
      router.push({ name: 'login' });
    }, 1000);
}
</script>

<style scoped>
.register {
    padding: 1rem;
}
</style>
