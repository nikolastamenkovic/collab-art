<template>
    <nav>
        <span class="pixel-art-title">Collab Art</span>
        <v-btn
            :to="{ name: 'draw' }"
            variant="text"
            size="x-large"
        >
            <v-icon class="rainbow-text" icon="mdi-pencil" />
            <span class="rainbow-text">DRAW!</span>
        </v-btn>

        <v-btn :to="{ name: 'home' }" color="#FF0000" :variant="route.name === 'home' ? 'elevated' : 'tonal'">
        Home
        </v-btn>

        <v-btn :to="{ name: 'gallery' }" color="#00FF00" :variant="route.name === 'gallery' && route.query.author !== authStore.userId ? 'elevated' : 'tonal'">
        Gallery
        </v-btn>
        <div v-if="!isAuthenticated">
            <RouterLink
                :to="{ name: 'login' }"
                class="nav-link"
                :class="{ selected: route.name === 'login' }"
                >
                Log in
            </RouterLink>
            <RouterLink
                :to="{ name: 'register' }"
                class="nav-link"
                :class="{ selected: route.name === 'register' }"
                >
                Register
            </RouterLink>
        </div>
        <div v-else>
            <RouterLink
                :to="{ name: 'gallery', query: { author: authStore.userId } }"
                class="nav-link"
            >
                My Gallery
            </RouterLink>
            <button
                @click="handleLogout"
                class="nav-link"
            >
                Logout
            </button>
            <span class="username-display">
                <v-icon>mdi-account-box</v-icon>
                {{ authStore.username }}
            </span>
        </div>
    </nav>
</template>

<script setup lang="ts">
    import { RouterLink, useRoute, useRouter } from 'vue-router'
    import { useAuthStore } from '@/stores/AuthStore'
    import { computed } from 'vue'

    const route = useRoute()
    const router = useRouter()
    const authStore = useAuthStore()
    const isAuthenticated = computed(() => authStore.isAuthenticated)

    function handleLogout() {
        authStore.logout()
        router.push({ name: 'home' })
    }
</script>

<style scoped>
    nav {
        background-color: black;
        padding: 1rem;
        text-align: center;
        width: 100%;
        display: flex;
        justify-content: right;
        gap: 1rem;
        align-items: center;
        position: relative;
    }
    
    nav::after {
        content: "";
        position: absolute;
        left: 0;
        bottom: 0;
        width: 100%;
        height: 3px;
        background: linear-gradient(to right, #FF0000, #00FF00, #0000FF);
    }

    .username-display {
        color: #FFCCBC;;
        font-size: 0.75rem;
        padding: 0.5rem;
        user-select: none;
    }

    .pixel-art-title {
        color: #FFCCBC;
        font-size: 1.5rem;
        margin-right: auto;
        letter-spacing: 2px;
        user-select: none;
    }

    .rainbow-text {
        background: linear-gradient(90deg, #FF7F7F, #7FFF7F, #7F7FFF); /* softer pastel colors */
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        font-weight: bold;
        font-size: 0.75rem;
        letter-spacing: 2px;
    }

    .nav-link {
        color: #fff;
        font-weight: bold;
        font-size: 0.75rem;
        text-decoration: none;
        transition: border-bottom 0.15s;
        border-bottom: 2px solid transparent;
        padding: 0.5rem;
        cursor: pointer;
    }

    .nav-link.selected,
    .nav-link:hover {
        border-bottom: 2px solid #fff;
    }

</style>