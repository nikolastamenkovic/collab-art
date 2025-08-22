<template>
    <nav>
        <span class="pixel-art-title">Collab Art</span>
        <v-btn
            :to="{ name: 'draw' }"
            variant="text"
            class="rainbow-btn"
            size="x-large"
        >
            <v-icon class="rainbow-text" icon="mdi-pencil" />
            <span class="rainbow-text">DRAW!</span>
        </v-btn>

        <v-btn :to="{ name: 'home' }" color="#FF0000" :variant="route.name === 'home' ? 'text' : 'tonal'">
        Home
        </v-btn>

        <v-btn :to="{ name: 'gallery' }" color="#00FF00" :variant="route.name === 'gallery' ? 'text' : 'tonal'">
        Gallery
        </v-btn>

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

    </nav>
</template>

<script setup lang="ts">
  import { RouterLink, useRoute } from 'vue-router'
  const route = useRoute()
</script>

<style scoped>
    nav {
        background-color: black;
        padding: 1rem;
        text-align: center;
        border-bottom: none;
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
        border-radius: 2px;
    }

    .pixel-art-title {
        font-family: 'Press Start 2P', 'VT323', monospace, 'Courier New', Courier;
        font-size: 2rem;
        font-weight: bold;
        color: #FFCCBC;
        margin-right: auto;
        letter-spacing: 2px;
        text-shadow: 2px 2px 0 #333, 4px 4px 0 #222;
        padding: 0.5rem 1rem;
        user-select: none;
    }

    .rainbow-btn {
        background: none;
        box-shadow: none;
        padding: 0.5rem 1rem;
        min-width: unset;
    }

    .rainbow-text {
        background: linear-gradient(90deg, #FF7F7F, #7FFF7F, #7F7FFF); /* softer pastel colors */
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        font-weight: bold;
        font-size: 1.1rem;
        letter-spacing: 2px;
    }

    .nav-link {
        color: #fff;
        text-decoration: none;
        font-weight: bold;
        font-size: 1rem;
        padding: 0.5rem 1rem;
        transition: border-bottom 0.2s;
        border-bottom: 2px solid transparent;
        cursor: pointer;
    }

    .nav-link.selected,
    .nav-link:hover {
        border-bottom: 2px solid #fff;
    }

    .btnselected {
        /* border-bottom: 2px solid #fff; */
        background: none !important;
    }
</style>