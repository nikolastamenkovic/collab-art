<template>
    <div class="authbox">
        <h1>{{ title }}</h1>
        <v-form ref="form" @submit.prevent="handleSubmit">
            <v-text-field 
                v-model="formData.username"
                label="Username" 
                :rules="usernameRules"
            />
            <v-text-field 
                v-model="formData.password"
                label="Password" 
                type="password"
                :rules="passwordRules"
            />
            <v-text-field 
                v-if="isRegister"
                v-model="formData.confirmPassword"
                label="Confirm Password" 
                type="password"
                :rules="confirmPasswordRules"
            />
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
import type { AuthForm } from '@/types/auth';

const route = useRoute();
const form = ref();

const props = defineProps<{
    title: string
}>();

const emit = defineEmits();

const isRegister = computed(() => route.name === 'register');
const isLoading = ref(false);

const formData = reactive<AuthForm>({
    username: '',
    password: '',
    confirmPassword: ''
});

// Validation rules
const usernameRules = [
    (v: string) => !!v || 'Username is required',
    (v: string) => v.length >= 2 || 'Username must be at least 2 characters',
    (v: string) => v.length <= 32 || 'Username must be at most 32 characters',
];

const passwordRules = [
    (v: string) => !!v || 'Password is required',
    (v: string) => v.length >= 8 || 'Password must be at least 8 characters',
    (v: string) => v.length <= 128 || 'Password must be at most 128 characters'
];

const confirmPasswordRules = computed(() => [
    (v: string) => !!v || 'Please confirm your password',
    (v: string) => v === formData.password || "Passwords don't match"
]);

async function handleSubmit() {
    const { valid } = await form.value.validate();
    
    if (!valid) {
        return;
    }

    isLoading.value = true;
    
    try {
        emit('submit', formData);
    } catch (error) {
        console.error('Form submission error:', error);
    } finally {
        isLoading.value = false;
    }
}
</script>

<style scoped>
    .authbox {
        padding: 16px;
        border: 1px solid #eee;
        border-radius: 8px;
        background-color: #fff;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        width: 400px;
        max-width: 90vw; 
    }
</style>


<!-- <template>
    <div class="authbox">
        <h1>{{ title }}</h1>
        <v-form @submit.prevent="handleSubmit">
            <v-text-field 
                v-model="formData.username"
                label="Username" 
                :error-messages="errors.username"
                :error="!!errors.username"
                @blur="validateField('username')"
                @input="clearFieldError('username')"
            />
            <v-text-field 
                v-model="formData.password"
                label="Password" 
                type="password"
                :error-messages="errors.password"
                :error="!!errors.password"
                @blur="validateField('password')"
                @input="clearFieldError('password')"
            />
            <div v-if="isRegister">
                <v-text-field 
                    v-model="formData.confirmPassword"
                    label="Confirm Password" 
                    type="password"
                    :error-messages="errors.confirmPassword"
                    :error="!!errors.confirmPassword"
                    @blur="validateField('confirmPassword')"
                    @input="clearFieldError('confirmPassword')"
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
import type { ZodError } from 'zod';

const route = useRoute();

const props = defineProps<{
    title: string
}>();

const emit = defineEmits();

const isRegister = computed(() => route.name === 'register');

const isLoading = ref(false);

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
    const schema = isRegister.value ? registerSchema : loginSchema;

    const fieldSchema = schema.pick({ [field]: true });

    try {
        fieldSchema.parse({ [field]: formData[field as keyof AuthForm] });
    } catch (err: any) {
        errors[field] = err.errors.map((e: any) => e.message);
    }
}

function handleSubmit() {
    for (const field in errors) {
        if (errors[field as keyof typeof errors].length) {
            return;
        }
    }

    isLoading.value = true;
    
    try {
        emit('submit', formData);
    } catch (error) {
        console.error('Form submission error:', error);
    } finally {
        isLoading.value = false;
    }
}
</script>

<style scoped>

</style> -->