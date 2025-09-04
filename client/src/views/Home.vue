<template>
  <div class="home">
    <div 
      class="grid" 
      @mousemove="handleMouseMove"
      ref="gridRef"
    >
      <div
        v-for="(tile, index) in tiles"
        :key="index"
        class="tile"
        :style="{ backgroundColor: tile.color }"
        :data-index="index"
      ></div>
    </div>
    
    <div class="text">
      <h1>Draw pixel art together!</h1>
      <div class="buttons">
        <v-btn :to="{ name: 'draw' }" color="primary" size="large">
          Start Drawing
        </v-btn>
        <v-btn :to="{ name: 'gallery' }" variant="outlined" size="large">
          View Gallery
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const gridRef = ref<HTMLElement>()
const tiles = ref<{ color: string }[]>([])
const gridSize = ref({ cols: 50, rows: 30 })

const colors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
]

function initGrid() {
  const cols = Math.floor(window.innerWidth / 25)
  const rows = Math.floor(window.innerHeight / 25)
  
  gridSize.value = { cols, rows }
  
  tiles.value = Array.from({ length: cols * rows }, () => ({
    color: '#f0f0f0'
  }))
  
  if (gridRef.value) {
    gridRef.value.style.gridTemplateColumns = `repeat(${cols}, 1fr)`
  }
}

function handleMouseMove(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (target.classList.contains('tile')) {
    const index = parseInt(target.dataset.index || '0')
    if (tiles.value[index] && tiles.value[index].color === '#f0f0f0') {
      const randomColor = colors[Math.floor(Math.random() * colors.length)]
      tiles.value[index].color = randomColor
    }
  }
}

onMounted(() => {
  initGrid()
  window.addEventListener('resize', initGrid)
})

onUnmounted(() => {
  window.removeEventListener('resize', initGrid)
})
</script>

<style scoped>
.home {
  position: relative;
  width: 100vw;
  height: 100vh;
}

.grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: grid;
  gap: 1px;
  background: #ddd;
  z-index: 1;
}

.tile {
  background: #f0f0f0;
}

.text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  padding: 2rem;
  z-index: 2;
  pointer-events: none;
}

.text h1 {
  margin: 0 0 1rem 0;
  font-size: 2rem;
  color: #333;
}

.buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  pointer-events: auto;
}
</style>