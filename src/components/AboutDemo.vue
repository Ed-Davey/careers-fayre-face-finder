<script setup lang="ts">
const repository = 'https://github.com/Ed-Davey/careers-fayre-face-finder';
</script>

<template>
  <section class="about-demo" aria-label="About this demo">
    <details class="info-details">
      <summary>Privacy and personal data</summary>
      <div class="info-content">
        <h2>Camera images stay on this device</h2>
        <p>
          Camera frames and per-frame face detections are processed in browser memory.
          The app does not record, save or upload images or detections to an application
          server or Google. The live preview is visible to people looking at this screen.
          Stopping the camera stops its video tracks and clears the preview and detection boxes.
        </p>
        <p>
          No microphone is requested. There is no first-party backend or database, identity matching,
          face enrolment, age estimation or emotion estimation. The count is an estimate of faces
          in the current frame, not a count of unique visitors. Turned-away, hidden or missed faces
          may not be counted.
        </p>
        <h2>Usage telemetry goes to Google</h2>
        <p>
          MediaPipe Tasks Vision 1.0.1 separately sends aggregate usage and performance metrics to
          Google's logging service (odml.pa.googleapis.com): the FaceDetector task, VIDEO mode,
          SDK version, broad operating-system family, inference totals and timings.
          The payload contains no camera images, video frames, face boxes or displayed face count.
          Google also receives normal connection metadata, such as the source IP address and
          request time. The app has no telemetry opt-out.
        </p>
        <p>
          The app, font, logos, runtime and model are served from the app's own origin;
          in the local Docker setup this is the same computer. Local hosting does not block
          Google's separate telemetry requests. Once installed and built, detection can run
          offline; telemetry cannot reach Google without an internet connection.
          External links only open when you choose to follow them.
        </p>
        <p>
          Explain camera use and obtain consent before including someone in view.
          Local processing does not remove that responsibility. This describes app behaviour,
          not a claim of GDPR compliance.
        </p>
        <p>
          <a :href="`${repository}/blob/main/README.md#security-and-data-flow`" target="_blank" rel="noopener noreferrer">Data-flow diagrams</a>
          ·
          <a :href="`${repository}/blob/main/THIRD_PARTY_NOTICES.md`" target="_blank" rel="noopener noreferrer">Third-party notices and privacy details</a>
        </p>
      </div>
    </details>

    <details class="info-details">
      <summary>AI and the code behind this demo</summary>
      <div class="info-content">
        <h2>AI in the demo</h2>
        <p>
          Google's MediaPipe runs BlazeFace, a specialist machine-vision neural network, in your
          browser to locate faces. This is AI, but it is not a large language model (LLM) or a chatbot.
          It detects where faces are, not who people are. This face-counting demo is not the
          Salto XS4 Face recognition product linked from the logo.
        </p>
        <ol class="process-flow" aria-label="Face-counting process">
          <li>Camera supplies a video frame</li>
          <li>BlazeFace predicts face locations</li>
          <li>The app counts boxes and draws them over the preview</li>
          <li>Repeat about every 300 milliseconds</li>
        </ol>
        <h2>AI used to build the app</h2>
        <p>
          Development was agent-driven, with strong CI/CD rules and both human and AI review.
          AI coding agents helped create and change the program; the face detector itself uses
          a pre-trained specialist neural network, not LLM-generated predictions.
          The proportion of AI-written code has not been measured, so we do not claim a percentage.
          AI assistance still needs testing and review: generated code and wording can be wrong.
        </p>
        <h2>AI at Salto</h2>
        <p>
          A company example is face recognition using machine vision and a specialist neural
          network, rather than an LLM. Recognition and this demo's detection/counting are different
          tasks; this demo does not identify visitors.
        </p>
        <p class="code-links">
          <a :href="repository" target="_blank" rel="noopener noreferrer">Explore the source on GitHub</a>
          <a :href="`${repository}/blob/main/src/composables/useFaceCounter.ts`" target="_blank" rel="noopener noreferrer">Read the camera and detection code</a>
          <a :href="`${repository}/blob/main/README.md#camera-start-detection-and-stop`" target="_blank" rel="noopener noreferrer">See the process flowcharts</a>
        </p>
      </div>
    </details>
  </section>
</template>
