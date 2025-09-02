import { defineStore } from 'pinia';
import type { PictureDto, BasePictureDto }  from '@/types/picture';
import { ref,reactive } from 'vue';
import { useAuthStore } from './AuthStore';
import type { APIErrorCommon, PictureListingPage, GetPictureRes, UpdatePictureRes } from '@/types/api';
import type { PictureQueryParams, NewPictureRes, DeletePictureRes } from '@/types/api';
import { getErrorMessage } from '@/types/api';

export const usePictureStore = defineStore('pictures', () => {
    const pictures = reactive<PictureDto[]>([]);
    const total = ref(0);
    const authStore = useAuthStore();

    function getAuthHeaders(): Record<string, string> {
        const headers: Record<string, string> = {
        'Content-Type': 'application/json'
        };
        
        if (authStore.token) {
            headers.Authorization = `Bearer ${authStore.token}`;
        }
        
        return headers;
    }

    async function handleApiCall<T>(apiCall: () => Promise<Response>): Promise<{ success: true; data: T } | { success: false; error: string }> {
        try {
            const response = await apiCall();
            const data = await response.json();

            if (response.ok && !data.failed) {
                return { success: true, data };
            } else {
                const errorData = data as APIErrorCommon;
                return { success: false, error: getErrorMessage(errorData) };
            }
        } catch (err) {
            return { success: false, error: 'Network error occurred' };
        }
    }

    async function createPicture(picture: BasePictureDto): Promise<{ success: boolean; error?: string; pictureId?: string }> {
        const result = await handleApiCall<NewPictureRes>(() =>
        fetch('https://raf-pixeldraw.aarsen.me/api/pictures', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(picture)
            })
        );

        if (result.success) {
            return { success: true, pictureId: result.data.picture_id };
        } else {
            return { success: false, error: result.error };
        }
    }


    async function loadPictures(params?: PictureQueryParams): Promise<{success: boolean; error?: string;}> {
        const queryParams = new URLSearchParams();
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.user_id) queryParams.append('author', params.user_id);
        if (params?.older_first) queryParams.append('older_first', 'true');

        const url = `https://raf-pixeldraw.aarsen.me/api/pictures${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

        const result = await handleApiCall<PictureListingPage>(() =>
            fetch(url, {
                headers: getAuthHeaders()
            })
        );

        if (result.success) {
            pictures.splice(0, pictures.length, ...result.data.pictures);
            total.value = result.data.total;
            return { success: true };
        } else {
            return { success: false, error: result.error };
        }
    }

    async function getPictureById(pictureId: string): Promise<{ success: boolean; data?: PictureDto; error?: string }> {
        const existing = pictures.find(p => p.picture_id === pictureId);

        if(existing) return {success: true, data: existing};

        const result = await handleApiCall<GetPictureRes>(() =>
            fetch(`https://raf-pixeldraw.aarsen.me/api/pictures/${pictureId}`, {
                headers: getAuthHeaders()
            })
        );

        if (result.success) {
            return { success: true, data: result.data.picture };
        } else {
            return { success: false, error: result.error };
        }
    }

    async function updatePicture(pictureId: string, updates: Partial<BasePictureDto>): Promise<{ success: boolean; error?: string }> {
        const result = await handleApiCall<UpdatePictureRes>(() =>
        fetch(`https://raf-pixeldraw.aarsen.me/api/pictures/${pictureId}`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
                body: JSON.stringify(updates)
            })
        );

        if (result.success) {
            const index = pictures.findIndex(p => p.picture_id === pictureId);
            if (index !== -1) {
                Object.assign(pictures[index], updates);
            }
            return { success: true };
        } else {
            return { success: false, error: result.error };
        }
    }

    async function deletePicture(pictureId: string): Promise<{ success: boolean; error?: string }> {
        const result = await handleApiCall<DeletePictureRes>(() =>
        fetch(`https://raf-pixeldraw.aarsen.me/api/pictures/${pictureId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        })
        );

        if (result.success) {
            const index = pictures.findIndex(p => p.picture_id === pictureId);
            if (index !== -1) {
                pictures.splice(index, 1);
            }
            return { success: true };
        } else {
            return { success: false, error: result.error };
        }
    }

    return {
        pictures,
        total,
        createPicture,
        loadPictures,
        getPictureById,
        updatePicture,
        deletePicture
    };
})