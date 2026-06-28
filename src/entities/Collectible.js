// Golden crystals — float, glow, and can be collected

import * as THREE from 'three';
import { randomRange, distance } from '../utils/MathUtils.js';

class Crystal {
  constructor(scene, position) {
    this.collected = false;
    this.scene = scene;

    const geo = new THREE.OctahedronGeometry(0.5, 0);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xFFD700, emissive: 0xFFD700, emissiveIntensity: 0.5,
      roughness: 0.2, metalness: 0.8
    });

    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.position.copy(position);
    this.mesh.position.y = 1.5;
    this.mesh.castShadow = true;

    // Glow light
    this.light = new THREE.PointLight(0xFFD700, 1, 5);
    this.light.position.copy(this.mesh.position);

    scene.add(this.mesh);
    scene.add(this.light);

    this.baseY = 1.5;
    this.time = randomRange(0, Math.PI * 2);
  }

  update(deltaTime) {
    if (this.collected) return;
    this.time += deltaTime * 2;
    this.mesh.position.y = this.baseY + Math.sin(this.time) * 0.3;
    this.mesh.rotation.y += deltaTime * 2;
    this.light.position.y = this.mesh.position.y;
  }

  collect() {
    this.collected = true;
    this.scene.remove(this.mesh);
    this.scene.remove(this.light);
  }
}

export class CollectibleManager {
  constructor(scene, count = 15) {
    this.crystals = [];

    for (let i = 0; i < count; i++) {
      let x, z;
      do { x = randomRange(-40, 40); z = randomRange(-40, 40); }
      while (Math.abs(x) < 5 && Math.abs(z) < 5);

      this.crystals.push(new Crystal(scene, new THREE.Vector3(x, 0, z)));
    }
  }

  update(deltaTime) {
    for (const c of this.crystals) c.update(deltaTime);
  }

  checkCollection(playerPosition, radius = 2) {
    let collected = 0;
    for (const c of this.crystals) {
      if (!c.collected && distance(playerPosition, c.mesh.position) < radius) {
        c.collect();
        collected++;
      }
    }
    return collected;
  }

  get totalCount()     { return this.crystals.length; }
  get collectedCount() { return this.crystals.filter(c => c.collected).length; }
}
