// Tracks keyboard, mouse movement, and click states (modified for FPS controls)

export class InputManager {
  constructor() {
    this.keys = { 
      forward: false, 
      backward: false, 
      left: false, 
      right: false, 
      reload: false, 
      sprint: false, 
      shoot: false,
      ads: false,   // Aim Down Sights (Right-click)
      jump: false   // Jump physics (Spacebar)
    };
    this.mouse = { movementX: 0, movementY: 0 };
    this.isPointerLocked = false;

    // Listeners for key presses
    window.addEventListener('keydown', (e) => this._updateKey(e.code, true));
    window.addEventListener('keyup', (e) => this._updateKey(e.code, false));
    
    // Mouse movement
    window.addEventListener('mousemove', (e) => this._onMouseMove(e));
    
    // Left-click (shoot) & Right-click (aim down sights)
    window.addEventListener('mousedown', (e) => this._onMouseButton(e, true));
    window.addEventListener('mouseup', (e) => this._onMouseButton(e, false));
    
    // Disable right-click context menu so it doesn't break aiming
    window.addEventListener('contextmenu', (e) => {
      if (this.isPointerLocked) e.preventDefault();
    });

    document.addEventListener('pointerlockchange', () => {
      this.isPointerLocked = document.pointerLockElement !== null;
    });
  }

  requestPointerLock(element) {
    element.addEventListener('click', () => {
      if (!this.isPointerLocked) element.requestPointerLock();
    });
  }

  resetMouseDelta() {
    this.mouse.movementX = 0;
    this.mouse.movementY = 0;
  }

  _updateKey(code, pressed) {
    switch (code) {
      case 'KeyW': case 'ArrowUp':    this.keys.forward  = pressed; break;
      case 'KeyS': case 'ArrowDown':   this.keys.backward = pressed; break;
      case 'KeyA': case 'ArrowLeft':   this.keys.left     = pressed; break;
      case 'KeyD': case 'ArrowRight':  this.keys.right    = pressed; break;
      case 'KeyR':                    this.keys.reload   = pressed; break;
      case 'Space':                   this.keys.jump     = pressed; break;
      case 'ShiftLeft': case 'ShiftRight': this.keys.sprint = pressed; break;
    }
  }

  _onMouseMove(e) {
    if (this.isPointerLocked) {
      this.mouse.movementX += e.movementX;
      this.mouse.movementY += e.movementY;
    }
  }

  _onMouseButton(e, pressed) {
    if (!this.isPointerLocked) return;

    if (e.button === 0) {
      this.keys.shoot = pressed; // Left click
    } else if (e.button === 2) {
      this.keys.ads = pressed;   // Right click
    }
  }
}
