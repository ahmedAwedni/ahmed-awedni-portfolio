/* ============================================================================
   INTERACTIVE GAME DESIGN ARTIFACTS & SIMULATORS (PROJECTS 1 TO 5)
   Mathematically faithful to Ahmed Awedni's real game mechanics
   ============================================================================ */

import { audioEngine } from './audio-engine.js';

export function initAllArtifacts(onUnlockInspectorAchievement) {
  initWiseBattleArtifacts(onUnlockInspectorAchievement);
  initNarutoArtifacts(onUnlockInspectorAchievement);
  initMagicWordsArtifacts(onUnlockInspectorAchievement);
  initBalloonArtifacts(onUnlockInspectorAchievement);
  initLockedSlotArtifact(onUnlockInspectorAchievement);
}

/* ============================================================================
   PROJECT 1: WISE BATTLE — ARTIFACT A (30/30 RULE SIMULATOR) & ARTIFACT B (HEROES + C#)
   ============================================================================ */
function initWiseBattleArtifacts(unlockCb) {
  const state = {
    turn: 1,
    maxTurns: 30,
    energy: 25,
    maxEnergy: 100,
    answerTimeSec: 12,
    outcome: 'correct', // 'correct' | 'wrong' | 'timeout'
    p2Aid: false,
    alericBuffTurns: 0,
    actionUnlocked: true,
    combatLog: 'Turn 1 Ready — Quiz Phase active (Max Timer: 30s).'
  };

  const sliderEl = document.getElementById('wb-time-slider');
  const timeValEl = document.getElementById('wb-time-val');
  const maxTimerEl = document.getElementById('wb-max-timer');
  const outcomeBtns = document.querySelectorAll('[data-wb-outcome]');
  const p2AidBtn = document.getElementById('wb-p2-aid-btn');
  const resolveQuizBtn = document.getElementById('wb-resolve-quiz-btn');
  const actionBtns = document.querySelectorAll('[data-wb-action]');
  const resetBtn = document.getElementById('wb-reset-sim-btn');

  const energyValEl = document.getElementById('wb-energy-val');
  const energyBarEl = document.getElementById('wb-energy-bar');
  const deltaValEl = document.getElementById('wb-delta-val');
  const phaseStateEl = document.getElementById('wb-phase-state');
  const turnCountEl = document.getElementById('wb-turn-count');
  const logEl = document.getElementById('wb-sim-log');

  if (!sliderEl) return;

  function getMaxTimer() {
    return state.alericBuffTurns > 0 ? 40 : 30;
  }

  function getPreviewDelta() {
    const maxT = getMaxTimer();
    const t = Math.min(state.answerTimeSec, maxT);
    if (state.outcome === 'correct') {
      return Math.max(1, maxT - t);
    }
    if (state.outcome === 'wrong') {
      return -15;
    }
    return 0; // timeout
  }

  function renderWiseBattleA() {
    const maxT = getMaxTimer();
    sliderEl.max = String(maxT);
    if (state.answerTimeSec > maxT) state.answerTimeSec = maxT;

    timeValEl.textContent = `${state.answerTimeSec}s`;
    maxTimerEl.textContent = `${maxT}s${state.alericBuffTurns > 0 ? ' (+10s Time Spell!)' : ''}`;

    const delta = getPreviewDelta();
    deltaValEl.textContent = delta > 0 ? `+${delta} E` : `${delta} E`;
    deltaValEl.style.color = delta > 0 ? '#4ade80' : (delta < 0 ? '#f87171' : '#fbbf24');

    energyValEl.textContent = `${state.energy} / ${state.maxEnergy} E`;
    energyBarEl.style.width = `${Math.min(100, Math.max(0, state.energy))}%`;
    turnCountEl.textContent = `${state.turn} / ${state.maxTurns}`;

    if (state.outcome === 'correct' && state.actionUnlocked) {
      phaseStateEl.textContent = 'ACTION PHASE UNLOCKED';
      phaseStateEl.style.color = '#4ade80';
    } else if (state.outcome === 'wrong') {
      phaseStateEl.textContent = 'LOCKED (-15E PENALTY)';
      phaseStateEl.style.color = '#f87171';
    } else {
      phaseStateEl.textContent = 'TURN FORFEITED (0E)';
      phaseStateEl.style.color = '#fbbf24';
    }

    p2AidBtn.classList.toggle('active', state.p2Aid);
    p2AidBtn.textContent = state.p2Aid ? 'P2 Aid: ON (+15E Turn 1)' : 'P2 Aid: OFF (P1 Default)';

    actionBtns.forEach((btn) => {
      const cost = Number(btn.getAttribute('data-cost') || 0);
      const canUse = state.actionUnlocked && state.outcome === 'correct' && state.energy >= cost;
      btn.disabled = !canUse;
    });

    logEl.textContent = state.combatLog;
  }

  sliderEl.addEventListener('input', () => {
    state.answerTimeSec = Number(sliderEl.value);
    audioEngine.playHoverTick();
    renderWiseBattleA();
  });

  outcomeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      outcomeBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      state.outcome = btn.getAttribute('data-wb-outcome');
      state.actionUnlocked = state.outcome === 'correct';
      audioEngine.playTabSwitch();
      unlockCb();
      renderWiseBattleA();
    });
  });

  p2AidBtn.addEventListener('click', () => {
    state.p2Aid = !state.p2Aid;
    state.energy = state.p2Aid ? Math.min(100, state.energy + 15) : Math.max(0, state.energy - 15);
    state.combatLog = state.p2Aid
      ? 'Second Player Aid ENABLED: Player 2 receives +15 starting Energy on Turn 1 to offset P1 initiative.'
      : 'Second Player Aid DISABLED: Standard Turn 1 Energy baseline.';
    audioEngine.playTabSwitch();
    unlockCb();
    renderWiseBattleA();
  });

  resolveQuizBtn.addEventListener('click', () => {
    const delta = getPreviewDelta();
    state.energy = Math.min(state.maxEnergy, Math.max(0, state.energy + delta));
    if (state.outcome === 'correct') {
      state.actionUnlocked = true;
      state.combatLog = `Quiz Resolved in ${state.answerTimeSec}s: Gained +${delta} Energy! Select an Action below.`;
    } else if (state.outcome === 'wrong') {
      state.actionUnlocked = false;
      state.turn = Math.min(state.maxTurns, state.turn + 1);
      state.combatLog = `Wrong Answer! -15 Energy penalty applied & Action Phase LOCKED. Advancing to Turn ${state.turn}.`;
    } else {
      state.actionUnlocked = false;
      state.turn = Math.min(state.maxTurns, state.turn + 1);
      state.combatLog = `30s Timer Expired! +0 Energy & Turn forfeited. Advancing to Turn ${state.turn}.`;
    }
    audioEngine.playCardFlip();
    unlockCb();
    renderWiseBattleA();
  });

  actionBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const actionName = btn.getAttribute('data-wb-action');
      const cost = Number(btn.getAttribute('data-cost') || 0);
      if (state.energy < cost) return;

      state.energy -= cost;
      if (actionName === 'timespell') {
        state.alericBuffTurns = 3;
        state.combatLog = `Turn ${state.turn}: Cast Aleric's TIME SPELL (-30E)! Quiz Timer expanded to 40s for the next 3 turns!`;
      } else if (actionName === 'attack') {
        state.combatLog = `Turn ${state.turn}: Executed Basic Attack (-20E) -> Dealt Hero ATK damage!`;
      } else if (actionName === 'defend') {
        state.combatLog = `Turn ${state.turn}: Raised Tactical Guard (-10E) -> Mitigates incoming enemy strike!`;
      } else {
        state.combatLog = `Turn ${state.turn}: Passed Action Phase (0E) -> Banking ${state.energy}E for a high-cost Unique Skill combo!`;
      }

      if (state.alericBuffTurns > 0 && actionName !== 'timespell') {
        state.alericBuffTurns--;
      }
      state.turn = Math.min(state.maxTurns, state.turn + 1);
      audioEngine.playCardFlip();
      unlockCb();
      renderWiseBattleA();
    });
  });

  resetBtn?.addEventListener('click', () => {
    state.turn = 1;
    state.energy = state.p2Aid ? 40 : 25;
    state.alericBuffTurns = 0;
    state.actionUnlocked = true;
    state.outcome = 'correct';
    state.combatLog = 'Simulator Reset — Turn 1 initialized.';
    audioEngine.playTabSwitch();
    renderWiseBattleA();
  });

  renderWiseBattleA();

  /* ARTIFACT B: ASYMMETRIC HERO ROSTER & C# ARCHITECTURE */
  const HERO_DATA = {
    galios: {
      name: "Galios (The Knight — Attrition Tank)",
      hp: 100,
      atk: "25 DMG (20E)",
      def: "15 Shield (10E)",
      skillName: "Shield Slam (50E)",
      skillDesc: "Deals 15 DMG + 50% chance to STUN the enemy, completely forfeiting their next turn.",
      synergy: "High HP & DEF let Galios bank energy across multiple turns to unleash game-swinging 50E Stun locks."
    },
    pokey: {
      name: "Pokey (The Assassin — Glass Cannon)",
      hp: 90,
      atk: "30 DMG (20E)",
      def: "10 Shield (10E)",
      skillName: "Assassin's Rush (35E)",
      skillDesc: "Grants +10 ATK for 3 consecutive turns (boosting Basic Attacks to 40 DMG!).",
      synergy: "Punishes slow opponents: a 35E buff + three 20E attacks deals 120 burst DMG if answered fast."
    },
    aleric: {
      name: "Aleric (The Mage — Chronomancer Utility)",
      hp: 80,
      atk: "35 DMG (20E)",
      def: "5 Shield (10E)",
      skillName: "Time Spell (30E)",
      skillDesc: "Grants +10 extra seconds on the quiz timer for the next 3 turns (40s Max Timer!).",
      synergy: "Directly manipulates the Quiz Economy: +10s max timer means up to +10 extra Energy generated per turn (+30E ROI)!"
    }
  };

  const heroTabs = document.querySelectorAll('[data-wb-hero]');
  const heroTitleEl = document.getElementById('wb-hero-title');
  const heroHpEl = document.getElementById('wb-hero-hp');
  const heroAtkEl = document.getElementById('wb-hero-atk');
  const heroDefEl = document.getElementById('wb-hero-def');
  const heroSkillNameEl = document.getElementById('wb-hero-skill-name');
  const heroSkillDescEl = document.getElementById('wb-hero-skill-desc');
  const heroSynergyEl = document.getElementById('wb-hero-synergy');
  const codeToggleBtn = document.getElementById('wb-code-toggle-btn');
  const codeDrawerEl = document.getElementById('wb-code-drawer');

  function renderHero(key) {
    const h = HERO_DATA[key] || HERO_DATA.galios;
    heroTitleEl.textContent = h.name;
    heroHpEl.textContent = `${h.hp} HP`;
    heroAtkEl.textContent = h.atk;
    heroDefEl.textContent = h.def;
    heroSkillNameEl.textContent = h.skillName;
    heroSkillDescEl.textContent = h.skillDesc;
    heroSynergyEl.textContent = h.synergy;
  }

  heroTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      heroTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      renderHero(tab.getAttribute('data-wb-hero'));
      audioEngine.playTabSwitch();
      unlockCb();
    });
  });

  codeToggleBtn?.addEventListener('click', () => {
    const isHidden = codeDrawerEl.hasAttribute('hidden');
    if (isHidden) {
      codeDrawerEl.removeAttribute('hidden');
      codeToggleBtn.textContent = 'Hide C# ScriptableObject Architecture ▲';
    } else {
      codeDrawerEl.setAttribute('hidden', '');
      codeToggleBtn.textContent = 'Inspect C# ScriptableObject & BaseSkill Architecture ▼';
    }
    audioEngine.playTabSwitch();
    unlockCb();
  });

  renderHero('galios');
}

