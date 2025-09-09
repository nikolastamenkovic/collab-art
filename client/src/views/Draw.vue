<template>
<div class="draw-layout">
  <div v-if="socketStore.connected && connectedUsers.size > 0" class="user-pills">
    <div class="connection-status" :class="{ connected: socketStore.connected }">
    <v-icon size="medium" :color="socketStore.connected ? 'success' : 'error'">
      {{ socketStore.connected ? 'mdi-account-multiple' : 'mdi-account-off' }}
    </v-icon>
    </div>
    <div 
      v-for="(user, index) in Array.from(connectedUsers.values())" 
      :key="user.id"
      class="user-pill"
      :class="{ 'current-user': user.id === authStore.userId }"
    >
      <v-icon v-if="user.id === authStore.userId" size="small">mdi-account</v-icon>
      <span>{{ user.username }}</span>
      <span v-if="user.id === authStore.userId">(You)</span>
    </div>
  </div>
  <div class="draw-container">
    <h1>{{ pictureName }}</h1>
    <v-alert 
      v-if="isSaving" 
      type="info" 
    >
      <v-icon>mdi-loading mdi-spin</v-icon>
      Author is saving the drawing...
    </v-alert>
    <div class="toolbox">
      <v-btn
        @click="tool = 'pen'"
      :color="tool === 'pen' ? 'primary' : 'grey'"
      :variant="tool === 'pen' ? 'elevated' : 'outlined'"
    >
      <v-icon>mdi-pencil</v-icon>
    </v-btn>
    <v-btn
      @click="tool = 'eraser'"
      :color="tool === 'eraser' ? 'primary' : 'grey'"
      :variant="tool === 'eraser' ? 'elevated' : 'outlined'"
    >
      <v-icon>mdi-eraser</v-icon>
    </v-btn>
    <v-divider vertical />
    <input
      id="color-picker"
      type="color"
      v-model="color"
      :disabled="tool === 'eraser'"
    />
    <v-btn @click="handleDec" :disabled="n <= 1 || socketStore.connected">-</v-btn>
    <input id="grid-size-input" :value="n" type="text" :disabled="socketStore.connected" @keydown.enter="onEnterN" @blur="resetTempN" style="max-width: 50px;" />
    <v-btn @click="handleInc" :disabled="n >= 24 || socketStore.connected">+</v-btn>
    <v-divider vertical />
    <v-btn
      @click="handleSave"
      color="success"
      variant="elevated"
      :disabled="authStore.userId !== pictureUserId"
    >
      <v-icon>mdi-content-save</v-icon>
      Save
    </v-btn>
    </div>
    <div
      class="grid"
      :class="{ 'grid-disabled': isSaving }"
      :style="{
        gridTemplateColumns: `repeat(${n}, 1fr)`,
        gridTemplateRows: `repeat(${n}, 1fr)`
      }"
    >
      <div
        v-for="(row, rowIdx) in tiles"
        :key="`row-${rowIdx}`" class="row-wrapper">
        <div
          v-for="(tile, colIdx) in row"
          :key="`tile-${rowIdx}-${colIdx}`"
          class="tile"
          :class="{ 'tile-disabled': isSaving }"
          :style="{
            background: tile,
            width: `${560 / n}px`,
            height: `${560 / n}px`
          }"
          @mousedown="!isSaving && draw(rowIdx, colIdx)"
          @mouseover="!isSaving && mouseDown && draw(rowIdx, colIdx)">
        </div>
      </div>
    </div>
    <div v-if="authStore.isAuthenticated && pictureId" class="like-dislike-section">
      <div class="like-dislike-buttons">
        <v-btn
          @click="handleLike"
          :disabled="!authStore.isAuthenticated"
          :color="userReaction === 'like' ? 'success' : 'grey'"
          :variant="userReaction === 'like' ? 'elevated' : 'outlined'"
          size="large"
          class="reaction-btn"
        >
          <v-icon>mdi-thumb-up</v-icon>
          <span class="reaction-count">{{ likeCount }}</span>
        </v-btn>
        
        <v-btn
          @click="handleDislike"
          :disabled="!authStore.isAuthenticated"
          :color="userReaction === 'dislike' ? 'error' : 'grey'"
          :variant="userReaction === 'dislike' ? 'elevated' : 'outlined'"
          size="large"
          class="reaction-btn"
        >
          <v-icon>mdi-thumb-down</v-icon>
          <span class="reaction-count">{{ dislikeCount }}</span>
        </v-btn>
      </div>
    </div>
    <div v-if="authStore.isAuthenticated && socketStore.connected" style="width: 100%; max-width: 600px; margin-top: 2rem;">
      <CommentList
        :comments="comments"
        @delete="handleDeleteComment"
        @add="handleAddComment"
      />
    </div>
  </div>

  <div class="alert-container">
    <v-alert 
      v-if="successMessage" 
      type="success" 
      closable
      class="popup-alert"
      @click:close="successMessage = null"
    >
      {{ successMessage }}
    </v-alert>

    <v-alert 
      v-if="errorMessage" 
      type="error" 
      closable
      class="popup-alert"
      @click:close="errorMessage = null"
    >
      {{ errorMessage }}
    </v-alert>
  </div>

  <v-dialog v-model="saveDialog" max-width="400px">
    <v-card>
      <v-card-title>Save Drawing</v-card-title>
      <v-card-text>
        <v-form v-model="saveForm" @submit.prevent="saveDrawing">
          <v-text-field
            v-model="drawingName"
            label="Drawing Name"
            :rules="nameRules"
            required
          />
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="saveDialog = false" variant="text">Cancel</v-btn>
        <v-btn 
          @click="saveDrawing"
          color="primary" 
          :loading="saving"
          :disabled="!saveForm"
        >
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <div v-if="socketStore.connected"
    v-for="cursor in Array.from(cursors.entries())"
    :key="cursor[0]"
    class="collaborative-cursor"
    :style="{
      left: `${cursor[1].x}px`,
      top: `${cursor[1].y}px`
    }"
  >
    <v-icon :color="cursor[1].color" size="medium">mdi-cursor-default</v-icon>
    <span class="cursor-username" :style="{ background: cursor[1].color }">{{ cursor[1].username }}</span>
  </div>
