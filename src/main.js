// Main entry point — wires everything together and runs the game loop with shooting mechanics

import './style.css';
import * as THREE from 'three';
import { createScene } from './scene/SceneSetup.js';
import { InputManager } from './systems/InputManager.js';
import { Player } from './player/Player.js';
import { ThirdPersonCamera } from './camera/ThirdPersonCamera.js';
import { Environment } from './environment/Environment.js';
import { CollectibleManager } from './entities/Collectible.js';
import { EnemyManager } from './entities/Enemy.js';
import { ParticleSystem } from './systems/ParticleSystem.js';
import { GameState } from './systems/GameState.js';
import { HUD } from './ui/HUD.js';
import { MenuScreen, GameOverScreen, WinScreen } from './ui/MenuScreen.js';

// ===== Core setup =====
const canvas = document.getElementById('game-canvas');
const { scene, camera, renderer } = createScene(canvas);
const inputManager = new InputManager();
const particleSystem = new ParticleSystem(scene);
const gameState = new GameState();

// ===== Game objects (initialized on game start) =====
let player, thirdPersonCamera, environment, collectibles, enemies;

// ===== Shooting & Visual Effects State =====
let tracers = [];
let muzzleFlashes = [];
let shootCooldown = 0;
let shakeIntensity = 0;

// ===== HUD =====
const hud = new HUD();
hud.hide();

// ===== Initialize a new game =====
function initGame() {
  player = new Player(scene);
  thirdPersonCamera = new ThirdPersonCamera(camera, player.group);
  environment = new Environment(scene);
  collectibles = new CollectibleManager(scene, 15);
  enemies = new EnemyManager(scene, 8);

  inputManager.requestPointerLock(canvas);

  hud.show();
  hud.updateHealth(100);
  hud.updateScore(0);
  gameState.score = 0;

  // Reset effects state
  tracers.forEach(t => scene.remove(t.line));
  muzzleFlashes.forEach(f => scene.remove(f.mesh));
  tracers = [];
  muzzleFlashes = [];
  shootCooldown = 0;
  shakeIntensity = 0;
}

// ===== Screens =====
const menuScreen = new MenuScreen(() => {
  menuScreen.hide();
  gameState.setState('playing');
  initGame();
});

const gameOverScreen = new GameOverScreen(() => window.location.reload());
const winScreen = new WinScreen(() => window.location.reload());

// ===== Game loop =====
let lastTime = performance.now();