/* ============================================================================
   PROJECT 2: NARUTO: THE BOARD GAME — ARTIFACT A (40-TILE LOOP) & ARTIFACT B (BLIND COMBAT)
   ============================================================================ */
function initNarutoArtifacts(unlockCb) {
  const TILE_INFO = {
    "1": {
      title: "Tile 1 — Starting Line (Tour Completion)",
      rule: "Grants +1000 SP (Normal Mode) or +1500 SP (Shinobis War Mode). Unlocks swapping between Active Party (max 3 in hand) and Inactive Party (max 2 reserve)."
    },
    "4": {
      title: "Tile 4 — Hidden Leaf Village 1 (Territory Tile)",
      rule: "Purchase Cost: 100 SP | Location Defensive Power: 35. Enemy landing here ONLY pays the SP toll if their Active Party Total Power < 35!"
    },
    "6": {
      title: "Tiles 6, 16, 26, 36 — The 4 Kage Offices",
      rule: "Strategic corner citadels: grant end-game stat buffs, emergency Active/Inactive party swapping, and progress toward the Kage Office Victory condition."
    },
    "8": {
      title: "Tile 8 — Shinobi Draw",
      rule: "Recruit a new Shinobi card into your roster (expanding tactical combinations for your 3-card Active Party or 2-card reserve)."
    },
    "9": {
      title: "Tile 9 — Side Quests (Max 3 Held)",
      rule: "Draw an objective-driven Side Quest card (up to 3 held simultaneously) granting bonus SP and tactical rewards upon completion."
    },
    "11": {
      title: "Tiles 11 & 31 — Genjutsu Traps",
      rule: "High-risk illusion hazard tiles that disrupt movement, drain chakra/SP, or force defensive checks."
    },
    "21": {
      title: "Tile 21 — Legendary Draw (Requires 11+ on 2D6)",
      rule: "Elite recruitment sanctum: player rolls 2D6 and must score 11 or 12 to unlock a Legendary Shinobi card!"
    }
  };

  const tileBtns = document.querySelectorAll('[data-naruto-tile]');
  const tileTitleEl = document.getElementById('naruto-tile-title');
  const tileRuleEl = document.getElementById('naruto-tile-rule');
  const powerSlider = document.getElementById('naruto-party-power-slider');
  const powerValEl = document.getElementById('naruto-party-power-val');
  const tollResultEl = document.getElementById('naruto-toll-result');
  const roll2d6Btn = document.getElementById('naruto-roll-2d6-btn');
  const roll2d6ResultEl = document.getElementById('naruto-2d6-result');

  if (!powerSlider) return;

  tileBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      tileBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const key = btn.getAttribute('data-naruto-tile');
      const info = TILE_INFO[key] || TILE_INFO["1"];
      tileTitleEl.textContent = info.title;
      tileRuleEl.textContent = info.rule;
      audioEngine.playTabSwitch();
      unlockCb();
    });
  });

  function updatePowerCheck() {
    const partyPower = Number(powerSlider.value);
    const locationDefense = 35; // Hidden Leaf Village 1
    powerValEl.textContent = `${partyPower} PWR`;
    if (partyPower < locationDefense) {
      tollResultEl.textContent = `PARTY POWER (${partyPower}) < DEFENSE (35) → TOLL TRIGGERED (-100 SP)!`;
      tollResultEl.style.color = '#f87171';
    } else {
      tollResultEl.textContent = `PARTY POWER (${partyPower}) ≥ DEFENSE (35) → TERRITORY BREACHED (0 SP TOLL)!`;
      tollResultEl.style.color = '#4ade80';
    }
  }

  powerSlider.addEventListener('input', () => {
    audioEngine.playHoverTick();
    updatePowerCheck();
  });

  roll2d6Btn?.addEventListener('click', () => {
    const d1 = 1 + Math.floor(Math.random() * 6);
    const d2 = 1 + Math.floor(Math.random() * 6);
    const sum = d1 + d2;
    if (sum >= 11) {
      roll2d6ResultEl.textContent = `Rolled ${d1} + ${d2} = ${sum} (≥11) → LEGENDARY SHINOBI UNLOCKED!`;
      roll2d6ResultEl.style.color = '#4ade80';
      audioEngine.playAchievementChime();
    } else {
      roll2d6ResultEl.textContent = `Rolled ${d1} + ${d2} = ${sum} (<11) → Sanctum Sealed. Try again!`;
      roll2d6ResultEl.style.color = '#fbbf24';
      audioEngine.playCardFlip();
    }
    unlockCb();
  });

  updatePowerCheck();

  /* ARTIFACT B: BLIND-TARGET 3-CARD PARTY COMBAT & PASSIVE TRIGGERS */
  const defenderCards = [
    { name: "Shikamaru (Shadow Tactician)", maxHp: 55 },
    { name: "Gaara (Sand Aegis)", maxHp: 80 },
    { name: "Hinata (Byakugan Scout)", maxHp: 60 }
  ];

  let sakuraPassive = false;
  const sakuraBtn = document.getElementById('naruto-sakura-passive-btn');
  const cardEls = document.querySelectorAll('[data-blind-card]');
  const resetCardsBtn = document.getElementById('naruto-reset-cards-btn');
  const combatReadoutEl = document.getElementById('naruto-combat-readout');

  sakuraBtn?.addEventListener('click', () => {
    sakuraPassive = !sakuraPassive;
    sakuraBtn.classList.toggle('active', sakuraPassive);
    sakuraBtn.textContent = sakuraPassive
      ? "Sakura's Healthy Dice Passive: ON (Fatal Burst)"
      : "Sakura's Healthy Dice Passive: OFF";
    audioEngine.playTabSwitch();
    unlockCb();
  });

  function resetBlindCards() {
    // Shuffle defender cards so blind pick is truly blind
    defenderCards.sort(() => Math.random() - 0.5);
    cardEls.forEach((el, idx) => {
      el.innerHTML = `
        <span style="font-size:1.3rem;">🎴</span>
        <strong style="font-family:var(--font-mono);font-size:0.74rem;color:#fff;">FACE-DOWN #${idx + 1}</strong>
        <span style="font-size:0.66rem;color:var(--text-muted);">Click to strike with Chidori (60 DMG)</span>
      `;
      el.style.borderColor = 'var(--border-ornate)';
    });
    if (combatReadoutEl) {
      combatReadoutEl.textContent = "Select 1 of the 3 face-down Defender Active Party cards to strike with Kakashi's Chidori (60 DMG, 1-Tile Range).";
    }
  }

  cardEls.forEach((el, idx) => {
    el.addEventListener('click', () => {
      const target = defenderCards[idx];
      const dmg = sakuraPassive ? 999 : 60;
      const isLethal = dmg >= target.maxHp;

      el.innerHTML = `
        <strong style="font-family:var(--font-mono);font-size:0.74rem;color:${isLethal ? '#4ade80' : '#fbbf24'};">${target.name}</strong>
        <span style="font-size:0.7rem;color:#fff;">HP: ${target.maxHp} vs DMG: ${sakuraPassive ? 'FATAL (Sakura Dice)' : '60'}</span>
        <span style="font-size:0.65rem;color:${isLethal ? '#4ade80' : '#f87171'};">
          ${isLethal ? '💥 ELIMINATED!' : '♻️ SURVIVED → FULL-HP TURN RESET!'}
        </span>
      `;
      el.style.borderColor = isLethal ? '#4ade80' : '#fbbf24';

      combatReadoutEl.textContent = isLethal
        ? `CRITICAL ELIMINATION! ${target.name} (${target.maxHp} HP) was defeated in one turn!`
        : `NON-LETHAL HIT! ${target.name} (${target.maxHp} HP) survived 60 DMG and heals back to ${target.maxHp}/${target.maxHp} HP at Turn End — activate Sakura's Healthy Dice passive or combo attacks to finish high-HP tanks!`;

      audioEngine.playCardFlip();
      unlockCb();
    });
  });

  resetCardsBtn?.addEventListener('click', () => {
    resetBlindCards();
    audioEngine.playTabSwitch();
  });

  resetBlindCards();
}

