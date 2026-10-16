<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch, type CSSProperties } from 'vue';
import { useFaceCounter } from './composables/useFaceCounter';
import SceneSelector from './components/SceneSelector.vue';
import PhotoCredits from './components/PhotoCredits.vue';
import { customScenes, scenes, type Point, type Scene } from './data/scenes';
import saltoLogo from '../images/Salto_Claim_Multicolour_Neg_Logo_RGB.svg';
const sceneDurationMs = 7_500;

const selectedSceneId = ref('default');
const frameSize = ref({ width: 0, height: 0 });
const sceneTransitionActive = ref(false);
let frameObserver: ResizeObserver | null = null;
let sceneTimer = 0;
let geometryTransitionTimer = 0;

const {
  cameraIsVisible,
  canvasElement,
  countBand,
  countCaption,
  faceCount,
  resizeOverlay,
  screenSurfaceElement,
  startCamera,
  state,
  statusDetail,
  statusTitle,
  stopCamera,
  videoElement,
  viewfinderElement,
} = useFaceCounter();

const selectedScene = computed(() => scenes.find((scene) => scene.id === selectedSceneId.value) ?? scenes[0]);
const sceneCaption = computed(() => {
  const count = faceCount.value ?? 0;
  const people = `${count} ${count === 1 ? 'person' : 'people'}`;
  const captions: Record<string, string> = {
    cinema: `${people} in the audience. No spoilers, please.`,
    concert: `${people} in the crowd`,
    'living-room': `${people} around the TV. What are we watching?`,
    'formula-one': `Pit crew report: ${people} spotted. Nobody touch the tyres.`,
    'retro-computer': `SYSTEM ALERT: ${count} human${count === 1 ? '' : 's'} detected`,
    skatepark: `${people} at the skatepark. Mind the ramps.`,
    tennis: `${people} watching. Please hold the applause.`,
    wembley: `${people} in the stands. The crowd is growing.`,
  };
  return captions[selectedSceneId.value] ?? '';
});
const displayedScene = ref(scenes[0]);
const incomingScene = ref<Scene | null>(null);
const incomingSceneReady = ref(false);

onMounted(() => {
  const frame = viewfinderElement.value;
  if (!frame) return;
  const updateFrameSize = () => {
    const rect = frame.getBoundingClientRect();
    frameSize.value = { width: rect.width, height: rect.height };
  };
  updateFrameSize();
  frameObserver = new ResizeObserver(updateFrameSize);
  frameObserver.observe(frame);
});

onUnmounted(() => {
  frameObserver?.disconnect();
  window.clearTimeout(sceneTimer);
  window.clearTimeout(geometryTransitionTimer);
});

function solveLinearSystem(matrix: number[][], values: number[]) {
  const size = values.length;
  const rows = matrix.map((row, i) => [...row, values[i]]);
  for (let column = 0; column < size; column++) {
    let pivot = column;
    for (let row = column + 1; row < size; row++) {
      if (Math.abs(rows[row][column]) > Math.abs(rows[pivot][column])) pivot = row;
    }
    [rows[column], rows[pivot]] = [rows[pivot], rows[column]];
    const divisor = rows[column][column];
    if (Math.abs(divisor) < 1e-10) return null;
    for (let entry = column; entry <= size; entry++) rows[column][entry] /= divisor;
    for (let row = 0; row < size; row++) {
      if (row === column) continue;
      const factor = rows[row][column];
      for (let entry = column; entry <= size; entry++) rows[row][entry] -= factor * rows[column][entry];
    }
  }
  return rows.map((row) => row[size]);
}

function projectiveTransform(width: number, height: number, corners: [Point, Point, Point, Point]) {
  const source: Point[] = [{ x: 0, y: 0 }, { x: width, y: 0 }, { x: width, y: height }, { x: 0, y: height }];
  const matrix: number[][] = [];
  const values: number[] = [];
  corners.forEach((target, index) => {
    const { x, y } = source[index];
    matrix.push([x, y, 1, 0, 0, 0, -target.x * x, -target.x * y]);
    values.push(target.x);
    matrix.push([0, 0, 0, x, y, 1, -target.y * x, -target.y * y]);
    values.push(target.y);
  });
  const solved = solveLinearSystem(matrix, values);
  if (!solved) return 'none';
  const [a, b, c, d, e, f, g, h] = solved;
  return `matrix3d(${[a, d, 0, g, b, e, 0, h, 0, 0, 1, 0, c, f, 0, 1].join(',')})`;
}

