// Main entry point — wires everything together and runs the game loop

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
    // Input → Camera
    thirdPersonCamera.handleMouseMove(inputManager);

    // Update all systems
    player.update(deltaTime, inputManager, thirdPersonCamera.getYaw());
    thirdPersonCamera.update(deltaTime);
    collectibles.update(deltaTime);
    enemies.update(deltaTime, player.position);
    particleSystem.update(deltaTime);

    // Crystal collection
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

    // Enemy damage
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

    // Hide hint once player locks mouse
    if (inputManager.isPointerLocked) hud.hideControlsHint();
  }

  renderer.render(scene, camera);
}

animate();
console.log('🎮 Crystal Hunt loaded!');
