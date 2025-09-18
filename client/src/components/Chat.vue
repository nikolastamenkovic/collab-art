<template>
  <div class="chat-container">
    <div class="chat-header">
      <v-icon>mdi-chat</v-icon>
      <span>Chat</span>
      <v-btn 
        @click="toggleChat" 
        size="small" 
        variant="text" 
        :icon="isMinimized ? 'mdi-chevron-up' : 'mdi-chevron-down'"
      />
    </div>
    
    <div v-if="!isMinimized" class="chat-content">
      <div class="messages-list" ref="messagesContainer">
        <div 
          v-for="message in messages" 
          :key="message.id"
          class="message"
          :class="{ 'own-message': message.userId === authStore.userId }"
        >
          <span class="message-author">{{ message.username }}</span>
          <span class="message-text">{{ message.text }}</span>
          <span class="message-time">{{ formatTime(message.timestamp) }}</span>
        </div>
      </div>
      
      <div class="message-input">
        <v-text-field
          v-model="newMessage"
          placeholder="Type a message..."
          variant="outlined"
          density="compact"
          hide-details
          @keydown.enter="sendMessage"
          :disabled="!authStore.isAuthenticated"
        />
        <v-btn 
          @click="sendMessage"
          size="small"
          color="primary"
          :disabled="!newMessage.trim() || !authStore.isAuthenticated"
        >
          <v-icon>mdi-send</v-icon>
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue';
import { useAuthStore } from '@/stores/AuthStore';
import type { ChatMessage } from '@/types/collab';

const authStore = useAuthStore();
const messages = ref<ChatMessage[]>([]);
const newMessage = ref('');
const isMinimized = ref(false);
const messagesContainer = ref<HTMLElement>();

const emit = defineEmits<{
  sendMessage: [message: string];
}>();

defineExpose({
  addMessage
});

function toggleChat() {
  isMinimized.value = !isMinimized.value;
}

async function sendMessage() {
  if (!newMessage.value.trim() || !authStore.isAuthenticated) return;
  
  emit('sendMessage', newMessage.value.trim());
  newMessage.value = '';
}

function addMessage(message: ChatMessage) {
  messages.value.push(message);
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
}

function formatTime(timestamp: Date): string {
  return timestamp.toLocaleTimeString('en-GB', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}
</script>

<style scoped>
.chat-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 300px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 800;
}

.chat-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
}

.chat-header span {
  flex: 1;
  font-size: 0.875rem;
}

.chat-content {
  display: flex;
  flex-direction: column;
  height: 400px;
}

.messages-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.message {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  padding: 0.5rem;
  border-radius: 8px;
  background: #f8f9fa;
  max-width: 80%;
}

.message.own-message {
  align-self: flex-end;
  background: #e3f2fd;
}

.message-author {
  font-size: 0.5rem;
  font-weight: 600;
  color: #666;
}

.message-text {
  font-size: 0.5rem;
  word-wrap: break-word;
}

.message-time {
  font-size: 0.5rem;
  color: #999;
  align-self: flex-end;
}

.message-input {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem;
  border-top: 1px solid #e0e0e0;
}

.message-input .v-text-field {
  flex: 1;
}
</style>