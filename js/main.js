/* ============================================================================
   AHMED AWEDNI — MAIN PLAYABLE HUD CONTROLLER
   Coordinates RPG Character Sheet, Radar Chart, Shockwave i18n, Audio & Quests
   ============================================================================ */

import { RPG_STATS, LOADOUT_ITEMS, TRANSLATIONS } from './i18n-data.js';
import { audioEngine } from './audio-engine.js';
import { AtmosphereEngine } from './atmosphere-canvas.js';
import { initAllArtifacts } from './artifacts-simulators.js';

const CIPHER_GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ΔΣΩΨΛ⚡★";

class PortfolioHUDApp {
  constructor() {
    this.lang = localStorage.getItem('ahmed_hud_lang') || 'fr';
    this.activeStatIndex = 0;
    this.activeLoadoutIndex = 0;
    this.inspectorAchievementUnlocked = localStorage.getItem('ahmed_ach_inspector') === 'true';

    const atmoCanvas = document.getElementById('atmosphere-canvas');
    const shockCanvas = document.getElementById('shockwave-canvas');
    this.atmosphere = new AtmosphereEngine(atmoCanvas, shockCanvas);

    this.initTopBarControls();
    this.initPortraitInspect();
    this.renderRpgStatsAndRadar();
    this.renderLoadoutSlots();
    this.initQuestFiltersAndThemes();
    this.initMediaShowcases();
    this.initRecruiterDock();
    this.applyTranslations(false);

    initAllArtifacts(() => this.unlockInspectorAchievement());

    if (this.inspectorAchievementUnlocked) {
      this.markInspectorAchievementVisual();
    }
  }

  /* ==========================================================================
     1. TOP HUD BAR: AUDIO TOGGLES & SHOCKWAVE LANGUAGE SWITCHER
     ========================================================================== */
  initTopBarControls() {
    const sfxBtn = document.getElementById('sfx-toggle-btn');
    const musicBtn = document.getElementById('music-toggle-btn');
    const langBtn = document.getElementById('shockwave-lang-btn');

    const updateAudioButtons = () => {
      if (sfxBtn) {
        sfxBtn.setAttribute('aria-pressed', String(audioEngine.sfxEnabled));
        sfxBtn.innerHTML = `🔊 SFX: <span class="hud-btn-status">${audioEngine.sfxEnabled ? 'ON' : 'OFF'}</span>`;
      }
      if (musicBtn) {
        musicBtn.setAttribute('aria-pressed', String(audioEngine.musicEnabled));
        musicBtn.innerHTML = `🎵 MUSIC: <span class="hud-btn-status">${audioEngine.musicEnabled ? 'ON' : 'OFF'}</span>`;
      }
    };

    sfxBtn?.addEventListener('click', () => {
      audioEngine.setSfxEnabled(!audioEngine.sfxEnabled);
      updateAudioButtons();
    });

    musicBtn?.addEventListener('click', () => {
      audioEngine.setMusicEnabled(!audioEngine.musicEnabled);
      updateAudioButtons();
    });

    langBtn?.addEventListener('click', (e) => {
      const rect = langBtn.getBoundingClientRect();
      const originX = e.clientX || (rect.left + rect.width / 2);
      const originY = e.clientY || (rect.top + rect.height / 2);

      this.lang = this.lang === 'fr' ? 'en' : 'fr';
      localStorage.setItem('ahmed_hud_lang', this.lang);
      document.documentElement.lang = this.lang;

      this.atmosphere.triggerShockwave(originX, originY);
      this.spawnDomShockwaveRing(originX, originY);
      audioEngine.playShockwavePulse();

      this.applyTranslations(true);
      this.renderRpgStatsAndRadar();
      this.renderLoadoutSlots();
      if (this.inspectorAchievementUnlocked) {
        this.markInspectorAchievementVisual();
      }
    });

    updateAudioButtons();

    // Global subtle hover tick on interactive HUD elements
    document.querySelectorAll('.hud-btn, .quest-filter-btn, .dock-action-btn, .item-slot').forEach((el) => {
      el.addEventListener('mouseenter', () => audioEngine.playHoverTick());
    });
  }