const cameraSurfaceStyle = computed<CSSProperties>(() => {
  const scene = selectedScene.value;
  const frame = viewfinderElement.value;
  if (!scene.screen || !frame || !frameSize.value.width || !frameSize.value.height) {
    return { left: '0', top: '0', width: '100%', height: '100%', transform: 'none' };
  }

  const frameWidth = frameSize.value.width;
  const frameHeight = frameSize.value.height;
  const scale = Math.min(frameWidth / scene.width, frameHeight / scene.height);
  const imageWidth = scene.width * scale;
  const imageHeight = scene.height * scale;
  const imageLeft = (frameWidth - imageWidth) / 2;
  const imageTop = (frameHeight - imageHeight) / 2;
  const corners = scene.screen.map((point) => ({
    x: imageLeft + point.x * imageWidth,
    y: imageTop + point.y * imageHeight,
  })) as [Point, Point, Point, Point];
  const [topLeft, topRight, , bottomLeft] = corners;
  const width = Math.hypot(topRight.x - topLeft.x, topRight.y - topLeft.y);
  const height = Math.hypot(bottomLeft.x - topLeft.x, bottomLeft.y - topLeft.y);
  const localCorners = corners.map((point) => ({ x: point.x - topLeft.x, y: point.y - topLeft.y })) as [Point, Point, Point, Point];

  return {
    left: `${topLeft.x}px`,
    top: `${topLeft.y}px`,
    width: `${width}px`,
    height: `${height}px`,
    transformOrigin: '0 0',
    transform: projectiveTransform(width, height, localCorners),
  };
});

watch(selectedSceneId, async (sceneId) => {
  window.clearTimeout(sceneTimer);
  window.clearTimeout(geometryTransitionTimer);
  sceneTimer = 0;

  if (sceneId !== 'default') {
    sceneTimer = window.setTimeout(() => {
      const currentIndex = customScenes.findIndex((scene) => scene.id === selectedSceneId.value);
      const nextScene = customScenes[(currentIndex + 1) % customScenes.length];
      selectedSceneId.value = nextScene.id;
    }, sceneDurationMs);
  }

  const nextScene = scenes.find((scene) => scene.id === sceneId) ?? scenes[0];
  sceneTransitionActive.value = true;
  geometryTransitionTimer = window.setTimeout(() => {
    sceneTransitionActive.value = false;
  }, 500);

  if (displayedScene.value.image && nextScene.image) {
    // Keep the outgoing background underneath until the incoming image is fully opaque.
    incomingScene.value = nextScene;
    incomingSceneReady.value = false;
  } else {
    // The Default scene has no image layer to overlap, so switch directly to it.
    displayedScene.value = nextScene;
    incomingScene.value = null;
    incomingSceneReady.value = false;
  }

  await nextTick();
  resizeOverlay();
});

function finishSceneTransition() {
  if (!incomingScene.value) return;
  displayedScene.value = incomingScene.value;
  incomingScene.value = null;
  incomingSceneReady.value = false;
}

function startSceneTransition() {
  incomingSceneReady.value = true;
}
</script>

