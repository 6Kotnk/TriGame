import { GFXDisplay } from './gfxDisplay/gfxDisplay.js';
import { UserInterface } from './userInterface/userInterface.js';

import * as CONFETTI from '@tsparticles/confetti';
import * as UTILS from './utils.js';

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

    // Declare gamestate
    this.guessCounter = Infinity;
    this.initialGuessCount = Infinity;
    this.guessHistory = [];
    this.currentState = GameState.INIT;
    this.targetArea = null;
    this.citiesLocked = 0;

    // Game does not preserve state, since it has no cookies.
    // Every new game should be the same as a page reload
    this.resetGame();
  }
  
  // Starts the tour, shows how the difficulty selector works,
  // if it is still on screen.
  startTour() {
    const isDifficultyVisible = this.currentState == GameState.INIT;
    this.userInterface.startTour(isDifficultyVisible);
  }

  // Simple rolling hash function to convert string to number
  hash(inputStr){
    let hash = 0;
    for (let i = 0; i < inputStr.length; i++) {
      const char = inputStr.charCodeAt(i);
      // hash = hash * 31 + char
      hash = ((hash << 5) - hash) + char;
    }

    return hash;
  }


  // Starts the game, with the desired number of locked cities
  startGame(gameType) {

    let seed = 0;
    let numGuesses = 0;
    let numCitiesLocked = 0;

    // Get current date + time
    const now = new Date();

    // Strip off time, only want date
    const today = now.getFullYear() + '-' + 
                  String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                  String(now.getDate()).padStart(2, '0');
                
    // Generate a consistent seed based on today's date
    const todaySeed = this.hash(today);
    // Generate random seed
    const randomSeed = Math.floor(Math.random() * 0xFFFFFFFF);

    // Choose whether we want random or daily seed + other options
    switch (gameType) {
      case "Daily":
        seed = todaySeed;
        numCitiesLocked = UTILS.randomFromSeed(seed,0,2);
        numGuesses = UTILS.randomFromSeed(seed,1,10);
        break;

      case "Random":
        seed = randomSeed;
        numCitiesLocked = UTILS.randomFromSeed(seed,0,2);
        numGuesses = UTILS.randomFromSeed(seed,1,10);
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
        this.userInterface.display("Unknown game type");
        return;
    }

    // Get a random guess using our seed. This makes sure it is possible to win
    const targetGuess = this.userInterface.getRandomGuess(seed);

    // Get parameters of our guess
    this.targetArea = targetGuess.getArea();
    const cityList = targetGuess.getNames();
    const targetVal = this.targetArea;
    // Set initial number of guesses
    this.guessCounter = numGuesses;
    this.initialGuessCount = numGuesses;

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
  // Guesses are rounded depending on their magnitude, so smaller areas need more precision for an exact match.
  epicWinGame() {
    this.HTMLElements.epicWinPanelGuessesLeft.textContent = this.guessCounter;
    this.HTMLElements.epicWinPanel.style.display = 'block';
    this.celebrate(100);
  }

  // When you win within tolerance you can keep going, if you so choose
  continueGame() {
    this.HTMLElements.winPanel.style.display = 'none';
  }

  // No guesses left
  loss() {
    this.HTMLElements.losePanel.style.display = 'block';
  }

  // Click submit button
  submitGuess() {

    if (!this.userInterface) {
      console.error("Dashboard element not found!");
      return; // Exit if the dashboard element doesn't exist
    }

    try {
      // Get guess
      const guess = this.userInterface.getGuess();

      // If you haven't tried it yet...
      if(!guess.isInList(this.guessHistory))
      {

        this.guessCounter--;
        // The error (how wrong the guess was) is calculated using logarithmic distance
        const currentGuessAreaError = UTILS.logDist(guess.getArea(), this.targetArea);

        // if no guesses in guess history
        if(this.guessHistory.length == 0){
          this.guessHistory.push(guess);
        }else{
          // Iterate over list
          let inserted = false;
          for (let index = 0; index < this.guessHistory.length; index++) {
            const listGuessAreaError = UTILS.logDist(this.guessHistory[index].getArea(), this.targetArea);
            if(currentGuessAreaError < listGuessAreaError){
              // Insert at the right spot, so list is always sorted.
              // This makes sure guess history is displayed with closest guesses at the top
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

        // See if we have won/lost
        this.evaluateGuess(guess);

        // Set accuracy-based color for the triangle
        const accuracyColor = UTILS.getAccuracyColor(guess.getArea(), this.targetArea);
        guess.colors = {
          verts: accuracyColor,
          edges: accuracyColor,
          fill: accuracyColor,
        };

        // Show how good the new guess was
        this.userInterface.update(this.guessHistory, guess, this.guessCounter, this.initialGuessCount);
        this.display.update(guess);

      }else{
        this.userInterface.display("You already tried this triangle!");
      }

    } catch (error) {
      this.userInterface.display(error.message);
    }
  }


  evaluateGuess(guess) {
    const guessArea = guess.getArea();

    // Exact match
    if(guessArea == this.targetArea) {
      this.currentState = GameState.EXACT_MATCH;
      this.epicWinGame();
    }

    // Within targetTol of target
    // This only triggers once per game, so you are not constantly winning if you continue
    else if( (UTILS.logDist(1+targetTol) > UTILS.logDist(guessArea, this.targetArea)) && 
    (this.currentState == GameState.NOT_CLOSE)) {
      this.currentState = GameState.WITHIN_TOL;
      this.winGame();
    }

    // Out of guesses AND you didn't win
    else if(this.guessCounter == 0){
      this.currentState = GameState.LOSS;
      this.loss();
    }
  }

  // Displays a little fireworks display
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

  // Resets the state of the game to the initial condition, as if page was reloaded
  resetGame() {
    this.guessCounter = Infinity;
    this.initialGuessCount = Infinity;
    this.guessHistory = [];
    this.currentState = GameState.INIT;
    this.targetArea = null;
    this.citiesLocked = 0;

    // Reset the triangle
    this.display.reset();
    // Reset the cities, guess counter, history display
    this.userInterface.reset();

    // Hide all panels
    this.HTMLElements.winPanel.style.display = 'none';
    this.HTMLElements.epicWinPanel.style.display = 'none';
    this.HTMLElements.losePanel.style.display = 'none';
    //Show the difficulty selection
    this.HTMLElements.difficultyPanel.style.display = 'block';
  
  }

}



