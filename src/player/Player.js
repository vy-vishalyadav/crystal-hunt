// Player character — capsule body with eyes, WASD movement

import * as THREE from 'three';
import { clamp } from '../utils/MathUtils.js';

export class Player {
  constructor(scene) {
    this.group = new THREE.Group();

    // Body — capsule shape
    const bodyGeo = new THREE.CapsuleGeometry(0.5, 1, 8, 16);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x3498db, roughness: 0.6, metalness: 0.2 });
    this.body = new THREE.Mesh(bodyGeo, bodyMat);
    this.body.position.y = 1;
    this.body.castShadow = true;
    this.group.add(this.body);

    // Eyes for personality
    const eyeGeo = new THREE.SphereGeometry(0.1, 8, 8);
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.5 });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.2, 1.5, -0.4);
    this.group.add(leftEye);
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.2, 1.5, -0.4);
    this.group.add(rightEye);

    this.group.position.set(0, 0, 0);
    scene.add(this.group);

    // Stats
    this.health = 100;
    this.maxHealth = 100;
    this.isAlive = true;
    this.speed = 8;
    this.sprintMultiplier = 1.6;
    this.direction = new THREE.Vector3();
  }

  get position() { return this.group.position; }

  takeDamage(amount) {
    if (!this.isAlive) return;
    this.health = clamp(this.health - amount, 0, this.maxHealth);
    if (this.health <= 0) this.isAlive = false;
  }

  heal(amount) {
    this.health = clamp(this.health + amount, 0, this.maxHealth);
  }

  update(deltaTime, inputManager, cameraYaw) {
    if (!this.isAlive) return;

    this.direction.set(0, 0, 0);
    if (inputManager.keys.forward)  this.direction.z -= 1;
    if (inputManager.keys.backward) this.direction.z += 1;
    if (inputManager.keys.left)     this.direction.x -= 1;
    if (inputManager.keys.right)    this.direction.x += 1;

    if (this.direction.length() > 0) {
      this.direction.normalize();
      // Rotate movement direction by camera yaw so WASD is camera-relative
      const moveAngle = Math.atan2(this.direction.x, this.direction.z) + cameraYaw;
      const currentSpeed = inputManager.keys.sprint ? this.speed * this.sprintMultiplier : this.speed;

      this.group.position.x += Math.sin(moveAngle) * currentSpeed * deltaTime;
      this.group.position.z += Math.cos(moveAngle) * currentSpeed * deltaTime;
      this.group.rotation.y = moveAngle; // face movement direction
    }

    // Keep player within ground bounds
    this.group.position.x = clamp(this.group.position.x, -48, 48);
    this.group.position.z = clamp(this.group.position.z, -48, 48);
  }
}
