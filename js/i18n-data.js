/* ============================================================================
   AHMED AWEDNI — BILINGUAL (FR / EN) DATA, STATS, LOADOUT & CASE STUDIES
   Default Language: FR (for Paris & Île-de-France Game Studio Recruiters)
   ============================================================================ */

export const ELEVENLABS_AUDIO = {
  shockwaveUrl: "https://elevenlabsusercontent.com/database/workspace/6c2ddac69dc0473eae69f2f66242af49/content_generation/bpslQVPmblMVfaL8dzI0/bjybnf1RxPzoX1cIgT61/content.mp3?Expires=1794988800&KeyName=assets-cdn-key-1&Signature=L8Io9opsCmvuBcS33KGpdLAb5jY=",
  localShockwaveUrl: "/public/assets/audio/shockwave.mp3",
  bgmUrl: "https://elevenlabsusercontent.com/database/workspace/6c2ddac69dc0473eae69f2f66242af49/content_generation/z6AZd3hZJFaCTrEIRcDy/gnNYXsnRL4uD35fq8yAI/content.mp3?Expires=1794988800&KeyName=assets-cdn-key-1&Signature=lcxluYYSlMF7GcoKc0K8l92U4CU=",
  localBgmUrl: "/public/assets/audio/bgm-theme.mp3"
};

export const RPG_STATS = [
  {
    code: "SYS",
    score: 96,
    fr: {
      label: "Systems & Economy Design (Game Balancing)",
      desc: "Modélisation mathématique d'économies d'action, courbes de coût/récompense, équilibrage asymétrique et boucles de rétroaction (Wise Battle 30/30 Rule, Naruto 40-Tile Economy)."
    },
    en: {
      label: "Systems & Economy Design (Game Balancing)",
      desc: "Mathematical modeling of action economies, cost/reward curves, asymmetric hero balancing, and feedback loops (Wise Battle 30/30 Rule, Naruto 40-Tile Economy)."
    }
  },
  {
    code: "TEC",
    score: 81,
    fr: {
      label: "Technical Game Design (Prototyping & Scripting)",
      desc: "Architecture Unity C# modulaire (ScriptableObjects, State Machines, polymorphisme BaseSkill, Netcode 1v1) permettant d'itérer rapidement sans bloquer l'équipe."
    },
    en: {
      label: "Technical Game Design (Prototyping & Scripting)",
      desc: "Modular Unity C# architecture (ScriptableObjects, State Machines, polymorphic BaseSkill classes, 1v1 Netcode) enabling rapid design iteration."
    }
  },
  {
    code: "3CS",
    score: 92,
    fr: {
      label: "Core Gameplay Mechanics & 3Cs Design",
      desc: "Conception précise de Character, Camera & Controls : lisibilité tactique top-down, réactivité des inputs, états de tour et résolution de combat aveugle."
    },
    en: {
      label: "Core Gameplay Mechanics & 3Cs Design",
      desc: "Precision tuning of Character, Camera & Controls: tactical top-down readability, input responsiveness, turn states, and blind-party combat resolution."
    }
  },
  {
    code: "NAR",
    score: 99,
    fr: {
      label: "Narrative & Quest Design",
      desc: "Intégration organique de la narration dans les mécaniques : quêtes secondaires à objectifs, événements dynamiques et cohérence thématique des compétences."
    },
    en: {
      label: "Narrative & Quest Design",
      desc: "Seamless integration of narrative and mechanics: objective-driven side quests, dynamic world events, and thematic skill design."
    }
  },
  {
    code: "LWD",
    score: 99,
    fr: {
      label: "Level & World Design",
      desc: "Topologie de plateaux stratégiques (boucle de 40 cases à 4 villages, zones à haut risque) et arènes 3D favorisant le contrôle d'espace et la prise de décision."
    },
    en: {
      label: "Level & World Design",
      desc: "Strategic board topology (40-tile 4-village loop, high-risk zones) and 3D combat arenas crafted for spatial control and meaningful choices."
    }
  },
  {
    code: "UXG",
    score: 95,
    fr: {
      label: "UX & Game Feel",
      desc: "Ergonomie mobile Pass-and-Play à un écran, lisibilité HUD sous pression temporelle, feedbacks visuels/sonores (« Game Juice ») et onboarding intuitif."
    },
    en: {
      label: "UX & Game Feel",
      desc: "One-screen mobile Pass-and-Play ergonomics, HUD clarity under timer pressure, tactile audio/visual 'Game Juice', and intuitive player onboarding."
    }
  }
];

