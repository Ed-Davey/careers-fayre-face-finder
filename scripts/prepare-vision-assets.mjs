import { cp, mkdir, readFile, stat } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

const wasmSource = new URL('../node_modules/@mediapipe/tasks-vision/wasm/', import.meta.url);
const visionDir = new URL('../public/vision/', import.meta.url);
const wasmDir = new URL('../public/vision/wasm/', import.meta.url);
const modelFile = new URL('../public/vision/face_detector_full_range.tflite', import.meta.url);
const modelUrl = 'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_full_range/float16/1/blaze_face_full_range.tflite';

const rootPackage = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const installedPackage = JSON.parse(await readFile(new URL('../node_modules/@mediapipe/tasks-vision/package.json', import.meta.url), 'utf8'));
const expectedVersion = rootPackage.dependencies['@mediapipe/tasks-vision'];
if (installedPackage.version !== expectedVersion) {
  throw new Error(`Installed @mediapipe/tasks-vision ${installedPackage.version}; expected ${expectedVersion}. Run npm install before building.`);
}

await mkdir(visionDir, { recursive: true });
await mkdir(wasmDir, { recursive: true });
await cp(wasmSource, wasmDir, { recursive: true, force: true });

let modelPresent = false;
try { modelPresent = (await stat(modelFile)).size > 100_000; } catch { /* first preparation */ }
if (!modelPresent) {
  console.log('Fetching the MediaPipe Tasks full-range face detector model for local bundling…');
  const response = await fetch(modelUrl);
  if (!response.ok || !response.body) throw new Error(`Model download failed: HTTP ${response.status}`);
  await pipeline(Readable.fromWeb(response.body), createWriteStream(modelFile));
}
console.log('Vision runtime and model are ready in public/vision/.');
