<template>
  <div class="draw-container">
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
      <v-number-input
        v-model="tempN"
        :min="2"
        :max="24"
        control-variant="split"
        @click:increment="handleInc"
        @click:decrement="handleDec"
        @keydown.enter="onEnterN"
        @blur="resetTempN"
      />
      <v-divider vertical />
      <v-btn
        @click="openSaveDialog"
        color="success"
        variant="elevated"
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
      <v-form v-model="saveForm" @submit.prevent="saveDrawing">
        <v-text-field
          v-model="drawingName"
          label="Drawing Name"
          :rules="nameRules"
          required
        />
        <v-spacer />
        <v-btn @click="saveDialog = false" variant="text">Cancel</v-btn>
        <v-btn 
          type="submit"
          color="primary" 
          :loading="saving"
          :disabled="!formValid"
        >
          Save
        </v-btn>
      </v-form>
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
  import { ref, watch, reactive } from 'vue';
  import { useAuthStore } from '@/stores/AuthStore';
  import { BasePictureDto } from '@/types/picture';
  import { useRouter } from 'vue-router';

  const route = useRoute();
  const router = useRouter();
  const authStore = useAuthStore();
  const n = ref(16);
  const tempN = ref(16);
  const tool = ref<'pen' | 'eraser'>('pen');
  const color = ref('#000');
  const mouseDown = ref(false);
  const tiles = reactive<string[][]>(Array.from({ length: n.value }, () => Array(n.value).fill('#fff')));

  const saveDialog = ref(false);
  const drawingName = ref('');
  const saving = ref(false);
  const successMessage = ref<string | null>(null);
  const errorMessage = ref<string | null>(null);
  const saveForm = ref<boolean>(false);

  const nameRules = [
    (v: string) => !!v.trim() || 'Drawing name is required',
    (v: string) => v.trim().length <= 50 || 'Drawing name must be 50 characters or less'
  ];

  onMounted(() => {
    if (route.query.save === 'true' && authStore.isAuthenticated) {
      openSaveDialog();
      router.replace({ name: 'draw' });
    }
  });

  function handleInc(){
    tempN++;
    n++;
  }

  function handleDec(){
    tempN--;
    n--;
  }

  watch(n, (newN,oldN) => {
    if (newN !== oldN) 
      tiles.value = resizeGrid(oldN)
  });

  function onEnterN() {
    let newSize = tempN.value;

    if (newSize < 1) newSize = 1;
    if (newSize > 24) newSize = 24;

    if (newSize !== n.value)
      n.value = newSize;
    tempN.value = newSize;
  }

  function resetTempN() {
    tempN.value = n.value;
  }

  function resizeGrid(oldSize: number){
    const newGrid = Array.from({ length: n.value }, () => Array(n.value).fill('#fff'));
    const newSize = Math.min(n.value, oldSize);

    for (let row = 0; row < newSize; row++) {
      for (let col = 0; col < newSize; col++) {
        newGrid[row][col] = oldGrid[row][col];
      }
    }

  return newGrid;
  }

  function draw(row: number, col: number) {
    tiles.value[row][col] = tool.value === 'pen' ? color.value : '#fff';
  }

  function openSaveDialog() {
    if (!authStore.isAuthenticated) { 
      localStorage.setItem('pendingDrawing',JSON.stringify(tiles.value));

      router.push({
        name: 'login', 
        query: { returnTo: 'draw', save: 'true' } 
      });

      return;
    }
    
    drawingName.value = '';
    saveDialog.value = true;
  }

  async function saveDrawing(){
    saving.value = true;

    const picture: BasePictureDto = {
      name: drawingName
    }

    const pendingDrawing = localStorage.getItem('pendingDrawing');

    if (pendingDrawing)

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

  .toolbox > * {
    display: flex;
    align-items: center;
  }
</style>