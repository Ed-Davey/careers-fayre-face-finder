<script setup lang="ts">
const appTechnologies = [
  { name: 'Vue', icon: 'vuedotjs' },
  { name: 'JavaScript', icon: 'javascript' },
  { name: 'TypeScript', icon: 'typescript' },
  { name: 'Vite', icon: 'vite' },
  { name: 'Node.js', icon: 'nodedotjs' },
  { name: 'Docker', icon: 'docker' },
  { name: 'nginx', icon: 'nginx' },
  { name: 'Git', icon: 'git' },
  { name: 'GitHub', icon: 'github' },
];
const companyTechnologies = [
  { name: 'Quasar', icon: 'quasar' },
  { name: 'Python', icon: 'python' },
  { name: 'Terraform', icon: 'terraform' },
  { name: 'Raspberry Pi', icon: 'raspberrypi' },
  { name: 'Ubuntu', icon: 'ubuntu' },
  { name: 'C++', icon: 'cplusplus' },
];
</script>

<template>
  <section class="built-with" aria-label="Built with">
    <h2>Built with</h2>
    <h3>This app</h3>
    <p>Vue and TypeScript power the interface; MediaPipe and BlazeFace provide face detection.</p>
    <ul class="technology-cloud" aria-label="App technologies">
      <li v-for="technology in appTechnologies" :key="technology.icon">
        <img :src="`/technology/${technology.icon}.svg`" alt="" width="20" height="20" loading="lazy" />
        <span>{{ technology.name }}</span>
      </li>
    </ul>
    <h3>Also used across our company</h3>
    <p> </p>
    <ul class="technology-cloud" aria-label="Wider company technologies">
      <li v-for="technology in companyTechnologies" :key="technology.icon">
        <img :src="`/technology/${technology.icon}.svg`" alt="" width="20" height="20" loading="lazy" />
        <span>{{ technology.name }}</span>
      </li>
    </ul>
    <p class="logo-credit"></p>
  </section>
</template>
