Invoke my `websites-wizard`, `frontend-design`, `web-design-guidelines`, and `latest-method-validator` skills (and any other skill or MCP you might need) to design, build, test, and deploy my complete, hyper-stylized, Game-UI-driven Game Designer & Technical Unity Developer Portfolio Website.

### 1. CORE VISUAL DIRECTION: "THE PORTFOLIO IS A PLAYABLE GAME UI" (TOP PRIORITY)
Do NOT build a standard corporate website. Treat the entire website as a AAA Indie Game Menu & Interactive HUD (inspired by *DnD:battleMarked*, *Baldur's Gate 3*, and *Persona/Elden Ring* menus) with extreme "Game Feel" and "Juice":

1. **Interactive RPG Character Sheet Hero Section:**
   - Present **Ahmed Awedni** as a playable Character/Unit inspect screen.
   - **Left Column (Character Avatar Frame):** A stylized ornate/tactical character portrait frame (pre-wired to load `/public/assets/avatar.png` or `.webp` with a stylized RPG silhouette placeholder if not yet added) with a glowing rarity border, level badge (`LVL 22 — Master Game Design @ IIM Paris`), Class Title (`Game Designer & Technical Designer`), active Buff icons (`Seeking Alternance / Stage Alterné / Paris — Île-de-France`), and an interactive inspect effect.
- **Right Column (Core Game Designer RPG Attributes & Stat Bars):** Animated stat bars (plus an optional 6-point hexagonal radar chart) with hover tooltips presenting my 6 core Stats:
     - `SYS [Systems & Economy Design (Game Balancing)] — 96/100`
     - `TEC [Technical Game Design (Prototyping & Scripting)] — 81/100`
     - `3CS [Core Gameplay Mechanics & 3Cs Design] — 92/100`
     - `NAR [Narrative & Quest Design] — 99/100`
     - `LWD [Level & World Design] — 99/100`
     - `UXG [UX & Game Feel] — 95/100`
   - **Equipped Inventory / Loadout Slots:** Interactive RPG equipment slots for my tools (Unity, C#, Aseprite, Blender, Illustrator, GitHub) with RPG item-tooltip popups on hover.

2. **Full-Screen Shockwave Language Switcher (FR <-> EN):**
   - Default language: **French** (for Paris studio recruiters), with instant toggle to **English**.
   - **The Effect:** Clicking the `FR / EN` toggle triggers a full-screen radial CSS/Canvas **Shockwave Ring** expanding from the button's exact coordinates across the entire viewport, accompanied by a text-cipher decode animation transforming all text into the target language, synced with an **ElevenLabs** pulse SFX.

3. **Dynamic Project-Reactive Atmosphere & Background:**
   - Build a live HTML5 Canvas background layer with subtle ambient particles and dynamic lighting that shifts theme as the user views or hovers over each project:
     - *Default / Character Sheet:* Obsidian & medieval Tactical Gold embers.
     - *Project 1 (Wise Battle):* High-Fantasy Medieval Forest Green, Parchment Gold & Arcane Sparks.
     - *Project 2 (Naruto: The Board Game):* Shinobi Scroll Crimson, Chakra Orange & Tactical Map Grid Lines.
     - *Project 3 (Magic Words):* Arcane Violet & Floating Pixel Letter Runes.
     - *Project 4 (Balloon of the Countries):* Sky Azure, Compass Gold & Wind Particles.
     - *Project 5 (Locked Slot #05):* Mystery Emerald Blueprint & Stealth Grid Pulse.

4. **ElevenLabs Audio & "Game Juice" Micro-Interactions:**
   - Use the **ElevenLabs MCP** (paired with a zero-latency WebAudio synthesizer fallback) for background music and for tactile UI hover ticks, tab switches, card flips, and the Shockwave SFX, controlled by a top-bar **"Audio HUD Toggle (SFX ON/OFF) (MUSIC ON/OFF)"**.

---

### 2. QUEST FILTER & THE 5 PROJECT CASE STUDIES
Include an interactive "Quest Filter" bar above the projects using clean, general categories:
`[All Projects (5)]` | `[Technical Design & Scripting]` | `[Systems & Balancing]` | `[Core Mechanics & 3Cs]` | `[Level, World & Narrative]` | `[UX & Game Feel]`

Each of the first 4 projects must display a **`Primary Skills:`** badge list, a **Metadata HUD Bar**, a **1-Sentence High-Concept Pitch**, a **Dedicated Media Showcase Frame (pre-wired to load local `.mp4`/`.gif`/`.webp` gameplay clips from `/public/assets/media/` with a stylized animated placeholder until I drop the files in)**, a **Playtest Iteration Box (`Problem -> Decision -> Result`)**, and **2 Interactive HTML/CSS/SVG Game Design Artifacts** accurate to the real game mechanics:

#### Project 1: Wise Battle (3D Online Multiplayer Tactical RPG & AI Serious Game)
- **Primary Skills:** Systems & Combat Design, Game Balancing, Unity C#, Multiplayer Architecture, Mobile UI/UX
- **Metadata:** Co GDD maker, Game Designer & Unity C# Developer | Unity 3D, C#, Netcode, Gemini API, Blender | 4-Month Capstone (CGI Studio) | Android Mobile
- **Pitch:** A 3D top-down 1v1 turn-based medieval fantasy RPG where players upload any PDF course document and use AI-generated active-recall trivia as the sole fuel for their combat energy economy.
- **Artifact A (Interactive "30/30 Rule" Energy Economy & Turn State Machine Simulator):**
  Build an interactive visual diagram & calculator of the 2-Phase Turn Loop (30-second timer, 30-turn match cap, 100 Max Energy):
  - Show how answering correctly in $T$ seconds yields $+T_{\text{remaining}}$ Energy and unlocks the **Action Phase** (`Attack` 20E, `Defend` 10E, `Unique Skill` Variable E, `Pass` 0E).
  - Show how a wrong answer inflicts a **-15 Energy penalty** and locks the Action Phase, while a Timeout yields **0 Energy** and forfeits the turn.
  - Highlight the **"Second Player Aid" Balancing Buff** (Player 2 starts with +15 Energy on Turn 1 to mathematically offset the first-mover advantage).
- **Artifact B (Interactive Asymmetric Hero Roster & Architecture Inspector):**
  Build an interactive 3-tab character card switcher comparing the 3 playable medieval archetypes and how Aleric's utility directly manipulates the quiz economy:
  - **Galios (The Knight — Attrition Tank):** 100 HP | 25 ATK (20E) | 15 DEF (10E) | Unique Skill: *Shield Slam* (50E — Deals 15 DMG + 50% chance to **Stun** enemy, forfeiting their next turn).
  - **Pokey (The Assassin — Glass Cannon):** 90 HP | 30 ATK (20E) | 10 DEF (10E) | Unique Skill: *Assassin's Rush* (35E — Grants +10 ATK for 3 consecutive turns).
  - **Aleric (The Mage — Chronomancer Utility):** 80 HP | 35 ATK (20E) | 5 DEF (10E) | Unique Skill: *Time Spell* (30E — Grants **+10 extra seconds** on the quiz timer for the next 3 turns, directly supercharging Energy generation!).
  - Include a collapsible C# architecture view showing how `CharacterDataSO` and polymorphic `BaseSkill` classes decouple data from `BattleManager` and `PlayerAnimator`.

#### Project 2: Naruto: The Board Game (Tactical JRPG Tabletop & Territory Strategy — 2 to 8 Players)
- **Primary Skills:** Tabletop Systems Design, Rulebook Writing, Economy & combat Balancing, Board Layout Design
- **Metadata:** Solo Game Designer & Graphic Designer | Illustrator, Canva, Spreadsheet Balancing | Solo Design Study | Physical Tabletop *(Tag: Uncommercial Tabletop Systems Design Study — Fan IP Adaptation)*
- **Pitch:** A tactical 2-to-8 player turn-based tabletop JRPG set across a 40-tile board of the Four Hidden Villages, blending blind-hand Shinobi party combat, territory defense economics, and 3 distinct game modes.
- **Artifact A (Interactive 40-Tile Board Loop & Territory Defense Calculator):**
  Build an interactive miniature diagram of the **40-Tile Board Loop** showcasing key strategic tiles and mechanics:
  - **Tile 1 (Starting Line):** Grants Tour completion bonus (+1000 SP in Normal, +1500 SP in Shinobis War) and unlocks **Active Party (3 max in hand) <-> Inactive Party (2 max reserve)** swapping.
  - **Location Tiles & Power Check Mechanic:** Interactive example (e.g., *Hidden Leaf Village 1*: 100 SP cost for 35 Defensive Power) showing the core rule: an enemy landing on an owned tile only pays the SP toll if their **Active Party Total Power < Location Defensive Power**!
  - **Special Tiles:** The 4 **Kage Offices** (Tiles 6, 16, 26, 36 — grant end-game buffs, party swapping, and the *Kage Office Victory* condition), **Shinobi Draw** (Tile 8), **Side Quests** (Tile 9, max 3 held), **Genjutsu Traps** (Tiles 11 & 31), and **Legendary Draw** (Tile 21 — requires rolling 11+ on 2D6).
- **Artifact B (Blind-Target Combat System, Passive Triggers & 3-Mode Balancing Matrix):**
  - **Blind Party Combat & Full-HP Turn Reset:** Visual breakdown of how an attacker uses a combat ability (e.g., *Kakashi's Chidori*: 60 DMG at 1-tile range) by blindly picking 1 of the defender's 3 face-down Active Party cards, and why non-lethal damage heals at the end of the turn (requiring burst combos or passives like *Sakura's Healthy Dice* automatic fatal-hit trigger).
  - **3 Game Modes & 3 Win Conditions Comparison Table:** Compare *Normal Mode* (2000 SP, 1 Common Shinobi, 2 Mercies), *Shinobis War Mode* (4000 SP, 3 Shinobis, 0 Mercy, Round 1 Treaty), and *Alliance Team Mode* (shared inactive party, 1-tile *Downed/Revive* mechanic for 500 SP or 3+ roll vs. enemy *Finishing Blow* on 5+), plus the rare **"Red Moon Right of Victory"** via *The Masked One (TMO)* 3-round player capture channeling.

#### Project 3: Magic Words (2D Local PvP Wizard Word Duel — Published on itch.io)
- **Primary Skills:** Combat Balancing, Procedural Systems, Unity C#, 2D Pixel Art
- **Metadata:** Solo Game Designer, Pixel Artist & Unity Developer | Unity 2D, C#, Aseprite | Solo | PC / Web (itch.io)
- **Pitch:** A minimalist pixel-art 1v1 local multiplayer wizard duel inspired by *Bookworm Adventures*, where players take turns forging 3+ letter English words from a randomized letter pool to cast scaled magical blasts or tactical self-heals.
- **Artifact A (Interactive Word-Length Damage vs. Heal Scaling Simulator):** Interactive UI slider (3-letter to 8+ letter words) demonstrating how Attack Damage vs. Self-Heal values are mathematically curved so offensive spelling outscales defensive heal-stalling.
- **Artifact B (Vowel-Guaranteed Letter Pool Algorithm & Playtest Iteration):** C# logic diagram preventing unplayable consonant droughts + Playtest iteration log on nerfing short-word heal spam.

#### Project 4: Balloon of the Countries (2D Turn-Based Mobile Geography Game — Published on itch.io)
- **Primary Skills:** Mobile UI/UX, Turn-Based Pacing, Progression Design, 2D Game Art
- **Metadata:** Solo Game Designer & Unity Developer | Unity 2D, C#, Aseprite, Illustrator | Solo | Mobile / itch.io
- **Pitch:** A vibrant 2D local turn-based geography and strategy game published on itch.io.
- **Artifact A (One-Screen Pass-and-Play UI Wireframe — Before vs. After):** Interactive comparison showing how turn handoffs and HUD indicators were streamlined for mobile ergonomics.
- **Artifact B (Round Escalation & Score Multiplier Curve):** Visual graph of round pacing and risk-reward scoring.

#### Project 5: [LOCKED QUEST SLOT #05 — Incoming Playable 2D Prototype]
- **Primary Skills:** Level Design, AI Behavior, Narrative Design, Rapid Prototyping
- **Requirement:** Render Project #5 as a sleek, intentional **"Locked Quest Slot #05 — Incoming Live Playable 2D Prototype"** card with a glowing blueprint/padlock animation and modular code hook, ready for the playable 2D game we will build in the next step.

---

### 3. ACHIEVEMENT BADGES, RECRUITER HUD & LIVE DEPLOYMENT
- **Unlocked Achievements Row:** Highlight **Bubble Trouble** (*"First project and first Shipped Mobile Game on Google Play Store"*) and **Global Game Jam 2026** (*"48-Hour Rapid Prototyping Veteran"*) as Xbox/Steam-style unlocked achievement badges.
- **Recruiter Fast-Action Dock:** Sticky HUD bar with 1-click access to **GitHub (`https://github.com/ahmedAwedni`)**, **Download CV (PDF)**, **LinkedIn**, and **Direct Email Copy (with "+100 XP Email Copied!" toast)**.
- **Execution & Deployment:**
  1. Build the project with smooth 60fps animations and full mobile/desktop responsiveness.
  2. Test inside the **Antigravity built-in browser** (verify the RPG Character Sheet, FR/EN Shockwave animation, project-reactive background themes, and interactive artifacts).
  3. Push to a new GitHub repository via the **GitHub MCP**.
  4. Deploy live to **Firebase Hosting** via the **Firebase MCP** and return my live `.web.app` URL.