</div>
</template>

<script setup lang="ts">
  import { ref, watch, reactive, onMounted, onUnmounted, toRaw, triggerRef } from 'vue';
  import { useAuthStore } from '@/stores/AuthStore';
  import type { BasePictureDto, CommentDto } from '@/types/picture';
  import { useRoute, useRouter } from 'vue-router';
  import { usePictureStore } from '@/stores/PictureStore';
  import { useSocketStore } from '@/stores/SocketStore';
  import type { CursorData, CursorDataUser, PixelChangeData, UserInRoom } from '@/types/collab';
  import CommentList from '@/components/CommentList.vue';

  const route = useRoute();
  const router = useRouter();
  const authStore = useAuthStore();
  const n = ref(16);
  const tool = ref<'pen' | 'eraser'>('pen');
  const color = ref('#000');
  const mouseDown = ref(false);
  const tiles = ref<string[][]>(Array.from({ length: n.value }, () => Array(n.value).fill('#fff')));

  const saveDialog = ref(false);
  const drawingName = ref('');
  const saving = ref(false);
  const successMessage = ref<string | null>(null);
  const errorMessage = ref<string | null>(null);
  const saveForm = ref<boolean>(false);
  const pictureName = ref<string>('Untitled');
  const pictureUserId = ref<string | null>(authStore.userId);
  const pictureId = ref<string | null>(route.query.id as string | null);
  const pictureStore = usePictureStore();
  const socketStore = useSocketStore();
  const cursors = ref<Map<string, CursorDataUser>>(new Map());
  const connectedUsers = ref<Map<string, UserInRoom>>(new Map());
  const isSaving = ref<boolean>(false);
  const comments = ref<CommentDto[]>([]);

  const likeCount = ref(0);
  const dislikeCount = ref(0);
  const userReaction = ref<'like' | 'dislike' | null>(null);

  const nameRules = [
    (v: string) => !!v.trim() || 'Drawing name is required',
    (v: string) => v.trim().length <= 40 || 'Drawing name must be 40 characters or less'
  ];

  onMounted(async () => {
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    if (route.query.save === 'true' && authStore.isAuthenticated) {
      const pendingDrawing = localStorage.getItem('pendingDrawing');
      if (pendingDrawing) {
        try {
          const savedTiles = JSON.parse(pendingDrawing);
          tiles.value = savedTiles;
          localStorage.removeItem('pendingDrawing');
        } catch (error) {
          console.error('Failed to restore pending drawing:', error);
        }
      }
      openSaveDialog();
      router.replace({ name: 'draw' , query: { id: pictureId.value } });
    }
    else if (route.query.id) {
      pictureId.value = route.query.id as string;
      const result = await pictureStore.getPictureById(pictureId.value);
      if (result.success && result.data) {
        n.value = result.data.picture_data.length;
        tiles.value = toRaw(result.data.picture_data);
        pictureName.value = result.data.name;
        pictureUserId.value = result.data.author.user_id;
        comments.value = result.data.comments || [];
        likeCount.value = result.data.liked_count || 0;
        dislikeCount.value = result.data.disliked_count || 0;
      }
      console.log(result.data);
      connectHere()
    }
  });

  function connectHere(){
    if (!socketStore.connected) {
      socketStore.connect();
      socketStore.joinRoom(pictureId.value as string);
      console.log('OVDE SAM: ', authStore.isAuthenticated);

      cursors.value.delete(authStore.userId as string);

      socketStore.socket?.on('joined-picture', (picture_data: string[][], users: UserInRoom[], user_reaction: 'like' | 'dislike' | null) => {
        tiles.value = picture_data;

        connectedUsers.value.clear();
        users.forEach(user => {
          connectedUsers.value.set(user.id, user);
        });

        // likeCount.value += picture.likes.length;
        // dislikeCount.value += picture.dislikes.length;

        userReaction.value = user_reaction;
        console.log(`Joined picture room with ${users.length} users`);
      });

      socketStore.socket?.on('user-joined', (user: UserInRoom, cursor: CursorData) => {
        connectedUsers.value.set(user.id, user);
        cursors.value.set(user.id, {...cursor, username: user.username, color: '#000' });
        console.log(`User ${user.username} joined the room`);
      });

      socketStore.socket?.on('user-left', (userId: string) => {
        connectedUsers.value.delete(userId);
        cursors.value.delete(userId);
    
        console.log(`User ${userId} left the room`);
        // console.log(connectedUsers.value);
      });

      socketStore.socket?.on('cursor-color-changed', (color: string, userId: string) => {
        const cursor = cursors.value.get(userId);
        if (cursor) {
          cursor.color = color;
        }
      });
    
      socketStore.socket?.on('pixel-change', (data: PixelChangeData) => {
        tiles.value[data.x][data.y] = data.color;
      });

      socketStore.socket?.on('cursor-moved', (data: CursorData, userId: string) => {
        let cursor = cursors.value.get(userId);
        if (!cursor) {
            cursor = { x: data.x, y: data.y, username: connectedUsers.value.get(userId)?.username || 'Unknown', color: '#000' };
            cursors.value.set(userId, cursor);
        } else {
            cursor.x = data.x;
            cursor.y = data.y;
        }
      });

      socketStore.socket?.on('comment', (comment: CommentDto) => {
        comments.value.unshift(comment);
      });

      socketStore.socket?.on('comment-delete', (commentId: string) => {
        comments.value = comments.value.filter(c => c.comment_id !== commentId);
      });

      socketStore.socket?.on('save-finished', (data: string[][]) => {
        if (data) tiles.value = data;
        isSaving.value = false;
      });

      socketStore.socket?.on('like', () => {
        likeCount.value++;
      });

      socketStore.socket?.on('dislike', () => {
        dislikeCount.value++;
      });

      socketStore.socket?.on('unlike', () => {
        likeCount.value = Math.max(0, likeCount.value - 1);
      });

      socketStore.socket?.on('undislike', () => {
        dislikeCount.value = Math.max(0, dislikeCount.value - 1);
      });

      socketStore.socket?.on('save-started', () => {
        isSaving.value = true;
      });

      socketStore.socket?.on('save-failed', () => {
        isSaving.value = false;
        console.log('Save failed by author');
      });
      window.addEventListener('mousemove', handleMouseMove);
    }
  }

  function handleMouseMove(event: MouseEvent) {
    socketStore.socket?.emit('cursor-move', { x: event.pageX, y: event.pageY });
  }

  async function handleAddComment(text: string) {
    if (!authStore.isAuthenticated || !pictureId.value) return;

    const result = await pictureStore.addComment(pictureId.value, text);
    if (result.success && result.comment) {
      comments.value.unshift(result.comment);
      if(socketStore.connected)
        socketStore.socket?.emit('comment', result.comment);
    } else {
      errorMessage.value = result.error || 'Failed to add comment';
    }
  }

  async function handleDeleteComment(commentId: string) {
    if (!authStore.isAuthenticated || !pictureId.value) return;

    const result = await pictureStore.deleteComment(commentId);
    if (result.success) {
      comments.value = comments.value.filter(c => c.comment_id !== commentId);
      if(socketStore.connected)
        socketStore.socket?.emit('comment-delete', commentId);
    } else {
      errorMessage.value = result.error || 'Failed to delete comment';
      setTimeout(() => {
        errorMessage.value = null;
      }, 3000);
    }
  }

  function handleDec() {
    n.value--;
  }

  function handleInc() {
    n.value++;
  }

  function clearRoom() {
    connectedUsers.value.clear();
    cursors.value.clear();
    isSaving.value = false;
  }

  function sendSaveStarted() {
    if (!socketStore.connected) return;
    isSaving.value = true;
    socketStore.socket?.emit('save-started');
  }

  function sendSaveFinished(data: string[][] | null) {
    if (!socketStore.connected) return;
    isSaving.value = false;
    socketStore.socket?.emit('save-finished', data);
  }

  async function handleLike() {
    if(!authStore.isAuthenticated || !pictureId.value) return;

    const result = await pictureStore.likePicture(pictureId.value);
    if (result.success) {
      switch(userReaction.value) {
        case 'like':
          likeCount.value--;
          userReaction.value = null;
          if (socketStore.connected) {
            socketStore.socket?.emit('unlike', pictureId.value);
          }
          break;
        case 'dislike':
          dislikeCount.value--;
          likeCount.value++;
          userReaction.value = 'like';
          if (socketStore.connected) {
            socketStore.socket?.emit('undislike', pictureId.value);
            socketStore.socket?.emit('like', pictureId.value);
          }
          break;
        default:
          likeCount.value++;
          userReaction.value = 'like';
          if (socketStore.connected) {
            socketStore.socket?.emit('like', pictureId.value);
          }
      }
    } else {
      errorMessage.value = result.error || 'Failed to like the picture';
      setTimeout(() => {
        errorMessage.value = null;
      }, 3000);
    }
  }

  async function handleDislike() {
    if(!authStore.isAuthenticated || !pictureId.value) return;

    const result = await pictureStore.dislikePicture(pictureId.value);
    if (result.success) {
      switch(userReaction.value) {
        case 'dislike':
          dislikeCount.value--;
          userReaction.value = null;
          if (socketStore.connected) {
            socketStore.socket?.emit('undislike', pictureId.value);
          }
          break;
        case 'like':
          dislikeCount.value++;
          likeCount.value--;
          userReaction.value = 'dislike';
          if (socketStore.connected) {
            socketStore.socket?.emit('unlike', pictureId.value);
            socketStore.socket?.emit('dislike', pictureId.value);
          }
          break;
        default:
          dislikeCount.value++;
          userReaction.value = 'dislike';
          if (socketStore.connected) {
            socketStore.socket?.emit('dislike', pictureId.value);
          }
      }
    } else {
      errorMessage.value = result.error || 'Failed to dislike the picture';
      setTimeout(() => {
        errorMessage.value = null;
      }, 3000);
    }
  }

  watch(color, (newColor) => {
    if (socketStore.connected) {
      socketStore.socket?.emit('cursor-color-change', newColor);
    }
  });

  async function handleSave(){
    sendSaveStarted();
    if (route.query.id) {
      const pictureId = route.query.id as string;

      const result = await pictureStore.updatePicture(pictureId, {
        name: pictureName.value,
        picture_data: tiles.value
      });

      if (result.success) {
        successMessage.value = 'Drawing updated successfully!';
        setTimeout(() => {
          successMessage.value = null;
        }, 3000);
      } else {
        errorMessage.value = result.error || 'Failed to update drawing';
        setTimeout(() => {
          errorMessage.value = null;
        }, 3000);
      }
        sendSaveFinished(result.success ? tiles.value : null);
    }
    else
      openSaveDialog();
  }

  watch(n, (newN,oldN) => {
    if (newN !== oldN) {
      tiles.value = resizeGrid(oldN)
      // console.log(tiles.value.length + " " + tiles.value[0].length)
    }
  });
  
  function resetTempN() {
    const el = document.getElementById('grid-size-input') as HTMLInputElement;
    if(el)
      el.value = n.value.toString();
  }

  function onEnterN() {
    const el = document.getElementById('grid-size-input') as HTMLInputElement;
    let newSize = n.value;
    try{ 
      newSize = parseInt(el.value);
      if (isNaN(newSize)) newSize = 16;

      if (newSize < 1) newSize = 1;
      if (newSize > 24) newSize = 24;

      if (newSize !== n.value)
        n.value = newSize;
    } catch(e) {}
    finally {
      el.value = n.value.toString();
    }
  }

  function resizeGrid(oldSize: number){
    const newGrid = Array.from({ length: n.value }, () => Array(n.value).fill('#fff'));
    const newSize = Math.min(n.value, oldSize);
    for (let row = 0; row < newSize; row++) {
      for (let col = 0; col < newSize; col++) {
        newGrid[row][col] = tiles.value[row][col];
      }
    }

    // console.log("New grid size:" + newGrid.length + " " + newGrid[0].length);

    return newGrid;
  }

  function draw(row: number, col: number) {
    tiles.value[row][col] = tool.value === 'pen' ? color.value : '#fff';
    if (socketStore.connected) {
      socketStore.socket?.emit('pixel-change', { x: row, y: col, color: tiles.value[row][col] });
    }
  }

  function openSaveDialog() {
    if (!authStore.isAuthenticated) {
      const tilesTmp = JSON.stringify(tiles.value);

      localStorage.setItem('pendingDrawing', tilesTmp);

      router.push({
        name: 'login', 
        query: { returnTo: 'draw', save: 'true' } 
      });

      return;
    }
    
    drawingName.value = '';
    saveDialog.value = true;
  }

  async function saveDrawing() {
    saving.value = true;
    errorMessage.value = null;
    successMessage.value = null;

    const picture: BasePictureDto = {
      name: drawingName.value.trim(),
      picture_data: tiles.value
    };

    const result = await pictureStore.createPicture(picture);
    if (result.success) {
      pictureId.value = result.pictureId || null;
      router.replace({ name: 'draw' , query: { id: pictureId.value } });

      successMessage.value = 'Drawing saved successfully!';
      saveDialog.value = false;
              
      setTimeout(() => {
        successMessage.value = null;
      }, 3000);

    } else {
      errorMessage.value = result.error || 'Failed to save drawing';
    }
    saving.value = false;
    pictureName.value = picture.name;
    connectHere();
  }
  
  function handleMouseDown() {
    mouseDown.value = true;
  } 

  function handleMouseUp() {
    mouseDown.value = false;
  }

  onUnmounted(() => {
    window.removeEventListener('mousedown', handleMouseDown);
    window.removeEventListener('mouseup', handleMouseUp);

    if(socketStore.connected) {
      socketStore.disconnect();
      clearRoom();
      window.removeEventListener('mousemove', handleMouseMove);
    }
  });
