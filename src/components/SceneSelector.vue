<script setup lang="ts">
import type { Scene } from '../data/scenes';

defineProps<{ scenes: Scene[]; selectedSceneId: string }>();
const emit = defineEmits<{ select: [sceneId: string] }>();
</script>

<template>
  <nav class="scene-selector" aria-label="Choose a background scene">
    <span class="selector-label">SCENE</span>
    <div class="scene-options" role="group" aria-label="Background options">
      <button
        v-for="scene in scenes"
        :key="scene.id"
        class="scene-option"
        :class="{ selected: selectedSceneId === scene.id }"
        type="button"
        :aria-pressed="selectedSceneId === scene.id"
        @click="emit('select', scene.id)"
      >
        <span class="scene-swatch" :class="{ 'default-swatch': !scene.image }">
          <img v-if="scene.image" :src="scene.image" alt="" />
          <span v-else aria-hidden="true">✳</span>
        </span>
        <span class="scene-name">{{ scene.name }}</span>
      </button>
    </div>
  </nav>
</template>
