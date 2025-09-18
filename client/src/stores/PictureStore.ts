import { defineStore } from 'pinia';
import type { PictureDto, BasePictureDto, CommentDto }  from '@/types/picture';
import { ref,reactive } from 'vue';
import { useAuthStore } from './AuthStore';
import type { APIErrorCommon, PictureListingPage, GetPictureRes, UpdatePictureRes, DeleteCommentRes } from '@/types/api';
import type { AddCommentRes, PictureQueryParams, NewPictureRes, DeletePictureRes } from '@/types/api';
import { API_ENDPOINTS, getErrorMessage } from '@/types/api';

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

    async function handleApiCall<T>(apiCall: () => Promise<Response>): Promise<{ success: true; data: T } | { success: false; error: APIErrorCommon }> {
        try {
            const response = await apiCall();
            const data = await response.json();

            if (response.ok && !data.failed) {
                // console.log('Ovo je data u handleApi:' + data);
                return { success: true, data };
            } else {
                const errorData = data as APIErrorCommon;
                return { success: false, error: errorData };
            }
        } catch (err) {
            return { success: false, error: { failed: true, code: 'INTERNAL_ERROR' } };
        }
    }

    async function createPicture(picture: BasePictureDto): Promise<{ success: boolean; error?: string; pictureId?: string }> {
        const result = await handleApiCall<NewPictureRes>(() =>
            fetch(API_ENDPOINTS.PICTURES, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(picture)
            })
        );

        if (result.success) {
            return { success: true, pictureId: result.data.picture_id };
        } else {
            if (result.error.code == 'NOT_AUTHENTICATED' && authStore.isAuthenticated) {
                authStore.logout();
            }
            return { success: false, error: getErrorMessage(result.error) };
        }
    }


    async function loadPictures(params?: PictureQueryParams): Promise<{success: boolean; error?: string;}> {
        const queryParams = new URLSearchParams();
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.user_id) queryParams.append('author', params.user_id);
        if (params?.older_first) queryParams.append('older_first', 'true');

        // const url = `https://raf-pixeldraw.aarsen.me/api/pictures${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const url = `${API_ENDPOINTS.PICTURES}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        
        // console.log(url);

        const result = await handleApiCall<PictureListingPage>(() =>
            fetch(url, {
                headers: getAuthHeaders()
            })
        );

        // console.log(result);

        if (result.success) {
            pictures.splice(0, pictures.length, ...result.data.pictures);
            total.value = result.data.total;
            return { success: true };
        } else {
            return { success: false, error: getErrorMessage(result.error) };
        }
    }

    async function getPictureById(pictureId: string): Promise<{ success: boolean; data?: PictureDto; error?: string }> {
        // const existing = pictures.find(p => p.picture_id === pictureId);

        // if(existing) return {success: true, data: existing};

        const result = await handleApiCall<GetPictureRes>(() =>
            fetch(API_ENDPOINTS.PICTURE(pictureId), {
                headers: getAuthHeaders()
            })
        );

        if (result.success) {
            return { success: true, data: result.data.picture };
        } else {
            return { success: false, error: getErrorMessage(result.error) };
        }
    }

    async function updatePicture(pictureId: string, updates: Partial<BasePictureDto>): Promise<{ success: boolean; error?: string }> {
        const result = await handleApiCall<UpdatePictureRes>(() =>
        fetch(API_ENDPOINTS.UPDATE(pictureId), {
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
            if (result.error.code == 'NOT_AUTHENTICATED' && authStore.isAuthenticated) {
                authStore.logout();
            }
            return { success: false, error: getErrorMessage(result.error) };
        }
    }

    async function addComment(pictureId: string,text: string): Promise<{ success: boolean; error?: string; comment?: CommentDto }> {
        const result = await handleApiCall<AddCommentRes>(() =>
            fetch(API_ENDPOINTS.ADD_COMMENT(pictureId), {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ text })
            })
        );

        if (result.success) {
            return { success: true, comment: result.data.comment };
        } else {
            if (result.error.code == 'NOT_AUTHENTICATED' && authStore.isAuthenticated) {
                authStore.logout();
            }
            return { success: false, error: getErrorMessage(result.error) };
        }
    }

    async function likePicture(pictureId: string): Promise<{ success: boolean; error?: string }> {
        const result = await handleApiCall<UpdatePictureRes>(() =>
        fetch(`${API_ENDPOINTS.LIKE_PICTURE(pictureId)}`, {
                method: 'POST',
                headers: getAuthHeaders()
            })
        );
        if (result.success) {
            return { success: true };
        } else {
            if (result.error.code == 'NOT_AUTHENTICATED' && authStore.isAuthenticated) {
                authStore.logout();
            }
            return { success: false, error: getErrorMessage(result.error) };
        }
    }

    async function dislikePicture(pictureId: string): Promise<{ success: boolean; error?: string }> {
        const result = await handleApiCall<UpdatePictureRes>(() =>
        fetch(`${API_ENDPOINTS.DISLIKE_PICTURE(pictureId)}`, {
                method: 'POST',
                headers: getAuthHeaders()
            })
        );
        if (result.success) {
            return { success: true };
        } else {
            if (result.error.code == 'NOT_AUTHENTICATED' && authStore.isAuthenticated) {
                authStore.logout();
            }
            return { success: false, error: getErrorMessage(result.error) };
        }
    }

    async function deleteComment(commentId: string): Promise<{ success: boolean; error?: string }> {
        const result = await handleApiCall<DeleteCommentRes>(() =>
            fetch(API_ENDPOINTS.DELETE_COMMENT(commentId), {
                method: 'DELETE',
                headers: getAuthHeaders()
            })
        );

        if (result.success) {
            return { success: true };
        } else {
            if (result.error.code == 'NOT_AUTHENTICATED' && authStore.isAuthenticated) {
                authStore.logout();
            }
            return { success: false, error: getErrorMessage(result.error) };
        }
    }

    async function deletePicture(pictureId: string): Promise<{ success: boolean; error?: string }> {
        const result = await handleApiCall<DeletePictureRes>(() =>
        fetch(API_ENDPOINTS.DELETE(pictureId), {
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
            if (result.error.code == 'NOT_AUTHENTICATED' && authStore.isAuthenticated) {
                authStore.logout();
            }

            return { success: false, error: getErrorMessage(result.error) };
        }
    }

    return {
        pictures,
        total,
        createPicture,
        loadPictures,
        getPictureById,
        updatePicture,
        deletePicture,
        addComment,
        deleteComment,
        likePicture,
        dislikePicture
    };
})