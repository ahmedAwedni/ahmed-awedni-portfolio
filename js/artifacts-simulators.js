/* ============================================================================
   INTERACTIVE GAME DESIGN ARTIFACTS (bilingual FR / EN)
   Faithful to the real mechanics of Wise Battle, Naruto: The Board Game,
   Magic Words and Balloon of the Countries.
   ============================================================================ */

import { audioEngine } from './audio-engine.js';

const C = { ok: '#1F6B3F', bad: '#9E2A2B', warn: '#9A6A12' };
const EN = () => document.documentElement.lang === 'en';
const T = (fr, en) => (EN() ? en : fr);
const rerenders = [];

export function initAllArtifacts(unlockCb) {
  initWiseBattle(unlockCb);
  initNaruto(unlockCb);
  initMagicWords(unlockCb);
  initBalloon(unlockCb);
  initQuest05(unlockCb);
  document.addEventListener('langchange', () => rerenders.forEach((fn) => fn()));
}

/* ============================================================================
   WISE BATTLE
   ============================================================================ */
function initWiseBattle(unlock) {
  const s = { turn: 1, energy: 25, t: 12, outcome: 'correct', p2Aid: false, timeBuff: 0, unlocked: true, log: null };
  const $ = (id) => document.getElementById(id);
  const slider = $('wb-time-slider');
  if (!slider) return;
  const outcomeBtns = document.querySelectorAll('[data-wb-outcome]');
  const actionBtns = document.querySelectorAll('[data-wb-action]');

  const maxT = () => (s.timeBuff > 0 ? 40 : 30);
  const delta = () => {
    if (s.outcome === 'correct') return Math.max(1, maxT() - Math.min(s.t, maxT()));
    if (s.outcome === 'wrong') return -15;
    return 0;
  };
  const defaultLog = () => T(`Tour ${s.turn} prêt — phase de quiz active (minuteur max ${maxT()} s).`, `Turn ${s.turn} ready — quiz phase active (max timer ${maxT()}s).`);

  function render() {
    slider.max = String(maxT());
    if (s.t > maxT()) s.t = maxT();
    $('wb-time-val').textContent = `${s.t}s`;
    $('wb-max-timer').textContent = `${maxT()}s${s.timeBuff > 0 ? T(' (+10 s Sort du Temps)', ' (+10s Time Spell)') : ''}`;
    const d = delta();
    const dv = $('wb-delta-val');
    dv.textContent = d > 0 ? `+${d} E` : `${d} E`;
    dv.style.color = d > 0 ? C.ok : d < 0 ? C.bad : C.warn;
    $('wb-energy-val').textContent = `${s.energy} / 100 E`;
    $('wb-energy-bar').style.width = `${Math.max(0, Math.min(100, s.energy))}%`;
    $('wb-turn-count').textContent = `${s.turn} / 30`;
    const ph = $('wb-phase-state');
    if (s.outcome === 'correct' && s.unlocked) { ph.textContent = T('Débloquée', 'Unlocked'); ph.style.color = C.ok; }
    else if (s.outcome === 'wrong') { ph.textContent = T('Verrouillée (−15 E)', 'Locked (−15 E)'); ph.style.color = C.bad; }
    else { ph.textContent = T('Tour perdu (0 E)', 'Turn forfeited (0 E)'); ph.style.color = C.warn; }
    const aid = $('wb-p2-aid-btn');
    aid.classList.toggle('active', s.p2Aid);
    aid.textContent = s.p2Aid ? T('Aide J2 : ON (+15 E au tour 1)', 'P2 Aid: ON (+15E on turn 1)') : T('Aide J2 : OFF (J1 par défaut)', 'P2 Aid: OFF (P1 default)');
    actionBtns.forEach((b) => { b.disabled = !(s.unlocked && s.outcome === 'correct' && s.energy >= Number(b.dataset.cost || 0)); });
    $('wb-sim-log').textContent = s.log ? s.log() : defaultLog();
  }

  slider.addEventListener('input', () => { s.t = Number(slider.value); audioEngine.playHoverTick(); unlock(); render(); });
  outcomeBtns.forEach((b) => b.addEventListener('click', () => {
    outcomeBtns.forEach((x) => x.classList.toggle('active', x === b));
    s.outcome = b.dataset.wbOutcome;
    s.unlocked = s.outcome === 'correct';
    audioEngine.playClick(); unlock(); render();
  }));
  $('wb-p2-aid-btn').addEventListener('click', () => {
    s.p2Aid = !s.p2Aid;
    s.energy = s.p2Aid ? Math.min(100, s.energy + 15) : Math.max(0, s.energy - 15);
    const on = s.p2Aid;
    s.log = () => (on
      ? T('Second Player Aid activé : le Joueur 2 reçoit +15 Énergie au tour 1 pour compenser l’initiative du J1.', 'Second Player Aid on: Player 2 gets +15 Energy on turn 1 to offset P1 initiative.')
      : T('Second Player Aid désactivé : énergie de base au tour 1.', 'Second Player Aid off: standard turn 1 energy.'));
    audioEngine.playClick(); unlock(); render();
  });
  $('wb-resolve-quiz-btn').addEventListener('click', () => {
    const d = delta();
    const t = s.t;
    s.energy = Math.min(100, Math.max(0, s.energy + d));
    if (s.outcome === 'correct') {
      s.unlocked = true;
      s.log = () => T(`Quiz résolu en ${t} s : +${d} Énergie. Choisissez une action.`, `Quiz solved in ${t}s: +${d} Energy. Pick an action.`);
    } else {
      s.unlocked = false;
      s.turn = Math.min(30, s.turn + 1);
      const turn = s.turn;
      s.log = s.outcome === 'wrong'
        ? () => T(`Mauvaise réponse : −15 Énergie et phase d’action verrouillée. Tour ${turn}.`, `Wrong answer: −15 Energy and action phase locked. Turn ${turn}.`)
        : () => T(`Minuteur écoulé : +0 Énergie, tour perdu. Tour ${turn}.`, `Timer ran out: +0 Energy, turn lost. Turn ${turn}.`);
    }
    audioEngine.playCardFlip(); unlock(); render();
  });
  actionBtns.forEach((b) => b.addEventListener('click', () => {
    const cost = Number(b.dataset.cost || 0);
    if (s.energy < cost) return;
    const act = b.dataset.wbAction;
    const turn = s.turn;
    s.energy -= cost;
    if (act === 'timespell') {
      s.timeBuff = 3;
      s.log = () => T(`Tour ${turn} : Sort du Temps d’Aleric (−30 E) — minuteur porté à 40 s pour 3 tours.`, `Turn ${turn}: Aleric's Time Spell (−30E) — timer raised to 40s for 3 turns.`);
    } else {
      if (s.timeBuff > 0) s.timeBuff--;
      const e = s.energy;
      s.log = {
        attack: () => T(`Tour ${turn} : attaque de base (−20 E).`, `Turn ${turn}: basic attack (−20E).`),
        defend: () => T(`Tour ${turn} : garde levée (−10 E), le prochain coup est atténué.`, `Turn ${turn}: guard raised (−10E), next hit is mitigated.`),
        pass: () => T(`Tour ${turn} : passe (0 E) — ${e} E en réserve pour une compétence unique.`, `Turn ${turn}: pass (0E) — banking ${e}E for a unique skill.`)
      }[act];
    }
    s.turn = Math.min(30, s.turn + 1);
    audioEngine.playCardFlip(); unlock(); render();
  }));
  $('wb-reset-sim-btn').addEventListener('click', () => {
    Object.assign(s, { turn: 1, energy: s.p2Aid ? 40 : 25, timeBuff: 0, unlocked: true, outcome: 'correct', log: null });
    outcomeBtns.forEach((x) => x.classList.toggle('active', x.dataset.wbOutcome === 'correct'));
    audioEngine.playClick(); render();
  });
  render();
  rerenders.push(render);

  /* Artifact B — roster */
  const HEROES = {
    galios: { hp: 100,
      fr: { name: 'Galios — le Chevalier (tank d’usure)', atk: '25 DÉG (20 E)', def: '15 Bouclier (10 E)', skill: 'Heurt de Bouclier (50 E)', desc: 'Inflige 15 dégâts avec 50 % de chances d’ÉTOURDIR : l’adversaire perd son prochain tour.', syn: 'Ses PV et sa défense élevés lui permettent d’accumuler l’énergie sur plusieurs tours pour placer un étourdissement décisif à 50 E.' },
      en: { name: 'Galios — the Knight (attrition tank)', atk: '25 DMG (20E)', def: '15 Shield (10E)', skill: 'Shield Slam (50E)', desc: 'Deals 15 damage with a 50% chance to STUN: the enemy loses their next turn.', syn: 'High HP and defense let Galios bank energy over several turns to land a game-swinging 50E stun.' } },
    pokey: { hp: 90,
      fr: { name: 'Pokey — l’Assassin (canon de verre)', atk: '30 DÉG (20 E)', def: '10 Bouclier (10 E)', skill: "Assaut de l’Assassin (35 E)", desc: '+10 ATQ pendant 3 tours consécutifs (attaques de base à 40 dégâts).', syn: 'Punit les joueurs lents : 35 E de buff puis trois attaques à 20 E = 120 dégâts en rafale si l’on répond vite.' },
      en: { name: 'Pokey — the Assassin (glass cannon)', atk: '30 DMG (20E)', def: '10 Shield (10E)', skill: "Assassin's Rush (35E)", desc: '+10 ATK for 3 consecutive turns (basic attacks hit for 40).', syn: 'Punishes slow players: a 35E buff then three 20E attacks deal 120 burst damage if answered fast.' } },
    aleric: { hp: 80,
      fr: { name: 'Aleric — le Mage chronomancien (utilitaire)', atk: '35 DÉG (20 E)', def: '5 Bouclier (10 E)', skill: 'Sort du Temps (30 E)', desc: '+10 secondes au minuteur du quiz pendant 3 tours (40 s max).', syn: 'Il manipule directement l’économie du quiz : +10 s de minuteur, c’est jusqu’à +10 Énergie par tour (+30 E sur la durée).' },
      en: { name: 'Aleric — the Chronomancer mage (utility)', atk: '35 DMG (20E)', def: '5 Shield (10E)', skill: 'Time Spell (30E)', desc: '+10 seconds on the quiz timer for 3 turns (40s max).', syn: 'Directly bends the quiz economy: +10s of timer is up to +10 Energy per turn (+30E over the buff).' } }
  };
  let hero = 'galios';
  let codeOpen = false;
  const tabs = document.querySelectorAll('[data-wb-hero]');
  const codeBtn = $('wb-code-toggle-btn');
  function renderHero() {
    const h = HEROES[hero];
    const c = EN() ? h.en : h.fr;
    $('wb-hero-title').textContent = c.name;
    $('wb-hero-hp').textContent = `${h.hp} ${T('PV', 'HP')}`;
    $('wb-hero-atk').textContent = c.atk;
    $('wb-hero-def').textContent = c.def;
    $('wb-hero-skill-name').textContent = c.skill;
    $('wb-hero-skill-desc').textContent = c.desc;
    $('wb-hero-synergy').textContent = c.syn;
    codeBtn.textContent = codeOpen
      ? T('Masquer l’architecture C# ▲', 'Hide the C# architecture ▲')
      : T('Inspecter l’architecture C# (ScriptableObject & BaseSkill) ▼', 'Inspect the C# architecture (ScriptableObject & BaseSkill) ▼');
  }
  tabs.forEach((tab) => tab.addEventListener('click', () => {
    tabs.forEach((t) => t.classList.toggle('active', t === tab));
    hero = tab.dataset.wbHero;
    renderHero(); audioEngine.playClick(); unlock();
  }));
  codeBtn.addEventListener('click', () => {
    codeOpen = !codeOpen;
    $('wb-code-drawer').hidden = !codeOpen;
    renderHero(); audioEngine.playClick(); unlock();
  });
  renderHero();
  rerenders.push(renderHero);
}

