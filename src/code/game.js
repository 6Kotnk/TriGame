import { Display } from './display/display.js';
import { UserInterface } from './userInterface/userInterface.js';

import * as CONFETTI from '@tsparticles/confetti';

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

  constructor(HTMLElements) {

    this.HTMLElements = HTMLElements;

    this.display = new Display(this.HTMLElements.Display);
    this.userInterface = new UserInterface(this.HTMLElements.UserInterface);

    this.guessHistory = [];

    this.targetArea = null;
    this.guessCounter = Infinity;
    this.currentState = GameState.INIT;

    this.citiesLocked = 0;

    this.HTMLElements.difficultyPanel.style.display = 'block';
    this.HTMLElements.target.textContent = `Target: ?? million km²`;

  }


  startTour() {
    const isDifficultyVisible = this.currentState == GameState.INIT;
    this.userInterface.startTour(isDifficultyVisible);
  }

  resetGame() {

    this.guessCounter = Infinity;
    this.guessHistory = [];
    this.currentState = GameState.INIT;
    this.targetArea = null;

    this.display.reset();
    this.userInterface.reset();

    this.HTMLElements.difficultyPanel.style.display = 'block';
    this.HTMLElements.winPanel.style.display = 'none';
    this.HTMLElements.epicWinPanel.style.display = 'none';
    this.HTMLElements.losePanel.style.display = 'none';

    this.HTMLElements.target.textContent = `Target: ?? million km²`;
    
  }
  
  continueGame() {
    this.HTMLElements.winPanel.style.display = 'none';
  }

  logDist(a, b = 1){
    return Math.abs(Math.log10(a) - Math.log10(b));
  }

  submitGuess() {

    if (!this.userInterface) {
      console.error("Dashboard element not found!");
      return; // Exit if the dashboard element doesn't exist
    }

    try {

      const guess = this.userInterface.getGuess();

      //guess.colors = this.triangleColors;

      if(!guess.isInList(this.guessHistory))
      {

        //Insert guess at correct index
        this.guessCounter--;
        const currentGuessAreaError = this.logDist(guess.area, this.targetArea);

        // List is empty
        if(this.guessHistory.length == 0){
          this.guessHistory.push(guess);
        }else{
          // Itterate over list
          let inserted = false;
          for (let index = 0; index < this.guessHistory.length; index++) {
            const listGuessAreaError = this.logDist(this.guessHistory[index].area, this.targetArea);
            if(currentGuessAreaError < listGuessAreaError){
              this.guessHistory.splice(index, 0, guess);
              inserted = true;
              break;
            }
          }
          // If the element is last insert at the end
          if (!inserted) {
            this.guessHistory.push(guess);
          }
        }

        this.evaluateGuess(guess);

        // Put in evaluateGuess
        this.userInterface.update(this.guessHistory, guess, this.guessCounter);
        this.display.update(guess);

      }else{
        this.userInterface.display("You already tried this triangle!");
      }

    } catch (error) {
      this.userInterface.display(error.message);
    }
  }


  evaluateGuess(guess) {
    //Change color as well?
    const guessArea = guess.getArea();

    if(guessArea == this.targetArea) {
      this.currentState = GameState.EXACT_MATCH;
      this.epicWinGame();
    }
    else if( this.logDist(1+targetTol) > this.logDist(guessArea, this.targetArea) ) {
      if(this.currentState == GameState.NOT_CLOSE) {
        this.currentState = GameState.WITHIN_TOL;
        this.winGame();
      }
    }
    else if(this.guessCounter == 0){
      this.currentState = GameState.LOSS;
      this.loss();
    }
  }


  startGame(citiesLocked) {
    this.guessHistory = [];
    const targetGuess = this.userInterface.getRandomGuess();
    this.targetArea = targetGuess.getArea();

    this.display.reset();
    this.userInterface.reset();

    this.guessCounter = this.userInterface.startGame(citiesLocked, targetGuess.getNames());
    this.HTMLElements.target.textContent = `Target: ${this.targetArea} million km²`;
    this.HTMLElements.difficultyPanel.style.display = 'none';
    this.currentState = GameState.NOT_CLOSE;
  }

  winGame() {
    this.HTMLElements.guessCounterValueWinPanel.textContent = this.guessCounter;
    this.HTMLElements.winPanel.style.display = 'block';
    this.celebrate(10);
  }
  
  epicWinGame() {
    this.HTMLElements.guessCounterValueEpicWinPanel.textContent = this.guessCounter;
    this.HTMLElements.epicWinPanel.style.display = 'block';
    this.celebrate(100);
  }

  loss() {
    this.HTMLElements.losePanel.style.display = 'block';
  }

  celebrate(intensity){
    var duration = 5 * 1000; // Duration in milliseconds
    var animationEnd = Date.now() + duration;
    var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    var interval = setInterval(function() {
        var timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        var particleCount = intensity * (timeLeft / duration);
        // Since particles fall down, start a bit higher than random
        CONFETTI.confetti("confetti_id", Object.assign({}, 
          defaults, 
          { particleCount, origin: { x: Math.random(), y: Math.random() - 0.2 } }));
    }, 10);
  }

}



