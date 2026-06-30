// Red enemy orbs — Red Rogue Commando soldiers that chase the player and deal damage

import * as THREE from 'three';
import { randomRange, distance } from '../utils/MathUtils.js';

class Enemy {
  constructor(scene, position) {
    this.isAlive = true;
    this.speed = 3.5; // Walk speed
    this.attackRange = 2;
    this.attackCooldown = 0;
    this.attackRate = 1.0;
    this.damage = 10;
    this.health = 30; // 3 rifle hits to kill

    // Create container group
    this.group = new THREE.Group();

    // Materials
    const skinMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.7 }); // Darker, weathered skin
    const shirtMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9 }); // Black combat shirt
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x3a2c2c, roughness: 0.9 }); // Dark red/brown camo pants
    const armorMat = new THREE.MeshStandardMaterial({ color: 0x8b0000, roughness: 0.6, metalness: 0.2 }); // Crimson red tactical vest
    const bootMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.9 }); // Black heavy combat boots
    const helmetMat = new THREE.MeshStandardMaterial({ color: 0x5a1818, roughness: 0.6, metalness: 0.4 }); // Dark red combat helmet
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Glowing red eyes
    const weaponMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.5, metalness: 0.8 }); // Steel weapon mat
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0x8a0303, emissive: 0x500000, roughness: 0.3, metalness: 0.9 }); // Crimson machete blade

    // --- TORSO & RED VEST ---
    const torsoGroup = new THREE.Group();
    torsoGroup.position.y = 1.35;

    const torsoGeo = new THREE.BoxGeometry(0.7, 0.9, 0.4);
    const torsoMesh = new THREE.Mesh(torsoGeo, shirtMat);
    torsoMesh.castShadow = true;
    torsoMesh.receiveShadow = true;
    torsoGroup.add(torsoMesh);

    // Tactical Red Armor Vest
    const vestGeo = new THREE.BoxGeometry(0.76, 0.7, 0.46);
    const vestMesh = new THREE.Mesh(vestGeo, armorMat);
    vestMesh.castShadow = true;
    torsoGroup.add(vestMesh);

    this.group.add(torsoGroup);

    // --- HEAD & RED HELMET ---
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 2.0, 0);

    const headGeo = new THREE.SphereGeometry(0.26, 16, 16);
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headMesh.castShadow = true;
    headGroup.add(headMesh);

    // Dark Red Helmet
    const helmetGeo = new THREE.SphereGeometry(0.29, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.65);
    const helmetMesh = new THREE.Mesh(helmetGeo, helmetMat);
    helmetMesh.position.y = 0.03;
    helmetMesh.castShadow = true;
    headGroup.add(helmetMesh);

    // Glowing Red Eyes
    const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), eyeMat);
    leftEye.position.set(-0.1, 0.05, -0.23);
    const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), eyeMat);
    rightEye.position.set(0.1, 0.05, -0.23);
    headGroup.add(leftEye);
    headGroup.add(rightEye);

    this.group.add(headGroup);

    // --- LEGS (for walking animations) ---
    // Left Leg Group
    this.leftLeg = new THREE.Group();
    this.leftLeg.position.set(-0.22, 0.9, 0);

    const legGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.9, 8);
    const leftLegMesh = new THREE.Mesh(legGeo, pantsMat);
    leftLegMesh.position.y = -0.45;
    leftLegMesh.castShadow = true;
    leftLegMesh.receiveShadow = true;
    this.leftLeg.add(leftLegMesh);

    const leftBoot = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.15, 0.3), bootMat);
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

    const rightBoot = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.15, 0.3), bootMat);
    rightBoot.position.set(0, -0.9, -0.06);
    rightBoot.castShadow = true;
    this.rightLeg.add(rightBoot);

    this.group.add(this.rightLeg);

    // --- ARMS & WEAPON (Crimson Machete) ---
    // Right Arm (holds weapon)
    this.rightArm = new THREE.Group();
    this.rightArm.position.set(0.42, 1.6, 0);
    const armGeo = new THREE.CylinderGeometry(0.1, 0.08, 0.8, 8);
    const rightArmMesh = new THREE.Mesh(armGeo, shirtMat);
    rightArmMesh.position.y = -0.4;
    rightArmMesh.castShadow = true;
    this.rightArm.add(rightArmMesh);
    this.group.add(this.rightArm);

    // Left Arm (hanging ready to attack)
    this.leftArm = new THREE.Group();
    this.leftArm.position.set(-0.42, 1.6, 0);
    const leftArmMesh = new THREE.Mesh(armGeo, shirtMat);
    leftArmMesh.position.y = -0.4;
    leftArmMesh.castShadow = true;
    this.leftArm.add(leftArmMesh);
    this.group.add(this.leftArm);

    // Crimson Tactical Machete / Blade
    this.machete = new THREE.Group();
    
    // Hilt / Handle
    const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.3), weaponMat);
    hilt.position.y = 0.15;
    this.machete.add(hilt);

    // Guard
    const guard = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.04, 0.06), weaponMat);
    guard.position.y = 0.3;
    this.machete.add(guard);

    // Blade (Crimson steel)
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.9, 0.15), bladeMat);
    blade.position.set(0, 0.75, 0.03);
    blade.castShadow = true;
    this.machete.add(blade);

    // Position machete in right hand
    this.machete.position.set(0.42, 0.9, -0.3);
    this.machete.rotation.set(Math.PI / 3, 0, 0); // Ready to strike
    this.group.add(this.machete);

    // Glow light (Red warning aura)
    this.light = new THREE.PointLight(0xe74c3c, 0.4, 4);
    this.light.position.set(0, 1.5, 0);
    this.group.add(this.light);

    // Spawn at requested position
    this.group.position.copy(position);
    scene.add(this.group);

    // Walk animation track
    this.walkTime = randomRange(0, Math.PI * 2);
  }

  takeDamage(amount, scene) {
    if (!this.isAlive) return false;
    this.health -= amount;

    // Flash armor white momentarily on hit
    this.group.traverse(child => {
      if (child.isMesh && child.material && child.material.color) {
        const originalColor = child.material.color.getHex();
        // Skip skin & glow light
        if (originalColor !== 0x8b5a2b && originalColor !== 0xff0000) {
          child.material.emissive.setHex(0xffffff);
          child.material.emissiveIntensity = 0.8;
          setTimeout(() => {
            if (this.isAlive) {
              child.material.emissive.setHex(originalColor === 0x8b0000 ? 0x500000 : 0x000000);
              child.material.emissiveIntensity = originalColor === 0x8b0000 ? 0.2 : 0.0;
            }
          }, 80);
        }
      }
    });

    if (this.health <= 0) {
      this.destroy(scene);
      return true; // Indicates death
    }
    return false;
  }

  update(deltaTime, playerPosition) {
    if (!this.isAlive) return;

    // Chase logic
    const dist = distance(this.group.position, playerPosition);
    
    // Look at player direction (rotate around Y axis)
    const angleToPlayer = Math.atan2(playerPosition.x - this.group.position.x, playerPosition.z - this.group.position.z);
    this.group.rotation.y = angleToPlayer;

    if (dist > this.attackRange) {
      const dir = new THREE.Vector3().subVectors(playerPosition, this.group.position);
      dir.y = 0;
      dir.normalize();
      this.group.position.x += dir.x * this.speed * deltaTime;
      this.group.position.z += dir.z * this.speed * deltaTime;

      // Walking animation
      this.walkTime += deltaTime * 12;
      this.leftLeg.rotation.x = Math.sin(this.walkTime) * 0.5;
      this.rightLeg.rotation.x = -Math.sin(this.walkTime) * 0.5;
      
      // Swing arms & bob weapon
      this.leftArm.rotation.x = -Math.sin(this.walkTime) * 0.3;
      this.rightArm.rotation.x = Math.sin(this.walkTime) * 0.3;
      this.machete.rotation.x = Math.PI / 3 + Math.sin(this.walkTime) * 0.1;
    } else {
      // Attack state (rapidly slash with weapon)
      this.walkTime += deltaTime * 20;
      this.machete.rotation.x = Math.PI / 6 + Math.cos(this.walkTime) * 0.8; // Slashing motion
      
      this.leftLeg.rotation.x = THREE.MathUtils.lerp(this.leftLeg.rotation.x, 0, deltaTime * 10);
      this.rightLeg.rotation.x = THREE.MathUtils.lerp(this.rightLeg.rotation.x, 0, deltaTime * 10);
    }

    if (this.attackCooldown > 0) this.attackCooldown -= deltaTime;
  }

  canAttack(playerPosition) {
    return this.isAlive && this.attackCooldown <= 0 &&
           distance(this.group.position, playerPosition) < this.attackRange;
  }

  performAttack() {
    this.attackCooldown = this.attackRate;
    return this.damage;
  }

  destroy(scene) {
    this.isAlive = false;
    scene.remove(this.group);
  }
}

