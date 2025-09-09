<script setup lang="ts">
  import Navbar from '@/components/Navbar.vue';
  import { RouterView } from 'vue-router';

  import { ref } from 'vue'

</script>

<template>
  <Navbar />

  <div class="router-container">
    <RouterView />
  </div>
</template>

<style>
  
  .v-application {
    font-size: 12px !important;
  }

  .v-btn {
    font-size: 12px !important;
  }

 .router-container {
    width: 100%;
    min-height: 100vh;
    padding-top: 80px; 
  }

  .router-container > * {
    width: 100%;
  }

  .v-text-field input,
  .v-text-field label {
    font-size: 12px !important;
  }

  .v-form-control .v-label {
    font-size: 12px !important;
  }

  .v-messages__message {
    font-size: 12px !important;
  }

  #app {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-family: 'Press Start 2P';
    width: 100%;
    height: 100%;
    font-size: 8px;
  }

  @font-face {
    font-family: 'Press Start 2P';
    src: url('@/assets/fonts/PressStart2P-Regular.ttf') format('truetype');
  }
</style>
