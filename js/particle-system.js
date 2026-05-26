import { Particle } from './particle.js';

const HAND_CONNECTIONS = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [5,9],[9,10],[10,11],[11,12],
  [9,13],[13,14],[14,15],[15,16],
  [13,17],[17,18],[18,19],[19,20],
  [0,17]
];

const PALM_POINTS = [0, 1, 2, 5, 9, 13, 17];

export class ParticleSystem {
  constructor(maxParticles = 15000) {
    this.maxParticles = maxParticles;
    this.pool = [];
    this.active = [];

    for (let i = 0; i < maxParticles; i++) {
      this.pool.push(new Particle());
    }
  }

  _alloc() {
    if (this.pool.length === 0) {
      const oldest = this.active.shift();
      if (oldest) {
        oldest.reset();
        this.pool.push(oldest);
      }
    }
    return this.pool.pop() || null;
  }

  emit(x, y, opts = {}) {
    const p = this._alloc();
    if (p) {
      p.init(x, y, opts);
      this.active.push(p);
    }
  }

  emitLine(x1, y1, x2, y2, density = 1.2, opts = {}) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.max(1, Math.floor(dist / density));

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = x1 + dx * t + (Math.random() - 0.5) * 2;
      const y = y1 + dy * t + (Math.random() - 0.5) * 2;
      this.emit(x, y, opts);
    }
  }

  emitHand(points, canvasW, canvasH, fresh = true) {
    if (!points || points.length < 21) return;

    const pts = points.map(p => ({
      x: p.x * canvasW,
      y: p.y * canvasH
    }));

    const baseHue = 220 + Math.sin(Date.now() * 0.001) * 30;
    const layers = fresh ? 3 : 1;

    for (let layer = 0; layer < layers; layer++) {
      const hueOff = layer * 12;

      for (const [a, b] of HAND_CONNECTIONS) {
        this.emitLine(pts[a].x, pts[a].y, pts[b].x, pts[b].y, 1, {
          hue: baseHue + hueOff + Math.random() * 20 - 10,
          sat: 85,
          light: 70 + layer * 5
        });
      }

      for (let i = 0; i < PALM_POINTS.length; i++) {
        for (let j = i + 1; j < PALM_POINTS.length; j++) {
          const a = pts[PALM_POINTS[i]];
          const b = pts[PALM_POINTS[j]];
          this.emitLine(a.x, a.y, b.x, b.y, 2.5, {
            hue: baseHue + hueOff + 15 + Math.random() * 15,
            sat: 75,
            light: 65 + layer * 5
          });
        }
      }

      for (const pt of pts) {
        for (let k = 0; k < 4; k++) {
          this.emit(pt.x + (Math.random() - 0.5) * 8, pt.y + (Math.random() - 0.5) * 8, {
            hue: baseHue + hueOff + 35 + Math.random() * 20,
            sat: 90,
            light: 78 + layer * 4
          });
        }
      }
    }
  }

  update(dt) {
    for (let i = this.active.length - 1; i >= 0; i--) {
      const p = this.active[i];
      p.update(dt);

      if (!p.active) {
        p.reset();
        this.pool.push(p);
        this.active.splice(i, 1);
      }
    }
  }

  getActiveParticles() {
    return this.active;
  }

  clear() {
    while (this.active.length > 0) {
      const p = this.active.pop();
      p.reset();
      this.pool.push(p);
    }
  }
}
