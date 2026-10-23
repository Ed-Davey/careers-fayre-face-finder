<script setup lang="ts">
import type { Scene } from '../data/scenes';

defineProps<{ scenes: Scene[] }>();
</script>

<template>
  <details class="photo-credits">
    <summary>
      <span>Photos provided by Pexels.com</span>
      <span class="credits-chevron" aria-hidden="true">⌄</span>
    </summary>
    <div class="credits-table-wrap">
      <table class="credits-table">
        <thead>
          <tr>
            <th scope="col">Photo title</th>
            <th scope="col">Photographer</th>
            <th scope="col">Photo link</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="scene in scenes" :key="scene.id">
            <td>{{ scene.credit?.title || 'Add photo title' }}</td>
            <td>{{ scene.credit?.photographer || 'Add photographer name' }}</td>
            <td>
              <a v-if="scene.credit?.url" :href="scene.credit.url" target="_blank" rel="noopener noreferrer">View on Pexels</a>
              <span v-else>Add Pexels photo URL</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </details>
</template>
