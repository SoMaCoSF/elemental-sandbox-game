# Elemental Sandbox Game

**Evolved from** [Chiro Visuals – Elemental Sandbox](https://github.com/achrefelouafi/LinearAbiltyCastingThreeJS)

A full browser skillshot arena game. The original project is a pure VFX playground with stunning procedural GLSL abilities and a deep live editor. This repo turns that foundation into a playable game while keeping the door open to re-integrate the real VFX later.

## Play

```bash
npm install
npm run dev
```

### Controls
- **WASD** / Arrow keys — move
- **Mouse** — aim
- **Left click** — fire selected ability
- **Q / E / R / F / V** — select ability
- **Space** — dash

## Current Features (v0.1)

- Arena with boundary
- Player movement + dash
- 5 skillshot abilities (line + AoE) with cooldowns
- Ground targeting (League-style arrow + impact ring)
- Wave-based enemy spawns that chase and attack
- Health, score, kills, wave counter
- Hit detection and damage
- Game over + wave progression

## Architecture

See `development_diary.md` for full living context.

```
src/
  core/App.js
  game/Player.js Target.js TargetManager.js Combat.js
  abilities/AbilitySystem.js
  input/InputManager.js AimController.js
  world/Arena.js
  ui/HUD.js
```

## Path to original VFX

Keep this gameplay layer stable. Later vendor original abilities/materials and map casts onto the real AbilityManager API. Live editor becomes debug mode.