</script>

<style scoped>
.draw-layout {
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

/* .user-pills {
  margin-top: 1rem;
  position: absolute;
  display: flex;
  flex-direction: column;
  left: 0;
  top: 0;
  z-index: 200;
  gap: 0.5rem;
} */

.user-pills {
  position: fixed;
  margin-top: 10px;
  top: 80px;
  left: 0;
  z-index: 900;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
  pointer-events: none;
}

.user-pill {
  display: flex;
  pointer-events: none;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  text-align: center;
  padding: 0.75rem 1rem;
  background: rgba(76, 175, 80, 0.9);
  border: 1px solid #4caf50;
  border-radius: 0 25px 25px 0;
  font-size: 0.6rem;
  color: white;
  gap:0.25rem;
  min-height: 40px;
}

.user-pill.current-user {
  background: rgba(227, 242, 253, 0.95);
  border-color: #2196f3;
  color: #1976d2;
}

.connection-status {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  margin-left: 0.5rem;
  justify-content: center;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  border: 2px solid #f44336;
}

.connection-status.connected {
  border-color: #4caf50;
}

.draw-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  gap: 1em;
}

/* .alert-container {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 300;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
} */

.alert-container {
  position: fixed;
  top: 100px;
  right: 20px;
  z-index: 950;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.popup-alert {
  margin: 0;
  border-radius: 8px;
}

.like-dislike-section {
  width: 100%;
  max-width: 600px;
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
}

.like-dislike-buttons {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.reaction-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  min-width: 100px;
  justify-content: center;
}

.reaction-count {
  font-size: 1rem;
  font-weight: bold;
  min-width: 20px;
  text-align: center;
}

.collaborative-cursor {
  position: absolute;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  transform: translate(-50%, -50%);
}

.cursor-username {
  color: white;
  padding: 0.125rem;
  border-radius: 4px;
  font-size: 0.5rem;
  white-space: nowrap;
}

.grid {
  display: grid;
  gap: 0;
  width: 560px;
  height: 560px;
}

.grid-disabled {
  opacity: 0.6;
  pointer-events: none;
  position: relative;
}

.grid-disabled::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.3);
  z-index: 10;
}

.tile {
  cursor: pointer;
  border: 1px solid #E0E0E0;
}

.tile-disabled {
  cursor: not-allowed;
}

.toolbox {
  display: flex;
  flex-direction: row;
  gap: 0.8em;
  background: #fff;
  padding: 0.6em 1em;
  border-radius: 8px;
  box-shadow: 0 2px 8px 0 rgba(0,0,0,0.06);
  align-items: center;
}

#color-picker {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  cursor: pointer;
  padding: 0;
}

.row-wrapper {
  display: contents;
}

.toolbox > .v-btn {
  display: flex;
  align-items: center;
}
</style>