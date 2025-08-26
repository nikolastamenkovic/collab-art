import { defineStore } from 'pinia';
import type Picture from '@/types/picture';
import { ref } from 'vue';

export const usePictureStore = defineStore('pictures', () => {
    const pictures = ref<Picture[]>([]);

    async function loadAllPictures() {
        const response = await fetch('https://raf-pixeldraw.aarsen.me/api/pictures');
        const data = await response.json();
        pictures.value = data;
    }

    return {
        pictures,
        loadAllPictures
    };
    // state: () => ({
    //     pictures: [] as Picture[],
    // }),

    // actions: {
    //     async loadAllPictures() {
    //         const response = await fetch('/api/pictures');
    //         const data = await response.json();
    //         this.pictures = data;
    //     }
    // }
})