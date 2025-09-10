import { defineStore } from 'pinia';
import { ref } from 'vue';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from './AuthStore';

export const useSocketStore = defineStore('socket', () => {
  const socket = ref<Socket | null>(null);
  const connected = ref(!!socket.value);
  const authStore = useAuthStore();
  const currentRoomId = ref<string | null>(null);

  function connect() {
    if (socket.value?.connected || !authStore.isAuthenticated) return;

    socket.value = io('http://localhost:3001', {
      auth: {
        token: `Bearer ${authStore.token}`
      },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000
    });

    socket.value.on('connect', () => {
      connected.value = true;
      console.log('Connected to socket server');

      if (currentRoomId.value) {
        socket.value?.emit('join-room', currentRoomId.value);
      }
    });

    socket.value.on('disconnect', () => {
      connected.value = false;
      console.log('Disconnected from socket server');
    });

    socket.value.on('error', (error: { message: string }) => {
      console.error('Socket error:', error.message);
    });
  }

  function disconnect() {
    if (socket.value) {
      socket.value.disconnect();
      socket.value = null;
      connected.value = false;
      currentRoomId.value = null;
    }
  }

  function joinRoom(id: string) {
    if (!connected) {
      console.error('Socket not connected');
      return;
    }
    currentRoomId.value = id;
    socket.value?.emit('join-room', id);
  }

  return {
    socket,
    connected,
    connect,
    disconnect,
    joinRoom,
  };
});