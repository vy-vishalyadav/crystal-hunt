// Menu, Game Over, and Win screen overlays

export class MenuScreen {
  constructor(onStart) {
    this.container = document.createElement('div');
    this.container.id = 'menu-screen';
    this.container.innerHTML = `
      <div class="menu-content">
        <h1 class="game-title">CRYSTAL<span class="title-highlight">HUNT</span></h1>
        <p class="game-subtitle">Collect all crystals before the enemies get you</p>
        <div class="menu-divider"></div>
        <button class="menu-btn" id="start-btn">START GAME</button>
        <div class="menu-controls">
          <div class="control-item"><kbd>W A S D</kbd> Move</div>
          <div class="control-item"><kbd>Mouse</kbd> Look Around</div>
          <div class="control-item"><kbd>Shift</kbd> Sprint</div>
        </div>
      </div>
    `;
    document.body.appendChild(this.container);
    document.getElementById('start-btn').addEventListener('click', onStart);
  }

  show() { this.container.style.display = 'flex'; }
  hide() { this.container.style.display = 'none'; }
}

export class GameOverScreen {
  constructor(onRestart) {
    this.container = document.createElement('div');
    this.container.id = 'gameover-screen';
    this.container.innerHTML = `
      <div class="menu-content gameover-content">
        <h1 class="gameover-title">GAME OVER</h1>
        <p class="gameover-score">Score: <span id="final-score">0</span></p>
        <button class="menu-btn restart-btn" id="restart-btn">PLAY AGAIN</button>
      </div>
    `;
    document.body.appendChild(this.container);
    this.container.style.display = 'none';
    document.getElementById('restart-btn').addEventListener('click', onRestart);
  }

  show(score) {
    document.getElementById('final-score').textContent = score;
    this.container.style.display = 'flex';
  }
  hide() { this.container.style.display = 'none'; }
}

export class WinScreen {
  constructor(onRestart) {
    this.container = document.createElement('div');
    this.container.id = 'win-screen';
    this.container.innerHTML = `
      <div class="menu-content win-content">
        <h1 class="win-title">🏆 YOU WIN!</h1>
        <p class="win-text">All crystals collected!</p>
        <p class="gameover-score">Final Score: <span id="win-score">0</span></p>
        <button class="menu-btn" id="win-restart-btn">PLAY AGAIN</button>
      </div>
    `;
    document.body.appendChild(this.container);
    this.container.style.display = 'none';
    document.getElementById('win-restart-btn').addEventListener('click', onRestart);
  }

  show(score) {
    document.getElementById('win-score').textContent = score;
    this.container.style.display = 'flex';
  }
  hide() { this.container.style.display = 'none'; }
}
