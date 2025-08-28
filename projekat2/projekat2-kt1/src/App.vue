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

  /* Override all Vuetify component text sizes */
  .v-application {
    font-size: 12px !important;
  }

  /* Specific Vuetify component overrides */
  .v-btn {
    font-size: 12px !important;
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
    font-size: 8px;
  }

  @font-face {
    font-family: 'Press Start 2P';
    src: url('@/assets/fonts/PressStart2P-Regular.ttf') format('truetype');
  }

  .content {
    padding: 1rem;
  }
</style>
