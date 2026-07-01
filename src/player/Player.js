// Player character — First-Person Shooter (FPS) controller with jump physics, ADS, and gun bobbing

import * as THREE from 'three';
import { clamp } from '../utils/MathUtils.js';

export class Player {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    
    // Ensure camera is added to the scene so its child meshes (first-person gun) render
    if (!camera.parent) {
      scene.add(camera);
    }

    this.group = new THREE.Group();
    this.group.position.set(0, 0, 0);
    scene.add(this.group);

    // --- PHYSICS & MOVEMENT STATS ---
    this.health = 100;
    this.maxHealth = 100;
    this.isAlive = true;
    
    this.speed = 6.5;
    this.sprintMultiplier = 1.6;
    this.direction = new THREE.Vector3();
    
    this.velocity = new THREE.Vector3();
    this.isGrounded = true;
    this.gravity = 22.0; // gravity force
    this.jumpForce = 8.0; // jump height speed

    // --- CAMERA LOOK CONTROLS ---
    this.cameraYaw = 0;
    this.cameraPitch = 0;
    this.sensitivity = 0.002;

    // --- FIRST-PERSON WEAPON (M416 Rifle attached to camera) ---
    this.gunGroup = new THREE.Group();
    
    // Rifle materials
    const rifleMat = new THREE.MeshStandardMaterial({ color: 0x1c1d1f, roughness: 0.7, metalness: 0.6 });
    
