import * as THREE from 'three';
import { Target } from './Target.js';

export class TargetManager {
  constructor(scene) {
    this.scene = scene;
    this.targets = [];
  }

  spawnWave(wave) {
    this.targets = this.targets.filter((t) => {
      if (!t.alive) { t.dispose(); return false; }
      return true;
    });
    const count = Math.min(3 + wave * 2, 16);
    const radius = 12 + Math.min(wave * 0.4, 6);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
      const r = radius + Math.random() * 3;
      const pos = new THREE.Vector3(Math.cos(angle) * r, 0, Math.sin(angle) * r);
      const hp = 30 + wave * 10 + Math.random() * 12;
      this.targets.push(new Target(this.scene, pos, hp));
    }
  }

  update(dt, playerPos) {
    const attacks = [];
    const living = this.getLiving();
    for (let i = 0; i < living.length; i++) {
      for (let j = i + 1; j < living.length; j++) {
        const a = living[i], b = living[j];
        const d = a.position.distanceTo(b.position);
        if (d < 1.4 && d > 0.01) {
          const push = a.position.clone().sub(b.position).normalize().multiplyScalar((1.4 - d) * 0.5);
          a.position.add(push);
          b.position.sub(push);
        }
      }
    }
    for (const t of living) {
      const result = t.update(dt, playerPos);
      if (result && result.type === 'attack') attacks.push(result);
    }
    return attacks;
  }

  aliveCount() { return this.targets.filter((t) => t.alive).length; }
  getLiving() { return this.targets.filter((t) => t.alive); }
}
