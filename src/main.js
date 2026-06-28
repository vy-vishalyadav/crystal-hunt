/*
 * ============================================
 * MAIN.JS — The Entry Point of Our Game
 * ============================================
 *
 * This file does two things:
 *   1. Initializes the 3D scene by calling our setup function
 *   2. Runs the ANIMATION LOOP that keeps the game alive
 *
 * The animation loop is the HEARTBEAT of every game.
 * It runs ~60 times per second (60 FPS), and each iteration:
 *   - Updates object positions/rotations (game logic)
 *   - Renders the scene (draws the frame)
 */

// Import our CSS styles (Vite processes this automatically)
import './style.css';

// Import our scene setup function
import { createScene } from './scene/SceneSetup.js';

// =========================================
// 1. INITIALIZE THE SCENE
// =========================================

/*
 * Grab the <canvas> element from index.html.
 * This is the "screen" where Three.js will paint our 3D world.
 */
const canvas = document.getElementById('game-canvas');

/*
 * Call our setup function to create the entire 3D world.
 * We destructure the returned object to get individual references
 * to the scene, camera, renderer, and cube.
 *
 * Destructuring: const { a, b } = { a: 1, b: 2 }
 * is a shorthand for: const a = obj.a; const b = obj.b;
 */
const { scene, camera, renderer, cube } = createScene(canvas);


// =========================================
// 2. THE ANIMATION LOOP (the game's heartbeat)
// =========================================

/*
 * requestAnimationFrame is a browser API that calls our function
 * right before the next screen repaint (usually 60 times/second).
 *
 * Why not use setInterval?
 *   - requestAnimationFrame automatically pauses when the tab
 *     is hidden (saves CPU/battery)
 *   - It syncs with the monitor's refresh rate (smooth animation)
 *   - setInterval can cause stuttering because it's not synced
 *
 * The pattern works like this:
 *   1. animate() runs
 *   2. At the end, it asks the browser: "Call me again next frame"
 *   3. The browser calls animate() again ~16ms later
 *   4. Repeat forever = smooth animation!
 */
function animate() {
  // Schedule the next frame FIRST (so animation continues even if there's an error below)
  requestAnimationFrame(animate);

  // -----------------------------------------
  // UPDATE PHASE: Move/rotate objects
  // -----------------------------------------

  /*
   * Rotate the cube a tiny amount each frame.
   *
   * cube.rotation.x and .y are measured in RADIANS (not degrees).
   *   - Full circle = 2π radians = 360°
   *   - 0.01 radians ≈ 0.57° per frame
   *   - At 60 FPS: 0.01 × 60 = 0.6 radians/sec ≈ 34°/sec
   *
   * We rotate on both X and Y axes to get a nice tumbling effect.
   */
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  // -----------------------------------------
  // RENDER PHASE: Draw the frame
  // -----------------------------------------

  /*
   * renderer.render() takes a snapshot of the scene
   * from the camera's perspective and draws it on the canvas.
   * This is called EVERY frame to update what the player sees.
   */
  renderer.render(scene, camera);
}

// Start the animation loop! 🚀
animate();

// Log to console so we know everything loaded correctly
console.log('🎮 3D Game initialized successfully!');
