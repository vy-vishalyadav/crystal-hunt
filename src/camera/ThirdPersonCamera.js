// Third-person camera that orbits around the player with terrain clipping prevention

import * as THREE from 'three';
import { clamp } from '../utils/MathUtils.js';

export class ThirdPersonCamera {
  constructor(camera, target) {
    this.camera = camera;
    this.target = target; // player.group

    this.yaw = 0;       // horizontal orbit angle
    this.pitch = 0.3;   // vertical angle (slightly looking down)
    this.distance = 12;
    this.sensitivity = 0.002;
  }

  handleMouseMove(inputManager) {
    this.yaw -= inputManager.mouse.movementX * this.sensitivity;
    this.pitch -= inputManager.mouse.movementY * this.sensitivity;
    // Optimized: Clamped pitch minimum to 0.0 to prevent camera from looking up from below ground level.
    this.pitch = clamp(this.pitch, 0.0, 1.2);
    inputManager.resetMouseDelta();
  }

  update(deltaTime) {
    const targetPos = this.target.position;

    // Orbit position around the player
    const offsetX = Math.sin(this.yaw) * Math.cos(this.pitch) * this.distance;
    const offsetY = Math.sin(this.pitch) * this.distance + 2;
    const offsetZ = Math.cos(this.yaw) * Math.cos(this.pitch) * this.distance;

    const desired = new THREE.Vector3(
      targetPos.x + offsetX,
      targetPos.y + offsetY,
      targetPos.z + offsetZ
    );

    // Optimized: Ground Guard to prevent camera from ever dipping below the terrain (minimum Y height of 1.5)
    if (desired.y < 1.5) {
      desired.y = 1.5;
    }

    // Smooth follow (frame-rate independent)
    const t = 1 - Math.pow(0.001, deltaTime);
    this.camera.position.lerp(desired, t);
    this.camera.lookAt(targetPos.x, targetPos.y + 1.5, targetPos.z);
  }

  getYaw() { return this.yaw; }
}
