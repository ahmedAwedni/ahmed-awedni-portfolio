/* ============================================================================
   AHMED AWEDNI — PORTFOLIO v3 CONTROLLER
   Act 1 (Gacha) → Act 2 (Diagonal Sheet) ⇄ Act 3 (Living Grimoire)
   ============================================================================ */

import { RPG_STATS, LOADOUT_ITEMS, ABILITIES, PROJECTS, TRANSLATIONS, CONTACT } from './i18n-data.js';
import { audioEngine } from './audio-engine.js';
import { AtmosphereEngine } from './atmosphere-canvas.js';
import { Grimoire } from './grimoire.js';
import { initAllArtifacts } from './artifacts-simulators.js';

const gsap = window.gsap;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const RUNE_GLYPHS = 'ᚠᚢᚦᚨᚱᚲᚷᚹᛉᛋᛏᛒᛖᛗᛚᛞ✦';

const ICONS = {
  Q: '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3 20 C10 9 30 9 37 20 C30 31 10 31 3 20Z"/><circle cx="20" cy="20" r="6.5"/><path d="M20 15.2 l1.5 3.3 3.3 1.5 -3.3 1.5 -1.5 3.3 -1.5 -3.3 -3.3 -1.5 3.3 -1.5z" fill="currentColor" stroke="none"/></svg>',
  W: '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><ellipse cx="20" cy="31" rx="15" ry="5"/><path d="M11 30 V20 h5 v10 M17.5 30 V13 h5 v17 M24 30 V23 h5 v7"/><path d="M20 3.5 v4 M11.5 6.5 l2.2 3 M28.5 6.5 l-2.2 3"/></svg>',
  R: '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M20 5 L34 13 L20 21 L6 13 Z"/><path d="M6 19.5 L20 27.5 L34 19.5"/><path d="M6 26 L20 34 L34 26"/><path d="M31 3 l1 2.4 2.4 1 -2.4 1 -1 2.4 -1 -2.4 -2.4 -1 2.4 -1z" fill="currentColor" stroke="none"/></svg>'
};

class PortfolioApp {
  constructor() {
    this.lang = localStorage.getItem('aa_lang') === 'en' ? 'en' : 'fr';
    this.scene = 'act1';
    this.busy = false;
    this.activeStat = 0;
    this.radarOn = false;
    this.inspector = localStorage.getItem('aa_inspector') === 'true';
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.atmosphere = new AtmosphereEngine($('#particle-canvas'), $('#fx-canvas'));
    this.atmosphere.setMode('fireflies');

    this.grimoire = new Grimoire({
      atmosphere: this.atmosphere,
      getLang: () => this.lang,
      onCloseRequest: () => this.closeGrimoire(),
      onInteract: () => {}
    });

    this.initHud();
    this.renderAbilities();
    this.renderStats();
    this.renderLoadout();
    this.grimoire.init();
    this.applyLang(false);
    this.initAct1();
    this.initAct2();
    this.initContact();
    this.initMedia();
    initAllArtifacts(() => this.unlockInspector());
    if (this.inspector) this.markInspector();
  }

  t(key) { return (TRANSLATIONS[this.lang] || TRANSLATIONS.fr)[key] ?? key; }
  isMobile() { return window.innerWidth <= 760; }
  setScene(name) {
    this.scene = name;
    document.body.classList.remove('is-act1', 'is-act2', 'is-act3');
    document.body.classList.add(`is-${name}`);
    $('#replay-intro-btn').hidden = name !== 'act2';
  }

