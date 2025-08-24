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
        v-model="n"
        :min="2"
        :max="24"
        control-variant="split"
        @keydown.enter="updateGridSize"
        @blur="resetTempN"
      />
    </div>
    <div
      class="grid"
      :style="{
        gridTemplateColumns: `repeat(${n}, 1fr)`,
        gridTemplateRows: `repeat(${n}, 1fr)`
      }"
    >
      <div
        v-for="(tile, idx) in tiles"
        :key="idx"
        class="tile"
        :style="{
          background: tile,
          width: `${560 / n}px`,
          height: `${560 / n}px`
        }"
        @mousedown="draw(idx)"
        @mouseover="mouseDown && draw(idx)"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue';

  const n = ref(16);
  const tempN = ref(16);
  const tool = ref<'pen' | 'eraser'>('pen');
  const color = ref('#000');
  const mouseDown = ref(false);
  const tiles = ref<string[]>(Array(n.value * n.value).fill('#fff'));

  watch(n, (newN) => {
    if (newN > 24) newN = 24;
    if (newN < 2) newN = 2;
    tiles.value = Array(newN * newN).fill('#fff');
  });

  function updateGridSize() {
    let newSize = tempN.value;

    if (newSize < 2) newSize = 2;
    if (newSize > 24) newSize = 24;

    n.value = newSize;
    tempN.value = newSize;
  }

  function resetTempN() {
    tempN.value = n.value;
  }

  function draw(idx: number) {
    tiles.value[idx] = tool.value === 'pen' ? color.value : '#fff';
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