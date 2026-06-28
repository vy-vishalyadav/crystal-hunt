// Manages game state transitions and score

export class GameState {
  constructor() {
    this.state = 'menu'; // 'menu' | 'playing' | 'gameover' | 'win'
    this.score = 0;
    this.onStateChange = null;
  }

  setState(newState) {
    this.state = newState;
    if (this.onStateChange) this.onStateChange(newState);
  }

  addScore(points) {
    this.score += points;
  }

  reset() {
    this.score = 0;
    this.state = 'menu';
  }

  get isPlaying() {
    return this.state === 'playing';
  }
}
