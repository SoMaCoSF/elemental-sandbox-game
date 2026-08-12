# Elemental Sandbox Game — Development Diary

**Repo**: https://github.com/SoMaCoSF/elemental-sandbox-game  
**Origin**: Evolved from achrefelouafi/LinearAbiltyCastingThreeJS (Chiro Visuals Elemental Sandbox)  
**Goal**: Turn the pure VFX skillshot playground into a full browser arena game while preserving procedural GLSL VFX + live editor strengths.

## 2026-08-12 — Session

### Status
- Playable v0.1 prototype complete locally (~930 LOC).
- Move, aim, fire 5 abilities, kill waves, take damage, progress, game over.
- GitHub has package.json, vite, index.html, main.js, README (partial). Local is source of truth for remaining modules.

### Architecture decisions
1. Game layer owns player/targets/combat/waves.
2. AbilitySystem is a simplified proxy that mirrors original arm→aim→fire loop.
3. Real GLSL abilities from original can replace proxies later via AbilityManager.cast.
4. development_diary.md is the handoff document for any other agent.

### Files (local complete)
- package.json, vite.config.js, index.html, README.md, development_diary.md
- src/main.js, src/core/App.js
- src/game/Player.js, Target.js, TargetManager.js, Combat.js
- src/abilities/AbilitySystem.js
- src/input/InputManager.js, AimController.js
- src/world/Arena.js, src/ui/HUD.js

### Next priorities
1. Finish pushing all source to GitHub.
2. npm install + smoke test.
3. Impact particles / screen flash on hit.
4. Better ability visuals (trail + burst).
5. Optional: start vendoring original ability classes.

### Controls reminder
WASD move, mouse aim, LMB fire, Q/E/R/F/V select, Space dash.