/* ============================================================================
   NARUTO: THE BOARD GAME
   ============================================================================ */
function initNaruto(unlock) {
  const $ = (id) => document.getElementById(id);
  const slider = $('naruto-party-power-slider');
  if (!slider) return;
  const TILES = {
    1: { fr: ['Case 1 — Ligne de départ (fin de tour de plateau)', 'Rapporte +1000 SP (mode Normal) ou +1500 SP (Guerre des Shinobis) et permet d’échanger entre l’équipe active (3 max en main) et la réserve (2 max).'],
      en: ['Tile 1 — Starting line (lap completion)', 'Grants +1000 SP (Normal) or +1500 SP (Shinobis War) and allows swapping between the active party (max 3 in hand) and the reserve (max 2).'] },
    4: { fr: ['Case 4 — Village de la Feuille 1 (territoire)', 'Achat : 100 SP · Défense du lieu : 35. Un adversaire qui s’y arrête ne paie le péage que si la puissance totale de son équipe active est inférieure à 35.'],
      en: ['Tile 4 — Hidden Leaf Village 1 (territory)', 'Cost: 100 SP · Location defense: 35. A rival landing here only pays the toll if their active party power is below 35.'] },
    6: { fr: ['Cases 6, 16, 26, 36 — Les 4 Bureaux des Kage', 'Citadelles d’angle : bonus de fin de partie, échanges d’urgence entre équipe active et réserve, et progression vers la victoire par les Bureaux des Kage.'],
      en: ['Tiles 6, 16, 26, 36 — The 4 Kage Offices', 'Corner citadels: end-game buffs, emergency party swaps, and progress toward the Kage Office victory.'] },
    8: { fr: ['Case 8 — Pioche Shinobi', 'Recrute une nouvelle carte Shinobi pour élargir les combinaisons de l’équipe active (3) ou de la réserve (2).'],
      en: ['Tile 8 — Shinobi Draw', 'Recruit a new Shinobi card to widen the combos of the active party (3) or reserve (2).'] },
    9: { fr: ['Case 9 — Quêtes secondaires (3 max)', 'Pioche une quête à objectif (3 en main au maximum) qui rapporte SP et récompenses tactiques une fois accomplie.'],
      en: ['Tile 9 — Side Quests (max 3)', 'Draw an objective-driven quest (max 3 held) that pays SP and tactical rewards once completed.'] },
    11: { fr: ['Cases 11 et 31 — Pièges Genjutsu', 'Cases d’illusion à haut risque : elles perturbent le déplacement, drainent les SP ou forcent un test défensif.'],
      en: ['Tiles 11 & 31 — Genjutsu Traps', 'High-risk illusion tiles that disrupt movement, drain SP or force a defensive check.'] },
    21: { fr: ['Case 21 — Pioche Légendaire (11+ aux 2D6)', 'Sanctuaire de recrutement d’élite : il faut faire 11 ou 12 aux 2D6 pour obtenir un Shinobi légendaire.'],
      en: ['Tile 21 — Legendary Draw (11+ on 2D6)', 'Elite recruitment sanctum: roll 11 or 12 on 2D6 to unlock a Legendary Shinobi.'] }
  };
  let tile = 1;
  let roll = null;
  const tileBtns = document.querySelectorAll('[data-naruto-tile]');
  function renderTile() {
    const [title, rule] = TILES[tile][EN() ? 'en' : 'fr'];
    $('naruto-tile-title').textContent = title;
    $('naruto-tile-rule').textContent = rule;
    const r = $('naruto-2d6-result');
    if (!roll) { r.textContent = ''; return; }
    const { d1, d2 } = roll;
    const sum = d1 + d2;
    r.textContent = sum >= 11
      ? T(`${d1} + ${d2} = ${sum} (≥ 11) → Shinobi légendaire obtenu !`, `${d1} + ${d2} = ${sum} (≥ 11) → Legendary Shinobi unlocked!`)
      : T(`${d1} + ${d2} = ${sum} (< 11) → le sanctuaire reste scellé.`, `${d1} + ${d2} = ${sum} (< 11) → the sanctum stays sealed.`);
    r.style.color = sum >= 11 ? C.ok : C.warn;
  }
  tileBtns.forEach((b) => b.addEventListener('click', () => {
    tileBtns.forEach((x) => x.classList.toggle('active', x === b));
    tile = Number(b.dataset.narutoTile);
    renderTile(); audioEngine.playClick(); unlock();
  }));
  function renderToll() {
    const p = Number(slider.value);
    $('naruto-party-power-val').textContent = `${p} ${T('PUIS', 'PWR')}`;
    const out = $('naruto-toll-result');
    if (p < 35) { out.textContent = T(`Puissance ${p} < défense 35 → péage payé (−100 SP)`, `Power ${p} < defense 35 → toll paid (−100 SP)`); out.style.color = C.bad; }
    else { out.textContent = T(`Puissance ${p} ≥ défense 35 → territoire franchi (0 SP)`, `Power ${p} ≥ defense 35 → territory breached (0 SP)`); out.style.color = C.ok; }
  }
  slider.addEventListener('input', () => { audioEngine.playHoverTick(); renderToll(); unlock(); });
  $('naruto-roll-2d6-btn').addEventListener('click', () => {
    roll = { d1: 1 + Math.floor(Math.random() * 6), d2: 1 + Math.floor(Math.random() * 6) };
    if (roll.d1 + roll.d2 >= 11) audioEngine.playAchievementChime(); else audioEngine.playCardFlip();
    renderTile(); unlock();
  });
  renderTile(); renderToll();
  rerenders.push(renderTile, renderToll);

  /* Artifact B — blind combat */
  const defenders = [
    { name: 'Shikamaru', role: { fr: 'Tacticien des ombres', en: 'Shadow tactician' }, hp: 55 },
    { name: 'Gaara', role: { fr: 'Égide de sable', en: 'Sand aegis' }, hp: 80 },
    { name: 'Hinata', role: { fr: 'Éclaireuse Byakugan', en: 'Byakugan scout' }, hp: 60 }
  ];
  let sakura = false;
  const revealed = [false, false, false];
  let last = null;
  const cards = document.querySelectorAll('[data-blind-card]');
  const sakuraBtn = $('naruto-sakura-passive-btn');
  function renderCards() {
    sakuraBtn.classList.toggle('active', sakura);
    sakuraBtn.textContent = sakura ? T('Passif « Healthy Dice » de Sakura : ON', "Sakura's Healthy Dice passive: ON") : T('Passif « Healthy Dice » de Sakura : OFF', "Sakura's Healthy Dice passive: OFF");
    cards.forEach((el, i) => {
      const d = defenders[i];
      if (!revealed[i]) {
        el.classList.remove('revealed');
        el.style.borderColor = '';
        el.innerHTML = `<span style="font-size:1.5rem;color:#ecd27a;">✦</span><strong style="font-family:var(--f-display);font-size:0.82rem;">${T('Carte cachée', 'Face-down')} #${i + 1}</strong><span style="font-size:0.8rem;opacity:0.85;">${T('Frapper avec le Chidori (60)', 'Strike with Chidori (60)')}</span>`;
        return;
      }
      const lethal = (d.lethalWith ?? 60) >= d.hp;
      el.classList.add('revealed');
      el.style.borderColor = lethal ? C.ok : C.warn;
      el.innerHTML = `<strong style="font-family:var(--f-display);font-size:0.86rem;color:${lethal ? C.ok : C.warn};">${d.name}</strong><span style="font-size:0.8rem;font-style:italic;">${d.role[EN() ? 'en' : 'fr']}</span><span style="font-size:0.82rem;">${d.hp} PV · ${d.lethalWith >= 999 ? T('coup fatal', 'fatal blow') : '60 DMG'}</span><span style="font-size:0.8rem;font-weight:700;color:${lethal ? C.ok : C.bad};">${lethal ? T('Éliminé', 'Eliminated') : T('Survit → PV restaurés', 'Survives → HP reset')}</span>`;
    });
    const out = $('naruto-combat-readout');
    if (last == null) {
      out.textContent = T('Choisissez l’une des 3 cartes cachées de l’équipe adverse et frappez avec le Chidori de Kakashi (60 dégâts, portée 1 case).', "Pick one of the defender's 3 face-down cards and strike with Kakashi's Chidori (60 damage, 1-tile range).");
    } else {
      const d = defenders[last];
      const lethal = d.lethalWith >= d.hp;
      out.textContent = lethal
        ? T(`Élimination ! ${d.name} (${d.hp} PV) tombe en un seul tour.`, `Elimination! ${d.name} (${d.hp} HP) falls in a single turn.`)
        : T(`${d.name} (${d.hp} PV) encaisse 60 dégâts et récupère tous ses PV en fin de tour : il faut un combo ou le passif de Sakura pour achever les tanks.`, `${d.name} (${d.hp} HP) takes 60 damage and heals to full at end of turn: you need a combo or Sakura's passive to finish tanks.`);
    }
  }
  sakuraBtn.addEventListener('click', () => { sakura = !sakura; audioEngine.playClick(); unlock(); renderCards(); });
  cards.forEach((el, i) => {
    const hit = () => {
      defenders[i].lethalWith = sakura ? 999 : 60;
      revealed[i] = true;
      last = i;
      audioEngine.playCardFlip(); unlock(); renderCards();
    };
    el.addEventListener('click', hit);
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); hit(); } });
  });
  $('naruto-reset-cards-btn').addEventListener('click', () => {
    defenders.sort(() => Math.random() - 0.5);
    revealed.fill(false);
    last = null;
    audioEngine.playClick(); renderCards();
  });
  renderCards();
  rerenders.push(renderCards);
}

