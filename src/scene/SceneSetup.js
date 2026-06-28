/*
 * ============================================
 * SCENE SETUP — The Foundation of Our 3D World
 * ============================================
 *
 * Every 3D game needs three things to display anything:
 *   1. A SCENE    — The container that holds all 3D objects
 *   2. A CAMERA   — The "eyes" through which we see the scene
 *   3. A RENDERER — The engine that draws the scene onto the canvas
 *
 * Think of it like a movie:
 *   - Scene    = The movie set (stage, props, actors)
 *   - Camera   = The film camera pointing at the set
 *   - Renderer = The projector that shows the film on screen
 */

import * as THREE from 'three';

/**
 * Creates and configures the complete 3D scene.
 * Returns all the key objects so main.js can use them.
 *
 * @param {HTMLCanvasElement} canvas — The <canvas> element from our HTML
 * @returns {Object} — The scene, camera, renderer, and cube
 */
export function createScene(canvas) {

  // =========================================
  // 1. CREATE THE SCENE (the movie set)
  // =========================================

  const scene = new THREE.Scene();

  /*
   * Set the background color to a sky blue.
   * THREE.Color accepts hex values just like CSS.
   * 0x87CEEB = a pleasant sky blue color.
   * The '0x' prefix means it's a hexadecimal number.
   */
  scene.background = new THREE.Color(0x87CEEB);

  /*
   * Add FOG to the scene.
   * Fog makes distant objects fade into the background color,
   * giving the scene depth and making it feel more natural.
   *
   * Parameters: (color, nearDistance, farDistance)
   *   - color: should match the background so objects fade smoothly
   *   - near:  fog starts at this distance from the camera
   *   - far:   objects beyond this distance are fully hidden in fog
   */
  scene.fog = new THREE.Fog(0x87CEEB, 50, 200);


  // =========================================
  // 2. CREATE THE CAMERA (the eyes)
  // =========================================

  /*
   * PerspectiveCamera simulates how human eyes see the world:
   *   - Close objects appear LARGE
   *   - Distant objects appear SMALL
   *
   * Parameters:
   *   fov:    75 = Field of View in degrees (how wide the camera sees)
   *           75° is a good default — not too narrow, not too fish-eye
   *   aspect: Window width / height ratio (keeps things from looking stretched)
   *   near:   0.1 = Closest distance the camera can see (in world units)
   *   far:    1000 = Farthest distance the camera can see
   *           Anything closer than 'near' or farther than 'far' is invisible.
   */
  const camera = new THREE.PerspectiveCamera(
    75,                                    // Field of view
    window.innerWidth / window.innerHeight, // Aspect ratio
    0.1,                                    // Near clipping plane
    1000                                    // Far clipping plane
  );

  /*
   * Position the camera in 3D space.
   * Three.js uses a RIGHT-HANDED coordinate system:
   *   X = left (-) / right (+)
   *   Y = down (-) / up (+)
   *   Z = into screen (-) / toward you (+)
   *
   * So (0, 5, 10) means:
   *   - Centered horizontally (x=0)
   *   - 5 units UP from the ground (y=5)
   *   - 10 units TOWARD us from the origin (z=10)
   */
  camera.position.set(0, 5, 10);

  /*
   * Point the camera at the origin (0, 0, 0).
   * Without this, the camera would stare straight ahead
   * and might not show our objects.
   */
  camera.lookAt(0, 0, 0);


  // =========================================
  // 3. CREATE THE RENDERER (the projector)
  // =========================================

  /*
   * WebGLRenderer uses your computer's GPU (graphics card)
   * to draw 3D graphics. It's fast because GPUs are designed
   * for exactly this kind of work.
   *
   * Options:
   *   canvas:     The HTML canvas element to draw on
   *   antialias:  Smooths jagged edges on 3D objects (like anti-aliasing in games)
   */
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
  });

  /*
   * Set the render size to match the browser window.
   * This ensures our 3D scene fills the entire screen.
   */
  renderer.setSize(window.innerWidth, window.innerHeight);

  /*
   * Pixel ratio handles high-DPI screens (like Retina displays).
   * Without this, the game would look blurry on modern monitors.
   * We cap it at 2 because higher ratios tank performance
   * with little visual benefit.
   */
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  /*
   * Enable shadow mapping so objects can cast and receive shadows.
   * This makes the scene look much more realistic.
   */
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Soft, blurred shadows


  // =========================================
  // 4. CREATE THE GROUND (a flat green plane)
  // =========================================

  /*
   * In Three.js, every visible object is a "Mesh" made of two parts:
   *   1. GEOMETRY — The shape (what it looks like structurally)
   *   2. MATERIAL — The surface (color, shininess, texture, etc.)
   *
   * PlaneGeometry creates a flat rectangle.
   * Parameters: (width, height)
   * 100x100 gives us a large ground to walk on later.
   */
  const groundGeometry = new THREE.PlaneGeometry(100, 100);

  /*
   * MeshStandardMaterial is a physically-based material.
   * It reacts to light realistically (unlike MeshBasicMaterial
   * which ignores lighting entirely).
   *
   * color: 0x4CAF50 = A natural grass green
   */
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x4CAF50,
    roughness: 0.8,  // How rough the surface is (1 = matte, 0 = mirror)
    metalness: 0.2   // How metallic it looks (1 = chrome, 0 = plastic)
  });

  const ground = new THREE.Mesh(groundGeometry, groundMaterial);

  /*
   * By default, a PlaneGeometry faces the camera (vertical).
   * We need to rotate it to be horizontal (like a floor).
   *
   * rotation.x = -Math.PI / 2 rotates it 90° around the X-axis,
   * making it lie flat. (Math.PI = 180°, so Math.PI/2 = 90°)
   */
  ground.rotation.x = -Math.PI / 2;

  /*
   * This ground should RECEIVE shadows cast by other objects.
   * (The cube's shadow will appear on the ground.)
   */
  ground.receiveShadow = true;

  // Add the ground to our scene
  scene.add(ground);


  // =========================================
  // 5. CREATE THE CUBE (our first 3D object!)
  // =========================================

  /*
   * BoxGeometry creates a box/cube shape.
   * Parameters: (width, height, depth)
   * All set to 2 for a nice visible cube.
   */
  const cubeGeometry = new THREE.BoxGeometry(2, 2, 2);

  /*
   * Give the cube a vibrant orange color.
   * 0xFF6F00 = a warm, eye-catching orange.
   */
  const cubeMaterial = new THREE.MeshStandardMaterial({
    color: 0xFF6F00,
    roughness: 0.4,  // Slightly smooth surface
    metalness: 0.3   // A hint of metallic sheen
  });

  const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);

  /*
   * Position the cube 1.5 units above the ground.
   * Since the cube is 2 units tall and its origin is at the center,
   * y=1.5 lifts it so it sits slightly above the ground.
   */
  cube.position.set(0, 1.5, 0);

  /*
   * This cube should CAST shadows onto the ground.
   */
  cube.castShadow = true;

  scene.add(cube);


  // =========================================
  // 6. ADD LIGHTING (without light, everything is black!)
  // =========================================

  /*
   * AmbientLight illuminates ALL objects equally from every direction.
   * It prevents completely black shadows and ensures you can always
   * see something. Think of it as the general "daylight" in a room.
   *
   * Parameters: (color, intensity)
   *   - 0xffffff = white light
   *   - 0.4 = 40% intensity (subtle, so it doesn't wash out shadows)
   */
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  /*
   * DirectionalLight shines in ONE direction, like the sun.
   * It creates clear shadows and gives objects a sense of depth.
   *
   * Parameters: (color, intensity)
   *   - 0xffffff = white sunlight
   *   - 1.0 = full intensity
   */
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);

  /*
   * Position the light above and to the side.
   * (10, 20, 10) = right, high up, toward us
   * This angle creates natural-looking shadows.
   */
  directionalLight.position.set(10, 20, 10);

  /*
   * Enable shadow casting for this light.
   * Only DirectionalLight and SpotLight can cast shadows
   * (AmbientLight cannot — it has no direction).
   */
  directionalLight.castShadow = true;

  /*
   * Configure the shadow quality.
   * Higher values = sharper shadows but cost more performance.
   * 2048x2048 is a good balance for most games.
   */
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;

  /*
   * The shadow camera defines the area where shadows are calculated.
   * Objects outside this box won't cast or receive shadows.
   */
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 100;
  directionalLight.shadow.camera.left = -20;
  directionalLight.shadow.camera.right = 20;
  directionalLight.shadow.camera.top = 20;
  directionalLight.shadow.camera.bottom = -20;

  scene.add(directionalLight);


  // =========================================
  // 7. HANDLE WINDOW RESIZE
  // =========================================

  /*
   * When the user resizes the browser window, we need to update:
   *   1. Camera's aspect ratio (prevents stretching)
   *   2. Renderer's size (fills the new window size)
   *
   * Without this, resizing the window would distort the 3D scene.
   */
  window.addEventListener('resize', () => {
    // Update camera aspect ratio to match new window proportions
    camera.aspect = window.innerWidth / window.innerHeight;

    /*
     * After changing camera properties, we MUST call updateProjectionMatrix()
     * to apply the changes. Three.js caches the projection internally
     * for performance, so we have to tell it to recalculate.
     */
    camera.updateProjectionMatrix();

    // Resize the renderer to fill the new window size
    renderer.setSize(window.innerWidth, window.innerHeight);
  });


  // =========================================
  // 8. RETURN EVERYTHING MAIN.JS NEEDS
  // =========================================

  /*
   * We return these objects so main.js can:
   *   - Use 'renderer' and 'scene' and 'camera' in the animation loop
   *   - Access 'cube' to rotate it each frame
   */
  return { scene, camera, renderer, cube };
}