/* ============================================================================
   PROJECT 3: MAGIC WORDS — ARTIFACT A (WORD SCALING) & ARTIFACT B (VOWEL BAG RNG)
   ============================================================================ */
function initMagicWordsArtifacts(unlockCb) {
  const WORD_TABLE = {
    3: { word: "ARC", atk: 12, heal: 10, note: "Short 3-letter words: Heal (10 HP) nearly matches Attack (12 DMG), which caused stall in early playtests before our nerf." },
    4: { word: "FIRE", atk: 20, heal: 14, note: "4-letter spell: Attack (20 DMG) pulls ahead of Self-Heal (14 HP) by +42%." },
    5: { word: "FLAME", atk: 32, heal: 18, note: "5-letter breakpoint: Offensive scaling (+60% over Heal) rewards vocabulary mastery." },
    6: { word: "ARCANE", atk: 48, heal: 22, note: "6-letter incantation: 48 DMG crushes heal-stalling (22 HP cap slope)." },
    7: { word: "GRIMOIRE", atk: 68, heal: 25, note: "7-letter master spell: 68 DMG burst vs 25 HP heal — decisive duel finisher!" },
    8: { word: "ARCHMAGE", atk: 92, heal: 28, note: "8+ letter Mythic Word: 92 DMG catastrophic blast! Offensive spelling dominates." }
  };

  const lenSlider = document.getElementById('mw-length-slider');
  const lenValEl = document.getElementById('mw-length-val');
  const sampleWordEl = document.getElementById('mw-sample-word');
  const atkValEl = document.getElementById('mw-atk-val');
  const healValEl = document.getElementById('mw-heal-val');
  const ratioValEl = document.getElementById('mw-ratio-val');
  const noteEl = document.getElementById('mw-scaling-note');
  const markerEl = document.getElementById('mw-svg-marker');

  if (!lenSlider) return;

  function updateMagicWordsScaling() {
    const len = Number(lenSlider.value);
    const data = WORD_TABLE[len] || WORD_TABLE[5];
    lenValEl.textContent = `${len} Letters`;
    sampleWordEl.textContent = `"${data.word}"`;
    atkValEl.textContent = `${data.atk} DMG`;
    healValEl.textContent = `+${data.heal} HP`;
    const ratio = (data.atk / data.heal).toFixed(2);
    ratioValEl.textContent = `${ratio}× Offense`;
    noteEl.textContent = data.note;

    if (markerEl) {
      const xPos = 30 + (len - 3) * 48;
      markerEl.setAttribute('x1', String(xPos));
      markerEl.setAttribute('x2', String(xPos));
    }
  }

  lenSlider.addEventListener('input', () => {
    audioEngine.playHoverTick();
    unlockCb();
    updateMagicWordsScaling();
  });

  updateMagicWordsScaling();

  /* ARTIFACT B: VOWEL-GUARANTEED LETTER POOL GENERATOR */
  const VOWELS = ["A", "E", "I", "O", "U"];
  const CONSONANTS = ["B", "C", "D", "F", "G", "H", "K", "L", "M", "N", "P", "R", "S", "T", "V", "W", "Z"];

  const gridEl = document.getElementById('mw-letter-pool-grid');
  const btnGuaranteed = document.getElementById('mw-roll-guaranteed-btn');
  const btnNaive = document.getElementById('mw-roll-naive-btn');
  const poolStatusEl = document.getElementById('mw-pool-status');

  function renderPool(letters, modeLabel) {
    if (!gridEl) return;
    gridEl.innerHTML = '';
    let vowelCount = 0;
    letters.forEach((ch) => {
      const isV = VOWELS.includes(ch);
      if (isV) vowelCount++;
      const div = document.createElement('div');
      div.className = `rune-tile ${isV ? 'vowel' : ''}`;
      div.textContent = ch;
      gridEl.appendChild(div);
    });
    poolStatusEl.textContent = `${modeLabel} → Vowels: ${vowelCount}/9 | Consonants: ${9 - vowelCount}/9 ${vowelCount < 2 ? '(⚠️ UNPLAYABLE CONSONANT DROUGHT!)' : '(✅ PLAYABLE SPELL RACK)'}`;
    poolStatusEl.style.color = vowelCount < 2 ? '#f87171' : '#4ade80';
  }

  function rollGuaranteedPool() {
    const rack = [];
    const targetVowels = 2 + Math.floor(Math.random() * 2); // 2 or 3 guaranteed vowels
    const counts = {};

    while (rack.length < targetVowels) {
      const v = VOWELS[Math.floor(Math.random() * VOWELS.length)];
      if ((counts[v] || 0) < 2) {
        counts[v] = (counts[v] || 0) + 1;
        rack.push(v);
      }
    }
    while (rack.length < 9) {
      const c = CONSONANTS[Math.floor(Math.random() * CONSONANTS.length)];
      if ((counts[c] || 0) < 2) {
        counts[c] = (counts[c] || 0) + 1;
        rack.push(c);
      }
    }
    rack.sort(() => Math.random() - 0.5);
    renderPool(rack, "Vowel-Guaranteed Algorithm");
  }

  function rollNaiveDroughtPool() {
    // Demonstrates what happened in early playtests with pure unweighted RNG
    const rack = [];
    for (let i = 0; i < 9; i++) {
      const pick = Math.random() < 0.08
        ? VOWELS[Math.floor(Math.random() * VOWELS.length)]
        : CONSONANTS[Math.floor(Math.random() * CONSONANTS.length)];
      rack.push(pick);
    }
    renderPool(rack, "Naive Unweighted RNG");
  }

  btnGuaranteed?.addEventListener('click', () => {
    rollGuaranteedPool();
    audioEngine.playCardFlip();
    unlockCb();
  });

  btnNaive?.addEventListener('click', () => {
    rollNaiveDroughtPool();
    audioEngine.playTabSwitch();
    unlockCb();
  });

  rollGuaranteedPool();
}

