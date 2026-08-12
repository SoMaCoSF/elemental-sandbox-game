import * as THREE from 'three';

export class AimController {
  constructor(camera, canvas, scene) {
    this.camera = camera;
    this.canvas = canvas;
    this.scene = scene;
    this.raycaster = new THREE.Raycaster();
    this.mouseNDC = new THREE.Vector2(0, 0);
    this.groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    this.hit = new THREE.Vector3();
    this.origin = new THREE.Vector3();
    this.direction = new THREE.Vector3(0, 0, -1);
    this.distance = 12;
    this.maxRange = 18;
    this.onCast = null;

    const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0.05, 0), new THREE.Vector3(0, 0.05, -1)]);
    this.arrow = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0x7ec8ff, transparent: true, opacity: 0.9 }));
    this.arrow.visible = true;
    scene.add(this.arrow);

    const ringGeo = new THREE.RingGeometry(0.85, 1.1, 48);
    this.ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0x7ec8ff, transparent: true, opacity: 0.5, side: THREE.DoubleSide }));
    this.ring.rotation.x = -Math.PI / 2;
    this.ring.visible = true;
    scene.add(this.ring);
  }

  setPointer(clientX, clientY) {
    this.mouseNDC.x = (clientX / window.innerWidth) * 2 - 1;
    this.mouseNDC.y = -(clientY / window.innerHeight) * 2 + 1;
  }

  update(playerPos) {
    this.origin.copy(playerPos);
    this.origin.y = 0.05;
    this.raycaster.setFromCamera(this.mouseNDC, this.camera);
    const ok = this.raycaster.ray.intersectPlane(this.groundPlane, this.hit);
    if (ok) {
      this.direction.subVectors(this.hit, this.origin);
      this.direction.y = 0;
      const dist = this.direction.length();
      if (dist > 0.05) this.direction.normalize();
      else this.direction.set(0, 0, -1);
      this.distance = Math.min(dist, this.maxRange);
    }
    this.arrow.position.copy(this.origin);
    this.arrow.rotation.y = Math.atan2(this.direction.x, this.direction.z);
    this.arrow.scale.set(1, 1, Math.max(0.5, this.distance));
    this.ring.position.set(this.origin.x + this.direction.x * this.distance, 0.06, this.origin.z + this.direction.z * this.distance);
  }

  tryFire() {
    if (typeof this.onCast === 'function') {
      this.onCast(this.origin.clone(), this.direction.clone(), this.distance);
    }
  }
}
