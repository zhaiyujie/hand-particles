import { HandLandmarker, FilesetResolver } from "./vision_bundle.mjs";

export class HandTracker {
  constructor(videoElement, onResults) {
    this.video = videoElement;
    this.onResults = onResults;
    this.handLandmarker = null;
    this.running = false;
    this.prevHands = [];
    this.detectInterval = 3;
    this.frameCount = 0;
  }

  async init() {
    const vision = await FilesetResolver.forVisionTasks(
      "./wasm"
    );

    this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: "./models/hand_landmarker.task",
        delegate: "GPU"
      },
      runningMode: "VIDEO",
      numHands: 2,
      minHandDetectionConfidence: 0.5,
      minHandPresenceConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 320, height: 240, facingMode: "user" }
    });
    this.video.srcObject = stream;

    await new Promise((resolve) => {
      this.video.onloadeddata = resolve;
    });

    this.running = true;
    this._loop();
  }

  _loop() {
    if (!this.running) return;

    this.frameCount++;

    if (this.frameCount % this.detectInterval === 0) {
      const now = performance.now();
      const results = this.handLandmarker.detectForVideo(this.video, now);

      const handsData = [];

      if (results.landmarks && results.landmarks.length > 0) {
        for (let i = 0; i < results.landmarks.length; i++) {
          const landmarks = results.landmarks[i];
          const handedness = results.handednesses[i][0];

          const points = landmarks.map((lm) => ({
            x: 1 - lm.x,
            y: lm.y,
            z: lm.z
          }));

          handsData.push({
            points,
            label: handedness.categoryName,
            score: handedness.score
          });
        }
      }

      this.prevHands = handsData;
      this.onResults(handsData, true);
    } else {
      this.onResults(this.prevHands, false);
    }

    requestAnimationFrame(() => this._loop());
  }

  stop() {
    this.running = false;
    if (this.video.srcObject) {
      this.video.srcObject.getTracks().forEach(t => t.stop());
    }
  }
}