export class EnemyManager {
  constructor(scene, count = 8) {
    this.scene = scene;
    this.enemies = [];

    for (let i = 0; i < count; i++) {
      this.spawnEnemy(i, count);
    }
  }

  spawnEnemy(index = 0, count = 8) {
    const angle = (index / count) * Math.PI * 2 + randomRange(-0.2, 0.2);
    const dist = randomRange(28, 45);
    const pos = new THREE.Vector3(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);
    this.enemies.push(new Enemy(this.scene, pos));
  }

  update(deltaTime, playerPosition) {
    for (const e of this.enemies) e.update(deltaTime, playerPosition);
  }

  checkAttacks(playerPosition) {
    let totalDamage = 0;
    for (const e of this.enemies) {
      if (e.canAttack(playerPosition)) {
        totalDamage += e.performAttack();
      }
    }
    return totalDamage;
  }

  // Method to check if our gun ray hit an enemy, and deal damage
  checkRaycastHit(raycaster, damage = 10) {
    // Gather all enemy groups for raycast targeting
    const targetGroups = this.enemies.map(e => e.group);
    if (targetGroups.length === 0) return null;

    // Raycast check (recursive = true to check child meshes)
    const intersects = raycaster.intersectObjects(targetGroups, true);

    if (intersects.length > 0) {
      const hitObject = intersects[0].object;
      const hitPoint = intersects[0].point;

      // Traverse up to find which Enemy instance owns this mesh
      for (const enemy of this.enemies) {
        let isOwner = false;
        enemy.group.traverse(child => {
          if (child === hitObject) isOwner = true;
        });

        if (isOwner) {
          const isDead = enemy.takeDamage(damage, this.scene);
          
          if (isDead) {
            // Remove from active list
            this.enemies = this.enemies.filter(e => e !== enemy);
            // Spawn a replacement commando elsewhere
            this.spawnEnemy(Math.floor(randomRange(0, 8)), 8);
            
            return { hit: true, killed: true, enemyPos: enemy.group.position.clone(), hitPoint };
          }
          
          return { hit: true, killed: false, enemyPos: enemy.group.position.clone(), hitPoint };
        }
      }
    }

    return null;
  }
}
