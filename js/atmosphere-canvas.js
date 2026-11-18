/* ============================================================================
   DYNAMIC PROJECT-REACTIVE ATMOSPHERE ENGINE & RADIAL SHOCKWAVE RENDERER
   60fps HTML5 Canvas Particle + Grid + Rune System
   ============================================================================ */

const THEME_CONFIGS = {
  "default": {
    bgGlow: "rgba(212, 175, 55, 0.08)",
    gridColor: "rgba(212, 175, 55, 0.035)",
    colors: ["#d4af37", "#f7d665", "#b8860b", "#ffffff"],
    mode: "embers"
  },
  "wise-battle": {
    bgGlow: "rgba(44, 229, 155, 0.09)",
    gridColor: "rgba(44, 229, 155, 0.04)",
    colors: ["#2ce59b", "#d4af37", "#6ee7b7", "#fef08a"],
    mode: "arcane-sparks"
  },
  "naruto": {
    bgGlow: "rgba(255, 107, 26, 0.10)",
    gridColor: "rgba(255, 107, 26, 0.06)",
    colors: ["#ff6b1a", "#ff9e44", "#ef4444", "#fde047"],
    mode: "chakra-grid"
  },
  "magic-words": {
    bgGlow: "rgba(181, 101, 255, 0.11)",
    gridColor: "rgba(181, 101, 255, 0.045)",
    colors: ["#b565ff", "#5ce1e6", "#e879f9", "#c084fc"],
    mode: "letter-runes"
  },
  "balloon": {
    bgGlow: "rgba(56, 189, 248, 0.10)",
    gridColor: "rgba(56, 189, 248, 0.045)",
    colors: ["#38bdf8", "#f4b942", "#7dd3fc", "#e0f2fe"],
    mode: "wind-streams"
  },
  "locked-slot": {
    bgGlow: "rgba(16, 185, 129, 0.10)",
    gridColor: "rgba(16, 185, 129, 0.075)",
    colors: ["#10b981", "#6ee7b7", "#34d399", "#a7f3d0"],
    mode: "blueprint-pulse"
  }
};

const RUNE_LETTERS = ["A", "E", "I", "O", "U", "W", "Z", "M", "R", "S", "K", "V"];

export class AtmosphereEngine {
  constructor(atmoCanvas, shockCanvas) {
    this.canvas = atmoCanvas;
    this.ctx = atmoCanvas.getContext("2d");
    this.shockCanvas = shockCanvas;
    this.shockCtx = shockCanvas.getContext("2d");

    this.currentTheme = "default";
    this.particles = [];
    this.shockwaves = [];
    this.scanPhase = 0;

    this.resize();
    window.addEventListener("resize", () => this.resize());
    this.initParticles(58);
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    [this.canvas, this.shockCanvas].forEach((c) => {
      c.width = this.width * dpr;
      c.height = this.height * dpr;
      const ctx = c.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    });
  }

  setTheme(themeKey) {
    const validKey = THEME_CONFIGS[themeKey] ? themeKey : "default";
    if (this.currentTheme === validKey) return;
    this.currentTheme = validKey;

    if (validKey === "default") {
      document.body.removeAttribute("data-theme");
    } else {
      document.body.setAttribute("data-theme", validKey);
    }

    const cfg = THEME_CONFIGS[validKey];
    this.particles.forEach((p) => {
      p.color = cfg.colors[Math.floor(Math.random() * cfg.colors.length)];
    });
  }

