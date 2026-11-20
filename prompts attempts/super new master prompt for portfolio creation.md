Invoke my `websites-wizard`, `frontend-design`, and `web-design-guidelines` skills (and any other skills or MCPs you might need)to perform a COMPLETE visual and architectural frontend redesign of my portfolio website. Keep my existing Firebase Hosting and GitHub deployment setup intact, rebuild the frontend experience from scratch to achieve a breathtaking, AAA indie-game presentation, verify everything in the built-in browser, and redeploy live to Firebase.

### 1. ART DIRECTION: COLORFUL SUNLIT MEDIEVAL FANTASY (ZERO GENERIC DARK BOXES)
- **Visual Inspirations:** *Frieren: Beyond Journey's End*, *Genshin Impact*, *DnD: Battlemarked*, and *Violet Evergarden* cinematic UI composition (in the image I attached).
- **Color Palette & Mood:** Luminous, vibrant medieval fantasy—deep emerald forests, twilight indigo skies, warm sunlit parchment (`#F6ECD9`), burnished antique gold (`#D4AF37`), crimson wax seals, and rich oak wood. NO generic black/grey SaaS boxes, NO boring vertical scrolling grid of rectangles.
- **Asset Strategy (Prevent Basic/Flat CSS):** Use your native image generation tool (if available) to generate painterly, high-craft fantasy assets saved in `/public/assets/ui/` (1: sunlit meadow/twilight forest backdrop, 2: warm sunlit medieval oak wooden table top-down view, 3: ornate emerald-and-gold fantasy grimoire cover, 4: glowing runic treasure chest). Pair these with crisp SVG gold filigree ornaments, procedural SVG parchment grain (`feTurbulence`), layered 3D CSS shadows, and an HTML5 Canvas particle system (floating golden dust motes, fireflies, wind petals).
- **Audio & Game Juice (ElevenLabs MCP + WebAudio Fallback):**
  - Top-bar **Audio HUD Toggle (`SFX ON/OFF` | `MUSIC ON/OFF`)** with subtle medieval fantasy ambient music.
  - Tactile SFX for: Chest tremble & 5-star golden burst, screen shockwave, heavy leather book thud on wood, rapid page-flipping rustle, parchment hover ticks, and silk bookmark clicks.
- **Full-Screen Shockwave Language Switcher (`FR <-> EN`):**
  - Default language: **French** (for Paris recruiters), instant switch to **English**.
  - Clicking the toggle triggers a golden radial **Shockwave Ring** expanding from the button across the viewport with a subtle rune-cipher text reveal and ElevenLabs magical pulse SFX.

---

### 2. THE 3-ACT INTERACTIVE EXPERIENCE FLOW

#### ACT 1: THE 5-STAR GACHA TREASURE CHEST INTRO
- **Initial Scene:** Full-viewport twilight fantasy clearing with floating golden fireflies. Center stage: an ornate, softly pulsing **Runic Treasure Chest**.
- **Minimalist Gacha HUD:**
  - Top/above chest: `Clés restantes : 1 🔑` (`Keys Left: 1 🔑`)
  - Below chest: Glowing gilded button **`[ Ouvrir le Coffre — Requiert 1 🔑 ]`** (clicking either the chest or the button triggers the sequence).
  - Bottom-right corner: A discreet, recruiter-friendly **`Passer l'intro →`** (`Skip Intro`) link for repeat visitors.
- **The 5-Star Reveal Sequence (~2.2 seconds, snappy & exhilarating):**
  1. Chest trembles violently with rising light rays from the seam + crescendo SFX.
  2. A blinding golden 5-star wish beam bursts upward across the screen.
  3. My character silhouette appears in pure obsidian black with a blazing golden aura for 0.6s (pure hype moment).
  4. A **Full-Screen Shockwave** erupts from the center, shattering the darkness and unveiling **Act 2**.

#### ACT 2: THE DIAGONAL SPLIT CHARACTER SHEET (VIOLET EVERGARDEN COMPOSITION)
Use the attached image strictly as the layout and composition reference for Act 2 (the diagonal split angle, central overlapping character, and typography elegance), adapted to my sunlit medieval fantasy palette and my own content.
- **Layout Architecture (Full-Viewport, Zero Vertical Scroll Clutter):**
  - The screen is dramatically split by a sharp **diagonal slash** (approx. 60–65° angle) separating two rich contrasting backdrops:
    - **Left Half:** Deep twilight-emerald medieval forest / castle silhouette backdrop with subtle depth parallax.
    - **Right Half:** Warm sunlit golden-parchment backdrop with faint medieval map watermark lines.
  - **Center Focal Point (Overlapping the Diagonal Seam):** My character portrait/avatar (pre-wired to load `/public/assets/avatar.png` or `.webp`, with a stylized RPG hero silhouette placeholder if missing), floating smoothly across the diagonal split with subtle 3D mouse-tracking parallax.
