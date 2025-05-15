import { Display } from './display/display.js';
import { UserInterface } from './userInterface/userInterface.js';

export {Game};

const targetTol = 0.1; //10%

const GameState = {
  NOT_CLOSE: 'NOT_CLOSE',
  WITHIN_TOL: 'WITHIN_TOL',
  EXACT_MATCH: 'EXACT_MATCH',
};

class Game  {

  constructor(initialTargetArea) {

    this.display = new Display();
    this.userInterface = new UserInterface();

    this.targetArea = initialTargetArea;
    this.guessCounter = 0;
    this.currentState = GameState.NOT_CLOSE;

    this.triangleColors = {
      verts: "white",
      edges: "white",
      fill: "cyan",
    };

    document.getElementById('target').textContent = `Target: ${initialTargetArea} million km²`;

  }

  resetGame() {

    this.guessCounter = 0;
    this.currentState = GameState.NOT_CLOSE;
    this.targetArea = (10 + Math.random() * 90).toFixed(0);

    document.getElementById('winPanel').style.display = 'none';
    document.getElementById('epicWinPanel').style.display = 'none';

    document.getElementById('target').textContent = `Target: ${this.targetArea} million km²`;
    
  }
  
  continueGame() {
    document.getElementById('winPanel').style.display = 'none';
  }

  submitGuess() {

    if (!this.userInterface) {
      console.error("Dashboard element not found!");
      return; // Exit if the dashboard element doesn't exist
    }


    try {

      cityInputCoords = this.userInterface.getInputCoords();
      cityInputNames = this.userInterface.getInputNames();

    } catch (error) {
      this.userInterface.display("Make sure all cities are valid before submitting");
    }


/*

    // Move into getCoords, throw exception
  
    let CoordsValid = true; // Assume all coordinates are valid initially

    for (let i = 0; i < cityInputCoords.length; i++) {
      // Check if the current coordinate is "falsy" (null, undefined, etc.)
      if (!cityInputCoords[i]) {
        CoordsValid = false; // Found an invalid coordinate
        break; // Stop checking immediately, no need to check the rest
      }
    }
    if (!CoordsValid) {
      this.userInterface.display("Make sure all cities are valid before submitting");
      return;
    }

*/




    try {

      this.display.setTriangleCoords(cityInputCoords);
      triangleArea = this.display.getTriangleArea();
      this.evaluateGuess(triangleArea);

      this.userInterface.update(cityInputNames, triangleArea);
      this.display.setTriangleColors(this.triangleColors);

      this.display.reconfigure();
      this.displayIfWin();

    } catch (error) {
      this.userInterface.display("Error loading data during triangle movement: " + error.stack);
    }
  }


  evaluateGuess(guessVal) {
    //Change color as well?
    if(guessVal == this.targetVal) {
      this.currentState = GameState.EXACT_MATCH;
    }
    else if( targetTol > Math.abs(guessVal - this.targetVal) ) {
      if(this.currentState == GameState.NOT_CLOSE) {
        this.currentState = GameState.WITHIN_TOL;
      }
    }
  }

  displayIfWin() {
    switch (this.currentState) {
      case GameState.WITHIN_TOL:
        this.winGame();
        break;
      case GameState.EXACT_MATCH:
        this.epicWinGame();
        break;
      default:
        break;
    }
  }

  winGame() {
    document.getElementById('winValue').textContent = this.guessCounter;
    document.getElementById('winPanel').style.display = 'block';
  }
  
  epicWinGame() {
    document.getElementById('epicWinValue').textContent = this.guessCounter;
    document.getElementById('epicWinPanel').style.display = 'block';
  }

}