/* ============================================================================
   PROJECT 4: BALLOON OF THE COUNTRIES — ARTIFACT A (WIREFRAME) & ARTIFACT B (ESCALATION)
   ============================================================================ */
function initBalloonArtifacts(unlockCb) {
  const beforeBtn = document.getElementById('bal-wire-before-btn');
  const afterBtn = document.getElementById('bal-wire-after-btn');
  const stageEl = document.getElementById('bal-wireframe-stage');

  if (!stageEl) return;

  function renderWireframe(mode) {
    beforeBtn.classList.toggle('active', mode === 'before');
    afterBtn.classList.toggle('active', mode === 'after');

    if (mode === 'before') {
      stageEl.innerHTML = `
        <div style="border:1px dashed #f87171;padding:0.75rem;background:rgba(239,68,68,0.06);">
          <div style="display:flex;justify-content:space-between;font-family:var(--font-mono);font-size:0.68rem;color:#f87171;margin-bottom:0.5rem;">
            <span>[P1 TOP HUD — UPSIDE DOWN]</span>
            <span>⚠️ MISCLICK ZONE (TOP EDGE)</span>
          </div>
          <div style="height:82px;display:grid;place-items:center;border:1px solid rgba(255,255,255,0.1);font-size:0.78rem;color:var(--text-secondary);">
            Map Viewport Cramped (Only 48% Screen Area) — Both Players' Buttons Visible Simultaneously
          </div>
          <div style="display:flex;justify-content:space-between;font-family:var(--font-mono);font-size:0.68rem;color:#f87171;margin-top:0.5rem;">
            <span>[P2 BOTTOM HUD — CLUTTERED]</span>
            <span>❌ NO TURN HANDOFF SHIELD</span>
          </div>
        </div>
      `;
    } else {
      stageEl.innerHTML = `
        <div style="border:1.5px solid #38bdf8;padding:0.75rem;background:rgba(56,189,248,0.08);">
          <div style="display:flex;justify-content:space-between;font-family:var(--font-mono);font-size:0.68rem;color:#38bdf8;margin-bottom:0.5rem;">
            <span>🧭 ACTIVE TURN: PLAYER 1 (AZURE BORDER)</span>
            <span>✅ 82% MAP VIEWPORT AREA</span>
          </div>
          <div style="height:82px;display:grid;place-items:center;border:1px solid rgba(56,189,248,0.3);font-size:0.78rem;color:#fff;">
            Clean Full-Screen World Map + Handoff Interstitial Shield Between Turns
          </div>
          <div style="display:flex;justify-content:space-between;font-family:var(--font-mono);font-size:0.68rem;color:#4ade80;margin-top:0.5rem;">
            <span>[ERGONOMIC BOTTOM THUMB-ZONE DOCK (48px TAP TARGETS)]</span>
            <span>2× FASTER HANDOFF</span>
          </div>
        </div>
      `;
    }
  }

  beforeBtn?.addEventListener('click', () => {
    renderWireframe('before');
    audioEngine.playTabSwitch();
    unlockCb();
  });

  afterBtn?.addEventListener('click', () => {
    renderWireframe('after');
    audioEngine.playTabSwitch();
    unlockCb();
  });

  renderWireframe('after');

  /* ARTIFACT B: ROUND ESCALATION & SCORE MULTIPLIER SIMULATOR */
  const roundSlider = document.getElementById('bal-round-slider');
  const roundValEl = document.getElementById('bal-round-val');
  const multValEl = document.getElementById('bal-mult-val');
  const windValEl = document.getElementById('bal-wind-val');
  const scoreValEl = document.getElementById('bal-score-val');

  function updateBalloonEscalation() {
    if (!roundSlider) return;
    const r = Number(roundSlider.value);
    const mult = (1 + (r - 1) * 0.35).toFixed(2);
    const windKnots = 10 + (r - 1) * 6;
    const pts = Math.round(250 * Number(mult));

    roundValEl.textContent = `Round ${r} / 10`;
    multValEl.textContent = `${mult}×`;
    windValEl.textContent = `${windKnots} kt Wind`;
    scoreValEl.textContent = `+${pts} PTS`;
  }

  roundSlider?.addEventListener('input', () => {
    audioEngine.playHoverTick();
    unlockCb();
    updateBalloonEscalation();
  });

  updateBalloonEscalation();
}

/* ============================================================================
   PROJECT 5: LOCKED QUEST SLOT #05 — BLUEPRINT TELEMETRY SCANNER
   ============================================================================ */
function initLockedSlotArtifact(unlockCb) {
  const scanBtn = document.getElementById('slot05-scan-btn');
  const readoutEl = document.getElementById('slot05-telemetry-readout');

  scanBtn?.addEventListener('click', () => {
    audioEngine.playAchievementChime();
    unlockCb();
    if (readoutEl) {
      readoutEl.textContent = ">> SCAN COMPLETE: Canvas 2D Context Ready | Level Grid Hook [OK] | AI State Machine Hook [OK] | Awaiting Phase 2 Prototype Injection...";
      readoutEl.style.color = "#6ee7b7";
    }
  });
}