- **Left Panel Content (Sliding in from Left after the Shockwave):**
  - Level & Status Tag: `LVL 22 — Master Game Design @ IIM Paris` | active buffs status: `Recherche Alternance / Stage Alterné — Paris, Ile de France`
  - Large ornate Fantasy Serif Title with subtle star-sparkle accents inside the typography: **AHMED AWEDNI** + Subtitle: `Game Designer & Technical Designer`.
  - **Signature Quote:** *"Building with the precision of a developer, the eye of a designer, and the heart of a gamer."*
  - **Champion Ability Kit (3 League of Legends-Style Glowing Spell Icons with Rich RPG Hover Tooltips):**
    - **`[Passive / Q] Eye of the Designer`:** *Analyzes, deconstructs, and extracts inspiration from any medium (games, series, movies, anime, real life) to transform it into balanced, well-adapted gameplay mechanics.*
    - **`[W] Solutions Realm`:** *Commands the Solutions Realm to rapidly summon pragmatic constructs called "The Solutions" to debug, refactor, and destroy any design roadblock or technical bottleneck.*
    - **`[R — Ultimate] Full-Stack Vertical Slice`:** *Channels Developer Precision, Designer Vision, and Artist Craft simultaneously—bridging GDD systems, decoupled Unity C# code, and custom 2D/3D assets to materialize playable prototypes.*
