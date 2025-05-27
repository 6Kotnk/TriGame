import { Display } from './display/display.js';
import { Guess } from './guess.js';
import { UserInterface } from './userInterface/userInterface.js';

export {Game};

const targetTol = 0.1; //10%

const GameState = {
  INIT: 'INIT',
  NOT_CLOSE: 'NOT_CLOSE',
  WITHIN_TOL: 'WITHIN_TOL',
  EXACT_MATCH: 'EXACT_MATCH',
  LOSS: 'LOSS',
};

class Game  {

  constructor(initialTargetArea) {

    this.display = new Display();
    this.userInterface = new UserInterface();

    this.guessHistory = [];

    this.targetArea = initialTargetArea;
    this.guessCounter = 5;
    this.currentState = GameState.INIT;

    this.citiesLocked = 0;

    this.triangleColors = {
      verts: "white",
      edges: "white",
      fill: "cyan",
    };

    document.getElementById('difficultyPanel').style.display = 'block';
    document.getElementById('target').textContent = `Target: ${initialTargetArea} million km²`;

  }


  startGame() {
    document.getElementById('difficultyPanel').style.display = 'none';
    this.currentState = GameState.NOT_CLOSE;
  }

  resetGame() {

    this.guessCounter = 5;
    this.guessHistory = [];
    this.currentState = GameState.INIT;
    this.targetArea = (10 + Math.random() * 90).toFixed(0);

    this.display.reset();
    this.userInterface.reset();

    document.getElementById('difficultyPanel').style.display = 'block';
    document.getElementById('winPanel').style.display = 'none';
    document.getElementById('epicWinPanel').style.display = 'none';
    document.getElementById('losePanel').style.display = 'none';

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

    /*
    let cityInputCoords;
    let cityInputNames;

    try {

      cityInputCoords = this.userInterface.getInputCoords();
      cityInputNames = this.userInterface.getInputNames();

    } catch (error) {
      this.userInterface.display("Make sure all cities are valid before submitting");
    }
*/

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

      const guess = this.userInterface.getGuess();

      //guess.colors = this.triangleColors;

      if(!guess.isInList(this.guessHistory))
      {

        //Insert guess at correct index
        this.guessCounter--;
        const currentGuessAreaError = Math.abs(guess.area - this.targetArea);

        if(this.guessHistory.length == 0){
          this.guessHistory.push(guess);
        }else{
          for (let index = 0; index < this.guessHistory.length; index++) {
            const listGuessAreaError = Math.abs(this.guessHistory[index].area - this.targetArea);
            if(currentGuessAreaError < listGuessAreaError){
              this.guessHistory.splice(index, 0, guess);
              break;
            }
          }
        }

        this.evaluateGuess(guess);

        // Put in evaluateGuess
        this.userInterface.update(this.guessHistory, guess, this.guessCounter);
        this.display.update(guess);
        this.displayIfWin();

      }else{
        //IDK maybe tell that its in the list
      }

    } catch (error) {
      //this.userInterface.display("Error loading data during triangle movement: " + error.stack);
      this.userInterface.display(error.message);
    }
  }


  evaluateGuess(guess) {
    //Change color as well?
    const guessArea = guess.getArea();

    if(guessArea == this.targetArea) {
      this.currentState = GameState.EXACT_MATCH;
    }
    else if( targetTol > Math.abs(guessArea - this.targetArea) ) {
      if(this.currentState == GameState.NOT_CLOSE) {
        this.currentState = GameState.WITHIN_TOL;
      }
    }

    if(this.guessCounter == 0){
      this.currentState = GameState.LOSS;
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
      case GameState.LOSS:
        this.loss();
        break;
      default:
        break;
    }
  }

  startGame(citiesLocked) {
    //this.citiesLocked = citiesLocked;
    this.userInterface.lockCities(citiesLocked);
    document.getElementById('difficultyPanel').style.display = 'none';
  }

  winGame() {
    document.getElementById('guessCounterValueWinPanel').textContent = this.guessCounter;
    document.getElementById('winPanel').style.display = 'block';
  }
  
  epicWinGame() {
    document.getElementById('guessCounterValueEpicWinPanel').textContent = this.guessCounter;
    document.getElementById('epicWinPanel').style.display = 'block';
  }

  loss() {
    document.getElementById('losePanel').style.display = 'block';
  }

}



