// In-game HUD — health bar, score, damage flash, controls hint

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
        <div class="score-container">
          <div class="score-icon">💎</div>
          <div class="score-text" id="score-text">0</div>
        </div>
      </div>
      <div class="hud-bottom">
        <div class="controls-hint" id="controls-hint">
          WASD to move · Mouse to look · Left Click to shoot · Shift to sprint
        </div>
      </div>
      <div class="crosshair" id="crosshair">+</div>
      <div class="damage-overlay" id="damage-overlay"></div>
    `;
    document.body.appendChild(this.container);

    this.healthFill = document.getElementById('health-fill');
    this.healthText = document.getElementById('health-text');
    this.scoreText = document.getElementById('score-text');
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
