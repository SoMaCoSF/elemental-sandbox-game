import * as THREE from 'three';

export class Arena {
  constructor(scene) {
    this.radius = 22;
    const groundGeo = new THREE.CircleGeometry(this.radius + 2, 64);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x1a1e2e, roughness: 0.9, metalness: 0.05 });
    this.ground = new THREE.Mesh(groundGeo, groundMat);
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.receiveShadow = true;
    scene.add(this.ground);

    const grid = new THREE.GridHelper(this.radius * 2, 24, 0x2a3050, 0x1e2438);
    grid.position.y = 0.01;
    scene.add(grid);

    const edgeGeo = new THREE.RingGeometry(this.radius - 0.15, this.radius + 0.15, 64);
    const edgeMat = new THREE.MeshBasicMaterial({ color: 0x4060a0, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
    this.edge = new THREE.Mesh(edgeGeo, edgeMat);
    this.edge.rotation.x = -Math.PI / 2;
    this.edge.position.y = 0.03;
    scene.add(this.edge);

    const glowGeo = new THREE.RingGeometry(this.radius + 0.2, this.radius + 1.5, 64);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x203060, transparent: true, opacity: 0.25, side: THREE.DoubleSide });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.rotation.x = -Math.PI / 2;
    glow.position.y = 0.02;
    scene.add(glow);
  }
}