  /* ========================================================================
     HUD — audio toggles, language shockwave
     ======================================================================== */
  initHud() {
    const sfx = $('#sfx-btn');
    const music = $('#music-btn');
    const sync = () => {
      sfx.setAttribute('aria-pressed', String(audioEngine.sfxEnabled));
      music.setAttribute('aria-pressed', String(audioEngine.musicEnabled));
      sfx.querySelector('.hud-state').textContent = audioEngine.sfxEnabled ? 'ON' : 'OFF';
      music.querySelector('.hud-state').textContent = audioEngine.musicEnabled ? 'ON' : 'OFF';
    };
    sfx.addEventListener('click', () => { audioEngine.setSfxEnabled(!audioEngine.sfxEnabled); sync(); });
    music.addEventListener('click', () => { audioEngine.setMusicEnabled(!audioEngine.musicEnabled); sync(); });
    sync();

    $('#lang-btn').addEventListener('click', (e) => {
      const r = e.currentTarget.getBoundingClientRect();
      const x = e.clientX || r.left + r.width / 2;
      const y = e.clientY || r.top + r.height / 2;
      this.lang = this.lang === 'fr' ? 'en' : 'fr';
      localStorage.setItem('aa_lang', this.lang);
      this.atmosphere.shockwave(x, y);
      this.spawnRings(x, y, true);
      audioEngine.playShockwavePulse();
      this.applyLang(true);
      this.toast(this.t('toast.lang'));
    });

    $('#replay-intro-btn').addEventListener('click', () => this.replayIntro());
    $('#hud-home').addEventListener('click', () => {
      if (this.scene === 'act3') this.closeGrimoire();
    });

    $$('.hud-pill, .gilded-btn, .ink-btn, .chip, .art-tab, .dock-btn, .corner').forEach((el) => {
      el.addEventListener('mouseenter', () => audioEngine.playHoverTick());
    });
  }