<template>
  <div class="app-shell">
    <header class="topbar">
      <img class="topbar-logo" :src="saltoLogo" alt="Salto" />
      <span class="topbar-separator" aria-hidden="true">|</span>
      <h1>Careers fayre face counter</h1>
    </header>
    <main class="main-content">
      <section class="demo-grid" aria-label="Live face counter">
        <div
          ref="viewfinderElement"
          class="viewfinder"
          :class="{ 'is-live': cameraIsVisible, 'is-scene-transitioning': sceneTransitionActive }"
          aria-label="Camera preview"
        >
          <div
            v-if="displayedScene.image"
            class="scene-backdrop"
          >
            <img class="scene-artwork" :src="displayedScene.image" :alt="`${displayedScene.name} background`" />
          </div>
          <div
            v-if="incomingScene?.image"
            :key="incomingScene.id"
            class="scene-backdrop"
            :class="['scene-incoming', { 'is-ready': incomingSceneReady }]"
            @animationend="finishSceneTransition"
          >
            <img class="scene-artwork" :src="incomingScene.image" :alt="`${incomingScene.name} background`" @load="startSceneTransition" />
          </div>
          <div ref="screenSurfaceElement" class="screen-surface" :style="cameraSurfaceStyle">
            <video
              ref="videoElement"
              v-show="cameraIsVisible"
              autoplay
              playsinline
              muted
              aria-label="Live camera preview"
            />
            <canvas ref="canvasElement" v-show="cameraIsVisible" aria-hidden="true" />
            <div v-if="!cameraIsVisible && selectedScene.image" class="screen-standby">
              <span class="screen-standby-dot" />
              <span>Camera off · Start when ready</span>
            </div>
          </div>

          <div
            v-if="selectedScene.image || !cameraIsVisible"
            class="standby"
            :class="{ 'scene-matte': selectedScene.image }"
          >
            <div class="standby-illustration" aria-hidden="true">
              <svg viewBox="0 0 80 80" fill="none">
                <rect x="12" y="22" width="56" height="40" rx="8" />
                <path d="M27 22l5-8h16l5 8" />
                <circle cx="40" cy="42" r="12" />
                <circle class="lens-core" cx="40" cy="42" r="5" />
              </svg>
            </div>
            <h2>{{ state === 'error' ? 'Ready to try again' : state === 'requesting' ? 'Camera permission needed' : 'Ready for the first face' }}</h2>
            <p>{{ state === 'requesting' ? 'Allow camera access in your browser to begin.' : 'Start the camera when everyone is ready.' }}</p>
          </div>

          <span class="frame-corner corner-tl" aria-hidden="true" />
          <span class="frame-corner corner-tr" aria-hidden="true" />
          <span class="frame-corner corner-bl" aria-hidden="true" />
          <span class="frame-corner corner-br" aria-hidden="true" />

          <div v-if="state === 'active'" class="live-indicator"><span /> LIVE PREVIEW</div>
          <div class="status-pill" :data-state="state" role="status">
            <span class="status-dot" />
            {{ statusTitle }}
          </div>
          <p v-if="state === 'active' && selectedScene.image" class="scene-caption">{{ sceneCaption }}</p>
        </div>

        <aside class="count-panel" :data-band="countBand" aria-live="polite" aria-atomic="true">
          <div class="count-topline">
            <span class="count-spark" aria-hidden="true">✳</span>
            <span>LIVE COUNT</span>
          </div>
          <div class="count-number-wrap">
            <Transition name="count-pop" mode="out-in">
              <strong :key="faceCount ?? 'off'" class="count-number">{{ faceCount ?? '—' }}</strong>
            </Transition>
          </div>
          <p class="count-label">Faces visible</p>
          <Transition name="caption-fade" mode="out-in">
            <p :key="countCaption" class="count-caption">{{ countCaption }}</p>
          </Transition>
          <div class="count-rings" aria-hidden="true"><span /><span /><span /></div>
        </aside>
      </section>

      <SceneSelector :scenes="scenes" :selected-scene-id="selectedSceneId" @select="selectedSceneId = $event" />

      <section class="control-row" aria-label="Camera controls">
        <div class="control-copy">
          <p class="status-detail">{{ statusDetail }}</p>
          <p class="privacy-note">On-device only · Frames are analysed in memory and immediately discarded.</p>
        </div>
        <div class="button-row">
          <button
            class="button button-start"
            type="button"
            :disabled="state === 'requesting' || state === 'loading' || state === 'active'"
            @click="startCamera"
          >
            <span aria-hidden="true">◉</span> Start camera
          </button>
          <button
            class="button button-stop"
            type="button"
            :disabled="state !== 'requesting' && state !== 'loading' && state !== 'active'"
            @click="stopCamera()"
          >
            <span aria-hidden="true">■</span> Stop camera
          </button>
        </div>
      </section>

      <PhotoCredits :scenes="customScenes" />
      </main>
  </div>
</template>
