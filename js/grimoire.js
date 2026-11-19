/* ============================================================================
   THE LIVING GRIMOIRE — spreads, 3D page turns, fast-flip, TOC ink preview,
   bookmarks, table atmosphere and mobile single-page mode.
   ============================================================================ */

import { audioEngine } from './audio-engine.js';
import { PROJECTS } from './i18n-data.js';

const gsap = window.gsap;
const SPREADS = 7;
const FOLIOS = ['i · ii', '1 · 2', '3 · 4', '5 · 6', '7 · 8', '9 · 10', '11 · 12'];
const SPREAD_THEME = ['default', 'wise-battle', 'naruto', 'magic-words', 'balloon', 'locked-slot', 'default'];
const TINTS = {
  default: ['rgba(255, 196, 90, 0.22)', 'rgba(40, 24, 10, 0.55)'],
  'wise-battle': ['rgba(70, 190, 110, 0.42)', 'rgba(10, 42, 24, 0.62)'],
  naruto: ['rgba(255, 112, 40, 0.42)', 'rgba(70, 18, 8, 0.6)'],
  'magic-words': ['rgba(150, 95, 255, 0.45)', 'rgba(32, 14, 64, 0.62)'],
  balloon: ['rgba(90, 185, 255, 0.45)', 'rgba(10, 38, 70, 0.55)'],
  'locked-slot': ['rgba(40, 205, 145, 0.42)', 'rgba(6, 42, 32, 0.62)']
};

export class Grimoire {
  constructor({ atmosphere, getLang, onCloseRequest, onInteract }) {
    this.atmosphere = atmosphere;
    this.getLang = getLang;
    this.onCloseRequest = onCloseRequest;
    this.onInteract = onInteract;
    this.current = 0;
    this.busy = false;
    this.previewSlug = null;

    this.book = document.getElementById('book');
    this.leftInner = document.getElementById('page-left-inner');
    this.rightInner = document.getElementById('page-right-inner');
    this.flipLayer = document.getElementById('flip-layer');
    this.coverBack = document.getElementById('cover-back');
    this.prevCorner = document.getElementById('corner-prev');
    this.nextCorner = document.getElementById('corner-next');
    this.tint = document.querySelector('.bg-act3-tint');
  }

  init() {
    this.injectFiligree();
    this.renderToc();
    this.bindFilters();
    this.bindArtifactTabs();

    this.prevCorner.addEventListener('click', () => this.turnTo(this.current - 1));
    this.nextCorner.addEventListener('click', () => this.turnTo(this.current + 1));
    document.getElementById('m-prev').addEventListener('click', () => this.turnTo(this.current - 1));
    document.getElementById('m-next').addEventListener('click', () => this.turnTo(this.current + 1));
    document.getElementById('ink-open').addEventListener('click', () => {
      const p = PROJECTS.find((x) => x.slug === this.previewSlug);
      if (p) this.turnTo(p.spread, { fast: true });
    });

    document.querySelectorAll('[data-bookmark]').forEach((rb) => {
      rb.addEventListener('mouseenter', () => audioEngine.playHoverTick());
      rb.addEventListener('click', () => {
        const key = rb.dataset.bookmark;
        audioEngine.playBookmark();
        if (key === 'sheet') { this.onCloseRequest(); return; }
        const target = key === '6c' ? 6 : Number(key);
        if (target === this.current) {
          if (key === '6c') this.scrollToContact();
          return;
        }
        this.turnTo(target, { fast: Math.abs(target - this.current) > 1, then: key === '6c' ? () => this.scrollToContact() : null });
      });
    });

    // Keyboard page turning
    window.addEventListener('keydown', (e) => {
      if (!document.body.classList.contains('is-act3')) return;
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === 'ArrowRight') this.turnTo(this.current + 1);
      if (e.key === 'ArrowLeft') this.turnTo(this.current - 1);
    });

