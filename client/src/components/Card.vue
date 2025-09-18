<template>
<div class="picture-card" @click="openPicture">
    <div
      class="mini-grid"
      :style="{
        gridTemplateColumns: `repeat(${pic.picture_data.length}, 1fr)`,
        gridTemplateRows: `repeat(${pic.picture_data.length}, 1fr)`
      }"
    >
      <div
        v-for="(row, rowIdx) in pic.picture_data"
        :key="`row-${rowIdx}`"
        style="display: contents;"
      >
        <div
          v-for="(tile, colIdx) in row"
          :key="`tile-${rowIdx}-${colIdx}`"
          class="mini-tile"
          :style="{ 
            background: tile,
            width: `${250 / pic.picture_data.length}px`,
            height: `${250 / pic.picture_data.length}px`
          }"
        />
      </div>
    </div>
    
    <div class="picture-info">
      <h3 v-if="!isEditing" class="name">{{ pic.name }}</h3>
      <div v-else class="edit-title-container">
        <v-text-field
          v-model="editingName"
          :rules="nameRules"
          hide-details="auto"
          variant="outlined"
          density="compact"
          @keydown.enter="rename"
          @keydown.esc="cancelEdit"
          @click.stop
          autofocus
          class="edit-input"
        />
      </div>
      <p class="author">
        by 
        <span 
          class="author-link" 
          @click.stop="filterByAuthor"
          :title="`Filter by ${pic.author.username}`"
        >
          {{ pic.author.username }}
        </span>
      </p>
      <p class="date">{{ new Date(pic.created_at).toLocaleDateString('en-GB') }}</p>
    </div>

    <div class="picture-actions" v-if="canEdit">
      <template v-if="!isEditing">
        <v-btn
          size="small"
          color="primary"
          variant="outlined"
          @click.stop="startEdit"
        >
          <v-icon size="small">mdi-pencil</v-icon>
          Rename
        </v-btn>
        
        <v-btn
          size="small"
          color="error"
          variant="outlined"
          @click.stop="deletePicture"
        >
          <v-icon size="small">mdi-delete</v-icon>
          Delete
        </v-btn>
      </template>
      
      <template v-else>
        <v-btn
          size="small"
          color="success"
          variant="outlined"
          @click.stop="rename"
          :disabled="!isValidName"
          :loading="saving"
        >
          <v-icon size="small">mdi-check</v-icon>
          Save
        </v-btn>
        
        <v-btn
          size="small"
          color="error"
          variant="outlined"
          @click.stop="cancelEdit"
          :disabled="saving"
        >
          <v-icon size="small">mdi-close</v-icon>
          Cancel
        </v-btn>
      </template>
    </div>
</div>
</template>

<script setup lang="ts">
    import { computed,ref } from 'vue';
    import type { PictureDto } from '@/types/picture';
    import { useRouter } from 'vue-router';
    import { useAuthStore } from '@/stores/AuthStore';
    import type Author from '@/types/author';

    const props = defineProps<{
        pic: PictureDto;
    }>();

    const emit = defineEmits<{
        rename: [picture_id: string, newName: string];
        delete: [picture_id: string];
        filter: [author: Author];
    }>();

    const router = useRouter();
    const authStore = useAuthStore();
    const canEdit = computed(() => {
        return authStore.isAuthenticated && authStore.userId === props.pic.author.user_id;
    });
    const isEditing = ref(false);
    const editingName = ref('');
    const saving = ref(false);

    const nameRules = [
        (v: string) => !!v?.trim() || 'Picture name is required',
        (v: string) => v?.trim().length >= 1 && v?.trim().length <= 40 || 'Picture name must be between 1 and 40 characters'
    ];

    const isValidName = computed(() => {
        const trimmed = editingName.value?.trim();
        return trimmed && trimmed.length >= 1 && trimmed.length <= 40 && trimmed !== props.pic.name;
    });

    function openPicture() {
      router.push({ 
          name: 'draw', 
          query: { id: props.pic.picture_id } 
      });
    }

    function startEdit() {
      isEditing.value = true;
      editingName.value = props.pic.name;
    }

    function cancelEdit() {
      isEditing.value = false;
      editingName.value = '';
    }

    function filterByAuthor() {
      emit('filter', props.pic.author);
    }

    async function rename() {
      if (!isValidName.value) return;

      saving.value = true;

      emit('rename', props.pic.picture_id, editingName.value.trim());

      isEditing.value = false;
      saving.value = false;
    }

    async function deletePicture() {
      emit('delete', props.pic.picture_id); 
    }
</script>

<style scoped>
.picture-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  background: white;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  height: 100%;
}

.mini-grid {
  display: grid;
  width: 250px;
  height: 250px;
  /* height: 100%; */
  aspect-ratio: 1/1;
}

.mini-tile {
  /* width: 100%;
  height: 100%; */
  border: 1px solid #eee;
  box-sizing: border-box;
  aspect-ratio:1/1;
}

.picture-info {
  text-align: center;
  padding: 0.5rem 0;
}

.name {
  font-size: 1.25rem;
  font-weight: bold;
  margin: 0 0 0.5rem 0;
  color: #333;
  word-break: break-word;
}

.edit-title-container {
  margin: 0.25rem 0;
}

.edit-input {
  font-size: 1.25rem;
}

.edit-input :deep(.v-field__input) {
  text-align: center;
  font-weight: bold;
  color: #333;
}

.author {
  font-size: 0.75rem; 
  color: #666;
}

.author-link:hover {
  color: #1976d2;
  text-decoration: underline;
  font-weight: 500;
}

.date {
  font-size: 0.3rem;
  color: #999;
  margin: 0;
}

.picture-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin-top: 0.25rem;
  flex-wrap: wrap;
}

.picture-actions .v-btn {
  font-size: 0.75rem;
}
</style>