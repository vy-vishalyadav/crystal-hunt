// Procedural environment — ground, trees, rocks optimized for low-end GPUs

import * as THREE from 'three';
import { randomRange } from '../utils/MathUtils.js';

export class Environment {
  constructor(scene) {
    this.collidableMeshes = []; // List of static meshes to raycast against
    this._createGround(scene);
    this._createTrees(scene);
    this._createRocks(scene);
  }

  _createGround(scene) {
    // Optimized: Changed segments to 20x20. This provides enough vertices for correct fog calculation near the center, 
    // while keeping polygon count extremely low (only 800 triangles) for your integrated GPU.
    const geo = new THREE.PlaneGeometry(100, 100, 20, 20);
    const mat = new THREE.MeshStandardMaterial({ color: 0x4CAF50, roughness: 0.8, metalness: 0.1 });
    const ground = new THREE.Mesh(geo, mat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    
    // Explicit name for identification
    ground.name = 'ground';
    
    scene.add(ground);
    this.collidableMeshes.push(ground);

    // Subtle grid overlay (GridHelper is already highly optimized in WebGL)
    const grid = new THREE.GridHelper(100, 50, 0x3d8b40, 0x3d8b40);
    grid.position.y = 0.01;
    grid.material.opacity = 0.15;
    grid.material.transparent = true;
    scene.add(grid);
  }

  _createTrees(scene) {
    const trunkGeo = new THREE.CylinderGeometry(0.3, 0.5, 3, 8);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.9 });
    const leafGeo  = new THREE.ConeGeometry(2, 4, 8);
    const leafMat  = new THREE.MeshStandardMaterial({ color: 0x228B22, roughness: 0.8 });

    for (let i = 0; i < 40; i++) {
      let x, z;
      do { x = randomRange(-45, 45); z = randomRange(-45, 45); }
      while (Math.abs(x) < 8 && Math.abs(z) < 8); // keep center clear for player

      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.set(x, 1.5, z);
      trunk.castShadow = true;
      trunk.name = 'tree_trunk';
      scene.add(trunk);
      this.collidableMeshes.push(trunk);

      const leaves = new THREE.Mesh(leafGeo, leafMat);
      leaves.position.set(x, 5, z);
      leaves.castShadow = true;
      leaves.name = 'tree_leaves';
      scene.add(leaves);
      this.collidableMeshes.push(leaves);
    }
  }

  _createRocks(scene) {
    const mat = new THREE.MeshStandardMaterial({ color: 0x808080, roughness: 0.9, metalness: 0.1 });

    for (let i = 0; i < 25; i++) {
      let x, z;
      do { x = randomRange(-45, 45); z = randomRange(-45, 45); }
      while (Math.abs(x) < 6 && Math.abs(z) < 6);

      const scale = randomRange(0.5, 2);
      // Dodecahedron is low-poly and lightweight
      const geo = new THREE.DodecahedronGeometry(scale, 0); // detail=0 for absolute minimum triangles
      const rock = new THREE.Mesh(geo, mat);
      rock.position.set(x, scale * 0.4, z);
      rock.rotation.set(randomRange(0, Math.PI), randomRange(0, Math.PI), 0);
      rock.castShadow = true;
      rock.receiveShadow = true;
      rock.name = 'rock';
      scene.add(rock);
      this.collidableMeshes.push(rock);
    }
  }
}
