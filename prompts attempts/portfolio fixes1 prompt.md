Perform a targeted polish pass on **Act 1 (The Chest Landing Page)**, the **Audio Manager**, and the **Character Reveal VFX/SFX**. Do NOT alter the core layout, transitions, Act 2 diagonal character sheet, or Act 3 3D Grimoire mechanics—they are working great.

### 1. ACT 1 VISUAL & UI FIXES (SURGICAL)
1. **Remove the Chest Seam Line:** Completely remove the stray horizontal glowing yellow line cutting across the middle of the treasure chest. Keep only a subtle, natural ambient glow behind the chest itself.
2. **Fix Drop-Rate Text Spacing:** Add clean vertical margin (`margin-top: 16px` to `20px`) below the `"OPEN THE CHEST — REQUIRES 1"` button so the `"5★ drop rate: 100%"` subtitle sits comfortably below the button border with zero overlap or visual crowding. (Also ensure the key icon next to `REQUIRES 1` has crisp contrast against the gold button).
3. **New Act 1 Background (LoR-Inspired Mysterious Void + Game Design Particles):**
   - Replace the current green forest clearing background in Act 1 ONLY (keep the sunlit medieval fantasy theme intact for Act 2 and Act 3).
   - Use the attached *Legends of Runeterra* image as the atmospheric reference: build an animated deep midnight-indigo/obsidian void (`#080C16` to `#121B2E`) with slowly drifting volumetric mist along the bottom and giant, faint, slowly rotating **celestial/astrolabe geometric rings** centered behind the chest.
   - Make the treasure chest gently **levitate/float** in the darkness with a soft radial spotlight behind it.
   - **Game-Design Particle Layer (HTML5 Canvas behind the chest):** Emit subtle, hype-building game-design-themed particles radiating outward and upward from behind the floating chest—blending glowing golden embers, faint wireframe polyhedra/d20 shapes, arcane runes, and soft energy wisps.

### 2. AUDIO ENGINE UPGRADE (2 DYNAMIC BGM TRACKS + AUTO-MUTE ON TAB SWITCH)
1. **Music ON by Default:** Set Background Music to `ON` by default in the Audio HUD. Handle browser autoplay restrictions gracefully: attempt to start immediately on load, and if blocked by the browser, automatically start playing on the very first `pointerdown` / `keydown` event without requiring the user to toggle the Music button.
2. **Auto-Mute on Tab Switch (Page Visibility API):** Add a `document.visibilitychange` listener (plus `window.blur` / `window.focus` safety) that automatically mutes/pauses all BGM and SFX when the user switches to another browser tab or minimizes the window, and smoothly resumes/fades audio back in when they return (strictly respecting whether the user manually turned Music or SFX off).
3. **Two-Track Dynamic Soundtrack Flow (via ElevenLabs MCP / WebAudio):**
   - **Track 1 (Act 1 — Mystery & Hype Loop):** A minimal, atmospheric, suspenseful dark-fantasy ambient loop playing while the chest floats closed in the darkness.
   - **Chest Opening Ducking/Cut:** The instant the user clicks to open the chest, immediately fade out/stop Track 1 so the chest-opening and 5★ reveal SFX hit with full clarity in silence.
   - **Track 2 (Act 2 & Act 3 — Sunlit Medieval Fantasy Soundtrack):** As soon as the character reveal finishes and Act 2 appears, smoothly fade in the main uplifting medieval fantasy soundtrack and keep it playing across Act 2 and Act 3.

### 3. DISTINCT CHARACTER REVEAL SFX & VFX (DECOUPLED FROM LANGUAGE SWITCH)
Currently, the character reveal reuses the exact same SFX and shockwave VFX as the `FR / EN` language switch. Decouple them completely so each has its own signature identity:
- **Language Switch (`FR <-> EN`):** Keep its existing crisp radial ring shockwave VFX and pulse SFX.
- **New 5★ Character Reveal SFX:** Generate/assign a brand-new, dedicated legendary 5★ reveal sound effect (a triumphant crystalline burst + resonant orchestral/fantasy chime impact) used exclusively for the Act 1 -> Act 2 reveal.
- **New 5★ Character Reveal VFX:** Replace the reused shockwave ring with a unique, high-impact **Legendary Summon Burst**—combining a radiant golden starburst flare from the silhouette, a bright diagonal light-slash flash matching the Act 2 split angle, and an explosive outward wave of golden-emerald light shards and drifting petals.

### 4. VERIFY & REDEPLOY
1. Preview Act 1 in the built-in browser to verify: no horizontal yellow line on the chest, clean spacing under the button, smooth LoR-inspired dark animated background with particles, distinct reveal VFX/SFX vs. language switch, 2-track music handoff, and tab-switch auto-mute.
2. Commit the polish pass to GitHub and redeploy to Firebase Hosting.(while keeping it hidden from the search engines of course)