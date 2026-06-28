// Red enemy orbs — chase the player and deal damage

import * as THREE from 'three';
import { randomRange, distance } from '../utils/MathUtils.js';

class Enemy {
  constructor(scene, position) {
    this.isAlive = true;
    this.speed = 3;
    this.attackRange = 2;
    this.attackCooldown = 0;
    this.attackRate = 1;
    this.damage = 10;

    const geo = new THREE.IcosahedronGeometry(0.8, 0);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xE74C3C, emissive: 0xE74C3C, emissiveIntensity: 0.2,
      roughness: 0.5, metalness: 0.3
    });

    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.position.copy(position);
    this.mesh.position.y = 1;
    this.mesh.castShadow = true;

    // Red glow
    this.light = new THREE.PointLight(0xE74C3C, 0.5, 4);
    this.mesh.add(this.light);

    scene.add(this.mesh);
  }

  update(deltaTime, playerPosition) {
    if (!this.isAlive) return;

    // Menacing rotation
    this.mesh.rotation.x += deltaTime;
    this.mesh.rotation.z += deltaTime * 0.5;
    this.mesh.position.y = 1 + Math.sin(Date.now() * 0.003) * 0.2;

    // Chase player
    const dist = distance(this.mesh.position, playerPosition);
    if (dist > this.attackRange) {
      const dir = new THREE.Vector3().subVectors(playerPosition, this.mesh.position);
      dir.y = 0;
      dir.normalize();
      this.mesh.position.x += dir.x * this.speed * deltaTime;
      this.mesh.position.z += dir.z * this.speed * deltaTime;
    }

    if (this.attackCooldown > 0) this.attackCooldown -= deltaTime;
  }

  canAttack(playerPosition) {
    return this.isAlive && this.attackCooldown <= 0 &&
           distance(this.mesh.position, playerPosition) < this.attackRange;
  }

  performAttack() {
    this.attackCooldown = this.attackRate;
    return this.damage;
  }
}

export class EnemyManager {
  constructor(scene, count = 8) {
    this.enemies = [];

    for (let i = 0; i < count; i++) {
      // Spawn in a ring far from center
      const angle = (i / count) * Math.PI * 2;
      const dist = randomRange(20, 40);
      const pos = new THREE.Vector3(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);
      this.enemies.push(new Enemy(scene, pos));
    }
  }

  update(deltaTime, playerPosition) {
    for (const e of this.enemies) e.update(deltaTime, playerPosition);
  }

  checkAttacks(playerPosition) {
    let totalDamage = 0;
    for (const e of this.enemies) {
      if (e.canAttack(playerPosition)) totalDamage += e.performAttack();
    }
    return totalDamage;
  }
}
