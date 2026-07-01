// In-game HUD — health bar, score, ammo count, reloading indicator, damage flash, controls hint

export class HUD {
  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'hud';
    this.container.innerHTML = `
      <div class="hud-top">
        <div class="health-container">
          <div class="health-label">HP</div>
          <div class="health-bar-bg">
            <div class="health-bar-fill" id="health-fill"></div>
          </div>
          <div class="health-text" id="health-text">100</div>
        </div>
        
        <div class="hud-top-right">
          <div class="score-container">
            <div class="score-icon">💎</div>
            <div class="score-text" id="score-text">0</div>
          </div>
          
          <div class="ammo-container">
            <div class="ammo-icon">💥</div>
            <div class="ammo-text"><span id="ammo-loaded">30</span> / <span id="ammo-reserve">120</span></div>
          </div>
        </div>
      </div>
      
      <div class="hud-bottom">
        <div class="controls-hint" id="controls-hint">
          WASD to move · Mouse to look · Left Click to shoot · R to reload · Shift to sprint
        </div>
      </div>
      
      <div class="crosshair" id="crosshair">+</div>
      <div class="damage-overlay" id="damage-overlay"></div>
      <div class="reload-overlay" id="reload-overlay">RELOADING...</div>
      
      <div class="minimap-container" id="minimap-container">
        <canvas id="minimap" width="130" height="130"></canvas>
      </div>
    `;
    document.body.appendChild(this.container);

    this.healthFill = document.getElementById('health-fill');
    this.healthText = document.getElementById('health-text');
    this.scoreText = document.getElementById('score-text');
    this.ammoLoadedText = document.getElementById('ammo-loaded');
    this.ammoReserveText = document.getElementById('ammo-reserve');
    this.reloadOverlay = document.getElementById('reload-overlay');
    this.damageOverlay = document.getElementById('damage-overlay');
    this.controlsHint = document.getElementById('controls-hint');
    this.minimapCanvas = document.getElementById('minimap');
    this.minimapCtx = this.minimapCanvas.getContext('2d');
  }

  updateHealth(health) {
    this.healthFill.style.width = `${health}%`;
    this.healthText.textContent = Math.ceil(health);

    if (health > 60)      this.healthFill.style.background = 'linear-gradient(90deg, #2ecc71, #27ae60)';
    else if (health > 30) this.healthFill.style.background = 'linear-gradient(90deg, #f39c12, #e67e22)';
    else                  this.healthFill.style.background = 'linear-gradient(90deg, #e74c3c, #c0392b)';
  }

  updateScore(score) {
    this.scoreText.textContent = score;
  }

  updateAmmo(loaded, reserve) {
    this.ammoLoadedText.textContent = loaded;
    this.ammoReserveText.textContent = reserve;
  }

  setReloading(isReloading) {
    if (isReloading) {
      this.reloadOverlay.style.opacity = '1';
      this.reloadOverlay.style.transform = 'translate(-50%, -50%) scale(1)';
    } else {
      this.reloadOverlay.style.opacity = '0';
      this.reloadOverlay.style.transform = 'translate(-50%, -50%) scale(0.8)';
    }
  }

  flashDamage() {
    this.damageOverlay.style.opacity = '0.3';
    setTimeout(() => { this.damageOverlay.style.opacity = '0'; }, 150);
  }

  hideControlsHint() {
    this.controlsHint.style.opacity = '0';
  }

  updateMinimap(playerPos, cameraYaw, zombies, crystals) {
    const ctx = this.minimapCtx;
    const width = this.minimapCanvas.width;
    const height = this.minimapCanvas.height;
    
    // Clear canvas frame
    ctx.clearRect(0, 0, width, height);

    // Map size (110x110 boundary pixels representation)
    const mapSize = 114;
    const offset = (width - mapSize) / 2;
    const scale = mapSize / 100; // 1.14 pixels per world unit
    
    // 1. Draw outer boundary border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(offset, offset, mapSize, mapSize);
    
    // World coordinates (-50 to 50) to Canvas coordinates converter
    const toCanvas = (wx, wz) => {
      const cx = width / 2 + wx * scale;
      const cz = height / 2 + wz * scale;
      return { x: cx, y: cz };
    };

    // 2. Draw crystals (Gold circles)
    for (const c of crystals) {
      if (!c.collected) {
        const cPos = toCanvas(c.mesh.position.x, c.mesh.position.z);
        ctx.beginPath();
        ctx.arc(cPos.x, cPos.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffca28'; // Gold glow
        ctx.fill();
      }
    }

    // 3. Draw Zombie Commandos (Red circles)
    for (const z of zombies) {
      if (z.isAlive) {
        const zPos = toCanvas(z.group.position.x, z.group.position.z);
        ctx.beginPath();
        ctx.arc(zPos.x, zPos.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#f44336'; // Bright Red danger indicator
        ctx.fill();
      }
    }

    // 4. Draw Player (Green triangle pointing along look direction)
    const pPos = toCanvas(playerPos.x, playerPos.z);
    ctx.save();
    ctx.translate(pPos.x, pPos.y);
    ctx.rotate(-cameraYaw); // align canvas rotation to counter-clockwise camera yaw

    ctx.beginPath();
    ctx.moveTo(0, -5);  // Arrow nose pointing straight ahead
    ctx.lineTo(-3.5, 3.5); // Bottom Left tail
    ctx.lineTo(3.5, 3.5);  // Bottom Right tail
    ctx.closePath();
    ctx.fillStyle = '#00e676'; // Neon Green
    ctx.fill();
    
    ctx.restore();
  }

  show() { this.container.style.display = 'block'; }
  hide() { this.container.style.display = 'none'; }
}
