import { GFXDisplay } from './gfxDisplay/gfxDisplay.js';
import { UserInterface } from './userInterface/userInterface.js';

import * as CONFETTI from '@tsparticles/confetti';
import * as UTILS from './utils.js';

export {Game};

// Tolerance for winning a game
const targetTol = 0.1; //10%

const errorScalingFactor = Math.log(3)/UTILS.logDist(2*(1+targetTol));

const GameState = {
  INIT: 'INIT',
  PLAY: 'PLAY',
  END: 'END',
};

class Game  {

  constructor(HTMLElements) {
    this.HTMLElements = HTMLElements;
    
    this.display = new GFXDisplay(this.HTMLElements.GFXDisplay);
    this.userInterface = new UserInterface(this.HTMLElements.UserInterface);

    // Set up callback for when a guess is selected from history
    this.userInterface.onGuessSelected = (guess) => {
      this.display.update(guess);
    };

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


  // Starts the daily game
  startGame() {

    // Get current date + time
    const now = new Date();

    // Strip off time, only want date
    const today = now.getFullYear() + '-' + 
                  String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                  String(now.getDate()).padStart(2, '0');
                
    // Generate a consistent seed based on today's date
    const seed = this.hash(today);
    const numCitiesLocked = UTILS.randomFromSeed(seed,0,2);
    const numGuesses = UTILS.randomFromSeed(seed,1,10);

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
    
    this.HTMLElements.titlePanel.style.display = 'none';
    document.getElementById('tourButton').classList.remove('hidden');
    this.currentState = GameState.PLAY;
  }
  
  // No guesses left
  endGame() {
    this.currentState = GameState.END;
    this.HTMLElements.endPanel.style.display = 'block';
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

      // The error (how wrong the guess was) is calculated using logarithmic distance
      const guessError = UTILS.logDist(guess.getArea(), this.targetArea);

      // If you haven't tried it yet...
      if(!guess.isInList(this.guessHistory))
      {

        this.guessCounter--;

        // if no guesses in guess history
        if(this.guessHistory.length == 0){
          this.guessHistory.push(guess);
        }else{
          // Iterate over list
          let inserted = false;
          for (let index = 0; index < this.guessHistory.length; index++) {
            const listGuessAreaError = UTILS.logDist(this.guessHistory[index].getArea(), this.targetArea);
            if(guessError < listGuessAreaError){
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
        const accuracyColor = UTILS.getColorFromValue(errorScalingFactor * guessError);
        guess.setColors (
          {
            verts: accuracyColor,
            edges: accuracyColor,
            fill: accuracyColor,
            outline: accuracyColor,
          }
        );
        

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
    // Within targetTol of target
    if( UTILS.logDist(1+targetTol) > UTILS.logDist(guessArea, this.targetArea)){
      this.celebrate(10);
      this.endGame();
    }
    // Out of guesses AND you didn't win
    else if(this.guessCounter == 0){
      this.endGame();
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

    // Hide end panel
    this.HTMLElements.endPanel.style.display = 'none';
    //Show the title screen
    this.HTMLElements.titlePanel.style.display = 'block';
    document.getElementById('tourButton').classList.add('hidden');
  
  }

}



