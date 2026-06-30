// Player character — Procedural PUBG-like Soldier with walking animations and an M416 rifle

import * as THREE from 'three';
import { clamp } from '../utils/MathUtils.js';

export class Player {
  constructor(scene) {
    this.group = new THREE.Group();

    // Materials
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xffdbac, roughness: 0.6 }); // Peach skin
    const shirtMat = new THREE.MeshStandardMaterial({ color: 0xe6c280, roughness: 0.8 }); // Khaki/desert shirt
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x3d4b3a, roughness: 0.9 }); // Olive camo green
    const armorMat = new THREE.MeshStandardMaterial({ color: 0x2b2b2b, roughness: 0.7, metalness: 0.2 }); // Dark tactical vest
    const bootMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 }); // Black combat boots
    const helmetMat = new THREE.MeshStandardMaterial({ color: 0x4a5340, roughness: 0.5, metalness: 0.5 }); // Level 3 green helmet
    const visorMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.2, metalness: 0.9 }); // Dark visor
    const backpackMat = new THREE.MeshStandardMaterial({ color: 0x556b2f, roughness: 0.8 }); // Olive backpack
    const rifleMat = new THREE.MeshStandardMaterial({ color: 0x1c1d1f, roughness: 0.7, metalness: 0.6 }); // Black metallic rifle

    // --- TORSO & ARMOR VEST ---
    const torsoGroup = new THREE.Group();
    torsoGroup.position.y = 1.35; // Center of torso

    const torsoGeo = new THREE.BoxGeometry(0.7, 0.9, 0.4);
    const torsoMesh = new THREE.Mesh(torsoGeo, shirtMat);
    torsoMesh.castShadow = true;
    torsoMesh.receiveShadow = true;
    torsoGroup.add(torsoMesh);

    // Tactical Vest (Thicker box over torso)
    const vestGeo = new THREE.BoxGeometry(0.76, 0.7, 0.46);
    const vestMesh = new THREE.Mesh(vestGeo, armorMat);
    vestMesh.castShadow = true;
    torsoGroup.add(vestMesh);

    // Military Backpack (Box on back)
    const backpackGeo = new THREE.BoxGeometry(0.55, 0.7, 0.3);
    const backpackMesh = new THREE.Mesh(backpackGeo, backpackMat);
    backpackMesh.position.set(0, 0, 0.33);
    backpackMesh.castShadow = true;
    torsoGroup.add(backpackMesh);

    this.group.add(torsoGroup);

    // --- HEAD & HELMET ---
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 2.0, 0);

    // Head sphere
    const headGeo = new THREE.SphereGeometry(0.26, 16, 16);
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headMesh.castShadow = true;
    headGroup.add(headMesh);

    // Level 3 Helmet
    const helmetGeo = new THREE.SphereGeometry(0.29, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.6);
    const helmetMesh = new THREE.Mesh(helmetGeo, helmetMat);
    helmetMesh.position.y = 0.03;
    helmetMesh.castShadow = true;
    headGroup.add(helmetMesh);

    // Helmet Visor
    const visorGeo = new THREE.BoxGeometry(0.3, 0.12, 0.1);
    const visorMesh = new THREE.Mesh(visorGeo, visorMat);
    visorMesh.position.set(0, 0.02, -0.25);
    headGroup.add(visorMesh);

    this.group.add(headGroup);

    // --- LEGS (for walking animation) ---
    // Left Leg Group (rotates around hip joint)
    this.leftLeg = new THREE.Group();
    this.leftLeg.position.set(-0.22, 0.9, 0);

    const legGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.9, 8);
    const leftLegMesh = new THREE.Mesh(legGeo, pantsMat);
    leftLegMesh.position.y = -0.45; // Shift cylinder down so top aligns with joint
    leftLegMesh.castShadow = true;
    leftLegMesh.receiveShadow = true;
    this.leftLeg.add(leftLegMesh);

    const bootGeo = new THREE.BoxGeometry(0.16, 0.15, 0.3);
    const leftBoot = new THREE.Mesh(bootGeo, bootMat);
    leftBoot.position.set(0, -0.9, -0.06);
    leftBoot.castShadow = true;
    this.leftLeg.add(leftBoot);

    this.group.add(this.leftLeg);

    // Right Leg Group
    this.rightLeg = new THREE.Group();
    this.rightLeg.position.set(0.22, 0.9, 0);

    const rightLegMesh = new THREE.Mesh(legGeo, pantsMat);
    rightLegMesh.position.y = -0.45;
    rightLegMesh.castShadow = true;
    rightLegMesh.receiveShadow = true;
    this.rightLeg.add(rightLegMesh);

    const rightBoot = new THREE.Mesh(bootGeo, bootMat);
    rightBoot.position.set(0, -0.9, -0.06);
    rightBoot.castShadow = true;
    this.rightLeg.add(rightBoot);

    this.group.add(this.rightLeg);

    // --- ARMS & WEAPON (M416 Rifle) ---
    // Right Arm (holds rifle)
    this.rightArm = new THREE.Group();
    this.rightArm.position.set(0.42, 1.6, 0);
    const armGeo = new THREE.CylinderGeometry(0.1, 0.08, 0.8, 8);
    const rightArmMesh = new THREE.Mesh(armGeo, shirtMat);
    rightArmMesh.position.y = -0.4;
    rightArmMesh.castShadow = true;
    this.rightArm.add(rightArmMesh);
    this.group.add(this.rightArm);

    // Left Arm (supports rifle)
    this.leftArm = new THREE.Group();
    this.leftArm.position.set(-0.42, 1.6, 0);
    const leftArmMesh = new THREE.Mesh(armGeo, shirtMat);
    leftArmMesh.position.y = -0.4;
    leftArmMesh.castShadow = true;
    this.leftArm.add(leftArmMesh);
    this.group.add(this.leftArm);

    // M416 Rifle Assembly
    this.rifle = new THREE.Group();

    // Receiver/Body
    const bodyRifle = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.15, 0.8), rifleMat);
    this.rifle.add(bodyRifle);

    // Barrel
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.5), rifleMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.03, -0.65);
    this.rifle.add(barrel);

    // Muzzle Point Helper (at the tip of the barrel)
    this.muzzlePoint = new THREE.Object3D();
    this.muzzlePoint.position.set(0, 0.03, -0.9);
    this.rifle.add(this.muzzlePoint);

    // Magazine
    const mag = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.25, 0.12), rifleMat);
    mag.position.set(0, -0.15, -0.25);
    mag.rotation.x = -0.2;
    this.rifle.add(mag);

    // Stock
    const stock = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.18, 0.3), rifleMat);
    stock.position.set(0, -0.02, 0.5);
    this.rifle.add(stock);

    // Scope (Red Dot)
    const scope = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.2), rifleMat);
    scope.position.set(0, 0.11, -0.15);
    this.rifle.add(scope);

    // Position Rifle in front of character (held in hands)
    this.rifle.position.set(0.2, 1.35, -0.45);
    this.rifle.rotation.set(-0.15, -0.2, 0); // Angled ready position
    this.group.add(this.rifle);

    // Position whole group
    this.group.position.set(0, 0, 0);
    scene.add(this.group);

    // Stats
    this.health = 100;
    this.maxHealth = 100;
    this.isAlive = true;
    this.speed = 8;
    this.sprintMultiplier = 1.6;
    this.direction = new THREE.Vector3();

    // Animation tracking
    this.walkTime = 0;
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

    const isMoving = this.direction.length() > 0;

    if (isMoving) {
      this.direction.normalize();
      // Rotate movement direction by camera yaw so WASD is camera-relative
      const moveAngle = Math.atan2(this.direction.x, this.direction.z) + cameraYaw;
      const currentSpeed = inputManager.keys.sprint ? this.speed * this.sprintMultiplier : this.speed;

      this.group.position.x += Math.sin(moveAngle) * currentSpeed * deltaTime;
      this.group.position.z += Math.cos(moveAngle) * currentSpeed * deltaTime;
      this.group.rotation.y = moveAngle; // Face movement direction

      // Animate walking (swing legs/arms)
      const animSpeed = inputManager.keys.sprint ? 16 : 10;
      this.walkTime += deltaTime * animSpeed;

      this.leftLeg.rotation.x = Math.sin(this.walkTime) * 0.6;
      this.rightLeg.rotation.x = -Math.sin(this.walkTime) * 0.6;

      // Arms swing opposite of legs, but keeping them holding the rifle generally forward
      this.leftArm.rotation.x = -Math.sin(this.walkTime) * 0.2 - 0.2;
      this.rightArm.rotation.x = Math.sin(this.walkTime) * 0.2 - 0.2;

      // Slightly bob the M416 up and down
      this.rifle.position.y = 1.35 + Math.sin(this.walkTime * 2) * 0.05;
    } else {
      // Idle pose - return legs/arms smoothly to straight positions
      this.leftLeg.rotation.x = THREE.MathUtils.lerp(this.leftLeg.rotation.x, 0, deltaTime * 10);
      this.rightLeg.rotation.x = THREE.MathUtils.lerp(this.rightLeg.rotation.x, 0, deltaTime * 10);
      this.leftArm.rotation.x = THREE.MathUtils.lerp(this.leftArm.rotation.x, -0.1, deltaTime * 10);
      this.rightArm.rotation.x = THREE.MathUtils.lerp(this.rightArm.rotation.x, -0.1, deltaTime * 10);
      this.rifle.position.y = THREE.MathUtils.lerp(this.rifle.position.y, 1.35, deltaTime * 10);
    }

    // Keep player within ground bounds
    this.group.position.x = clamp(this.group.position.x, -48, 48);
    this.group.position.z = clamp(this.group.position.z, -48, 48);
  }

  getMuzzlePosition() {
    const pos = new THREE.Vector3();
    if (this.muzzlePoint) {
      this.muzzlePoint.getWorldPosition(pos);
    } else {
      pos.copy(this.group.position).y += 1.35; // fallback
    }
    return pos;
  }
}
