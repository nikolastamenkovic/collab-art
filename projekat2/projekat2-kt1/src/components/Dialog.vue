<template>
    <div class="dialog">
        <h1>{{ title }}</h1>
        <v-form @submit.prevent="handleSubmit">
            <v-text-field 
                v-model="formData.username"
                label="Username" 
                :error-messages="errors.username"
                :error="!!errors.username"
                @blur="validateField('username')"
            />
            <v-text-field 
                v-model="formData.password"
                label="Password" 
                type="password"
                :error-messages="errors.password"
                :error="!!errors.password"
                @blur="validateField('password')"
            />
            <div v-if="isRegister">
                <v-text-field 
                    v-model="formData.confirmPassword"
                    label="Confirm Password" 
                    type="password"
                    :error-messages="errors.confirmPassword"
                    :error="!!errors.confirmPassword"
                    @blur="validateField('confirmPassword')"
                />
            </div>
            <v-btn 
                type="submit" 
                color="primary" 
                :loading="isLoading"
                block
            >
                {{ isRegister ? 'Register' : 'Log in' }}
            </v-btn>
        </v-form>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useRoute } from 'vue-router';
import { loginSchema, registerSchema, type AuthForm, type LoginForm, type RegisterForm } from '@/schemas/auth';

const route = useRoute();

const props = defineProps<{
    title: string
}>();

const emit = defineEmits();

const isRegister = computed(() => route.name === 'register');

const formData = reactive<AuthForm>({
    username: '',
    password: '',
    confirmPassword: ''
});

const errors = reactive({
    username: [],
    password: [],
    confirmPassword: []
});

function clearFieldError(field: keyof typeof errors) {
    errors[field] = [];
}

function clearErrors() {
    clearFieldError('username');
    clearFieldError('password');
    clearFieldError('confirmPassword');
}

function validateField(field: keyof typeof errors) {
    clearFieldError(field);
    const schema = isRegister.value ? registerSchema : loginSchema;

    const fieldSchema = schema.pick({ [field]: true });

    try {
        fieldSchema.parse({ [field]: formData[field as keyof AuthForm] });
    } catch (err: any) {
        if (err.name === 'ZodError') {
            errors[field] = err.errors.map((e: any) => e.message);
        }
    }
}

</script>

<style scoped>

</style>