- **Right Panel Content (Sliding in from Right after the Shockwave):**
  - **Character Lore (Short Bio):** *"Graduated top of my class in Computer Science & Multimedia (Serious Games) at ISIMS before joining the Master in Game Design at IIM Digital School Paris. From shipping my first mobile game on the Google Play Store to architecting AI-powered 3D multiplayer RPGs in Unity and crafting physical tabletop systems, I bridge the gap between pure Game Design rules and clean C# implementation."*
  - **6 Core Game Designer RPG Stats (Animated golden ink bars + optional toggleable hexagonal radar chart):**
    - `SYS [Systems & Economy Design (Game Balancing)] — 94/100`
    - `TEC [Technical Game Design (Prototyping & Scripting)] — 79/100`
    - `3CS [Core Gameplay Mechanics & 3Cs Design] — 93/100`
    - `NAR [Narrative & Quest Design] — 99/100`
    - `LWD [Level & World Design] — 99/100`
    - `UXG [UX & Game Feel] — 90/100`
  - **Equipped Loadout:** Compact RPG inventory icons (Unity, C#, Aseprite, Blender, Illustrator, GitHub) with hover tooltips.
  - **Primary CTA Button (Bottom Right / Center-Right, Glowing Gold):** **`[ Ouvrir le Grimoire des Quêtes ✦ ]`** (`Open the Quest Grimoire`).

#### TRANSITION (ACT 2 -> ACT 3): THE GRIMOIRE DROP
- When the user clicks **`[ Ouvrir le Grimoire des Quêtes ]`**:
  1. The diagonal character sheet dissolves rapidly via a smooth warm fade/radial transition into a **sunlit medieval wooden adventurer's table** (complete with drifting sunbeam dust motes and subtle ambient props at the edges).
  2. Suddenly, the closed **Emerald & Gold Grimoire** drops heavily from above into the center of the table (`scale` + gravity drop + impact micro-screen-shake + radial dust puff particles + heavy leather-on-wood thud SFX).
  3. After a crisp 0.3s beat, the ornate front cover swings open smoothly in **3D CSS (`perspective: 2000px`, `rotateY(-180deg)`)**, zooming cleanly to fill the viewport as a realistic **2-Page Open Grimoire** directly on the **Table of Contents** spread.

#### ACT 3: THE LIVING 3D GRIMOIRE (PROJECTS, ARTIFACTS & NAVIGATION)
- **Book Craftsmanship:** Realistic central spine gutter shadow, multi-layered stacked parchment edges on both sides, SVG gold corner filigree, subtle paper grain texture, and **colored Silk Bookmark Ribbons** sticking out the top edge allowing instant 1-click jumps to: `[Fiche Perso]` (returns smoothly to Act 2, the reverse of the animtion of entering the act 3), `[Sommaire]`, `[Succès]`, and `[Contact / CV]`.
- **Table of Contents Spread (Landing Pages of the Book):**
  - **Left Page:** Interactive **Quest Filter** (`[All (5)]` | `[Technical Design & Scripting]` | `[Systems & Balancing]` | `[Core Mechanics & 3Cs]` | `[Level, World & Narrative]` | `[UX & Game Feel]`) + calligraphic numbered list of the 5 Projects.
  - **Right Page (Live Ink Preview):** Hovering over any project title on the left page smoothly draws/fades its stylized emblem, 1-sentence pitch, and `Primary Skills` onto the right page in gold-and-ink style.
  - **Fast-Flip Navigation:** Clicking any project title triggers a **rapid multi-page flip animation** (4–5 parchment pages fluttering in 3D with crisp paper-flip SFX) landing directly on that project's 2-page spread! Users can also click the curled bottom-right / bottom-left page corners to turn pages manually(next project/previous project (or table of content page)).
- **Dynamic Table Atmosphere:** As the user lands on each project's spread, the ambient lighting and Canvas particles around the wooden table subtly shift to match that game's world (Forest Emerald for Wise Battle, Shinobi Crimson/Orange for Naruto, Arcane Violet for Magic Words, Sky Azure for Balloon of the Countries, Emerald Blueprint for Slot #05).

---

### 3. THE 5 PROJECT SPREADS (2-PAGE VIEW PER PROJECT)
Each of the first 4 projects occupies a clean, readable **2-Page Spread**:
- **Left Page:** Project Title, Metadata HUD, `Primary Skills:` badges, 1-Sentence Pitch, **Dedicated Media Showcase Frame** (pre-wired to load `/public/assets/media/[project-slug].mp4|.gif|.webp` with a rich fantasy-framed placeholder until I drop my files in), and the **Playtest Iteration Box (`Problem -> Decision -> Result`)**.
- **Right Page:** The **2 Interactive HTML/CSS/SVG Game Design Artifacts** accurate to my real games:

1. **Wise Battle (3D Online Multiplayer Tactical RPG & AI Serious Game)**
   - **Primary Skills:** Systems & Combat Design, Game Balancing, Unity C#, Multiplayer Architecture, Mobile UI/UX
   - **Metadata:** Co GDD Maker, Game Designer & Unity C# Developer | Unity 3D, C#, Netcode, Gemini API, Blender | 4-Month Capstone (CGI Studio) | Android Mobile
   - **Pitch:** A 3D top-down 1v1 turn-based medieval fantasy RPG where players upload any PDF course document and use AI-generated active-recall trivia as the sole fuel for their combat energy economy.
   - **Artifact A (Interactive "30/30 Rule" Energy Economy & Turn State Machine Simulator):** Interactive 2-Phase Turn Loop (30s timer, 30-turn cap, 100 Max Energy): Correct answer in $T$ sec = $+T_{\text{remaining}}$ Energy & unlocks Action Phase (`Attack` 20E, `Defend` 10E, `Unique Skill` Variable E, `Pass` 0E); Wrong answer = `-15 Energy` & locks Action Phase; Timeout = `0 Energy`. Highlight Player 2's **+15 Energy "Second Player Aid" Buff**.
   - **Artifact B (Interactive Asymmetric Hero Roster & Architecture Inspector):** 3-tab switcher comparing **Galios** (Knight Tank: 100 HP, 25 ATK, 15 DEF, *Shield Slam* 50E: 15 DMG + 50% Stun), **Pokey** (Assassin: 90 HP, 30 ATK, 10 DEF, *Assassin's Rush* 35E: +10 ATK for 3 turns), and **Aleric** (Chronomancer Mage: 80 HP, 35 ATK, 5 DEF, *Time Spell* 30E: +10s on quiz timer for 3 turns to supercharge Energy), plus collapsible `CharacterDataSO` / polymorphic `BaseSkill` C# architecture diagram.

2. **Naruto: The Board Game (Tactical JRPG Tabletop & Territory Strategy — 2 to 8 Players)**
   - **Primary Skills:** Tabletop Systems Design, Rulebook Writing, Economy & Combat Balancing, Board Layout Design
   - **Metadata:** Solo Game Designer & Graphic Designer | Illustrator, Canva, Spreadsheet Balancing | Solo Design Study | Physical Tabletop *(Tag: Uncommercial Tabletop Systems Design Study — Fan IP Adaptation)*
   - **Pitch:** A tactical 2-to-8 player turn-based tabletop JRPG set across a 40-tile board of the Four Hidden Villages, blending blind-hand Shinobi party combat, territory defense economics, and 3 distinct game modes.
   - **Artifact A (Interactive 40-Tile Board Loop & Territory Defense Calculator):** Miniature interactive 40-tile board highlighting Tile 1 (Tour bonus +1000/+1500 SP & Active 3 / Inactive 2 party swapping), Location Power Check (*Active Party Power < Location Defense = Pay SP toll*, e.g., Hidden Leaf Village 1: 100 SP / 35 DEF), 4 Kage Offices (Tiles 6, 16, 26, 36), Shinobi Draw (8), Side Quests (9), Genjutsu Traps (11, 31), and Legendary Draw (21 — 11+ on 2D6).
   - **Artifact B (Blind-Target Combat, Passive Triggers & 3-Mode Matrix):** Visual breakdown of blind face-down targeting (*Kakashi's Chidori* 60 DMG at 1-tile range), full-HP end-of-turn reset requiring burst combos or passives (*Sakura's Healthy Dice*), and comparison table of *Normal* (2000 SP, 1 Shinobi, 2 Mercies), *Shinobis War* (4000 SP, 3 Shinobis, 0 Mercy, Round 1 Treaty), *Alliance* (shared reserve, 1-tile Downed/Revive), plus *The Masked One (TMO)* "Red Moon Right of Victory".

3. **Magic Words (2D Local PvP Wizard Word Duel — Published on itch.io)**
   - **Primary Skills:** Combat Balancing, Procedural Systems, Unity C#, 2D Pixel Art
   - **Metadata:** Solo Game Designer, Pixel Artist & Unity Developer | Unity 2D, C#, Aseprite | Solo | PC / Web (itch.io)
   - **Pitch:** A minimalist pixel-art 1v1 local multiplayer wizard duel inspired by *Bookworm Adventures*, where players take turns forging 3+ letter English words from a randomized letter pool to cast scaled magical blasts or tactical self-heals.
   - **Artifact A (Interactive Word-Length Damage vs. Heal Scaling Simulator):** Slider (3 to 8+ letters) showing offensive scaling outpacing heal-stalling.
   - **Artifact B (Vowel-Guaranteed Letter Pool Algorithm & Playtest Iteration):** C# fairness logic preventing consonant droughts + playtest note on nerfing 3-letter heal spam.

4. **Balloon of the Countries (2D Turn-Based Mobile Geography Game — Published on itch.io)**
   - **Primary Skills:** Mobile UI/UX, Turn-Based Pacing, Progression Design, 2D Game Art
   - **Metadata:** Solo Game Designer & Unity Developer | Unity 2D, C#, Aseprite, Illustrator | Solo | Mobile / itch.io
   - **Pitch:** A vibrant 2D local turn-based geography and strategy game published on itch.io.
   - **Artifact A (One-Screen Pass-and-Play UI Wireframe — Before vs. After):** Interactive comparison of streamlined mobile turn handoffs.
   - **Artifact B (Round Escalation & Score Multiplier Curve):** Visual risk-reward pacing curve.

5. **[LOCKED QUEST SLOT #05 — Incoming Live Playable 2D Prototype]**
   - **Primary Skills:** Level Design, AI Behavior, Narrative Design, Rapid Prototyping
   - Render as an ornate **Wax-Sealed / Rune-Locked 2-Page Blueprint Spread** labeled *"Quest #05 — Unlocking Soon"* with a clean modular component hook so I can drop a live playable 2D game directly onto this spread later.

---

### 4. FINAL SPREAD (ACHIEVEMENTS & RECRUITER DOCK), TESTING & REDEPLOYMENT
- **Achievements & Contact Spread (Also accessible via top Silk Bookmarks & subtle floating Recruiter Dock):**
  - Unlocked Achievement Seals: **Bubble Trouble** (*"First Project & First Shipped Mobile Game on Google Play Store"*) and **Global Game Jam 2026** (*"48-Hour Rapid Prototyping Veteran"*).
  - 1-click access to **GitHub (`https://github.com/ahmedAwedni`)**, **Download CV (PDF)**, **LinkedIn**, and **Direct Email Copy (`+100 XP Email Copied!` golden toast)**.
- **Responsive Mobile Grace:** On narrow mobile screens, adapt the diagonal split cleanly into a stacked hero and the 2-page grimoire into a crisp single-page swipeable parchment view without breaking any animations.
- **Verification & Redeploy:**
  1. Test the complete flow inside Antigravity's built-in browser: Chest Intro -> 5★ Silhouette & Shockwave -> Diagonal Character Sheet -> FR/EN Shockwave -> Book Drop & 3D Open -> Table of Contents Hover & Fast-Flip -> All Interactive Artifacts. Fix any clipping, overflow, or console errors.
  2. Commit and push the redesign to GitHub.
  3. Redeploy live to Firebase Hosting via the Firebase MCP and confirm the live `.web.app` URL but let it hidden from the search engines for now.