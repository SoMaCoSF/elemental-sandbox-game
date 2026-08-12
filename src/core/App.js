import * as THREE from 'three';
import { Player } from '../game/Player.js';
import { TargetManager } from '../game/TargetManager.js';
import { AbilitySystem } from '../abilities/AbilitySystem.js';
import { AimController } from '../input/AimController.js';
import { InputManager } from '../input/InputManager.js';
import { Arena } from '../world/Arena.js';
import { HUD } from '../ui/HUD.js';
import { Combat } from '../game/Combat.js';

export class App {
  constructor(canvas) {
    this.canvas = canvas;
    this.clock = new THREE.Clock();
    this.elapsed = 0;
    this.running = false;
    this.paused = false;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a12);
    this.scene.fog = new THREE.FogExp2(0x0a0a12, 0.018);

    this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 200);
    this.camera.position.set(0, 18, 22);
    this.camera.lookAt(0, 0, 0);

    this.input = null;
    this.aim = null;
    this.player = null;
    this.targets = null;
    this.abilities = null;
    this.combat = null;
    this.arena = null;
    this.hud = null;

    this.score = 0;
    this.kills = 0;
    this.wave = 1;
    this.waveTimer = 0;
    this.gameOver = false;

    this._onResize = this._onResize.bind(this);
    window.addEventListener('resize', this._onResize);
  }

  async init() {
    const ambient = new THREE.AmbientLight(0x4060a0, 0.35);
    this.scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xfff0e0, 1.4);
    sun.position.set(12, 30, 10);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 80;
    sun.shadow.camera.left = -30;
    sun.shadow.camera.right = 30;
    sun.shadow.camera.top = 30;
    sun.shadow.camera.bottom = -30;
    this.scene.add(sun);

    const fill = new THREE.DirectionalLight(0x6080ff, 0.3);
    fill.position.set(-10, 10, -8);
    this.scene.add(fill);

    this.arena = new Arena(this.scene);
    this.input = new InputManager(this.canvas);
    this.aim = new AimController(this.camera, this.canvas, this.scene);
    this.player = new Player(this.scene, this.input);
    this.targets = new TargetManager(this.scene);
    this.abilities = new AbilitySystem(this.scene, this.player);
    this.combat = new Combat(this);
    this.hud = new HUD();

    this.aim.onCast = (origin, direction, distance) => {
      if (this.gameOver) return;
      this.abilities.tryCast(origin, direction, distance);
    };

    this.targets.spawnWave(this.wave);
    this.running = true;
    this._loop();
    this.hud.showMessage('Wave 1 — Survive', 2.2);
  }

  _loop() {
    if (!this.running) return;
    requestAnimationFrame(() => this._loop());

    const dt = Math.min(this.clock.getDelta(), 0.05);
    this.elapsed += dt;

    if (this.paused || this.gameOver) {
      this.renderer.render(this.scene, this.camera);
      return;
    }

    this.input.update();
    this.player.update(dt, this.arena);
    this.aim.update(this.player.position);
    this.abilities.update(dt);
    this.targets.update(dt, this.player.position);
    this.combat.update(dt);
    this._updateCamera(dt);
    this._updateWave(dt);

    this.hud.update({
      score: this.score,
      wave: this.wave,
      health: Math.max(0, Math.ceil(this.player.health)),
      kills: this.kills,
      selected: this.abilities.selected,
      cooldowns: this.abilities.cooldowns
    });

    this.renderer.render(this.scene, this.camera);
  }

  _updateCamera(dt) {
    const target = this.player.position;
    const desired = new THREE.Vector3(target.x, 16 + Math.min(8, this.wave * 0.4), target.z + 18);
    this.camera.position.lerp(desired, 1 - Math.pow(0.001, dt));
    this.camera.lookAt(target.x, 0.5, target.z);
  }

  _updateWave(dt) {
    this.waveTimer += dt;
    if (this.targets.aliveCount() === 0) {
      this.wave += 1;
      this.waveTimer = 0;
      this.score += 50 * this.wave;
      this.targets.spawnWave(this.wave);
      this.hud.showMessage(`Wave ${this.wave}`, 1.8);
    }
  }

  addScore(points) { this.score += points; }

  onKill() {
    this.kills += 1;
    this.addScore(25 + this.wave * 5);
  }

  onPlayerDeath() {
    this.gameOver = true;
    this.hud.showMessage(`Game Over — Score ${this.score}`, 999);
  }

  _onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  dispose() {
    this.running = false;
    window.removeEventListener('resize', this._onResize);
    this.renderer.dispose();
  }
}