  spawnDomShockwaveRing(x, y) {
    const ring = document.createElement('div');
    ring.className = 'shockwave-dom-ring';
    ring.style.left = `${x}px`;
    ring.style.top = `${y}px`;
    document.body.appendChild(ring);
    setTimeout(() => ring.remove(), 750);
  }

  /* ==========================================================================
     2. PORTRAIT 3D TILT & SCANNER RETICLE
     ========================================================================== */
  initPortraitInspect() {
    const wrapper = document.getElementById('portrait-inspect-wrapper');
    if (!wrapper) return;

    wrapper.addEventListener('mousemove', (e) => {
      const rect = wrapper.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      wrapper.style.setProperty('--mouse-x', `${x}%`);
      wrapper.style.setProperty('--mouse-y', `${y}%`);

      const tiltX = ((y - 50) / 50) * -4.5;
      const tiltY = ((x - 50) / 50) * 4.5;
      wrapper.style.transform = `perspective(700px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    });

    wrapper.addEventListener('mouseleave', () => {
      wrapper.style.transform = 'perspective(700px) rotateX(0deg) rotateY(0deg)';
    });
  }

  /* ==========================================================================
     3. RPG ATTRIBUTE BARS & 6-POINT HEXAGONAL RADAR CHART
     ========================================================================== */
  renderRpgStatsAndRadar() {
    const listEl = document.getElementById('rpg-stats-list');
    const tipEl = document.getElementById('radar-tooltip-readout');
    const svgEl = document.getElementById('rpg-radar-svg');
    if (!listEl || !svgEl) return;

    listEl.innerHTML = '';

    RPG_STATS.forEach((stat, idx) => {
      const copy = stat[this.lang] || stat.fr;
      const item = document.createElement('div');
      item.className = `stat-item ${idx === this.activeStatIndex ? 'active' : ''}`;
      item.setAttribute('tabindex', '0');
      item.innerHTML = `
        <div class="stat-header-line">
          <div class="stat-code-group">
            <span class="stat-tag">${stat.code}</span>
            <span class="stat-label-text">${copy.label}</span>
          </div>
          <span class="stat-value-num">${stat.score}/100</span>
        </div>
        <div class="stat-bar-outer">
          <div class="stat-bar-inner" style="width: ${stat.score}%;"></div>
        </div>
      `;

      const selectStat = () => {
        this.activeStatIndex = idx;
        listEl.querySelectorAll('.stat-item').forEach((el, i) => {
          el.classList.toggle('active', i === idx);
        });
        if (tipEl) {
          tipEl.innerHTML = `<strong style="color:var(--theme-primary-bright);font-family:var(--font-mono);">[${stat.code} — ${stat.score}/100]</strong> ${copy.desc}`;
        }
        this.drawHexRadar(svgEl, idx);
        audioEngine.playHoverTick();
      };

      item.addEventListener('mouseenter', selectStat);
      item.addEventListener('click', selectStat);
      item.addEventListener('focus', selectStat);
      listEl.appendChild(item);
    });

    const activeStat = RPG_STATS[this.activeStatIndex];
    const activeCopy = activeStat[this.lang] || activeStat.fr;
    if (tipEl) {
      tipEl.innerHTML = `<strong style="color:var(--theme-primary-bright);font-family:var(--font-mono);">[${activeStat.code} — ${activeStat.score}/100]</strong> ${activeCopy.desc}`;
    }
    this.drawHexRadar(svgEl, this.activeStatIndex);
  }

  drawHexRadar(svgEl, highlightIdx = 0) {
    const cx = 120;
    const cy = 120;
    const maxR = 84;
    const levels = [0.33, 0.66, 1.0];

    const pointAt = (idx, ratio) => {
      const angle = (Math.PI * 2 * idx) / 6 - Math.PI / 2;
      return {
        x: cx + Math.cos(angle) * maxR * ratio,
        y: cy + Math.sin(angle) * maxR * ratio
      };
    };

    let gridPolygons = '';
    levels.forEach((lvl) => {
      const pts = RPG_STATS.map((_, i) => {
        const p = pointAt(i, lvl);
        return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
      }).join(' ');
      gridPolygons += `<polygon points="${pts}" fill="none" stroke="rgba(212,175,55,0.22)" stroke-width="1" />`;
    });

    let axes = '';
    let labels = '';
    const statPoints = [];

    RPG_STATS.forEach((stat, i) => {
      const outer = pointAt(i, 1.0);
      const labelPos = pointAt(i, 1.22);
      const valPos = pointAt(i, stat.score / 100);
      statPoints.push(valPos);

      axes += `<line x1="${cx}" y1="${cy}" x2="${outer.x.toFixed(1)}" y2="${outer.y.toFixed(1)}" stroke="rgba(255,255,255,0.1)" stroke-width="1" />`;
      const isHighlighted = i === highlightIdx;
      labels += `
        <text x="${labelPos.x.toFixed(1)}" y="${labelPos.y.toFixed(1)}"
          text-anchor="middle" dominant-baseline="middle"
          fill="${isHighlighted ? '#f7d665' : '#c4bba8'}"
          font-family="JetBrains Mono, monospace"
          font-size="${isHighlighted ? '11' : '10'}"
          font-weight="700">${stat.code}</text>
      `;
    });

    const dataPolygonPts = statPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    const dots = statPoints.map((p, i) => `
      <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${i === highlightIdx ? 5.5 : 3.5}"
        fill="${i === highlightIdx ? '#ffffff' : '#f7d665'}"
        stroke="#d4af37" stroke-width="1.5" />
    `).join('');

    svgEl.innerHTML = `
      ${gridPolygons}
      ${axes}
      <polygon points="${dataPolygonPts}" fill="rgba(212, 175, 55, 0.28)" stroke="#f7d665" stroke-width="2" />
      ${dots}
      ${labels}
    `;
  }

  /* ==========================================================================
     4. EQUIPPED INVENTORY / LOADOUT SLOTS (6 TOOLS)
     ========================================================================== */
  renderLoadoutSlots() {
    const gridEl = document.getElementById('loadout-slots-grid');
    const detailEl = document.getElementById('loadout-tooltip-panel');
    if (!gridEl || !detailEl) return;

    gridEl.innerHTML = '';

    LOADOUT_ITEMS.forEach((item, idx) => {
      const slot = document.createElement('button');
      slot.type = 'button';
      slot.className = `item-slot ${idx === this.activeLoadoutIndex ? 'active' : ''}`;
      slot.innerHTML = `
        <span class="item-slot-icon">${item.icon}</span>
        <span class="item-slot-name">${item.name}</span>
        <span class="item-slot-tier">${item.tier}</span>
      `;

      const inspectItem = () => {
        this.activeLoadoutIndex = idx;
        gridEl.querySelectorAll('.item-slot').forEach((el, i) => {
          el.classList.toggle('active', i === idx);
        });
        detailEl.innerHTML = `
          <div>
            <strong style="color:var(--theme-primary-bright);font-family:var(--font-mono);">[${item.tier.toUpperCase()}] ${item.name} :</strong>
            <span style="color:var(--text-main);margin-left:0.4rem;">${item[this.lang] || item.fr}</span>
          </div>
          <span style="font-family:var(--font-mono);font-size:0.72rem;color:#4ade80;">EQUIPPED // SLOT 0${idx + 1}</span>
        `;
        audioEngine.playTabSwitch();
      };

      slot.addEventListener('click', inspectItem);
      slot.addEventListener('mouseenter', inspectItem);
      gridEl.appendChild(slot);
    });

    const initial = LOADOUT_ITEMS[this.activeLoadoutIndex];
    detailEl.innerHTML = `
      <div>
        <strong style="color:var(--theme-primary-bright);font-family:var(--font-mono);">[${initial.tier.toUpperCase()}] ${initial.name} :</strong>
        <span style="color:var(--text-main);margin-left:0.4rem;">${initial[this.lang] || initial.fr}</span>
      </div>
      <span style="font-family:var(--font-mono);font-size:0.72rem;color:#4ade80;">EQUIPPED // SLOT 0${this.activeLoadoutIndex + 1}</span>
    `;
  }

  /* ==========================================================================
     5. QUEST FILTER BAR & PROJECT-REACTIVE ATMOSPHERE TRIGGERS
     ========================================================================== */
  initQuestFiltersAndThemes() {
    const filterBtns = document.querySelectorAll('[data-quest-filter]');
    const questCards = document.querySelectorAll('.quest-card');
    const themeBtns = document.querySelectorAll('[data-activate-theme]');
    const atmoNameEl = document.getElementById('active-atmosphere-name');

    const updateAtmosphereReadout = (themeKey) => {
      this.atmosphere.setTheme(themeKey);
      if (atmoNameEl) {
        const dict = TRANSLATIONS[this.lang] || TRANSLATIONS.fr;
        const i18nKey = `hud.atmo_${themeKey}`;
        atmoNameEl.textContent = dict[i18nKey] || dict['hud.atmo_default'];
      }
    };

    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const category = btn.getAttribute('data-quest-filter');

        questCards.forEach((card) => {
          if (category === 'all') {
            card.classList.remove('hidden-by-filter');
          } else {
            const cats = (card.getAttribute('data-categories') || '').split(',');
            card.classList.toggle('hidden-by-filter', !cats.includes(category));
          }
        });
        audioEngine.playTabSwitch();
      });
    });

    themeBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const themeKey = btn.getAttribute('data-activate-theme');
        updateAtmosphereReadout(themeKey);
        audioEngine.playCardFlip();
      });
    });

    // Hover & Scroll Intersection reactivity for project cards
    questCards.forEach((card) => {
      const themeKey = card.getAttribute('data-project-theme');
      if (!themeKey) return;
      card.addEventListener('mouseenter', () => {
        updateAtmosphereReadout(themeKey);
      });
    });

    const heroSection = document.getElementById('hero-character-sheet');
    heroSection?.addEventListener('mouseenter', () => {
      updateAtmosphereReadout('default');
    });

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
              const themeKey = entry.target.getAttribute('data-project-theme') || 'default';
              updateAtmosphereReadout(themeKey);
            }
          });
        },
        { threshold: [0.35] }
      );
      if (heroSection) observer.observe(heroSection);
      questCards.forEach((c) => observer.observe(c));
    }
  }

  /* ==========================================================================
     6. PRE-WIRED LOCAL MEDIA SHOWCASE FRAMES
     ========================================================================== */
  initMediaShowcases() {
    fetch('/public/assets/media/manifest.json')
      .then((res) => (res.ok ? res.json() : { availableMedia: [] }))
      .then((data) => {
        const list = Array.isArray(data.availableMedia) ? data.availableMedia : [];
        document.querySelectorAll('.media-video-el').forEach((videoEl) => {
          const src = videoEl.getAttribute('data-video-src');
          if (src && list.includes(src)) {
            videoEl.src = src;
            videoEl.addEventListener('loadeddata', () => {
              videoEl.classList.add('loaded');
              const placeholder = videoEl.parentElement?.querySelector('.media-placeholder-visual');
              if (placeholder) placeholder.style.display = 'none';
            });
          }
        });
      })
      .catch(() => {});
  }

  /* ==========================================================================
     7. RECRUITER FAST-ACTION DOCK & +100 XP EMAIL TOAST
     ========================================================================== */
  initRecruiterDock() {
    const copyEmailBtn = document.getElementById('copy-email-btn');
    copyEmailBtn?.addEventListener('click', () => {
      const email = 'ahmed.awadni.jr@gmail.com';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).catch(() => {});
      }
      audioEngine.playAchievementChime();
      const dict = TRANSLATIONS[this.lang] || TRANSLATIONS.fr;
      this.showXpToast(dict['dock.toast_email']);
      this.unlockInspectorAchievement();
    });
  }

  showXpToast(message) {
    const container = document.getElementById('xp-toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'xp-toast';
    toast.innerHTML = `<span>🏆</span> <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 320);
    }, 3400);
  }

  unlockInspectorAchievement() {
    if (this.inspectorAchievementUnlocked) return;
    this.inspectorAchievementUnlocked = true;
    localStorage.setItem('ahmed_ach_inspector', 'true');
    this.markInspectorAchievementVisual();
    const msg = this.lang === 'fr'
      ? '🏆 SUCCÈS DÉVERROUILLÉ : Inspecteur de Systèmes (+100 XP) !'
      : '🏆 ACHIEVEMENT UNLOCKED: Systems Inspector (+100 XP)!';
    this.showXpToast(msg);
  }

  markInspectorAchievementVisual() {
    const badge = document.getElementById('ach-inspector-status');
    if (badge) {
      badge.textContent = this.lang === 'fr' ? '★ DÉVERROUILLÉ EN DIRECT (+100 XP)' : '★ LIVE UNLOCKED (+100 XP)';
      badge.style.color = '#4ade80';
    }
  }

  /* ==========================================================================
     8. SHOCKWAVE TEXT-CIPHER DECODE TRANSLATION ENGINE
     ========================================================================== */
  applyTranslations(animateCipher = false) {
    const dict = TRANSLATIONS[this.lang] || TRANSLATIONS.fr;

    // Update FR / EN button highlight
    const frSpan = document.getElementById('lang-indicator-fr');
    const enSpan = document.getElementById('lang-indicator-en');
    if (frSpan && enSpan) {
      frSpan.className = this.lang === 'fr' ? 'lang-active' : 'lang-inactive';
      enSpan.className = this.lang === 'en' ? 'lang-active' : 'lang-inactive';
    }

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      const targetText = dict[key];
      if (!targetText) return;

      const isHtml = targetText.includes('<');
      if (!animateCipher || isHtml) {
        el.innerHTML = targetText;
      } else {
        this.cipherDecodeElement(el, targetText);
      }
    });

    // Update atmosphere indicator text
    const atmoNameEl = document.getElementById('active-atmosphere-name');
    if (atmoNameEl) {
      const i18nKey = `hud.atmo_${this.atmosphere.currentTheme}`;
      atmoNameEl.textContent = dict[i18nKey] || dict['hud.atmo_default'];
    }
  }

  cipherDecodeElement(el, finalStr) {
    const duration = 280;
    const steps = 6;
    const intervalTime = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      if (step >= steps) {
        el.textContent = finalStr;
        clearInterval(timer);
        return;
      }
      const revealRatio = step / steps;
      const revealCount = Math.floor(finalStr.length * revealRatio);
      let scrambled = finalStr.slice(0, revealCount);
      const maxScramble = Math.min(finalStr.length, revealCount + 12);
      for (let i = revealCount; i < maxScramble; i++) {
        if (finalStr[i] === ' ') {
          scrambled += ' ';
        } else {
          scrambled += CIPHER_GLYPHS[Math.floor(Math.random() * CIPHER_GLYPHS.length)];
        }
      }
      el.textContent = scrambled;
    }, intervalTime);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.portfolioHUD = new PortfolioHUDApp();
});
