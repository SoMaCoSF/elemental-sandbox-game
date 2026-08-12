import * as THREE from 'three';
import { Target } from './Target.js';

export class TargetManager {
  constructor(scene) {
    this.scene = scene;
    this.targets = [];
  }

  spawnWave(wave) {
    this.targets = this.targets.filter((t) => {
      if (!t.alive) {
        t.dispose();
        return false;
      }
      return true;
    });

    const count = Math.min(4 + wave * 2, 18);
    const radius = 14 + wave * 0.5;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
      const r = radius * (0.7 + Math.random() * 0.3);
      const pos = new THREE.Vector3(Math.cos(angle) * r, 0, Math.sin(angle) * r);
      const hp = 35 + wave * 12 + Math.random() * 15;
      this.targets.push(new Target(this.scene, pos, hp));
    }
  }

  update(dt, playerPos) {
    const attacks = [];
    for (const t of this.targets) {
      if (!t.alive) continue;
      const result = t.update(dt, playerPos);
      if (result && result.type === 'attack') attacks.push(result);
    }
    return attacks;
  }

  aliveCount() {
    return this.targets.filter((t) => t.alive).length;
  }

  getLiving() {
    return this.targets.filter((t) => t.alive);
  }
}