  spawnRings(x, y, astrolabe = false) {
    const make = (cls) => {
      const el = document.createElement('div');
      el.className = cls;
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1700);
    };
    if (astrolabe) make('astrolabe');
    make('shockwave-dom-ring');
    make('shockwave-dom-ring second');
  }

  /* ========================================================================
     I18N + runic cipher
     ======================================================================== */
  applyLang(animate) {
    const dict = TRANSLATIONS[this.lang];
    document.documentElement.lang = this.lang;
    $$('.lang-opt').forEach((o) => o.classList.toggle('is-on', o.dataset.lang === this.lang));

    $$('[data-i18n]').forEach((el) => {
      const val = dict[el.dataset.i18n];
      if (val == null) return;
      if (animate && !this.reduced && el instanceof HTMLElement && el.offsetParent !== null && getComputedStyle(el).visibility !== 'hidden') this.cipher(el, val);
      else el.textContent = val;
    });
    $$('[data-i18n-aria]').forEach((el) => el.setAttribute('aria-label', dict[el.dataset.i18nAria] || ''));
    $$('[data-i18n-proj]').forEach((el) => {
      const [slug, field] = el.dataset.i18nProj.split('.');
      const p = PROJECTS.find((x) => x.slug === slug);
      if (p) el.textContent = p[this.lang][field];
    });
    $$('.chapter[data-chapter]').forEach((el) => { el.textContent = `${this.lang === 'fr' ? 'Chapitre' : 'Chapter'} ${el.dataset.chapter}`; });

    this.renderAbilities();
    this.renderStats(true);
    this.renderLoadout();
    this.grimoire.renderToc();
    $('#radar-toggle span').textContent = this.t(this.radarOn ? 'a2.view_bars' : 'a2.view_radar');
    if (this.inspector) this.markInspector();
    document.dispatchEvent(new CustomEvent('langchange'));
  }

  cipher(el, finalStr) {
    const steps = 11;
    let step = 0;
    el.classList.add('cipher');
    clearInterval(el._cipher);
    el._cipher = setInterval(() => {
      step++;
      if (step >= steps) {
        el.textContent = finalStr;
        el.classList.remove('cipher');
        clearInterval(el._cipher);
        return;
      }
      const reveal = Math.floor(finalStr.length * (step / steps));
      let s = finalStr.slice(0, reveal);
      for (let i = reveal; i < Math.min(finalStr.length, reveal + 14); i++) {
        s += (finalStr[i] === ' ' || finalStr[i] === '\u00A0') ? finalStr[i] : RUNE_GLYPHS[Math.floor(Math.random() * RUNE_GLYPHS.length)];
      }
      el.textContent = s;
    }, 68);
  }

  toast(msg) {
    const stack = $('#toast-stack');
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    stack.appendChild(el);
    gsap.fromTo(el, { autoAlpha: 0, y: -12 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power3.out' });
    gsap.to(el, { autoAlpha: 0, y: -8, duration: 0.35, delay: 2.8, onComplete: () => el.remove() });
  }

  /* ========================================================================
     ACT 2 renderers — abilities, stats, radar, loadout
     ======================================================================== */
  renderAbilities() {
    const row = $('#ability-kit');
    const openKey = row.querySelector('.ability.is-open')?.dataset.key;
    row.innerHTML = '';
    ABILITIES.forEach((a) => {
      const c = a[this.lang];
      const tag = a.kind === 'passive' ? 'Q · P' : a.key;
      const wrap = document.createElement('div');
      wrap.className = `ability ${a.kind}${openKey === a.key ? ' is-open' : ''}`;
      wrap.dataset.key = a.key;
      const tipId = `tip-${a.key}`;
      wrap.innerHTML = `
        <button type="button" class="ability-btn" aria-describedby="${tipId}" aria-label="${c.name}">
          ${ICONS[a.key]}<span class="ability-key">${a.key}</span>
        </button>
        <div class="tooltip" role="tooltip" id="${tipId}">
          <div class="tooltip-head"><span class="tooltip-tag">${tag}</span><b>${c.name}</b></div>
          <p class="tooltip-type">${c.type}</p>
          <p class="tooltip-desc">${c.desc}</p>
        </div>`;
      const btn = wrap.querySelector('.ability-btn');
      btn.addEventListener('mouseenter', () => audioEngine.playHoverTick());
      btn.addEventListener('click', () => {
        const willOpen = !wrap.classList.contains('is-open');
        row.querySelectorAll('.ability').forEach((x) => x.classList.remove('is-open'));
        wrap.classList.toggle('is-open', willOpen);
        audioEngine.playClick();
      });
      row.appendChild(wrap);
    });
  }

  renderStats(keepWidths = false) {
    const list = $('#stat-list');
    list.innerHTML = '';
    RPG_STATS.forEach((s, i) => {
      const c = s[this.lang];
      const li = document.createElement('li');
      li.className = `stat${i === this.activeStat ? ' is-on' : ''}`;
      li.tabIndex = 0;
      li.innerHTML = `
        <span class="stat-code">${s.code}</span>
        <span class="stat-label">${c.label}</span>
        <span class="stat-score">${s.score}</span>
        <span class="stat-bar"><i style="width:${keepWidths || this.statsRevealed ? s.score : 0}%"></i></span>`;
      const pick = () => this.selectStat(i);
      li.addEventListener('mouseenter', pick);
      li.addEventListener('focus', pick);
      li.addEventListener('click', pick);
      list.appendChild(li);
    });
    let desc = $('#stat-desc');
    if (!desc) {
      desc = document.createElement('p');
      desc.id = 'stat-desc';
      desc.className = 'stat-desc';
      $('.stats-wrap').appendChild(desc);
    }
    desc.textContent = RPG_STATS[this.activeStat][this.lang].desc;
    this.drawRadar();
  }

  selectStat(i) {
    if (this.activeStat === i) return;
    this.activeStat = i;
    $$('#stat-list .stat').forEach((el, k) => el.classList.toggle('is-on', k === i));
    $('#stat-desc').textContent = RPG_STATS[i][this.lang].desc;
    this.drawRadar();
    audioEngine.playHoverTick();
  }

  revealStats() {
    this.statsRevealed = true;
    $$('#stat-list .stat-bar i').forEach((bar, i) => {
      gsap.fromTo(bar, { width: '0%' }, { width: `${RPG_STATS[i].score}%`, duration: 1.1, delay: 0.25 + i * 0.07, ease: 'power3.out' });
    });
  }

  drawRadar() {
    const svg = $('#radar-svg');
    const cx = 130; const cy = 130; const R = 88;
    const pt = (i, r) => {
      const a = (Math.PI * 2 * i) / 6 - Math.PI / 2;
      return [cx + Math.cos(a) * R * r, cy + Math.sin(a) * R * r];
    };
    let out = '';
    [0.33, 0.66, 1].forEach((lv) => {
      out += `<polygon points="${RPG_STATS.map((_, i) => pt(i, lv).join(',')).join(' ')}" fill="none" stroke="rgba(138,102,20,0.38)" stroke-width="1"/>`;
    });
    RPG_STATS.forEach((s, i) => {
      const [x, y] = pt(i, 1);
      const [lx, ly] = pt(i, 1.2);
      out += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="rgba(138,102,20,0.25)"/>`;
      out += `<text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="middle" font-family="Cinzel, serif" font-weight="700" font-size="${i === this.activeStat ? 13 : 11}" fill="${i === this.activeStat ? '#9e2a2b' : '#5b4632'}">${s.code}</text>`;
    });
    const pts = RPG_STATS.map((s, i) => pt(i, s.score / 100));
    out += `<polygon points="${pts.map((p) => p.join(',')).join(' ')}" fill="rgba(31,107,63,0.2)" stroke="#1f6b3f" stroke-width="2.4"/>`;
    pts.forEach(([x, y], i) => {
      out += `<circle cx="${x}" cy="${y}" r="${i === this.activeStat ? 6 : 4}" fill="${i === this.activeStat ? '#9e2a2b' : '#d4af37'}" stroke="#fbf3e2" stroke-width="1.5"/>`;
    });
    svg.innerHTML = out;
  }

  renderLoadout() {
    const row = $('#loadout-row');
    row.innerHTML = '';
    LOADOUT_ITEMS.forEach((g) => {
      const d = document.createElement('div');
      d.className = 'gear';
      d.innerHTML = `
        <button type="button" class="gear-btn" aria-label="${g.name}">${g.glyph}</button>
        <div class="gear-tip" role="tooltip"><b>${g.name}</b>${g[this.lang]}</div>`;
      d.querySelector('button').addEventListener('mouseenter', () => audioEngine.playHoverTick());
      row.appendChild(d);
    });
  }

  /* ========================================================================
     ACT 1 — GACHA CHEST
     ======================================================================== */
  initAct1() {
    $('#chest').addEventListener('click', () => this.playGacha());
    $('#open-chest-btn').addEventListener('click', () => this.playGacha());
    $('#skip-intro-btn').addEventListener('click', () => this.skipIntro());
    $('#open-chest-btn').classList.add('glint');
    gsap.set('.chest-rays', { '--rs': 1 });
    gsap.from('.gacha > *', { autoAlpha: 0, y: 20, duration: 0.8, stagger: 0.1, ease: 'power3.out', delay: 0.2 });
  }

  playGacha() {
    if (this.busy || this.scene !== 'act1') return;
    this.busy = true;
    audioEngine.ensureContext();
    const gacha = $('.gacha');
    const chest = $('#chest');
    gacha.classList.add('is-opening');
    chest.style.animation = 'none';
    $('#key-count').textContent = '0';

    const cr = chest.getBoundingClientRect();
    const cx = cr.left + cr.width / 2;
    const cy = cr.top + cr.height * 0.48;

    // Key flies into the keyhole
    const ki = $('#key-icon').getBoundingClientRect();
    const flyer = document.createElement('div');
    flyer.textContent = '🔑';
    Object.assign(flyer.style, { position: 'fixed', left: `${ki.left}px`, top: `${ki.top}px`, zIndex: 58, fontSize: '1.3rem', pointerEvents: 'none' });
    document.body.appendChild(flyer);

    const shake = { a: 0 };
    const tl = gsap.timeline({ onComplete: () => { this.busy = false; } });
    tl.to(flyer, { left: cr.left + cr.width * 0.69 - 10, top: cr.top + cr.height * 0.54 - 12, rotation: 200, scale: 0.7, duration: 0.32, ease: 'power2.in', onComplete: () => flyer.remove() }, 0)
      .to('#open-chest-btn, .gacha-rate, .gacha-keys', { autoAlpha: 0, y: 8, duration: 0.25 }, 0.05)
      .call(() => audioEngine.playChestCrescendo(), null, 0.3)
      .to(shake, {
        a: 1, duration: 0.95, ease: 'power2.in',
        onUpdate: () => {
          const now = performance.now();
          gsap.set(chest, { x: Math.sin(now / 16) * 9 * shake.a, y: Math.cos(now / 21) * 3 * shake.a, rotation: Math.sin(now / 24) * 3.2 * shake.a });
        }
      }, 0.3)
      .to('.chest-seam', { opacity: 1, scaleY: 3.2, duration: 0.95, ease: 'power2.in' }, 0.3)
      .to('.chest-halo', { opacity: 1, scale: 1.5, duration: 0.95, ease: 'power2.in' }, 0.3)
      .to('.chest-rays', { opacity: 1, '--rs': 1.7, duration: 0.95, ease: 'power2.in' }, 0.3)
      // 5★ beam
      .call(() => { audioEngine.playStarBurst(); this.atmosphere.burst(cx, cy, { count: 90, speed: 16 }); }, null, 1.24)
      .set('.wish-beam', { opacity: 1, bottom: window.innerHeight - cy }, 1.24)
      .fromTo('.wish-beam', { scaleY: 0 }, { scaleY: 1, duration: 0.42, ease: 'expo.out' }, 1.24)
      .fromTo('.wish-flash', { opacity: 0 }, { opacity: 0.92, duration: 0.1, ease: 'none' }, 1.24)
      .to('.wish-flash', { opacity: 0, duration: 0.55, ease: 'power2.out' }, 1.36)
      .to(gacha, { autoAlpha: 0, scale: 0.94, duration: 0.25 }, 1.28)
      .fromTo('.wish-stars svg', { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: 0.26, stagger: 0.07, ease: 'back.out(3)' }, 1.36)
      // Obsidian silhouette with golden aura
      .fromTo('.hero-silhouette', { autoAlpha: 0, scale: 0.9, y: 40 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.36, ease: 'power3.out' }, 1.5)
      .to('.wish-beam', { opacity: 0, duration: 0.45 }, 1.62)
      // Shockwave → Act 2
      .call(() => {
        this.atmosphere.shockwave(window.innerWidth / 2, window.innerHeight * 0.55, { runes: false });
        this.spawnRings(window.innerWidth / 2, window.innerHeight * 0.55);
        audioEngine.playShockwavePulse();
      }, null, 2.1)
      .to(['.hero-silhouette', '.wish-stars'], { autoAlpha: 0, scale: 1.12, duration: 0.35 }, 2.12)
      .add(this.revealAct2(), 2.12);
  }

  skipIntro() {
    if (this.busy || this.scene !== 'act1') return;
    this.busy = true;
    audioEngine.playClick();
    gsap.timeline({ onComplete: () => { this.busy = false; } })
      .to('#act1', { autoAlpha: 0, duration: 0.35 }, 0)
      .add(this.revealAct2(), 0.1);
  }

  revealAct2() {
    const tl = gsap.timeline();
    const fromClip = this.isMobile() ? 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)' : 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)';
    const toClip = this.isMobile() ? 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)' : 'polygon(0% 0%, 63% 0%, 37% 100%, 0% 100%)';
    tl.call(() => { this.setScene('act2'); this.atmosphere.setMode('meadow'); }, null, 0)
      .to('#act1', { autoAlpha: 0, duration: 0.3 }, 0)
      .to('.bg-act1', { autoAlpha: 0, duration: 0.5 }, 0)
      .set('.bg-act2', { autoAlpha: 1 }, 0)
      .fromTo('.bg-act2-right', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 0)
      .fromTo('.bg-act2-left', { clipPath: fromClip }, { clipPath: toClip, duration: 0.9, ease: 'power4.out', clearProps: 'clipPath' }, 0.05)
      .fromTo('.bg-act2-seam', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 0.55)
      .set('#act2', { autoAlpha: 1 }, 0.05)
      .fromTo('#a2-portrait', { autoAlpha: 0, y: 70 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out' }, 0.15)
      .fromTo('#a2-left > *', { autoAlpha: 0, x: -50 }, { autoAlpha: 1, x: 0, duration: 0.7, stagger: 0.07, ease: 'power3.out' }, 0.3)
      .fromTo('#a2-right > *', { autoAlpha: 0, x: 50 }, { autoAlpha: 1, x: 0, duration: 0.7, stagger: 0.05, ease: 'power3.out' }, 0.35)
      .call(() => this.revealStats(), null, 0.4)
      .fromTo('#dock', { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.5 }, 0.8);
    return tl;
  }

  replayIntro() {
    if (this.busy || this.scene !== 'act2') return;
    this.busy = true;
    audioEngine.playClick();
    const gacha = $('.gacha');
    gsap.timeline({
      onComplete: () => { this.busy = false; }
    })
      .to(['#act2', '.bg-act2', '#dock'], { autoAlpha: 0, duration: 0.45 }, 0)
      .call(() => {
        this.setScene('act1');
        this.atmosphere.setMode('fireflies');
        $('#key-count').textContent = '1';
        gacha.classList.remove('is-opening');
        gsap.set('#chest', { clearProps: 'transform' });
        $('#chest').style.animation = '';
        gsap.set(['.chest-seam', '.chest-halo', '.chest-rays'], { clearProps: 'opacity,transform' });
        gsap.set('.chest-rays', { '--rs': 1 });
        gsap.set(['.hero-silhouette', '.wish-stars'], { autoAlpha: 0, scale: 1 });
        gsap.set('.wish-stars svg', { opacity: 0 });
        gsap.set('.wish-beam', { opacity: 0, scaleY: 0 });
        gsap.set(gacha, { autoAlpha: 1, scale: 1 });
        gsap.set('#open-chest-btn, .gacha-rate, .gacha-keys', { autoAlpha: 1, y: 0 });
      }, null, 0.45)
      .to(['.bg-act1', '#act1'], { autoAlpha: 1, duration: 0.5 }, 0.45);
  }

  /* ========================================================================
     ACT 2 — parallax + grimoire CTA
     ======================================================================== */
  initAct2() {
    const act2 = $('#act2');
    const img = $('#a2-portrait img');
    const bg = $('.bg-act2-left-img');
    let raf = 0;
    act2.addEventListener('mousemove', (e) => {
      if (this.isMobile() || this.reduced) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const nx = (e.clientX / window.innerWidth) * 2 - 1;
        const ny = (e.clientY / window.innerHeight) * 2 - 1;
        img.style.setProperty('--tx', `${(nx * 14).toFixed(1)}px`);
        img.style.setProperty('--ty', `${(ny * 8).toFixed(1)}px`);
        img.style.setProperty('--ry', `${(nx * 5).toFixed(2)}deg`);
        bg.style.setProperty('--px', `${(-nx * 16).toFixed(1)}px`);
        bg.style.setProperty('--py', `${(-ny * 10).toFixed(1)}px`);
      });
    });

    $('#radar-toggle').addEventListener('click', (e) => {
      this.radarOn = !this.radarOn;
      e.currentTarget.setAttribute('aria-pressed', String(this.radarOn));
      $('#stat-list').hidden = this.radarOn;
      $('#radar-wrap').hidden = !this.radarOn;
      $('#radar-toggle span').textContent = this.t(this.radarOn ? 'a2.view_bars' : 'a2.view_radar');
      if (this.radarOn) gsap.fromTo('#radar-svg', { autoAlpha: 0, scale: 0.9 }, { autoAlpha: 1, scale: 1, duration: 0.45, ease: 'back.out(1.6)' });
      else this.revealStats();
      audioEngine.playClick();
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.ability')) $$('.ability.is-open').forEach((a) => a.classList.remove('is-open'));
    });

    $('#open-grimoire-btn').addEventListener('click', (e) => this.openGrimoire(e));
  }

  /* ========================================================================
     TRANSITION — the Grimoire Drop (Act 2 → Act 3) and its reverse
     ======================================================================== */
  buildGrimoireTimeline(originX, originY) {
    const mobile = this.isMobile();
    const book = $('#book');
    const block = $('#book-block');
    const cover = $('#cover-leaf');
    const stage = $('#book-stage');
    const wipe = $('#warm-wipe');
    const wx = ((originX / window.innerWidth) * 100).toFixed(1);
    const wy = ((originY / window.innerHeight) * 100).toFixed(1);
    const leftParts = mobile ? [] : ['#page-left', '.stack-left', '.spine-gutter'];
    const rightParts = mobile ? ['#page-left', '#page-right'] : ['#page-right', '.stack-right'];
    const D = this.reduced ? 0.01 : 1;

    const tl = gsap.timeline({ paused: true });
    const fwd = () => !tl.reversed();

    tl.set(wipe, { visibility: 'visible', autoAlpha: 1, clipPath: `circle(0% at ${wx}% ${wy}%)` }, 0)
      .to(wipe, { clipPath: `circle(150% at ${wx}% ${wy}%)`, duration: 0.6 * D, ease: 'power2.in' }, 0)
      .set(['#act2', '.bg-act2', '#replay-intro-btn'], { autoAlpha: 0 }, 0.6 * D)
      .set(['.bg-act3', '#act3'], { autoAlpha: 1 }, 0.6 * D)
      .set(book, { xPercent: mobile ? 0 : -25, y: -window.innerHeight * 1.15, rotation: -7, scale: 0.9 }, 0.6 * D)
      .set(cover, { autoAlpha: 1, rotationY: 0, z: 2 }, 0.6 * D)
      .set(block, { '--cover-o': 0 }, 0.6 * D)
      .set(rightParts, { autoAlpha: 0 }, 0.6 * D)
      .set(['#bookmarks', '#corner-prev', '#corner-next', '#mobile-nav'], { autoAlpha: 0 }, 0.6 * D)
      .call(() => {
        if (fwd()) { this.setScene('act3'); this.atmosphere.setMode('table', this.grimoire.theme()); }
        else { this.setScene('act2'); this.atmosphere.setMode('meadow'); }
      }, null, 0.6 * D)
      .to(wipe, { autoAlpha: 0, duration: 0.45 * D }, 0.66 * D);
    if (leftParts.length) tl.set(leftParts, { autoAlpha: 0 }, 0.6 * D);

    // Gravity drop + impact
    tl.to(book, { y: 0, rotation: 0, duration: 0.55 * D, ease: 'power4.in' }, 0.78 * D)
      .call(() => {
        if (!fwd()) { audioEngine.playPageTurn(); return; }
        audioEngine.playBookThud();
        const r = book.getBoundingClientRect();
        this.atmosphere.dustPuff(r.left + r.width * (mobile ? 0.5 : 0.75), r.bottom - 6, r.width * 0.5);
      }, null, 1.33 * D)
      .to(book, { scaleY: 0.86, duration: 0.07 * D, ease: 'power1.out' }, 1.33 * D)
      .to(book, { scaleY: 0.9, duration: 0.2 * D, ease: 'back.out(3)' }, 1.4 * D)
      .fromTo(stage, { x: 0, y: 0 }, { keyframes: [{ x: -7, y: 4 }, { x: 6, y: -3 }, { x: -3, y: 2 }, { x: 0, y: 0 }], duration: 0.3 * D, ease: 'none' }, 1.33 * D);

    // A crisp beat, then the cover swings open and the book zooms in
    const open = 1.92 * D;
    tl.call(() => { if (fwd()) audioEngine.playBookOpen(); else audioEngine.playBookThud(); }, null, open)
      .set(rightParts, { autoAlpha: 1 }, open);
    if (mobile) {
      tl.to(cover, { rotationY: -110, autoAlpha: 0, duration: 0.9 * D, ease: 'power2.inOut' }, open)
        .to(book, { scale: 1, duration: 0.9 * D, ease: 'power2.inOut' }, open);
    } else {
      tl.to(cover, { rotationY: -180, duration: 1.05 * D, ease: 'power2.inOut' }, open)
        .to(book, { xPercent: 0, scale: 1, duration: 1.05 * D, ease: 'power2.inOut' }, open)
        .to(block, { '--cover-o': 1, duration: 0.5 * D }, open + 0.45 * D)
        .set(leftParts, { autoAlpha: 1 }, open + 1.05 * D)
        .set(cover, { autoAlpha: 0 }, open + 1.05 * D);
    }
    tl.fromTo('#bookmarks', { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.45 * D, ease: 'power3.out' }, open + 0.85 * D)
      .to(['#corner-prev', '#corner-next', '#mobile-nav'], { autoAlpha: 1, duration: 0.35 * D }, open + 1.05 * D);
    return tl;
  }

  openGrimoire(e) {
    if (this.busy || this.scene !== 'act2') return;
    this.busy = true;
    audioEngine.playClick();
    const r = (e?.currentTarget || $('#open-grimoire-btn')).getBoundingClientRect();
    this.grimoire.prepareCover();
    this.grimoireTl?.kill();
    this.grimoireTl = this.buildGrimoireTimeline(r.left + r.width / 2, r.top + r.height / 2);
    this.grimoireTl.eventCallback('onComplete', () => { this.busy = false; });
    this.grimoireTl.timeScale(1).play(0);
  }

  closeGrimoire() {
    if (this.busy || this.scene !== 'act3' || !this.grimoireTl) return;
    this.busy = true;
    this.grimoire.prepareCover();
    document.getElementById('act3').scrollTo({ top: 0 });
    this.grimoireTl.eventCallback('onReverseComplete', () => {
      this.busy = false;
      gsap.set('#warm-wipe', { visibility: 'hidden' });
      gsap.set('#book-stage', { clearProps: 'transform' });
    });
    this.grimoireTl.timeScale(1.45).reverse();
  }

  /* ========================================================================
     CONTACT, ACHIEVEMENT, MEDIA
     ======================================================================== */
  initContact() {
    $$('[data-copy-email]').forEach((btn) => {
      btn.addEventListener('click', () => {
        navigator.clipboard?.writeText(CONTACT.email).catch(() => {});
        audioEngine.playAchievementChime();
        this.toast(this.t('toast.email'));
        this.unlockInspector();
      });
    });
  }

  unlockInspector() {
    if (this.inspector) return;
    this.inspector = true;
    localStorage.setItem('aa_inspector', 'true');
    this.markInspector();
    setTimeout(() => this.toast(this.t('toast.ach')), 500);
  }

  markInspector() {
    const feat = $('#feat-inspector');
    const st = $('#feat-inspector-state');
    feat?.classList.add('is-earned');
    if (st) { st.dataset.i18n = 'ach.unlocked'; st.textContent = this.t('ach.unlocked'); }
  }

  initMedia() {
    fetch('public/assets/media/manifest.json')
      .then((r) => (r.ok ? r.json() : { availableMedia: [] }))
      .then((data) => {
        const list = (data.availableMedia || []).map((p) => p.replace(/^\//, ''));
        $$('.media-video').forEach((v) => {
          const src = v.dataset.videoSrc;
          if (!list.includes(src)) return;
          v.src = src;
          v.addEventListener('loadeddata', () => v.classList.add('loaded'));
        });
      })
      .catch(() => {});
  }
}

window.addEventListener('DOMContentLoaded', () => {
  if (!window.gsap) {
    document.body.classList.add('no-gsap');
    console.error('GSAP failed to load');
    return;
  }
  window.portfolio = new PortfolioApp();
});
