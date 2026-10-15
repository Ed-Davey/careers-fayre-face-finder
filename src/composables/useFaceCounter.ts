import { computed, onMounted, onUnmounted, ref } from 'vue';
import { FaceDetector, FilesetResolver } from '@mediapipe/tasks-vision';

export type AppState = 'standby' | 'requesting' | 'loading' | 'active' | 'error';

const statusCopy: Record<AppState, { title: string; detail: string }> = {
  standby: { title: 'Camera is off', detail: 'Start the camera when everyone is ready. Nothing is recorded.' },
  requesting: { title: 'Waiting for permission', detail: 'Allow camera access in your browser to start the live count.' },
  loading: { title: 'Preparing face detection', detail: 'The camera is on. Loading the on-device detector…' },
  active: { title: 'Camera active · on-device detection', detail: 'Aim the camera at consenting participants. Stop it at any time.' },
  error: { title: 'Camera or detector unavailable', detail: 'The camera is off. The fallback screen is ready.' },
};

export function useFaceCounter() {
  const videoElement = ref<HTMLVideoElement | null>(null);
  const canvasElement = ref<HTMLCanvasElement | null>(null);
  const viewfinderElement = ref<HTMLElement | null>(null);
  const screenSurfaceElement = ref<HTMLDivElement | null>(null);
  const state = ref<AppState>('standby');
  const faceCount = ref<number | null>(null);
  const failureDetail = ref('');

  let stream: MediaStream | null = null;
  let detector: FaceDetector | null = null;
  let detectTimer = 0;
  let generation = 0;
  let busy = false;
  let resizeObserver: ResizeObserver | null = null;

  const cameraIsVisible = computed(() => state.value === 'loading' || state.value === 'active');
  const statusTitle = computed(() => statusCopy[state.value].title);
  const statusDetail = computed(() => state.value === 'error' ? failureDetail.value : statusCopy[state.value].detail);
  const countBand = computed(() => {
    if (faceCount.value === null || faceCount.value === 0) return 'quiet';
    if (faceCount.value === 1) return 'first';
    if (faceCount.value < 5) return 'gathering';
    return 'crowd';
  });
  const countCaption = computed(() => {
    if (state.value === 'requesting') return 'Waiting for camera access';
    if (state.value === 'loading') return 'Getting the counter ready';
    if (state.value === 'error') return 'Live count paused';
    if (state.value === 'standby') return 'Ready for the first face';
    if (faceCount.value === 0) return 'Ready for the first face';
    if (faceCount.value === 1) return 'First face in view';
    if (faceCount.value !== null && faceCount.value < 5) return 'Faces are gathering';
    return 'Look at all these faces';
  });

  function changeState(next: AppState) {
    state.value = next;
    if (next !== 'active') faceCount.value = null;
    if (next !== 'error') failureDetail.value = '';
  }

  function clearOverlay() {
    const canvas = canvasElement.value;
    const context = canvas?.getContext('2d');
    if (canvas && context) context.clearRect(0, 0, canvas.width, canvas.height);
  }

  function resizeOverlay() {
    const canvas = canvasElement.value;
    const surface = screenSurfaceElement.value;
    if (!canvas || !surface) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pixelWidth = Math.round(surface.clientWidth * dpr);
    const pixelHeight = Math.round(surface.clientHeight * dpr);
    if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
    if (canvas.height !== pixelHeight) canvas.height = pixelHeight;
    clearOverlay();
  }

  function drawFaces(boxes: { originX: number; originY: number; width: number; height: number }[]) {
    const canvas = canvasElement.value;
    const video = videoElement.value;
    const surface = screenSurfaceElement.value;
    const context = canvas?.getContext('2d');
    if (!canvas || !video || !surface || !context || !video.videoWidth || !video.videoHeight) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = surface.clientWidth;
    const height = surface.clientHeight;
    const scale = Math.max(width / video.videoWidth, height / video.videoHeight);
    const cropX = (video.videoWidth * scale - width) / 2;
    const cropY = (video.videoHeight * scale - height) / 2;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.save();
    context.scale(dpr, dpr);
    context.strokeStyle = '#d5ff67';
    context.lineWidth = 2.5;
    context.shadowColor = 'rgba(0,0,0,.25)';
    context.shadowBlur = 6;
    for (const box of boxes) {
      context.strokeRect(
        box.originX * scale - cropX,
        box.originY * scale - cropY,
        box.width * scale,
        box.height * scale,
      );
    }
    context.restore();
  }

  function stopCamera(showStandby = true) {
    ++generation;
    window.clearInterval(detectTimer);
    detectTimer = 0;
    resizeObserver?.disconnect();
    resizeObserver = null;
    detector?.close();
    detector = null;
    stream?.getTracks().forEach((track) => track.stop());
    stream = null;
    const video = videoElement.value;
    video?.pause();
    if (video) video.srcObject = null;
    clearOverlay();
    if (showStandby) changeState('standby');
  }

  function detectFrame() {
    const video = videoElement.value;
    if (state.value !== 'active' || !detector || busy || document.hidden || !video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
    busy = true;
    try {
      const result = detector.detectForVideo(video, performance.now());
      const boxes = result.detections.flatMap((detection) => detection.boundingBox ? [detection.boundingBox] : []);
      faceCount.value = boxes.length;
      drawFaces(boxes);
    } catch (error) {
      stopCamera(false);
      const detail = error instanceof Error ? ` ${error.message.slice(0, 220)}` : '';
      failureDetail.value = `Face detection failed.${detail} The camera has been turned off; you can use the standby screen.`;
      changeState('error');
    } finally {
      busy = false;
    }
  }

  async function startCamera() {
    if (['requesting', 'loading', 'active'].includes(state.value)) return;
    const video = videoElement.value;
    const viewfinder = viewfinderElement.value;
    const surface = screenSurfaceElement.value;
    if (!video || !viewfinder || !surface) return;

    const run = ++generation;
    let startupStage = 'Camera startup';
    changeState('requesting');
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera access is unavailable. Open the app from localhost in a current browser.');
      }
      stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        // Ask for more sensor pixels so small, distant faces retain detail.
        // Browsers can negotiate a lower resolution when the camera cannot provide this.
        video: { facingMode: 'user', width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      if (run !== generation) {
        stream.getTracks().forEach((track) => track.stop());
        stream = null;
        return;
      }
      video.srcObject = stream;
      await video.play();
      if (run !== generation) return;
      changeState('loading');

      startupStage = 'Loading the local vision runtime';
      const vision = await FilesetResolver.forVisionTasks('/vision/wasm');
      if (run !== generation) return;
      startupStage = 'Loading the full-range face detector';
      detector = await FaceDetector.createFromOptions(vision, {
        baseOptions: { modelAssetPath: '/vision/face_detector_full_range.tflite', delegate: 'CPU' },
        runningMode: 'VIDEO',
        minDetectionConfidence: 0.5,
      });
      if (run !== generation) {
        detector.close();
        detector = null;
        return;
      }

      resizeOverlay();
      resizeObserver = new ResizeObserver(resizeOverlay);
      resizeObserver.observe(viewfinder);
      resizeObserver.observe(surface);
      changeState('active');
      faceCount.value = 0;
      detectTimer = window.setInterval(detectFrame, 300);
    } catch (error) {
      if (run !== generation) return;
      stopCamera(false);
      failureDetail.value = error instanceof DOMException && error.name === 'NotAllowedError'
        ? 'Camera permission was denied. Allow camera access in the browser site settings, then try again.'
        : `${startupStage} failed: ${error instanceof Error ? error.message : 'Unknown error'}. The camera has been stopped.`;
      changeState('error');
    }
  }

  function onVisibilityChange() {
    if (!document.hidden && state.value === 'active') detectFrame();
  }

  function onPageHide() {
    stopCamera(false);
  }

  onMounted(() => {
    resizeOverlay();
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('pagehide', onPageHide);
  });
  onUnmounted(() => {
    document.removeEventListener('visibilitychange', onVisibilityChange);
    window.removeEventListener('pagehide', onPageHide);
    stopCamera(false);
  });

  return {
    cameraIsVisible,
    canvasElement,
    countBand,
    countCaption,
    faceCount,
    startCamera,
    state,
    statusDetail,
    statusTitle,
    stopCamera,
    videoElement,
    viewfinderElement,
    screenSurfaceElement,
    resizeOverlay,
  };
}
