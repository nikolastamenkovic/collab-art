<template>
    <Dialog title = "Log in" @submit="handleLogin"/>
</template>

<script setup lang="ts">
    import AuthBox from "@/components/AuthBox.vue";
    import type { AuthForm } from "@/types/auth";

    async function handleLogin(formData: AuthForm) {

    }

</script>

<style scoped>
</style>