/* ============================================================================
   MAGIC WORDS
   ============================================================================ */
function initMagicWords(unlock) {
  const $ = (id) => document.getElementById(id);
  const slider = $('mw-length-slider');
  if (!slider) return;
  const TABLE = {
    3: { word: 'ARC', atk: 12, heal: 10, fr: 'Mots de 3 lettres : le soin (10) talonnait l’attaque (12), d’où les duels interminables avant le rééquilibrage.', en: 'Short 3-letter words: the heal (10) nearly matched the attack (12), which caused endless duels before the rebalance.' },
    4: { word: 'FIRE', atk: 20, heal: 14, fr: '4 lettres : l’attaque (20) prend 42 % d’avance sur le soin (14).', en: '4 letters: the attack (20) pulls 42% ahead of the heal (14).' },
    5: { word: 'FLAME', atk: 32, heal: 18, fr: 'Seuil des 5 lettres : l’offensive dépasse nettement le soin et récompense le vocabulaire.', en: '5-letter breakpoint: offense clearly outscales healing and rewards vocabulary.' },
    6: { word: 'ARCANE', atk: 48, heal: 22, fr: '6 lettres : 48 dégâts écrasent le soin plafonné (22).', en: '6 letters: 48 damage crushes the capped heal (22).' },
    7: { word: 'GRIMOIRE', atk: 68, heal: 25, fr: '7 lettres et plus : 68 dégâts contre 25 de soin, un finisher décisif.', en: '7+ letters: 68 damage vs. 25 heal, a decisive finisher.' },
    8: { word: 'ARCHMAGE', atk: 92, heal: 28, fr: '8 lettres et plus : 92 dégâts, le mot mythique qui retourne un duel.', en: '8+ letters: 92 damage, the mythic word that turns a duel.' }
  };
  function render() {
    const len = Number(slider.value);
    const d = TABLE[len];
    $('mw-length-val').textContent = T(`${len} lettres`, `${len} letters`);
    $('mw-sample-word').textContent = `« ${d.word} »`;
    $('mw-atk-val').textContent = `${d.atk} ${T('DÉG', 'DMG')}`;
    $('mw-heal-val').textContent = `+${d.heal} ${T('PV', 'HP')}`;
    $('mw-ratio-val').textContent = `${(d.atk / d.heal).toFixed(2)}×`;
    $('mw-scaling-note').textContent = EN() ? d.en : d.fr;
    const m = $('mw-svg-marker');
    const x = 30 + (len - 3) * 48;
    m.setAttribute('x1', x); m.setAttribute('x2', x);
  }
  slider.addEventListener('input', () => { audioEngine.playHoverTick(); unlock(); render(); });
  render();
  rerenders.push(render);

  const V = ['A', 'E', 'I', 'O', 'U'];
  const K = ['B', 'C', 'D', 'F', 'G', 'H', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'V', 'W', 'Z'];
  let rack = [];
  let mode = 'fair';
  function renderRack() {
    const grid = $('mw-letter-pool-grid');
    grid.innerHTML = '';
    let vowels = 0;
    rack.forEach((ch) => {
      const isV = V.includes(ch);
      if (isV) vowels++;
      const d = document.createElement('div');
      d.className = `rune-tile${isV ? ' vowel' : ''}`;
      d.textContent = ch;
      grid.appendChild(d);
    });
    const st = $('mw-pool-status');
    const label = mode === 'fair' ? T('Algorithme à voyelles garanties', 'Vowel-guaranteed algorithm') : T('Tirage aléatoire naïf', 'Naive random draw');
    st.textContent = `${label} — ${T('voyelles', 'vowels')} ${vowels}/9 · ${vowels < 2 ? T('tour mort, aucun mot possible', 'dead turn, no word possible') : T('tirage jouable', 'playable rack')}`;
    st.style.color = vowels < 2 ? C.bad : C.ok;
  }
  function fair() {
    const counts = {};
    const target = 2 + Math.floor(Math.random() * 2);
    rack = [];
    while (rack.length < target) { const v = V[Math.floor(Math.random() * V.length)]; if ((counts[v] || 0) < 2) { counts[v] = (counts[v] || 0) + 1; rack.push(v); } }
    while (rack.length < 9) { const c = K[Math.floor(Math.random() * K.length)]; if ((counts[c] || 0) < 2) { counts[c] = (counts[c] || 0) + 1; rack.push(c); } }
    rack.sort(() => Math.random() - 0.5);
    mode = 'fair';
  }
  function naive() {
    rack = Array.from({ length: 9 }, () => (Math.random() < 0.08 ? V[Math.floor(Math.random() * V.length)] : K[Math.floor(Math.random() * K.length)]));
    mode = 'naive';
  }
  $('mw-roll-guaranteed-btn').addEventListener('click', (e) => {
    fair(); renderRack(); audioEngine.playCardFlip(); unlock();
    e.currentTarget.classList.add('active'); $('mw-roll-naive-btn').classList.remove('active');
  });
  $('mw-roll-naive-btn').addEventListener('click', (e) => {
    naive(); renderRack(); audioEngine.playClick(); unlock();
    e.currentTarget.classList.add('active'); $('mw-roll-guaranteed-btn').classList.remove('active');
  });
  fair(); renderRack();
  rerenders.push(renderRack);
}