    // Swipe on touch screens
    const stage = document.getElementById('book-stage');
    let sx = 0; let sy = 0;
    stage.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    stage.addEventListener('touchend', (e) => {
      if (e.target.closest('input, .table-scroll, .code-scroll')) return;
      const dx = e.changedTouches[0].clientX - sx;
      const dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.6) this.turnTo(this.current + (dx < 0 ? 1 : -1));
    }, { passive: true });

    this.updateChrome();
  }

  isMobile() { return window.innerWidth <= 760; }
  theme() { return SPREAD_THEME[this.current]; }

  injectFiligree() {
    document.querySelectorAll('#page-left, #page-right').forEach((page) => {
      ['tl', 'tr', 'bl', 'br'].forEach((pos) => {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', `page-fili ${pos}`);
        svg.setAttribute('aria-hidden', 'true');
        const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
        use.setAttribute('href', '#filigree');
        svg.appendChild(use);
        page.insertBefore(svg, page.firstChild);
      });
    });
  }

  leafEl(spread, side) {
    return (side === 'left' ? this.leftInner : this.rightInner).querySelector(`.leaf[data-spread="${spread}"]`);
  }

  show(spread, side) {
    const inner = side === 'left' ? this.leftInner : this.rightInner;
    inner.querySelectorAll('.leaf').forEach((l) => l.classList.toggle('is-active', Number(l.dataset.spread) === spread));
    inner.scrollTop = 0;
  }

  setSpread(spread) {
    this.current = spread;
    this.show(spread, 'left');
    this.show(spread, 'right');
    this.updateChrome();
  }

  cloneLeaf(spread, side, scrollTop = 0) {
    const src = this.leafEl(spread, side);
    const inner = document.createElement('div');
    inner.className = 'page-inner';
    if (!src) return inner;
    const copy = src.cloneNode(true);
    copy.classList.add('is-active');
    copy.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
    copy.setAttribute('inert', '');
    inner.appendChild(copy);
    inner.dataset.scroll = String(scrollTop);
    return inner;
  }

  blankFace() {
    const d = document.createElement('div');
    d.className = 'blank-lines';
    return d;
  }

  makeLeaf(frontContent, backContent) {
    const leaf = document.createElement('div');
    leaf.className = 'leaf3d flip-leaf';
    const front = document.createElement('div');
    front.className = 'leaf-face front page-face front-face';
    const back = document.createElement('div');
    back.className = 'leaf-face back page-face';
    front.appendChild(frontContent || this.blankFace());
    back.appendChild(backContent || this.blankFace());
    [front, back].forEach((f) => {
      const shade = document.createElement('div');
      shade.className = 'leaf-shade';
      f.appendChild(shade);
    });
    leaf.append(front, back);
    this.flipLayer.appendChild(leaf);
    leaf.querySelectorAll('.page-inner').forEach((pi) => { pi.scrollTop = Number(pi.dataset.scroll || 0); });
    return leaf;
  }

  /* Fill the inside of the front cover with the current left page (used by open/close) */
  prepareCover() {
    this.coverBack.innerHTML = '';
    this.coverBack.appendChild(this.cloneLeaf(this.current, 'left', this.leftInner.scrollTop));
    const pi = this.coverBack.querySelector('.page-inner');
    if (pi) pi.scrollTop = Number(pi.dataset.scroll || 0);
  }

  turnTo(target, { fast = false, then = null } = {}) {
    if (this.busy || target < 0 || target >= SPREADS || target === this.current) return;
    this.onInteract?.('turn');
    const from = this.current;
    const dir = target > from ? 1 : -1;

    if (this.isMobile()) {
      this.busy = true;
      const block = document.getElementById('book-block');
      audioEngine.playPageTurn();
      gsap.timeline({ onComplete: () => { this.busy = false; then?.(); } })
        .to(block, { autoAlpha: 0, x: -dir * 40, duration: 0.2, ease: 'power2.in' })
        .call(() => {
          this.setSpread(target);
          document.getElementById('act3').scrollTo({ top: 0 });
        })
        .fromTo(block, { x: dir * 40 }, { autoAlpha: 1, x: 0, duration: 0.32, ease: 'power3.out' });
      return;
    }

    this.busy = true;
    const n = fast ? Math.min(5, Math.max(3, Math.abs(target - from) + 2)) : 1;
    const oldLeft = this.cloneLeaf(from, 'left', this.leftInner.scrollTop);
    const oldRight = this.cloneLeaf(from, 'right', this.rightInner.scrollTop);
    const newLeft = this.cloneLeaf(target, 'left');
    const newRight = this.cloneLeaf(target, 'right');

    const leaves = [];
    for (let i = 0; i < n; i++) {
      const first = i === 0;
      const last = i === n - 1;
      const leaf = dir > 0
        ? this.makeLeaf(first ? oldRight : null, last ? newLeft : null)
        : this.makeLeaf(last ? newRight : null, first ? oldLeft : null);
      leaves.push(leaf);
    }

    if (dir > 0) this.show(target, 'right');
    else this.show(target, 'left');

    if (fast) audioEngine.playPageFlip(n);
    else audioEngine.playPageTurn();

    const dur = fast ? 0.58 : 0.9;
    const stagger = fast ? 0.085 : 0;
    const tl = gsap.timeline({
      onComplete: () => {
        this.show(target, dir > 0 ? 'left' : 'right');
        this.current = target;
        this.flipLayer.innerHTML = '';
        this.updateChrome();
        this.busy = false;
        then?.();
      }
    });

    leaves.forEach((leaf, i) => {
      const fromY = dir > 0 ? 0 : -180;
      const toY = dir > 0 ? -180 : 0;
      gsap.set(leaf, { rotationY: fromY, zIndex: n - i });
      const shades = leaf.querySelectorAll('.leaf-shade');
      tl.to(leaf, {
        rotationY: toY,
        duration: dur,
        ease: 'power2.inOut',
        onUpdate() {
          const p = this.progress();
          leaf.style.zIndex = String(p < 0.5 ? n - i : n + i);
        }
      }, i * stagger);
      tl.to(shades, { keyframes: { opacity: [0, 0.9, 0] }, duration: dur, ease: 'none' }, i * stagger);
    });

    // Re-tint the table as we arrive
    tl.call(() => this.applyAtmosphere(SPREAD_THEME[target]), null, dur * 0.4);
  }

  applyAtmosphere(theme) {
    const [tint, edge] = TINTS[theme] || TINTS.default;
    if (this.tint) {
      this.tint.style.setProperty('--tint', tint);
      this.tint.style.setProperty('--edge', edge);
    }
    this.atmosphere.setTint(theme);
  }

  updateChrome() {
    this.prevCorner.classList.toggle('is-hidden', this.current === 0);
    this.nextCorner.classList.toggle('is-hidden', this.current === SPREADS - 1);
    document.querySelectorAll('[data-bookmark]').forEach((rb) => {
      const k = rb.dataset.bookmark;
      const on = (k === '0' && this.current === 0) || ((k === '6' || k === '6c') && this.current === 6);
      rb.classList.toggle('is-on', on);
    });
    const folio = document.getElementById('m-folio');
    if (folio) folio.textContent = FOLIOS[this.current];
    document.getElementById('m-prev').disabled = this.current === 0;
    document.getElementById('m-next').disabled = this.current === SPREADS - 1;
    this.applyAtmosphere(SPREAD_THEME[this.current]);
  }

  scrollToContact() {
    const title = document.getElementById('contact-title');
    if (this.isMobile() && title) title.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ------------------------------------------------------------ TOC */
  renderToc() {
    const lang = this.getLang();
    const list = document.getElementById('toc-list');
    list.innerHTML = '';
    PROJECTS.forEach((p) => {
      const li = document.createElement('li');
      li.className = 'toc-item';
      li.dataset.cats = p.categories.join(',');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'toc-btn';
      btn.dataset.slug = p.slug;
      btn.innerHTML = `
        <span class="toc-num">${p.numeral}</span>
        <span class="toc-text"><b>${p.title}</b><i>${p[lang].kind}</i></span>
        <span class="toc-page">${p.spread * 2 - 1}</span>`;
      const preview = () => this.renderPreview(p.slug);
      btn.addEventListener('mouseenter', () => { preview(); audioEngine.playHoverTick(); });
      btn.addEventListener('focus', preview);
      btn.addEventListener('click', () => this.turnTo(p.spread, { fast: true }));
      li.appendChild(btn);
      list.appendChild(li);
    });
    this.applyFilter(this.activeFilter || 'all', false);
    if (this.previewSlug) this.renderPreview(this.previewSlug, false);
  }

  bindFilters() {
    document.querySelectorAll('#toc-filters .chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('#toc-filters .chip').forEach((c) => c.classList.toggle('is-on', c === chip));
        this.applyFilter(chip.dataset.filter, true);
        audioEngine.playClick();
      });
    });
  }

  applyFilter(filter, animate) {
    this.activeFilter = filter;
    const items = [...document.querySelectorAll('#toc-list .toc-item')];
    const visible = [];
    items.forEach((li) => {
      const ok = filter === 'all' || li.dataset.cats.split(',').includes(filter);
      li.hidden = !ok;
      if (ok) visible.push(li);
    });
    document.getElementById('toc-empty').hidden = visible.length > 0;
    if (animate && visible.length) gsap.fromTo(visible, { autoAlpha: 0, x: -10 }, { autoAlpha: 1, x: 0, duration: 0.35, stagger: 0.05, ease: 'power2.out' });
  }

  renderPreview(slug, animate = true) {
    const p = PROJECTS.find((x) => x.slug === slug);
    if (!p) return;
    const lang = this.getLang();
    const changed = this.previewSlug !== slug;
    this.previewSlug = slug;
    document.querySelectorAll('.toc-btn').forEach((b) => b.classList.toggle('is-hover', b.dataset.slug === slug));
    document.getElementById('ink-idle').hidden = true;
    const card = document.getElementById('ink-card');
    card.hidden = false;
    document.getElementById('ink-emblem-use').setAttribute('href', `#em-${p.slug}`);
    document.getElementById('ink-chapter').textContent = `${lang === 'fr' ? 'Chapitre' : 'Chapter'} ${p.numeral}`;
    document.getElementById('ink-title').textContent = p.title;
    document.getElementById('ink-kind').textContent = p[lang].kind;
    document.getElementById('ink-pitch').textContent = p[lang].pitch;
    document.getElementById('ink-skills').innerHTML = p.skills.map((s) => `<span>${s}</span>`).join('');
    if (animate && changed) {
      const emblem = document.getElementById('ink-emblem');
      card.classList.remove('ink-reveal');
      emblem.classList.remove('drawing');
      void card.offsetWidth;
      card.classList.add('ink-reveal');
      emblem.classList.add('drawing');
    }
  }

  bindArtifactTabs() {
    document.querySelectorAll('.art-tabs').forEach((tabs) => {
      const leaf = tabs.closest('.leaf');
      tabs.querySelectorAll('.art-tab').forEach((tab) => {
        tab.addEventListener('click', () => {
          tabs.querySelectorAll('.art-tab').forEach((t) => t.classList.toggle('is-on', t === tab));
          leaf.querySelectorAll('.artifact').forEach((a) => a.classList.toggle('is-on', a.dataset.artPanel === tab.dataset.art));
          audioEngine.playBookmark();
        });
      });
    });
  }
}
