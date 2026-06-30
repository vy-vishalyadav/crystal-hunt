// Red enemy orbs — Zombie Commandos that chase the player slowly and deal damage

import * as THREE from 'three';
import { randomRange, distance } from '../utils/MathUtils.js';

class Enemy {
  constructor(scene, position) {
    this.isAlive = true;
    this.speed = 1.8; // Slowed down from 3.5 for classic zombie speed
    this.attackRange = 1.8;
    this.attackCooldown = 0;
    this.attackRate = 1.2;
    this.damage = 10;
    this.health = 30; // 3 rifle hits to kill

    // Create container group
    this.group = new THREE.Group();

    // Zombie Materials (decaying colors)
    const zombieSkinMat = new THREE.MeshStandardMaterial({ color: 0x5a7d5a, roughness: 0.8 }); // Pale decaying green
    const rippedShirtMat = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.9 }); // Torn muddy brown shirt
    const rippedPantsMat = new THREE.MeshStandardMaterial({ color: 0x311b92, roughness: 0.9 }); // Ripped dark purple pants
    const bootMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 }); // Dirty boots
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff }); // Glowing hollow white eyes

    // --- TORSO (Ripped muddy shirt) ---
    const torsoGroup = new THREE.Group();
    torsoGroup.position.y = 1.35;

    const torsoGeo = new THREE.BoxGeometry(0.68, 0.85, 0.38);
    const torsoMesh = new THREE.Mesh(torsoGeo, rippedShirtMat);
    torsoMesh.castShadow = true;
    torsoMesh.receiveShadow = true;
    torsoGroup.add(torsoMesh);

    // Exposed green shoulder/neck joints (adds details to a ripped shirt look)
    const neckGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.2);
    const neck = new THREE.Mesh(neckGeo, zombieSkinMat);
    neck.position.y = 0.45;
    torsoGroup.add(neck);

    this.group.add(torsoGroup);

    // --- ZOMBIE HEAD (Decaying Green) ---
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 2.0, 0);

    const headGeo = new THREE.SphereGeometry(0.26, 16, 16);
    const headMesh = new THREE.Mesh(headGeo, zombieSkinMat);
    headMesh.castShadow = true;
    headGroup.add(headMesh);

    // Glowing Hollow White Eyes
    const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), eyeMat);
    leftEye.position.set(-0.1, 0.05, -0.23);
    const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), eyeMat);
    rightEye.position.set(0.1, 0.05, -0.23);
    headGroup.add(leftEye);
    headGroup.add(rightEye);

    // Rotten jaw / mouth (represented by a simple dark box)
    const mouthMat = new THREE.MeshStandardMaterial({ color: 0x211111, roughness: 0.9 });
    const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.1), mouthMat);
    mouth.position.set(0, -0.12, -0.21);
    headGroup.add(mouth);

    this.group.add(headGroup);

    // --- LEGS (Ripped purple pants + hobbling walk) ---
    // Left Leg Group
    this.leftLeg = new THREE.Group();
    this.leftLeg.position.set(-0.2, 0.9, 0);

    const legGeo = new THREE.CylinderGeometry(0.11, 0.09, 0.9, 8);
    const leftLegMesh = new THREE.Mesh(legGeo, rippedPantsMat);
    leftLegMesh.position.y = -0.45;
    leftLegMesh.castShadow = true;
    leftLegMesh.receiveShadow = true;
    this.leftLeg.add(leftLegMesh);

    // Boot
    const leftBoot = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 0.28), bootMat);
    leftBoot.position.set(0, -0.9, -0.06);
    leftBoot.castShadow = true;
    this.leftLeg.add(leftBoot);

    this.group.add(this.leftLeg);

    // Right Leg Group
    this.rightLeg = new THREE.Group();
    this.rightLeg.position.set(0.2, 0.9, 0);

    const rightLegMesh = new THREE.Mesh(legGeo, rippedPantsMat);
    rightLegMesh.position.y = -0.45;
    rightLegMesh.castShadow = true;
    rightLegMesh.receiveShadow = true;
    this.rightLeg.add(rightLegMesh);

    // Boot
    const rightBoot = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 0.28), bootMat);
    rightBoot.position.set(0, -0.9, -0.06);
    rightBoot.castShadow = true;
    this.rightLeg.add(rightBoot);

    this.group.add(this.rightLeg);

    // --- ARMS (Extended straight forward to grab player) ---
    const armGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.85, 8);

    // Left Arm
    this.leftArm = new THREE.Group();
    this.leftArm.position.set(-0.42, 1.6, 0);
    const leftArmMesh = new THREE.Mesh(armGeo, zombieSkinMat); // zombie skin showing
    leftArmMesh.position.y = -0.4;
    leftArmMesh.castShadow = true;
    this.leftArm.add(leftArmMesh);
    // Rotate arm straight forward (pointing along Z axis)
    this.leftArm.rotation.x = -Math.PI / 2;
    this.group.add(this.leftArm);

    // Right Arm
    this.rightArm = new THREE.Group();
    this.rightArm.position.set(0.42, 1.6, 0);
    const rightArmMesh = new THREE.Mesh(armGeo, zombieSkinMat);
    rightArmMesh.position.y = -0.4;
    rightArmMesh.castShadow = true;
    this.rightArm.add(rightArmMesh);
    // Rotate arm straight forward (pointing along Z axis)
    this.rightArm.rotation.x = -Math.PI / 2;
    this.group.add(this.rightArm);

    // Glow light (Subtle green warning aura)
    this.light = new THREE.PointLight(0x5a7d5a, 0.3, 4);
    this.light.position.set(0, 1.5, 0);
    this.group.add(this.light);

    // Spawn position
    this.group.position.copy(position);
    scene.add(this.group);

    // Walk animation track
    this.walkTime = randomRange(0, Math.PI * 2);
  }

  takeDamage(amount, scene) {
    if (!this.isAlive) return false;
    this.health -= amount;

    // Flash body emissive red on damage
    this.group.traverse(child => {
      if (child.isMesh && child.material) {
        const mat = child.material;
        if (mat.emissive) {
          const originalEmissive = mat.emissive.getHex();
          mat.emissive.setHex(0xe74c3c);
          mat.emissiveIntensity = 0.8;
          setTimeout(() => {
            if (this.isAlive) {
              mat.emissive.setHex(originalEmissive);
              mat.emissiveIntensity = 0.0;
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
    
    // Face player
    const angleToPlayer = Math.atan2(playerPosition.x - this.group.position.x, playerPosition.z - this.group.position.z);
    this.group.rotation.y = angleToPlayer;

    if (dist > this.attackRange) {
      const dir = new THREE.Vector3().subVectors(playerPosition, this.group.position);
      dir.y = 0;
      dir.normalize();
      this.group.position.x += dir.x * this.speed * deltaTime;
      this.group.position.z += dir.z * this.speed * deltaTime;

      // Zombie walking animation (slow staggered leg swing, minor shoulder sway)
      this.walkTime += deltaTime * 5; // slower swing speed
      
      // Assymmetric leg swing to look like a limp/shuffle
      this.leftLeg.rotation.x = Math.sin(this.walkTime) * 0.35;
      this.rightLeg.rotation.x = -Math.sin(this.walkTime + 0.5) * 0.3; 
      
      // Arms bob up/down slightly as they reach forward
      this.leftArm.rotation.x = -Math.PI / 2 + Math.sin(this.walkTime * 2) * 0.08;
      this.rightArm.rotation.x = -Math.PI / 2 - Math.sin(this.walkTime * 2) * 0.08;
      
      // Zombie hunched upper body posture bobbing
      this.group.position.y = Math.sin(this.walkTime * 2) * 0.03;
    } else {
      // Zombie attacking state (scratching and lunging)
      this.walkTime += deltaTime * 12;
      this.leftArm.rotation.x = -Math.PI / 3 + Math.sin(this.walkTime) * 0.5;
      this.rightArm.rotation.x = -Math.PI / 3 - Math.sin(this.walkTime) * 0.5;
      
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
    const targetGroups = this.enemies.map(e => e.group);
    if (targetGroups.length === 0) return null;

    const intersects = raycaster.intersectObjects(targetGroups, true);

    if (intersects.length > 0) {
      const hitObject = intersects[0].object;
      const hitPoint = intersects[0].point;

      for (const enemy of this.enemies) {
        let isOwner = false;
        enemy.group.traverse(child => {
          if (child === hitObject) isOwner = true;
        });

        if (isOwner) {
          const isDead = enemy.takeDamage(damage, this.scene);
          
          if (isDead) {
            this.enemies = this.enemies.filter(e => e !== enemy);
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