export const LOADOUT_ITEMS = [
  {
    id: "unity",
    icon: "⚔️",
    name: "Unity 3D/2D",
    tier: "Mythic Core",
    fr: "Moteur principal : Architecture ScriptableObject, Netcode multijoueur, UI/UX mobile & prototypage C# rapide.",
    en: "Primary Engine: ScriptableObject data architecture, Multiplayer Netcode, mobile UI/UX & rapid C# prototyping."
  },
  {
    id: "csharp",
    icon: "📜",
    name: "C# Scripting",
    tier: "Legendary Tome",
    fr: "Programmation gameplay orientée objet, machines à états finis (Turn/Combat FSM), algorithmes procéduraux & intégration API IA.",
    en: "Object-oriented gameplay scripting, Finite State Machines (Turn/Combat FSM), procedural algorithms & AI API integration."
  },
  {
    id: "aseprite",
    icon: "🎨",
    name: "Aseprite",
    tier: "Epic Blade",
    fr: "Direction artistique Pixel Art 2D, animations de sprites image par image, tuiles et effets visuels de sortilèges (Magic Words).",
    en: "2D Pixel Art direction, frame-by-frame sprite animation, tilemaps, and spell VFX (Magic Words)."
  },
  {
    id: "blender",
    icon: "🛡️",
    name: "Blender",
    tier: "Rare Relic",
    fr: "Modélisation 3D low-poly, blockout d'arènes tactiques et intégration d'assets dans le pipeline Unity 3D (Wise Battle).",
    en: "Low-poly 3D modeling, tactical arena blockouts, and asset pipeline integration into Unity 3D (Wise Battle)."
  },
  {
    id: "illustrator",
    icon: "🧭",
    name: "Illustrator",
    tier: "Epic Scroll",
    fr: "Design vectoriel de plateaux de jeu (40 cases), gabarits de cartes Shinobi, iconographie HUD et livrets de règles.",
    en: "Vector tabletop board layouts (40 tiles), Shinobi card templates, HUD iconography, and rulebook typography."
  },
  {
    id: "github",
    icon: "⚡",
    name: "GitHub / Git",
    tier: "Tactical Seal",
    fr: "Gestion de versions en équipe, revues de code, branches de fonctionnalités et déploiement continu.",
    en: "Team version control, code reviews, feature branching workflows, and continuous deployment."
  }
];