    // Receiver/Body
    const bodyRifle = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, 0.35), rifleMat);
    this.gunGroup.add(bodyRifle);

    // Barrel
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.25), rifleMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.012, -0.3);
    this.gunGroup.add(barrel);

    // Muzzle Point Helper (for tracers and muzzle flash)
    this.muzzlePoint = new THREE.Object3D();
    this.muzzlePoint.position.set(0, 0.012, -0.43);
    this.gunGroup.add(this.muzzlePoint);

    // Magazine
    const mag = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.1, 0.05), rifleMat);
    mag.position.set(0, -0.06, -0.1);
    mag.rotation.x = -0.2;
    this.gunGroup.add(mag);

    // Stock
    const stock = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.07, 0.12), rifleMat);
    stock.position.set(0, -0.01, 0.22);
    this.gunGroup.add(stock);

    // Scope (Red Dot sight)
    const scope = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.03, 0.08), rifleMat);
    scope.position.set(0, 0.045, -0.06);
    this.gunGroup.add(scope);
    
    // Holographic ring placeholder
    const reticleMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const reticle = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.015, 0.005), reticleMat);
    reticle.position.set(0, 0.05, -0.09);
    this.gunGroup.add(reticle);

    // Attach gun to the camera
    this.camera.add(this.gunGroup);

    // Gun Positioning offsets (Hipfire default)
    this.hipfirePosition = new THREE.Vector3(0.16, -0.18, -0.32);
    this.hipfireRotation = new THREE.Euler(-0.05, -0.05, 0);

    // Aim Down Sights (ADS) offsets
    this.adsPosition = new THREE.Vector3(0.0, -0.045, -0.22);
    this.adsRotation = new THREE.Euler(0.0, 0.0, 0);

    this.gunGroup.position.copy(this.hipfirePosition);
    this.gunGroup.rotation.copy(this.hipfireRotation);

    // Bobbing & FOV scaling states
    this.bobTime = 0;
    this.currentFov = 75;
  }

  get position() { return this.group.position; }

  takeDamage(amount) {
    if (!this.isAlive) return;
    this.health = clamp(this.health - amount, 0, this.maxHealth);
    if (this.health <= 0) {
      this.isAlive = false;
      // Detach gun on death
      this.camera.remove(this.gunGroup);
    }
  }

  heal(amount) {
    this.health = clamp(this.health + amount, 0, this.maxHealth);
  }

  update(deltaTime, inputManager) {
    if (!this.isAlive) return;

    // -----------------------------------------
    // 1. MOUSE LOOK (Camera rotation)
    // -----------------------------------------
    this.cameraYaw -= inputManager.mouse.movementX * this.sensitivity;
    this.cameraPitch -= inputManager.mouse.movementY * this.sensitivity;
    
    // Clamp pitch to prevent flipping upside down (approx 85 degrees up/down)
    this.cameraPitch = clamp(this.cameraPitch, -Math.PI / 2.1, Math.PI / 2.1);
    
    inputManager.resetMouseDelta();

    // Rotate camera directly (rotation order: Y first then X)
    this.camera.rotation.set(0, 0, 0);
    this.camera.rotation.y = this.cameraYaw;
    this.camera.rotation.x = this.cameraPitch;

    // -----------------------------------------
    // 2. MOVEMENT & JUMP PHYSICS
    // -----------------------------------------
    this.direction.set(0, 0, 0);
    if (inputManager.keys.forward)  this.direction.z -= 1;
    if (inputManager.keys.backward) this.direction.z += 1;
    if (inputManager.keys.left)     this.direction.x -= 1;
    if (inputManager.keys.right)    this.direction.x += 1;

    // Calculate move speed and sprint multiplier
    const isSprinting = inputManager.keys.sprint && inputManager.keys.forward && !inputManager.keys.ads;
    const currentSpeed = isSprinting ? this.speed * this.sprintMultiplier : this.speed;

    // Translate keyboard inputs into camera-relative movement (projected on ground plane)
    const moveVector = new THREE.Vector3();
    if (this.direction.length() > 0) {
      this.direction.normalize();
      
      // Calculate movement relative to camera orientation
      const yawAngle = this.cameraYaw;
      moveVector.x = Math.sin(yawAngle) * this.direction.z + Math.cos(yawAngle) * this.direction.x;
      moveVector.z = Math.cos(yawAngle) * this.direction.z - Math.sin(yawAngle) * this.direction.x;
      moveVector.normalize();
      
      this.group.position.x += moveVector.x * currentSpeed * deltaTime;
      this.group.position.z += moveVector.z * currentSpeed * deltaTime;
    }

    // Apply Gravity physics
    if (!this.isGrounded) {
      this.velocity.y -= this.gravity * deltaTime;
    }

    // Jump trigger
    if (inputManager.keys.jump && this.isGrounded) {
      this.velocity.y = this.jumpForce;
      this.isGrounded = false;
    }

    // Update Y position
    this.group.position.y += this.velocity.y * deltaTime;

    // Ground collision check
    if (this.group.position.y <= 0) {
      this.group.position.y = 0;
      this.velocity.y = 0;
      this.isGrounded = true;
    }

    // Lock camera position exactly to player's head height
    this.camera.position.set(
      this.group.position.x,
      this.group.position.y + 1.7, // Head height
      this.group.position.z
    );

    // -----------------------------------------
    // 3. AIM DOWN SIGHTS (ADS) & FOV INTERPOLATION
    // -----------------------------------------
    const targetFov = inputManager.keys.ads 
      ? 52  // Zoomed in ADS FOV
      : (isSprinting ? 84 : 75); // Extra wide FOV when sprinting

    this.currentFov = THREE.MathUtils.lerp(this.currentFov, targetFov, deltaTime * 12);
    this.camera.fov = this.currentFov;
    this.camera.updateProjectionMatrix();

    // Lerp weapon position & rotation (ADS vs Hipfire)
    const targetGunPos = inputManager.keys.ads ? this.adsPosition : this.hipfirePosition;
    const targetGunRot = inputManager.keys.ads ? this.adsRotation : this.hipfireRotation;
    
    // Weapon bobbing effect when walking (only active if moving and grounded)
    const isMoving = this.direction.length() > 0 && this.isGrounded;
    let bobX = 0;
    let bobY = 0;
    
    if (isMoving && !inputManager.keys.ads) {
      const bobSpeed = isSprinting ? 14 : 9;
      this.bobTime += deltaTime * bobSpeed;
      
      // Traditional figure-8 weapon bobbing pattern
      bobX = Math.sin(this.bobTime) * 0.012;
      bobY = Math.cos(this.bobTime * 2) * 0.008;
    }

    this.gunGroup.position.x = THREE.MathUtils.lerp(this.gunGroup.position.x, targetGunPos.x + bobX, deltaTime * 14);
    this.gunGroup.position.y = THREE.MathUtils.lerp(this.gunGroup.position.y, targetGunPos.y + bobY, deltaTime * 14);
    this.gunGroup.position.z = THREE.MathUtils.lerp(this.gunGroup.position.z, targetGunPos.z, deltaTime * 14);

    this.gunGroup.rotation.x = THREE.MathUtils.lerp(this.gunGroup.rotation.x, targetGunRot.x, deltaTime * 14);
    this.gunGroup.rotation.y = THREE.MathUtils.lerp(this.gunGroup.rotation.y, targetGunRot.y, deltaTime * 14);
    this.gunGroup.rotation.z = THREE.MathUtils.lerp(this.gunGroup.rotation.z, targetGunRot.z, deltaTime * 14);

    // Keep player within ground bounds
    this.group.position.x = clamp(this.group.position.x, -48, 48);
    this.group.position.z = clamp(this.group.position.z, -48, 48);
  }

  getMuzzlePosition() {
    const pos = new THREE.Vector3();
    if (this.muzzlePoint) {
      this.muzzlePoint.getWorldPosition(pos);
    } else {
      pos.copy(this.camera.position).add(new THREE.Vector3(0.15, -0.15, -0.3)); // backup
    }
    return pos;
  }
}
