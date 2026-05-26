export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  clear() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  renderParticles(particles) {
    const ctx = this.ctx;

    for (const p of particles) {
      if (!p.active || p.alpha < 0.01) continue;

      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = `hsl(${p.hue}, ${p.sat}%, ${p.light}%)`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();

      if (p.size > 0.6 && p.alpha > 0.3) {
        ctx.globalAlpha = p.alpha * 0.5;
        ctx.fillStyle = `hsl(${p.hue}, ${p.sat}%, 92%)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.35, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.globalAlpha = 1;
  }
}