function animate() {
  requestAnimationFrame(animate);

  const now = performance.now();
  const deltaTime = Math.min((now - lastTime) / 1000, 0.1); // capped delta
  lastTime = now;

  if (gameState.isPlaying && player) {
    // Input → Camera Rotation
    thirdPersonCamera.handleMouseMove(inputManager);

    // Update player and camera positions
    player.update(deltaTime, inputManager, thirdPersonCamera.getYaw());
    thirdPersonCamera.update(deltaTime);
    
    // Update active game entities
    collectibles.update(deltaTime);
    enemies.update(deltaTime, player.position);
    particleSystem.update(deltaTime);

    // -----------------------------------------
    // SHOOTING SYSTEM (M416 Automatic Fire)
    // -----------------------------------------
    if (shootCooldown > 0) {
      shootCooldown -= deltaTime;
    }

    if (inputManager.keys.shoot && shootCooldown <= 0 && player.isAlive) {
      shootCooldown = 0.12; // 120ms between shots (~500 RPM)
      shakeIntensity = 0.08; // Apply camera recoil shake

      const muzzlePos = player.getMuzzlePosition();
      
      // Calculate shooting vector from screen center (crosshair)
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);

      // Default bullet endpoint (100 units along camera gaze)
      const cameraDir = new THREE.Vector3();
      camera.getWorldDirection(cameraDir);
      let endPoint = new THREE.Vector3().copy(camera.position).addScaledVector(cameraDir, 100);

      // Check if we hit an enemy commando
      const hitResult = enemies.checkRaycastHit(raycaster, 10); // deals 10 damage per shot

      if (hitResult && hitResult.hit) {
        endPoint.copy(hitResult.hitPoint);
        
        if (hitResult.killed) {
          gameState.addScore(150); // 150 points reward for kill
          hud.updateScore(gameState.score);
          // Crimson burst particle effect on kill
          particleSystem.emit(hitResult.hitPoint, 0x8a0303, 20);
        } else {
          // Yellow spark particles on impact
          particleSystem.emit(hitResult.hitPoint, 0xffa500, 6);
        }
      } else {
        // Raycast environment & ground to make bullet tracers stop on objects
        const intersects = raycaster.intersectObjects(scene.children, true);
        for (const intersect of intersects) {
          // Check if object belongs to the player or muzzle flash
          let isPlayerPart = false;
          player.group.traverse(child => {
            if (child === intersect.object) isPlayerPart = true;
          });
          
          if (!isPlayerPart && intersect.object.name !== "sky") {
            endPoint.copy(intersect.point);
            // Gray dust impact sparks
            particleSystem.emit(intersect.point, 0xbfbfbf, 4);
            break;
          }
        }
      }

      // 1. Create Muzzle Flash (quick bright yellow sphere)
      const flashGeo = new THREE.SphereGeometry(0.12, 8, 8);
      const flashMat = new THREE.MeshBasicMaterial({ color: 0xffe600 });
      const flashMesh = new THREE.Mesh(flashGeo, flashMat);
      flashMesh.position.copy(muzzlePos);
      scene.add(flashMesh);
      muzzleFlashes.push({ mesh: flashMesh, lifetime: 0.05, age: 0 });

      // 2. Create Bullet Tracer Line (fading yellow ray)
      const tracerMat = new THREE.LineBasicMaterial({ color: 0xffe57f, transparent: true, opacity: 0.9 });
      const tracerPoints = [muzzlePos, endPoint];
      const tracerGeo = new THREE.BufferGeometry().setFromPoints(tracerPoints);
      const tracerLine = new THREE.Line(tracerGeo, tracerMat);
      scene.add(tracerLine);
      tracers.push({ line: tracerLine, lifetime: 0.08, age: 0 });
    }

    // -----------------------------------------
    // RENDER & CLEANUP TRACERS & FLASHES
    // -----------------------------------------
    for (const t of tracers) {
      t.age += deltaTime;
      t.line.material.opacity = 1.0 - (t.age / t.lifetime);
      if (t.age >= t.lifetime) {
        scene.remove(t.line);
        t.line.geometry.dispose();
        t.line.material.dispose();
      }
    }
    tracers = tracers.filter(t => t.age < t.lifetime);

    for (const f of muzzleFlashes) {
      f.age += deltaTime;
      if (f.age >= f.lifetime) {
        scene.remove(f.mesh);
        f.mesh.geometry.dispose();
        f.mesh.material.dispose();
      }
    }
    muzzleFlashes = muzzleFlashes.filter(f => f.age < f.lifetime);

    // Apply camera recoil shake
    if (shakeIntensity > 0) {
      shakeIntensity = Math.max(0, shakeIntensity - deltaTime * 1.5);
      const shakeOffset = new THREE.Vector3(
        (Math.random() - 0.5) * shakeIntensity,
        (Math.random() - 0.5) * shakeIntensity,
        (Math.random() - 0.5) * shakeIntensity
      );
      camera.position.add(shakeOffset);
    }

    // Crystal collection check
    const collected = collectibles.checkCollection(player.position);
    if (collected > 0) {
      gameState.addScore(collected * 100);
      hud.updateScore(gameState.score);
      particleSystem.emit(
        new THREE.Vector3(player.position.x, player.position.y + 1.5, player.position.z),
        0xFFD700, 20
      );

      // Win check
      if (collectibles.collectedCount >= collectibles.totalCount) {
        gameState.setState('win');
        hud.hide();
        winScreen.show(gameState.score);
      }
    }

    // Enemy damage check
    const damage = enemies.checkAttacks(player.position);
    if (damage > 0) {
      player.takeDamage(damage);
      hud.updateHealth(player.health);
      hud.flashDamage();
      particleSystem.emit(
        new THREE.Vector3(player.position.x, player.position.y + 1, player.position.z),
        0xE74C3C, 10
      );

      // Death check
      if (!player.isAlive) {
        gameState.setState('gameover');
        hud.hide();
        gameOverScreen.show(gameState.score);
      }
    }

    // Hide controls overlay hint once mouse locks
    if (inputManager.isPointerLocked) hud.hideControlsHint();
  }

  renderer.render(scene, camera);
}

animate();
console.log('🎮 Crystal Hunt loaded with Shooting Mechanics!');
