import * as THREE from 'three';

export class Player {
  constructor(scene, input) {
    this.scene = scene;
    this.input = input;
    this.position = new THREE.Vector3(0, 0, 0);
    this.velocity = new THREE.Vector3();
    this.facing = new THREE.Vector3(0, 0, -1);
    this.speed = 9;
    this.dashSpeed = 22;
    this.dashTimer = 0;
    this.dashDuration = 0.18;
    this.health = 100;
    this.maxHealth = 100;
    this.radius = 0.55;
    this.alive = true;

    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.4, 0.9, 6, 12),
      new THREE.MeshStandardMaterial({ color: 0x4a90d9, roughness: 0.45, metalness: 0.15 })
    );
    body.castShadow = true;
    body.position.y = 0.85;

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 12, 10),
      new THREE.MeshStandardMaterial({ color: 0xe8d4b8, roughness: 0.5 })
    );
    head.position.y = 1.65;
    head.castShadow = true;

    this.mesh = new THREE.Group();
    this.mesh.add(body, head);
    scene.add(this.mesh);

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.5, 0.65, 32),
      new THREE.MeshBasicMaterial({ color: 0x7ec8ff, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.02;
    this.mesh.add(ring);
  }

  update(dt, arena) {
    if (!this.alive) return;

    if (this.input.wasPressed('Space') && this.dashTimer <= 0) {
      this.dashTimer = this.dashDuration;
    }
    if (this.dashTimer > 0) this.dashTimer -= dt;

    const move = this.input.getMoveVector();
    const spd = this.dashTimer > 0 ? this.dashSpeed : this.speed;
    this.velocity.x = move.x * spd;
    this.velocity.z = move.z * spd;

    this.position.x += this.velocity.x * dt;
    this.position.z += this.velocity.z * dt;

    if (arena) {
      const r = arena.radius - this.radius;
      const d = Math.hypot(this.position.x, this.position.z);
      if (d > r) {
        const s = r / d;
        this.position.x *= s;
        this.position.z *= s;
      }
    }

    if (move.x !== 0 || move.z !== 0) {
      this.facing.set(move.x, 0, move.z).normalize();
    }

    this.mesh.position.copy(this.position);
    this.mesh.rotation.y = Math.atan2(this.facing.x, this.facing.z);
  }

  takeDamage(amount) {
    if (!this.alive) return;
    this.health -= amount;
    if (this.health <= 0) {
      this.health = 0;
      this.alive = false;
    }
  }
}
