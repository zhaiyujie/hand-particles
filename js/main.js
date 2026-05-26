import { HandTracker } from './hand-tracker.js';
import { ParticleSystem } from './particle-system.js';
import { Renderer } from './renderer.js';

const canvas = document.getElementById('canvas');
const video = document.getElementById('video');
const status = document.getElementById('status');

const renderer = new Renderer(canvas);
const particleSystem = new ParticleSystem(15000);

let lastTime = performance.now();
let fps = 0;
let frameCount = 0;
let fpsTime = 0;

function onHandResults(handsData, fresh) {
  status.textContent = handsData.length > 0
    ? `Tracking ${handsData.length} hand(s) | Particles: ${particleSystem.getActiveParticles().length} | FPS: ${fps}`
    : 'Show your hand to the camera...';

  for (const hand of handsData) {
    particleSystem.emitHand(hand.points, canvas.width, canvas.height, fresh);
  }
}

const tracker = new HandTracker(video, onHandResults);

async function init() {
  status.textContent = 'Loading hand tracking model...';

  try {
    await tracker.init();
    status.textContent = 'Ready! Show your hand to the camera.';
    requestAnimationFrame(gameLoop);
  } catch (err) {
    status.textContent = `Error: ${err.message}`;
    console.error('Failed to initialize:', err);
  }
}

function gameLoop(timestamp) {
  const dt = (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  frameCount++;
  fpsTime += dt;
  if (fpsTime >= 1) {
    fps = frameCount;
    frameCount = 0;
    fpsTime -= 1;
  }

  particleSystem.update(dt);

  renderer.clear();
  renderer.renderParticles(particleSystem.getActiveParticles());

  requestAnimationFrame(gameLoop);
}

init();
