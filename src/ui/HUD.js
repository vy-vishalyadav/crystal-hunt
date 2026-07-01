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

  show() { this.container.style.display = 'block'; }
  hide() { this.container.style.display = 'none'; }
}
