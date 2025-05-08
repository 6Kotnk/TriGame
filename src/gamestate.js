import {resetDashboard} from './dashboard.js';

const targetTol = 0.1; //10%

const GameState = {
  NOT_CLOSE: 'NOT_CLOSE',
  WITHIN_TOL: 'WITHIN_TOL',
  EXACT_MATCH: 'EXACT_MATCH',
};

class GameStateMachine  {

  constructor(initialTarget) {
    this.targetVal = initialTarget;
    this.guessCounter = 0;
    this.currentState = GameState.NOT_CLOSE;
    document.getElementById('target').textContent = `Target: ${initialTarget} million km²`;
  }

  evaluateGuess(attemptVal) {
    if(attemptVal == this.targetVal) {
      this.epicWinGame();
    }
    else if( targetTol < Math.abs(attemptVal- this.targetVal) ) {
      if(this.currentState == GameState.NOT_CLOSE) {
        this.winGame();
      }
    }
  }

  winGame() {
    this.currentState = GameState.WITHIN_TOL;
    document.getElementById('winValue').textContent = this.guessCounter;
    document.getElementById('winPanel').style.display = 'block';
  }
  
  epicWinGame() {
    this.currentState = GameState.EXACT_MATCH;
    document.getElementById('epicWinValue').textContent = this.guessCounter;
    document.getElementById('epicWinPanel').style.display = 'block';
  }

  resetGame() {

    this.guessCounter = 0;
    this.currentState = GameState.NOT_CLOSE;
    this.targetVal = (10 + Math.random() * 90).toFixed(0);

    /*
    historyResults = [];
    const outputDiv = document.getElementById("dashboard");
    outputDiv.innerHTML = '';
    */

    document.getElementById('winPanel').style.display = 'none';
    document.getElementById('epicWinPanel').style.display = 'none';

    document.getElementById('target').textContent = `Target: ${this.targetVal} million km²`;
    
  }
  
  continueGame() {
    document.getElementById('winPanel').style.display = 'none';
  }

}

export const gameSM = new GameStateMachine(10);

function resetGame() {
  gameSM.resetGame();
  resetDashboard();
}

function continueGame() {
  gameSM.continueGame();
}

window.resetGame = resetGame;
window.continueGame = continueGame;
