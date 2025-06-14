import { GFXDisplay } from './gfxDisplay/gfxDisplay.js';
import { UserInterface } from './userInterface/userInterface.js';

import * as CONFETTI from '@tsparticles/confetti';

export {Game};

// Tolerance for winning a game
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
    
    this.display = new GFXDisplay(this.HTMLElements.GFXDisplay);
    this.userInterface = new UserInterface(this.HTMLElements.UserInterface);

    // Gamestate
    this.guessCounter = Infinity;
    this.guessHistory = [];
    this.currentState = GameState.INIT;
    this.targetArea = null;
    this.citiesLocked = 0;

    // Initalize gamestate, will be changed upon calling startGame()
    this.resetGame();
  }

  // Called on init and when a new game is requested
  resetGame() {
    this.guessCounter = Infinity;
    this.guessHistory = [];
    this.currentState = GameState.INIT;
    this.targetArea = null;
    this.citiesLocked = 0;

    // Reset the triangle
    this.display.reset();
    // Reset the cities, guess counter, history display
    this.userInterface.reset();

    // Hide all panels, except the difficulty selection
    this.HTMLElements.difficultyPanel.style.display = 'block';
    this.HTMLElements.winPanel.style.display = 'none';
    this.HTMLElements.epicWinPanel.style.display = 'none';
    this.HTMLElements.losePanel.style.display = 'none';
    // The target is unknown until a difficulty is selected
    //this.HTMLElements.target.textContent = `Target: ?? million km²`;
    
  }
  
  // Starts the tour, show how the difficulty selector works,
  // if it is still on screen.
  startTour() {
    const isDifficultyVisible = this.currentState == GameState.INIT;
    this.userInterface.startTour(isDifficultyVisible);
  }

  dateToHash(date){
    const dateString = date.getFullYear() + '-' + 
                  String(date.getMonth() + 1).padStart(2, '0') + '-' + 
                  String(date.getDate()).padStart(2, '0');
    
    // Simple rolling hash function to convert date to number
    let hash = 0;
    for (let i = 0; i < dateString.length; i++) {
      const char = dateString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
    }

    return hash;
  }

  randomFromSeed(seed, min, max){
    return min + (seed % (max - min + 1));
  }

  // Starts the game, with the desired number of locked cities
  startGame(gameType) {
    this.guessHistory = [];
    this.display.reset();
    this.userInterface.reset(); 

    let seed = 0;
    let numGuesses = 0;
    let numCitiesLocked = 0;

    // Generate a consistent seed based on today's date
    const today = new Date();
    const todaySeed = this.dateToHash(today);
    const randomSeed = Math.floor(Math.random() * 0xFFFFFFFF);

    switch (gameType) {
      case "Daily":
        seed = todaySeed;
        numCitiesLocked = this.randomFromSeed(seed,0,2);
        numGuesses = this.randomFromSeed(seed,1,10);
        break;

      case "Random":
        seed = randomSeed;
        numCitiesLocked = this.randomFromSeed(seed,0,2);
        numGuesses = this.randomFromSeed(seed,1,10);
        break;

      case "Easy":
        seed = randomSeed;
        numCitiesLocked = 0;
        numGuesses = this.userInterface.getNumGuesses();
        break;

      case "Medium":
        seed = randomSeed;
        numCitiesLocked = 1;
        numGuesses = this.userInterface.getNumGuesses();
        break;

      case "Hard":
        seed = randomSeed;
        numCitiesLocked = 2;
        numGuesses = this.userInterface.getNumGuesses();
        break;

      default:
        break;
    }

    const targetGuess = this.userInterface.getRandomGuess(seed);
    this.targetArea = targetGuess.getArea();

    const cityList = targetGuess.getNames();
    const targetVal = this.targetArea;


    this.guessCounter = numGuesses;

    this.userInterface.startGame(numCitiesLocked, cityList, targetVal, numGuesses);
    this.HTMLElements.difficultyPanel.style.display = 'none';
    this.currentState = GameState.NOT_CLOSE;
  }

  // Called when within targetTol. Displays the winGame panel.
  winGame() {
    this.HTMLElements.winPanelGuessesLeft.textContent = this.guessCounter;
    this.HTMLElements.winPanel.style.display = 'block';
    this.celebrate(10);
  }
  
  // Called when the guess is an EXACT match. Displays the epicWinGame panel.
  // Guesses are rounded depending on their magnitude.
  epicWinGame() {
    this.HTMLElements.epicWinPanelGuessesLeft.textContent = this.guessCounter;
    this.HTMLElements.epicWinPanel.style.display = 'block';
    this.celebrate(100);
  }

  continueGame() {
    this.HTMLElements.winPanel.style.display = 'none';
  }

  loss() {
    this.HTMLElements.losePanel.style.display = 'block';
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
          // Iterate over list
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

  logDist(a, b = 1){
    return Math.abs(Math.log10(a) - Math.log10(b));
  }

  evaluateGuess(guess) {
    //Change color as well?
    const guessArea = guess.getArea();

    if(guessArea == this.targetArea) {
      this.currentState = GameState.EXACT_MATCH;
      this.epicWinGame();
    }
    else if( (this.logDist(1+targetTol) > this.logDist(guessArea, this.targetArea)) && 
    (this.currentState == GameState.NOT_CLOSE)) {
      this.currentState = GameState.WITHIN_TOL;
      this.winGame();
    }
    else if(this.guessCounter == 0){
      this.currentState = GameState.LOSS;
      this.loss();
    }
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



