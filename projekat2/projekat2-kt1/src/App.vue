<script setup lang="ts">
  import Navbar from '@/components/Navbar.vue';
  import { RouterView } from 'vue-router';

  import { ref } from 'vue'

</script>

<template>
  <Navbar />

  <div class="content">
    <RouterView />
  </div>
</template>

<style>
  #app {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-family: 'Press Start 2P';
  }

  @font-face {
    font-family: 'Press Start 2P';
    src: url('@/assets/fonts/PressStart2P-Regular.ttf') format('truetype');
  }

  .content {
    padding: 1rem;
  }
</style>
