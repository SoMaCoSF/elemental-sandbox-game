import * as THREE from 'three';

const ABILITIES = [
  { key: 'KeyQ', id: 'ice', name: 'Frost Lance', color: 0x88ddff, cooldown: 1.4, damage: 28, width: 1.2, type: 'line' },
  { key: 'KeyE', id: 'thunder', name: 'Storm Lance', color: 0xa0a0ff, cooldown: 1.6, damage: 32, width: 1.0, type: 'line' },
  { key: 'KeyR', id: 'meteor', name: 'Cinder Fall', color: 0xff6030, cooldown: 2.8, damage: 55, width: 2.4, type: 'aoe' },
  { key: 'KeyF', id: 'beam', name: 'Nova Beam', color: 0xfff0a0, cooldown: 3.5, damage: 40, width: 0.9, type: 'line' },
  { key: 'KeyV', id: 'snare', name: 'Voltaic Snare', color: 0xc060ff, cooldown: 4.0, damage: 35, width: 3.2, type: 'aoe' }
];

export class AbilitySystem {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;
    this.selected = 0;
    this.cooldowns = ABILITIES.map(() => 0);
    this.projectiles = [];
    this.onHit = null;
  }

  selectByKey(code) {
    const idx = ABILITIES.findIndex((a) => a.key === code);
    if (idx >= 0) this.selected = idx;
  }

  tryCast(origin, direction, distance) {
    if (this.cooldowns[this.selected] > 0) return false;
    const def = ABILITIES[this.selected];
    this.cooldowns[this.selected] = def.cooldown;
    if (def.type === 'line') this._spawnLine(origin, direction, distance, def);
    else this._spawnAoe(origin, direction, distance, def);
    return true;
  }

  _spawnLine(origin, direction, distance, def) {
    const length = Math.max(2, distance);
    const geo = new THREE.BoxGeometry(def.width * 0.35, 0.25, length);
    const mat = new THREE.MeshBasicMaterial({ color: def.color, transparent: true, opacity: 0.85 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(origin).addScaledVector(direction, length * 0.5);
    mesh.position.y = 0.4;
    mesh.rotation.y = Math.atan2(direction.x, direction.z);
    this.scene.add(mesh);

    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 8), new THREE.MeshBasicMaterial({ color: def.color }));
    tip.position.copy(origin).addScaledVector(direction, length);
    tip.position.y = 0.45;
    this.scene.add(tip);

    this.projectiles.push({ type: 'line', def, mesh, tip, origin: origin.clone(), direction: direction.clone(), length, age: 0, life: 0.35 + length * 0.02, hit: false });
  }

  _spawnAoe(origin, direction, distance, def) {
    const center = origin.clone().addScaledVector(direction, distance);
    center.y = 0.1;
    const geo = new THREE.CircleGeometry(def.width, 32);
    const mat = new THREE.MeshBasicMaterial({ color: def.color, transparent: true, opacity: 0.55, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.copy(center);
    this.scene.add(mesh);

    const col = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, def.width * 0.6, 2.5, 12, 1, true),
      new THREE.MeshBasicMaterial({ color: def.color, transparent: true, opacity: 0.4, side: THREE.DoubleSide })
    );
    col.position.copy(center);
    col.position.y = 1.25;
    this.scene.add(col);

    this.projectiles.push({ type: 'aoe', def, mesh, tip: col, center, radius: def.width, age: 0, life: 0.7, hit: false });
  }

  update(dt) {
    for (let i = 0; i < this.cooldowns.length; i++) {
      if (this.cooldowns[i] > 0) this.cooldowns[i] = Math.max(0, this.cooldowns[i] - dt);
    }
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.age += dt;
      const t = p.age / p.life;
      if (p.mesh) {
        p.mesh.material.opacity = 0.85 * (1 - t);
        if (p.tip) p.tip.material.opacity = 0.6 * (1 - t);
      }
      if (!p.hit && p.age > 0.05 && typeof this.onHit === 'function') {
        p.hit = true;
        this.onHit(p);
      }
      if (p.age >= p.life) {
        this.scene.remove(p.mesh);
        if (p.tip) this.scene.remove(p.tip);
        p.mesh.geometry.dispose();
        p.mesh.material.dispose();
        if (p.tip) { p.tip.geometry.dispose(); p.tip.material.dispose(); }
        this.projectiles.splice(i, 1);
      }
    }
  }

  get selectedDef() { return ABILITIES[this.selected]; }
  get abilityList() { return ABILITIES; }
}