/* ============================================================================
   BALLOON OF THE COUNTRIES
   ============================================================================ */
function initBalloon(unlock) {
  const $ = (id) => document.getElementById(id);
  const stage = $('bal-wireframe-stage');
  if (!stage) return;
  let mode = 'after';
  function renderWire() {
    $('bal-wire-before-btn').classList.toggle('active', mode === 'before');
    $('bal-wire-after-btn').classList.toggle('active', mode === 'after');
    stage.innerHTML = mode === 'before'
      ? `<div class="wire before">
          <div class="wire-row"><span>${T('HUD J1 à l’envers, en haut', 'P1 HUD upside down at the top')}</span><span>${T('Zone de clics accidentels', 'Misclick zone')}</span></div>
          <div class="wire-map">${T('Carte à l’étroit (48 % de l’écran) — les boutons des deux joueurs visibles en même temps', "Cramped map (48% of the screen) — both players' buttons visible at once")}</div>
          <div class="wire-row"><span>${T('HUD J2 encombré, en bas', 'P2 HUD cluttered at the bottom')}</span><span>${T('Aucun écran de relais', 'No hand-off screen')}</span></div>
        </div>`
      : `<div class="wire after">
          <div class="wire-row"><span>${T('Tour actif : Joueur 1 (bordure azur)', 'Active turn: Player 1 (azure border)')}</span><span>${T('Carte sur 82 % de l’écran', '82% map area')}</span></div>
          <div class="wire-map">${T('Carte du monde plein écran + écran de relais entre les tours', 'Full-screen world map + hand-off screen between turns')}</div>
          <div class="wire-row ok"><span>${T('Dock dans la zone du pouce, cibles de 48 px', 'Thumb-zone dock, 48px tap targets')}</span><span>${T('Relais 2× plus rapide', '2× faster hand-off')}</span></div>
        </div>`;
  }
  $('bal-wire-before-btn').addEventListener('click', () => { mode = 'before'; renderWire(); audioEngine.playClick(); unlock(); });
  $('bal-wire-after-btn').addEventListener('click', () => { mode = 'after'; renderWire(); audioEngine.playClick(); unlock(); });
  renderWire();
  rerenders.push(renderWire);

  const slider = $('bal-round-slider');
  function renderRound() {
    const r = Number(slider.value);
    const mult = 1 + (r - 1) * 0.35;
    $('bal-round-val').textContent = T(`Manche ${r} / 10`, `Round ${r} / 10`);
    $('bal-mult-val').textContent = `${mult.toFixed(2)}×`;
    $('bal-wind-val').textContent = T(`Vent ${10 + (r - 1) * 6} nœuds`, `${10 + (r - 1) * 6} kt wind`);
    $('bal-score-val').textContent = `+${Math.round(250 * mult)} PTS`;
  }
  slider.addEventListener('input', () => { audioEngine.playHoverTick(); unlock(); renderRound(); });
  renderRound();
  rerenders.push(renderRound);
}

/* ============================================================================
   QUEST 05 — rune seal
   ============================================================================ */
function initQuest05(unlock) {
  const btn = document.getElementById('slot05-scan-btn');
  const out = document.getElementById('slot05-telemetry-readout');
  if (!btn) return;
  let scanned = false;
  const render = () => {
    out.textContent = scanned
      ? T('Sceau inspecté : scène 2D prête · grille de niveau OK · machine à états d’IA OK · en attente du prototype.', 'Seal inspected: 2D stage ready · level grid OK · AI state machine OK · awaiting the prototype.')
      : T('Point d’ancrage : #playable-prototype-stage — prêt.', 'Mount point: #playable-prototype-stage — ready.');
    out.style.borderLeftColor = scanned ? C.ok : '';
  };
  btn.addEventListener('click', () => {
    scanned = true;
    audioEngine.playAchievementChime();
    unlock(); render();
    const lock = document.querySelector('.rune-lock');
    if (lock && window.gsap) window.gsap.fromTo(lock, { scale: 1 }, { keyframes: { scale: [1, 1.06, 0.98, 1] }, duration: 0.6, ease: 'power2.out' });
  });
  render();
  rerenders.push(render);
}
