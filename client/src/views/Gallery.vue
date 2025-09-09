<template>
  <div class="gallery">    
    <div class="gallery-controls">
      <v-btn-toggle v-model="sortOrder" mandatory>
        <v-btn value="newest">Newest First</v-btn>
        <v-btn value="oldest">Oldest First</v-btn>
      </v-btn-toggle>
      <div v-if="authorFilter" class="author-filter">
        <v-chip
          color="primary"
          closable
          @click:close="clearAuthorFilter"
        >
          <v-icon start>mdi-account-filter</v-icon>
          Filtering by: {{ authorFilter.username }}
        </v-chip>
      </div>
    </div>

    <div v-if="loading">
      <v-progress-circular indeterminate />
    </div>

    <div v-else-if="pictureStore.pictures.length === 0">
      <p>No pictures found.</p>
    </div>

    <div v-else class="pictures-scroll">
      <div class="pictures-grid">
        <PictureCard
          v-for="picture in pictureStore.pictures"
          :key="picture.picture_id"
          :pic="picture"
          @rename="handleUpdateName"
          @delete="showDeleteDialog"
          @filter="handleFilter"
        />
      </div>
    </div>

    <div class="pagination" v-if="totalPages > 1">
      <v-btn
        :disabled="currentPage <= 1"
        @click="loadPage(currentPage - 1)"
      >
        Previous
      </v-btn>
      
      <span>Page {{ currentPage }} of {{ totalPages }}</span>
      
      <v-btn
        :disabled="currentPage >= totalPages"
        @click="loadPage(currentPage + 1)"
      >
        Next
      </v-btn>
    </div>

    <v-dialog v-model="deleteDialog" max-width="300">
      <v-card>
        <v-card-text>
          Are you sure you want to delete the photo?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="cancelDelete">Cancel</v-btn>
          <v-btn color="error" @click="confirmDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-alert
      v-if="successMessage"
      type="success"
      closable
      @click:close="successMessage = null"
      class="global-alert"
    >
      {{ successMessage }}
    </v-alert>
    
    <v-alert
      v-if="errorMessage"
      type="error"
      closable
      @click:close="errorMessage = null"
      class="global-alert"
    >
      {{ errorMessage }}
    </v-alert>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { usePictureStore } from '@/stores/PictureStore';
import PictureCard from '@/components/Card.vue';
import type Author from '@/types/author';
import { useRoute,useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/AuthStore';

const pictureStore = usePictureStore();
const currentPage = ref(1);
const pageSize = ref(12);
const sortOrder = ref('newest');
const loading = ref(false);
const successMessage = ref<string | null>(null);
const errorMessage = ref<string | null>(null);
const authorFilter = ref<Author | null>(null);
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const deleteDialog = ref<boolean>(false);
const pictureToDelete = ref<string | null>(null);

const totalPages = computed(() => 
  Math.ceil(pictureStore.total / pageSize.value)
);

async function loadPage(page: number, user_id?: string) {
  loading.value = true;
  currentPage.value = page;

  const auth_id = user_id || authorFilter.value?.user_id;

  const result = await pictureStore.loadPictures({
    page: page,
    limit: pageSize.value,
    older_first: sortOrder.value === 'oldest',
    user_id: auth_id
  });

  if (result.success) {} 
  else {
    errorMessage.value = result.error || 'Failed to load pictures';
  }
  loading.value = false;
} 

function handleFilter(author: Author){
  authorFilter.value = author;
  currentPage.value = 1;
  router.replace({ name: 'gallery' , query: { author: authorFilter.value.user_id } });
}

function clearAuthorFilter() {
  authorFilter.value = null;
  currentPage.value = 1;
  router.replace({ name:'gallery' })
}

async function handleRouteAuthorFilter() {
  if (route.query.author) {
    const auth_id = route.query.author as string;
    
    await loadPage(1, auth_id);
    
    if (pictureStore.pictures.length > 0) {
      const firstPicture = pictureStore.pictures[0];
      authorFilter.value = { 
        user_id: auth_id, 
        username: firstPicture.author.username 
      };
    } else {
      authorFilter.value = null;
      errorMessage.value = 'No pictures found for the specified author';
      setTimeout(() => {
        errorMessage.value = null;
      }, 3000);
    }
  } else {
    authorFilter.value = null;
    await loadPage(1);
  }
}

watch(() => route.query.author, async (newAuthor, oldAuthor) => {
  if (newAuthor !== oldAuthor) {
    currentPage.value = 1;
    await handleRouteAuthorFilter();
  }
}, { immediate: false });

async function handleUpdateName(pictureId: string, newName: string) {
  const result = await pictureStore.updatePicture(pictureId, { name: newName });
  
  if (result.success) {
    const picture = pictureStore.pictures.find(p => p.picture_id === pictureId);
    if (picture) {
      picture.name = newName;
    }
    successMessage.value = 'Picture name updated successfully!';
    
    setTimeout(() => {
      successMessage.value = null;
    }, 3000);
  } else {
    errorMessage.value = result.error || 'Failed to update picture name';
  }
}

async function confirmDelete() {
  if (!pictureToDelete.value) return;

  const result = await pictureStore.deletePicture(pictureToDelete.value);
  
  deleteDialog.value = false;
  pictureToDelete.value = null;

  if (result.success) {
    successMessage.value = 'Picture deleted successfully!';

    await loadPage(currentPage.value);

    setTimeout(() => {
      successMessage.value = null;
    }, 3000);
  } else {
    errorMessage.value = result.error || 'Failed to delete picture';
  }
}

function showDeleteDialog(picture_id: string) {
  pictureToDelete.value = picture_id;
  deleteDialog.value = true;
}

function cancelDelete() {
  deleteDialog.value = false;
  pictureToDelete.value = null;
}

watch(sortOrder, () => {
  currentPage.value = 1;
  loadPage(1);
});

onMounted(async () => {
  await handleRouteAuthorFilter();
});
</script>

<style scoped>
.gallery {
  display: flex;
  padding: 1rem;
  flex-direction: column;
  align-items: center;
  width: 100%;
  overflow: visible;
}

.gallery-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: center;
  justify-content: center;
}

.pictures-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3rem;
}

/* .pictures-scroll {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-x: auto;
  overflow-y: visible;
} */

.pictures-grid {
  display: grid;
  width: 1200px;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  justify-items: center;
  grid-auto-rows: 450px;
}

.loading,
.no-pictures {
  text-align: center;
  color: #666;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.pagination {
  font-size: 0.8rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  padding: 1rem;
}

.global-alert {
  position: fixed;
  top: 2rem;
  right: 2rem;
  z-index: 1000;
  max-width: 400px;
}
</style>