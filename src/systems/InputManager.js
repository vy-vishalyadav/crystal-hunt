// Tracks keyboard and mouse input state

export class InputManager {
  constructor() {
    this.keys = { forward: false, backward: false, left: false, right: false, sprint: false };
    this.mouse = { movementX: 0, movementY: 0 };
    this.isPointerLocked = false;

    window.addEventListener('keydown', (e) => this._updateKey(e.code, true));
    window.addEventListener('keyup', (e) => this._updateKey(e.code, false));
    window.addEventListener('mousemove', (e) => this._onMouseMove(e));
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
      case 'ShiftLeft': case 'ShiftRight': this.keys.sprint = pressed; break;
    }
  }

  _onMouseMove(e) {
    if (this.isPointerLocked) {
      this.mouse.movementX += e.movementX;
      this.mouse.movementY += e.movementY;
    }
  }
}
