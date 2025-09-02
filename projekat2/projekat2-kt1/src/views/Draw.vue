<template>
  <div class="draw-container">
    <h1>{{ pictureName }}</h1>
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
      <v-btn @click="handleDec" :disabled="n <= 1">-</v-btn>
      <input id="grid-size-input" :value="n" type="text" @keydown.enter="onEnterN" @blur="resetTempN" style="max-width: 50px;" />
      <v-btn @click="handleInc" :disabled="n >= 24">+</v-btn>
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
      :style="{
        gridTemplateColumns: `repeat(${n}, 1fr)`,
        gridTemplateRows: `repeat(${n}, 1fr)`
      }"
    >
      <div
        v-for="(row, rowIdx) in tiles"
        :key="`row-${rowIdx}`">
        <div
          v-for="(tile, colIdx) in row"
          :key="`tile-${rowIdx}-${colIdx}`"
          class="tile"
          :style="{
            background: tile,
            width: `${560 / n}px`,
            height: `${560 / n}px`
          }"
          @mousedown="draw(rowIdx, colIdx)"
          @mouseover="mouseDown && draw(rowIdx, colIdx)">
        </div>
      </div>
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
    <v-alert 
      v-if="successMessage" 
      type="success" 
      closable
      @click:close="successMessage = null"
    >
      {{ successMessage }}
    </v-alert>
    
    <v-alert 
      v-if="errorMessage" 
      type="error" 
      closable
      @click:close="errorMessage = null"
    >
      {{ errorMessage }}
    </v-alert>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, reactive, onMounted } from 'vue';
  import { useAuthStore } from '@/stores/AuthStore';
  import type { BasePictureDto } from '@/types/picture';
  import { useRoute, useRouter } from 'vue-router';
  import { usePictureStore } from '@/stores/PictureStore';

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

  const nameRules = [
    (v: string) => !!v.trim() || 'Drawing name is required',
    (v: string) => v.trim().length <= 40 || 'Drawing name must be 40 characters or less'
  ];

  onMounted(async () => {
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
        tiles.value = result.data.picture_data;
        pictureName.value = result.data.name;
        pictureUserId.value = result.data.author.user_id;      }
    }
  });

  function handleDec() {
    n.value--;
  }

  function handleInc() {
    n.value++;
  }

  async function handleSave(){
    if (route.query.id) {
      const pictureId = route.query.id as string;

      const result = await pictureStore.updatePicture(pictureId, {
        name: pictureName.value,
        picture_data: tiles.value
      });

      if (result.success) {
        successMessage.value = 'Drawing updated successfully!';
      } else {
        errorMessage.value = result.error || 'Failed to update drawing';
      }
    }
    else
      openSaveDialog();
  }

  watch(n, (newN,oldN) => {
    if (newN !== oldN) {
      tiles.value = resizeGrid(oldN)
      console.log(tiles.value.length + " " + tiles.value[0].length)
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

    console.log("New grid size:" + newGrid.length + " " + newGrid[0].length);

    return newGrid;
  }

  function draw(row: number, col: number) {
    tiles.value[row][col] = tool.value === 'pen' ? color.value : '#fff';
  }

  function openSaveDialog() {
    if (!authStore.isAuthenticated) {
      localStorage.setItem('pendingDrawing', JSON.stringify(tiles));

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
  }

  window.addEventListener('mousedown', () => (mouseDown.value = true));
  window.addEventListener('mouseup', () => (mouseDown.value = false));
</script>

<style scoped>
  .draw-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 2rem;
    gap: 1em;
  }

  .grid {
    display: grid;
    gap: 0;
    width: 560px;
    height: 560px;
  }

  .tile {
    cursor: pointer;
    border: 1px solid #E0E0E0;
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
  
  .toolbox > .v-btn {
    display: flex;
    align-items: center;
  }

  .grid-size-input :deep(.v-field__input) {
    text-align: center;
    min-width: 50px;
  }
</style>