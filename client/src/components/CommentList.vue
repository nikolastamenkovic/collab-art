<template>
  <div class="comment-list">
    <p class="comment-count">{{ comments.length }} Comments</p>
    
    <div class="comment-input-container">
      <v-textarea
        v-model="newComment"
        placeholder="Add a comment..."
        rows="1"
        auto-grow
        variant="outlined"
        no-resize
        class="comment-input"
        @keydown.enter.prevent="addComment"
      />
      <v-btn 
        size="small" 
        color="primary" 
        variant="outlined" 
        class="add-btn"
        @click="addComment"
      >
        <v-icon size="small">mdi-plus</v-icon>
        Add Comment
      </v-btn>
    </div>

    <div
      v-for="comment in comments"
      :key="comment.comment_id"
      class="comment"
    >
      <!-- <span class="comment-author">{{ comment.author.username }}</span>
      <span class="comment-text">{{ comment.text }}</span> -->
      <div class = "comment-content">
        <p class="comment-author">{{ comment.author.username }}</p>
        <p class="comment-text">{{ comment.text }}</p>
      </div>

      <v-btn 
        v-if="authStore.userId === comment.author.user_id"
        size="small" 
        color="error" 
        variant="outlined" 
        class="delete-btn"
        @click="handleDelete(comment.comment_id)"
      >
        <v-icon size="small">mdi-delete</v-icon>
        Delete
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CommentDto } from '@/types/picture';
import { ref } from 'vue';
import { useAuthStore } from '@/stores/AuthStore';

const newComment = ref<string>('');
const authStore = useAuthStore();

const props = defineProps<{
    comments: CommentDto[];
}>();

const emit = defineEmits<{
    delete: [comment_id: string];
    add: [text: string];
}>();

const handleDelete = (comment_id: string) => {
    emit('delete', comment_id);
};

const addComment = () => {
    if (newComment.value.trim()) {
      emit('add', newComment.value.trim());
      newComment.value = '';
    }
};
</script>

<style scoped>
.comment-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 100%;
  margin: 0 auto;
  height: 500px;
  overflow-y: auto;
}

.comment-count {
  text-align: left;
  margin: 0;
}

.comment-input-container {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  width: 100%;
  justify-content: center;
}

.comment-input {
  flex: 1;
}

.add-btn {
  flex-shrink: 0;
  align-self: flex-start;
}

.comment {
  position: relative;
  padding: 1rem;
  padding-right: 80px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #f9f9f9;
  border-radius: 8px;
  width: 100%;
}

.comment-content {
  display: flex;
  flex-direction: column;
  text-align: left;
  width: 100%;
  gap: 0.25rem;
  overflow-wrap: break-word;
  word-wrap: break-word;
}

.comment-author {
  font-weight: 600;
  font-size: 0.8rem;
  color: #e6a432;
  margin: 0 0 0.5rem 0;
  word-break: break-word;
}

.comment-text {
  margin: 0 0 0.75rem 0;
  font-size: 0.6rem;
  line-height: 1.4;
  word-break: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
}

.delete-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease, visibility 0.2s ease;
}

.comment:hover .delete-btn {
  opacity: 1;
  visibility: visible;
}
</style>