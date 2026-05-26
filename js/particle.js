export class Particle {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = 0;
    this.y = 0;
    this.originX = 0;
    this.originY = 0;
    this.vx = 0;
    this.vy = 0;
    this.life = 0;
    this.maxLife = 0;
    this.size = 0;
    this.baseSize = 0;
    this.hue = 0;
    this.sat = 0;
    this.light = 0;
    this.alpha = 0;
    this.active = false;
    this.drift = 0;
  }

  init(x, y, opts = {}) {
    this.x = x;
    this.y = y;
    this.originX = x;
    this.originY = y;

    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 0.4 + 0.05;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;

    this.maxLife = Math.random() * 0.6 + 0.3;
    this.life = this.maxLife;

    this.baseSize = opts.size || 3;
    this.size = this.baseSize;

    this.hue = opts.hue ?? (Math.random() * 60 + 210);
    this.sat = opts.sat ?? (Math.random() * 30 + 70);
    this.light = opts.light ?? (Math.random() * 20 + 65);
    this.alpha = 1;
    this.drift = Math.random() * 0.3;
    this.active = true;
  }

  update(dt) {
    if (!this.active) return;

    this.x += this.vx;
    this.y += this.vy;

    this.vx *= 0.96;
    this.vy *= 0.96;

    this.life -= dt;
    const t = Math.max(0, this.life / this.maxLife);
    this.alpha = t * t;
    this.size = this.baseSize;

    if (this.life <= 0) {
      this.active = false;
    }
  }
}
