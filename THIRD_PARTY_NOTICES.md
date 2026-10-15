# Third-party notices

The app bundles the following runtime components so they are served locally at run time.

## MediaPipe Tasks Vision

- Package: [`@mediapipe/tasks-vision`](https://www.npmjs.com/package/@mediapipe/tasks-vision), version 1.0.1 (the version pinned in `package.json`).
- License: Apache License 2.0, as declared in the package metadata. The package's WASM runtime files are copied from the installed package into `public/vision/wasm/` during `npm run build`.
- Source: [MediaPipe](https://github.com/google-ai-edge/mediapipe).

## BlazeFace full-range face detector model

- Model: `blaze_face_full_range/float16/1`, from the [MediaPipe face detector model collection](https://developers.google.com/edge/mediapipe/solutions/vision/face_detector).
- License: Apache License 2.0, as stated in the [BlazeFace full-range model card](https://storage.googleapis.com/mediapipe-assets/MediaPipe%20BlazeFace%20Model%20Card%20(Full%20Range).pdf).
- Model file: `public/vision/face_detector_full_range.tflite`, downloaded from the published model URL by `scripts/prepare-vision-assets.mjs`.

The model and library are used only for face detection. The app does not identify people, create face templates, or retain detections or images.