  initParticles(count) {
    this.particles = [];
    const cfg = THEME_CONFIGS[this.currentTheme];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: 1.5 + Math.random() * 2.8,
        vx: (Math.random() - 0.5) * 0.45,
        vy: -0.35 - Math.random() * 0.65,
        alpha: 0.2 + Math.random() * 0.65,
        color: cfg.colors[i % cfg.colors.length],
        letter: RUNE_LETTERS[i % RUNE_LETTERS.length],
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  triggerShockwave(originX, originY) {
    const maxRadius = Math.hypot(
      Math.max(originX, this.width - originX),
      Math.max(originY, this.height - originY)
    ) * 1.15;

    this.shockwaves.push({
      x: originX,
      y: originY,
      radius: 8,
      maxRadius,
      alpha: 1
    });
  }

  animate() {
    this.renderAtmosphere();
    this.renderShockwaves();
    requestAnimationFrame(this.animate);
  }

  renderAtmosphere() {
    const ctx = this.ctx;
    const cfg = THEME_CONFIGS[this.currentTheme] || THEME_CONFIGS["default"];
    ctx.clearRect(0, 0, this.width, this.height);

    this.scanPhase += 0.015;

    // 1. Ambient radial light aura
    const grad = ctx.createRadialGradient(
      this.width * 0.5,
      this.height * 0.28,
      20,
      this.width * 0.5,
      this.height * 0.4,
      Math.max(this.width, this.height) * 0.68
    );
    grad.addColorStop(0, cfg.bgGlow);
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.width, this.height);

    // 2. Tactical Grid / Blueprint Overlay for Naruto & Locked Slot
    if (cfg.mode === "chakra-grid" || cfg.mode === "blueprint-pulse") {
      const step = cfg.mode === "blueprint-pulse" ? 48 : 64;
      ctx.strokeStyle = cfg.gridColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < this.width; x += step) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, this.height);
      }
      for (let y = 0; y < this.height; y += step) {
        ctx.moveTo(0, y);
        ctx.lineTo(this.width, y);
      }
      ctx.stroke();

      if (cfg.mode === "blueprint-pulse") {
        const pulseY = ((this.scanPhase * 90) % this.height);
        ctx.strokeStyle = "rgba(16, 185, 129, 0.22)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, pulseY);
        ctx.lineTo(this.width, pulseY);
        ctx.stroke();
      }
    }

    // 3. Render Theme-Specific Particles
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.phase += 0.025;

      if (cfg.mode === "wind-streams") {
        p.x += 1.4 + p.size * 0.35;
        p.y += Math.sin(p.phase) * 0.35;
      } else {
        p.x += p.vx + Math.sin(p.phase) * 0.22;
        p.y += p.vy;
      }

      if (p.y < -20) p.y = this.height + 20;
      if (p.y > this.height + 20) p.y = -20;
      if (p.x < -20) p.x = this.width + 20;
      if (p.x > this.width + 20) p.x = -20;

      ctx.save();
      ctx.globalAlpha = p.alpha * (0.65 + 0.35 * Math.sin(p.phase));
      ctx.fillStyle = p.color;
      ctx.strokeStyle = p.color;

      if (cfg.mode === "letter-runes") {
        ctx.font = `700 ${Math.round(10 + p.size * 2)}px "Cinzel", serif`;
        ctx.fillText(p.letter, p.x, p.y);
      } else if (cfg.mode === "wind-streams") {
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - 18 - p.size * 4, p.y);
        ctx.stroke();
      } else if (cfg.mode === "arcane-sparks") {
        // Diamond spark
        const r = p.size * 1.3;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y - r);
        ctx.lineTo(p.x + r, p.y);
        ctx.lineTo(p.x, p.y + r);
        ctx.lineTo(p.x - r, p.y);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  renderShockwaves() {
    const ctx = this.shockCtx;
    ctx.clearRect(0, 0, this.width, this.height);
    if (this.shockwaves.length === 0) return;

    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += Math.max(24, (sw.maxRadius - sw.radius) * 0.095);
      const progress = sw.radius / sw.maxRadius;
      sw.alpha = Math.max(0, 1 - progress);

      ctx.save();
      // Outer Golden Shockwave Ring
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(247, 214, 101, ${sw.alpha * 0.9})`;
      ctx.lineWidth = 6 * sw.alpha + 1.5;
      ctx.shadowColor = "#f7d665";
      ctx.shadowBlur = 24;
      ctx.stroke();

      // Secondary Arcane Echo Ring
      if (sw.radius > 45) {
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius * 0.82, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(56, 189, 248, ${sw.alpha * 0.55})`;
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }
      ctx.restore();

      if (sw.radius >= sw.maxRadius * 0.98) {
        this.shockwaves.splice(i, 1);
      }
    }
  }
}
