import * as THREE from 'three';

let _id = 0;

export class Target {
  constructor(scene, position, hp = 40) {
    this.id = ++_id;
    this.scene = scene;
    this.position = position.clone();
    this.health = hp;
    this.maxHealth = hp;
    this.radius = 0.7;
    this.alive = true;
    this.speed = 2.2 + Math.random() * 1.5;
    this.attackRange = 1.6;
    this.attackTime = 0;
    this.attackInterval = 1.1;
    this.damage = 8;

    const geo = new THREE.IcosahedronGeometry(0.55, 1);
    this.mat = new THREE.MeshStandardMaterial({ color: 0xc04040, roughness: 0.55, metalness: 0.2, emissive: 0x400000, emissiveIntensity: 0.3 });
    this.mesh = new THREE.Mesh(geo, this.mat);
    this.mesh.castShadow = true;
    this.mesh.position.copy(this.position);
    this.mesh.position.y = 0.55;
    scene.add(this.mesh);

    const barGeo = new THREE.PlaneGeometry(1.0, 0.1);
    this.barBg = new THREE.Mesh(barGeo, new THREE.MeshBasicMaterial({ color: 0x222222 }));
    this.barFg = new THREE.Mesh(barGeo, new THREE.MeshBasicMaterial({ color: 0x40e070 }));
    this.barBg.position.set(0, 1.3, 0);
    this.barFg.position.set(0, 1.3, 0.01);
    this.mesh.add(this.barBg, this.barFg);
  }

  update(dt, playerPos) {
    if (!this.alive) return null;
    const dir = new THREE.Vector3().subVectors(playerPos, this.position);
    dir.y = 0;
    const dist = dir.length();
    if (dist > this.attackRange) {
      dir.normalize();
      this.position.addScaledVector(dir, this.speed * dt);
      this.mesh.position.x = this.position.x;
      this.mesh.position.z = this.position.z;
      this.mesh.rotation.y = Math.atan2(dir.x, dir.z);
    } else {
      this.attackTime -= dt;
      if (this.attackTime <= 0) {
        this.attackTime = this.attackInterval;
        return { type: 'attack', damage: this.damage };
      }
    }
    this.mesh.position.y = 0.55 + Math.sin(performance.now() * 0.004 + this.id) * 0.08;
    return null;
  }

  takeDamage(amount) {
    if (!this.alive) return false;
    this.health -= amount;
    const ratio = Math.max(0, this.health / this.maxHealth);
    this.barFg.scale.x = ratio;
    this.barFg.position.x = -0.5 * (1 - ratio);
    this.mat.emissiveIntensity = 0.3 + (1 - ratio) * 0.6;
    if (this.health <= 0) {
      this.alive = false;
      this.mesh.visible = false;
      return true;
    }
    return false;
  }

  dispose() {
    this.scene.remove(this.mesh);
    this.mesh.geometry.dispose();
    this.mat.dispose();
  }
}