export const TRANSLATIONS = {
  fr: {
    "hud.unit_sub": "LVL 22 // MASTER GAME DESIGN @ IIM PARIS",
    "hud.nav_hero": "Fiche Unité",
    "hud.nav_quests": "Journal de Quêtes (5)",
    "hud.nav_achievements": "Trophées",
    "hud.atmo_label": "Atmosphère :",
    "hud.atmo_default": "Obsidienne & Or Tactique",
    "hud.atmo_wise-battle": "Wise Battle — Forêt Médiévale & Arcane",
    "hud.atmo_naruto": "Naruto — Parchemin Cramoisi & Chakra",
    "hud.atmo_magic-words": "Magic Words — Violet Runique",
    "hud.atmo_balloon": "Balloon — Azur Céleste & Vent",
    "hud.atmo_locked-slot": "Slot #05 — Blueprint Émeraude",

    "hero.eyebrow": "// INSPECTION D'UNITÉ JOUABLE — FICHE DE PERSONNAGE RPG",
    "hero.title": "Ahmed Awedni — Game Designer & Technical Designer",
    "hero.rarity": "★ UNITÉ LÉGENDAIRE",
    "hero.inspect_hint": "SURVOLER POUR SCANNER",
    "hero.lvl_badge": "LVL 22 — Master Game Design @ IIM Paris",
    "hero.class_title": "Game Designer & Technical Unity Developer",
    "hero.buffs_title": "BUFFS DE RECHERCHE ACTIFS (2026)",
    "hero.buff1": "⚡ Recherche Alternance / Stage Alterné",
    "hero.buff2": "📍 Paris — Île-de-France (Mobilité Totale)",
    "hero.buff3": "🎯 Dispo Immédiate — Rythme École/Studio",
    "hero.lore": "Concepteur de systèmes de jeu et développeur Unity C# passionné par <strong>l'équilibrage mathématique</strong>, les <strong>économies d'action asymétriques</strong> et le <strong>Game Feel</strong>. Je transforme des intentions de design complexes en prototypes jouables, lisibles et rigoureusement équilibrés par le playtest.",
    "hero.radar_title": "RADAR HEXAGONAL D'ATTRIBUTS",
    "hero.radar_default_tip": "Survolez ou cliquez sur l'une des 6 statistiques RPG pour inspecter les preuves de conception et systèmes associés.",
    "hero.loadout_title": "INVENTAIRE ÉQUIPÉ & ARSENAL TECHNIQUE (6 SLOTS)",
    "hero.loadout_sub": "Cliquez sur un équipement pour inspecter ses bonus de production",

    "quests.eyebrow": "// JOURNAL DE CAMPAGNE — 5 ÉTUDES DE CAS & SIMULATEURS INTERACTIFS",
    "quests.title": "Quêtes Principales & Architecture de Systèmes",
    "quests.filter_all": "Tous les Projets (5)",
    "quests.filter_tech": "Technical Design & Scripting",
    "quests.filter_sys": "Systems & Balancing",
    "quests.filter_3cs": "Core Mechanics & 3Cs",
    "quests.filter_lwd": "Level, World & Narrative",
    "quests.filter_uxg": "UX & Game Feel",
    "quests.primary_skills": "Compétences Clés :",
    "quests.activate_theme": "Activer l'Atmosphère",

    /* PROJECT 1: WISE BATTLE */
    "p1.badge": "QUÊTE #01 // RPG TACTIQUE MULTIJOUEUR 3D & IA SERIOUS GAME",
    "p1.title": "Wise Battle",
    "p1.meta_role": "<strong>Rôle :</strong> Co-Auteur GDD, Game Designer & Développeur Unity C#",
    "p1.meta_stack": "<strong>Stack :</strong> Unity 3D, C#, Netcode, Gemini API, Blender",
    "p1.meta_scope": "<strong>Cadre :</strong> Projet Capstone 4 Mois (CGI Studio) | Mobile Android",
    "p1.pitch": "Un RPG médiéval-fantastique 3D en 1v1 au tour par tour où les joueurs importent n'importe quel cours PDF et utilisent des quiz de rappel actif générés par IA comme unique carburant de leur économie d'énergie de combat.",
    "p1.pdr_title": "Journal d'Itération Playtest (Problème → Décision → Résultat)",
    "p1.pdr_prob": "Avantage critique du Joueur 1 et joueurs répondant au hasard en 1 seconde pour accumuler de l'énergie.",
    "p1.pdr_dec": "Création de la « Règle 30/30 » avec pénalité stricte (-15 Énergie + verrouillage de la phase d'action en cas d'erreur) et ajout du buff d'équilibrage « Second Player Aid » (+15 Énergie au Tour 1 pour le Joueur 2).",
    "p1.pdr_res": "Taux de victoire J1/J2 stabilisé à 51% / 49% sur 40+ matchs de test ; élimination totale du spam aléatoire.",
    "p1.media_label": "APERÇU TACTIQUE 3D // PRÉ-CÂBLÉ : /public/assets/media/wise-battle.mp4",
    "p1.artA_title": "Simulateur Interactif « Règle 30/30 » : Économie d'Énergie & Machine à États",
    "p1.artB_title": "Inspecteur de Roster Asymétrique & Architecture C# (ScriptableObjects)",

    /* PROJECT 2: NARUTO BOARD GAME */
    "p2.badge": "QUÊTE #02 // JRPG TACTIQUE SUR PLATEAU & STRATÉGIE TERRITORIALE (2 À 8 JOUEURS)",
    "p2.title": "Naruto: The Board Game",
    "p2.meta_role": "<strong>Rôle :</strong> Solo Game Designer & Graphic Designer",
    "p2.meta_stack": "<strong>Outils :</strong> Illustrator, Canva, Équilibrage Tableur",
    "p2.meta_scope": "<strong>Tag :</strong> Étude de Systèmes Tabletop Non-Commerciale — Adaptation Fan IP",
    "p2.pitch": "Un JRPG tactique sur plateau au tour par tour pour 2 à 8 joueurs à travers une boucle de 40 cases reliant les Quatre Villages Cachés, mêlant combat d'escouade Shinobi à main cachée, économie de défense territoriale et 3 modes de jeu.",
    "p2.pdr_title": "Journal d'Itération Playtest (Problème → Décision → Résultat)",
    "p2.pdr_prob": "Effet boule de neige façon Monopoly où le premier acheteur taxait automatiquement tous les joueurs sans contre-jeu tactique, et combats d'usure trop lents.",
    "p2.pdr_dec": "Introduction du « Power Check Territorial » (péage payé UNIQUEMENT si Puissance Totale de l'Équipe Active < Défense du Lieu) et du « Full-HP Turn Reset » exigeant des combos explosifs ou passifs létaux.",
    "p2.pdr_res": "Tension tactique constante : les joueurs adaptent la composition de leur main active (3 max) au tour 1 pour franchir les territoires ennemis.",
    "p2.media_label": "PLATEAU 40 CASES // PRÉ-CÂBLÉ : /public/assets/media/naruto-board-game.mp4",
    "p2.artA_title": "Boucle de Plateau 40 Cases & Calculateur de Défense Territoriale",
    "p2.artB_title": "Simulateur de Combat Aveugle (3 Cartes) & Matrice des 3 Modes de Jeu",

    /* PROJECT 3: MAGIC WORDS */
    "p3.badge": "QUÊTE #03 // DUEL DE SORCIERS PVP LOCAL 2D — PUBLIÉ SUR ITCH.IO",
    "p3.title": "Magic Words",
    "p3.meta_role": "<strong>Rôle :</strong> Solo Game Designer, Pixel Artist & Développeur Unity",
    "p3.meta_stack": "<strong>Stack :</strong> Unity 2D, C#, Aseprite",
    "p3.meta_scope": "<strong>Plateforme :</strong> PC / Web (Publié sur itch.io)",
    "p3.pitch": "Un duel de sorciers 1v1 en multijoueur local pixel-art inspiré de Bookworm Adventures, où les joueurs forgent à tour de rôle des mots anglais de 3+ lettres à partir d'un tirage aléatoire pour lancer des déflagrations magiques ou des soins tactiques.",
    "p3.pdr_title": "Journal d'Itération Playtest (Problème → Décision → Résultat)",
    "p3.pdr_prob": "Deux problèmes majeurs en playtest : (1) tirages de 9 consonnes rendant le tour injouable, et (2) spam de mots courts de 3 lettres en soin prolongeant les duels indéfiniment.",
    "p3.pdr_dec": "Programmation d'un algorithme C# de sac pondéré garantissant 2 à 3 voyelles minimum par tirage, et courbe exponentielle des dégâts d'attaque surclassant le plafond de soin dès 5+ lettres.",
    "p3.pdr_res": "Zéro tour mort signalé et durée moyenne de duel ramenée de 14 minutes à 5 minutes intenses.",
    "p3.media_label": "ARÈNE PIXEL ART // PRÉ-CÂBLÉ : /public/assets/media/magic-words.mp4",
    "p3.artA_title": "Simulateur de Courbe : Dégâts d'Attaque vs Soin selon la Longueur du Mot",
    "p3.artB_title": "Algorithme de Tirage à Voyelles Garanties & Logique C#",

    /* PROJECT 4: BALLOON OF THE COUNTRIES */
    "p4.badge": "QUÊTE #04 // JEU DE GÉOGRAPHIE MOBILE AU TOUR PAR TOUR 2D — PUBLIÉ SUR ITCH.IO",
    "p4.title": "Balloon of the Countries",
    "p4.meta_role": "<strong>Rôle :</strong> Solo Game Designer & Développeur Unity",
    "p4.meta_stack": "<strong>Stack :</strong> Unity 2D, C#, Aseprite, Illustrator",
    "p4.meta_scope": "<strong>Plateforme :</strong> Mobile / itch.io",
    "p4.pitch": "Un jeu 2D vibrant de géographie et de stratégie au tour par tour en multijoueur local (Pass-and-Play), conçu pour des sessions mobiles rapides et publié sur itch.io.",
    "p4.pdr_title": "Journal d'Itération Playtest (Problème → Décision → Résultat)",
    "p4.pdr_prob": "Confusion lors du passage du téléphone entre joueurs : double HUD encombré et clics accidentels pendant la transition de tour.",
    "p4.pdr_dec": "Refonte complète vers un HUD Pass-and-Play à écran unique avec écran intercalaire de relais, indicateurs de tour codés par couleur et contrôles regroupés dans la zone du pouce.",
    "p4.pdr_res": "Transitions de tour 2× plus rapides sur mobile et suppression totale des erreurs de saisie entre joueurs.",
    "p4.media_label": "HUD MOBILE 2D // PRÉ-CÂBLÉ : /public/assets/media/balloon-countries.mp4",
    "p4.artA_title": "Wireframe UI Pass-and-Play à Un Écran — Comparateur Avant vs Après",
    "p4.artB_title": "Courbe d'Escalade des Manches & Multiplicateur de Score Risque/Récompense",

    /* PROJECT 5: LOCKED SLOT #05 */
    "p5.badge": "QUÊTE #05 // EMPLACEMENT DE QUÊTE VERROUILLÉ — PROTOTYPE JOUABLE EN APPROCHE",
    "p5.title": "[LOCKED QUEST SLOT #05 — Incoming Playable 2D Prototype]",
    "p5.pitch": "Emplacement d'extension modulaire pré-câblé pour accueillir le prochain prototype 2D jouable directement dans le navigateur (Level Design, AI Behavior, Narrative Design & Rapid Prototyping).",
    "p5.status": "STATUT : HOOK DOM & CANVAS PRÊTS POUR INJECTION LIVE",
    "p5.btn_scan": "Scanner la Télémétrie du Blueprint #05",

    /* ACHIEVEMENTS */
    "ach.eyebrow": "// VITRINE DE TROPHÉES — SUCCÈS DÉVERROUILLÉS",
    "ach.title": "Jalons de Production & Expérience Expédiée",
    "ach.unlocked": "SUCCÈS DÉVERROUILLÉ",
    "ach.a1_title": "Bubble Trouble",
    "ach.a1_desc": "Premier projet et premier jeu mobile expédié sur le Google Play Store.",
    "ach.a2_title": "Global Game Jam 2026",
    "ach.a2_desc": "Vétéran du prototypage rapide en 48 heures chrono en équipe pluridisciplinaire.",
    "ach.a3_title": "Inspecteur de Systèmes",
    "ach.a3_desc": "Interagissez avec un simulateur de Game Design ou copiez l'email recruteur (+100 XP).",

    /* RECRUITER DOCK */
    "dock.status": "PRÊT POUR ENTRETIEN // ALTERNANCE & STAGE ALTERNÉ (PARIS / IDF)",
    "dock.cv": "Télécharger CV (PDF)",
    "dock.copy_email": "Copier Email (+100 XP)",
    "dock.toast_email": "+100 XP — Email copié : ahmed.awadni.jr@gmail.com !"
  },

  en: {
    "hud.unit_sub": "LVL 22 // MASTER GAME DESIGN @ IIM PARIS",
    "hud.nav_hero": "Character Sheet",
    "hud.nav_quests": "Quest Log (5)",
    "hud.nav_achievements": "Achievements",
    "hud.atmo_label": "Atmosphere:",
    "hud.atmo_default": "Obsidian & Tactical Gold",
    "hud.atmo_wise-battle": "Wise Battle — Medieval Forest & Arcane",
    "hud.atmo_naruto": "Naruto — Shinobi Crimson & Chakra",
    "hud.atmo_magic-words": "Magic Words — Arcane Runic Violet",
    "hud.atmo_balloon": "Balloon — Sky Azure & Wind",
    "hud.atmo_locked-slot": "Slot #05 — Emerald Blueprint",

    "hero.eyebrow": "// PLAYABLE UNIT INSPECT — INTERACTIVE RPG CHARACTER SHEET",
    "hero.title": "Ahmed Awedni — Game Designer & Technical Designer",
    "hero.rarity": "★ LEGENDARY UNIT",
    "hero.inspect_hint": "HOVER TO INSPECT",
    "hero.lvl_badge": "LVL 22 — Master Game Design @ IIM Paris",
    "hero.class_title": "Game Designer & Technical Unity Developer",
    "hero.buffs_title": "ACTIVE STATUS BUFFS (2026)",
    "hero.buff1": "⚡ Seeking Alternance / Stage Alterné",
    "hero.buff2": "📍 Paris — Île-de-France (Full Mobility)",
    "hero.buff3": "🎯 Ready Immediately — Work-Study Rhythm",
    "hero.lore": "Systems Game Designer and Unity C# Developer specializing in <strong>mathematical game balancing</strong>, <strong>asymmetric action economies</strong>, and <strong>tactile Game Feel</strong>. I bridge creative design vision and clean C# engineering to build playable, playtest-hardened combat and progression systems.",
    "hero.radar_title": "HEXAGONAL ATTRIBUTE RADAR",
    "hero.radar_default_tip": "Hover or click any of the 6 core RPG attributes to inspect system design proofs and mechanics.",
    "hero.loadout_title": "EQUIPPED INVENTORY & TECHNICAL LOADOUT (6 SLOTS)",
    "hero.loadout_sub": "Click any equipped tool slot to inspect its production modifiers",

    "quests.eyebrow": "// CAMPAIGN QUEST LOG — 5 CASE STUDIES & INTERACTIVE SIMULATORS",
    "quests.title": "Main Quests & Systems Architecture",
    "quests.filter_all": "All Projects (5)",
    "quests.filter_tech": "Technical Design & Scripting",
    "quests.filter_sys": "Systems & Balancing",
    "quests.filter_3cs": "Core Mechanics & 3Cs",
    "quests.filter_lwd": "Level, World & Narrative",
    "quests.filter_uxg": "UX & Game Feel",
    "quests.primary_skills": "Primary Skills:",
    "quests.activate_theme": "Preview World Theme",

    /* PROJECT 1: WISE BATTLE */
    "p1.badge": "QUEST #01 // 3D ONLINE MULTIPLAYER TACTICAL RPG & AI SERIOUS GAME",
    "p1.title": "Wise Battle",
    "p1.meta_role": "<strong>Role:</strong> Co GDD Maker, Game Designer & Unity C# Developer",
    "p1.meta_stack": "<strong>Stack:</strong> Unity 3D, C#, Netcode, Gemini API, Blender",
    "p1.meta_scope": "<strong>Scope:</strong> 4-Month Capstone (CGI Studio) | Android Mobile",
    "p1.pitch": "A 3D top-down 1v1 turn-based medieval fantasy RPG where players upload any PDF course document and use AI-generated active-recall trivia as the sole fuel for their combat energy economy.",
    "p1.pdr_title": "Playtest Iteration Log (Problem → Decision → Result)",
    "p1.pdr_prob": "Severe first-mover snowball advantage and players blind-guessing answers in 1 second to farm maximum energy.",
    "p1.pdr_dec": "Engineered the '30/30 Rule' with a strict -15 Energy wrong-answer penalty + Action Phase lock, paired with the 'Second Player Aid' buff (+15 starting Energy on Turn 1 for Player 2).",
    "p1.pdr_res": "Stabilized P1/P2 win rates to 51% / 49% across 40+ playtest matches and eliminated blind-guess rushing.",
    "p1.media_label": "3D TACTICAL ARENA // PRE-WIRED: /public/assets/media/wise-battle.mp4",
    "p1.artA_title": "Interactive '30/30 Rule' Energy Economy & Turn State Machine Simulator",
    "p1.artB_title": "Asymmetric Hero Roster & C# Architecture Inspector (ScriptableObjects)",

    /* PROJECT 2: NARUTO BOARD GAME */
    "p2.badge": "QUEST #02 // TACTICAL JRPG TABLETOP & TERRITORY STRATEGY (2 TO 8 PLAYERS)",
    "p2.title": "Naruto: The Board Game",
    "p2.meta_role": "<strong>Role:</strong> Solo Game Designer & Graphic Designer",
    "p2.meta_stack": "<strong>Tools:</strong> Illustrator, Canva, Spreadsheet Balancing",
    "p2.meta_scope": "<strong>Tag:</strong> Uncommercial Tabletop Systems Design Study — Fan IP Adaptation",
    "p2.pitch": "A tactical 2-to-8 player turn-based tabletop JRPG set across a 40-tile board of the Four Hidden Villages, blending blind-hand Shinobi party combat, territory defense economics, and 3 distinct game modes.",
    "p2.pdr_title": "Playtest Iteration Log (Problem → Decision → Result)",
    "p2.pdr_prob": "Monopoly-style runaway leader snowballing where early tile owners taxed everyone without tactical counterplay, alongside sluggish chip-damage combat.",
    "p2.pdr_dec": "Designed the 'Territory Power Check' (enemies only pay the SP toll if Active Party Total Power < Location Defensive Power) and 'Full-HP Turn Reset' requiring burst combos or fatal passives.",
    "p2.pdr_res": "Created high-stakes hand management: players strategically swap their 3-card Active Party at Tile 1 to breach rival village territories.",
    "p2.media_label": "40-TILE BOARD LOOP // PRE-WIRED: /public/assets/media/naruto-board-game.mp4",
    "p2.artA_title": "Interactive 40-Tile Board Loop & Territory Defense Calculator",
    "p2.artB_title": "Blind-Target Party Combat Simulator & 3-Mode Balancing Matrix",

    /* PROJECT 3: MAGIC WORDS */
    "p3.badge": "QUEST #03 // 2D LOCAL PVP WIZARD WORD DUEL — PUBLISHED ON ITCH.IO",
    "p3.title": "Magic Words",
    "p3.meta_role": "<strong>Role:</strong> Solo Game Designer, Pixel Artist & Unity Developer",
    "p3.meta_stack": "<strong>Stack:</strong> Unity 2D, C#, Aseprite",
    "p3.meta_scope": "<strong>Platform:</strong> PC / Web (Published on itch.io)",
    "p3.pitch": "A minimalist pixel-art 1v1 local multiplayer wizard duel inspired by Bookworm Adventures, where players take turns forging 3+ letter English words from a randomized letter pool to cast scaled magical blasts or tactical self-heals.",
    "p3.pdr_title": "Playtest Iteration Log (Problem → Decision → Result)",
    "p3.pdr_prob": "Two major playtest bottlenecks: (1) pure RNG consonant droughts making turns unplayable, and (2) 3-letter self-heal stalling dragging matches out.",
    "p3.pdr_dec": "Implemented a C# Vowel-Guaranteed Bag algorithm (enforcing 2–3 vowels per 9-tile rack) and curved Attack Damage to outscale Self-Heal at 5+ letters.",
    "p3.pdr_res": "Zero dead-rack turns recorded and average duel duration tightened from 14 minutes to an intense 5-minute arc.",
    "p3.media_label": "PIXEL ART DUEL // PRE-WIRED: /public/assets/media/magic-words.mp4",
    "p3.artA_title": "Interactive Word-Length Damage vs. Self-Heal Scaling Simulator",
    "p3.artB_title": "Vowel-Guaranteed Letter Pool Algorithm & Playtest Iteration",

    /* PROJECT 4: BALLOON OF THE COUNTRIES */
    "p4.badge": "QUEST #04 // 2D TURN-BASED MOBILE GEOGRAPHY GAME — PUBLISHED ON ITCH.IO",
    "p4.title": "Balloon of the Countries",
    "p4.meta_role": "<strong>Role:</strong> Solo Game Designer & Unity Developer",
    "p4.meta_stack": "<strong>Stack:</strong> Unity 2D, C#, Aseprite, Illustrator",
    "p4.meta_scope": "<strong>Platform:</strong> Mobile / itch.io",
    "p4.pitch": "A vibrant 2D local turn-based geography and strategy game published on itch.io.",
    "p4.pdr_title": "Playtest Iteration Log (Problem → Decision → Result)",
    "p4.pdr_prob": "Cluttered dual-player HUD caused accidental misclicks and confusion when handing the phone between players.",
    "p4.pdr_dec": "Redesigned into a streamlined One-Screen Pass-and-Play UI with turn-handoff banners, color-coded active player borders, and thumb-zone anchored controls.",
    "p4.pdr_res": "2× faster turn handoffs on mobile viewports and zero accidental input collisions during local multiplayer tests.",
    "p4.media_label": "2D MOBILE HUD // PRE-WIRED: /public/assets/media/balloon-countries.mp4",
    "p4.artA_title": "One-Screen Pass-and-Play UI Wireframe — Before vs. After",
    "p4.artB_title": "Round Escalation & Score Multiplier Curve",

    /* PROJECT 5: LOCKED SLOT #05 */
    "p5.badge": "QUEST #05 // LOCKED QUEST SLOT #05 — INCOMING PLAYABLE 2D PROTOTYPE",
    "p5.title": "[LOCKED QUEST SLOT #05 — Incoming Playable 2D Prototype]",
    "p5.pitch": "Pre-wired modular expansion slot engineered to mount our upcoming live playable 2D prototype directly inside the HUD (Level Design, AI Behavior, Narrative Design & Rapid Prototyping).",
    "p5.status": "STATUS: DOM HOOK & CANVAS MOUNT READY FOR LIVE INJECTION",
    "p5.btn_scan": "Scan Blueprint Telemetry #05",

    /* ACHIEVEMENTS */
    "ach.eyebrow": "// TROPHY CABINET — UNLOCKED ACHIEVEMENTS",
    "ach.title": "Shipped Milestones & Rapid Prototyping",
    "ach.unlocked": "ACHIEVEMENT UNLOCKED",
    "ach.a1_title": "Bubble Trouble",
    "ach.a1_desc": "First project and first Shipped Mobile Game on Google Play Store.",
    "ach.a2_title": "Global Game Jam 2026",
    "ach.a2_desc": "48-Hour Rapid Prototyping Veteran.",
    "ach.a3_title": "Systems Inspector",
    "ach.a3_desc": "Tested an interactive Game Design simulator or copied recruiter contact (+100 XP).",

    /* RECRUITER DOCK */
    "dock.status": "READY FOR INTERVIEW // SEEKING ALTERNANCE & STAGE ALTERNÉ (PARIS / IDF)",
    "dock.cv": "Download CV (PDF)",
    "dock.copy_email": "Copy Email (+100 XP)",
    "dock.toast_email": "+100 XP — Email Copied: ahmed.awadni.jr@gmail.com!"
  }
};
