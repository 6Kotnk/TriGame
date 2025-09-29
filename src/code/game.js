import { GFXDisplay } from './gfxDisplay/gfxDisplay.js';
import { UserInterface } from './userInterface/userInterface.js';

import { Database as LocalDatabase } from './database/databaseLocal.js';
import { Database as ProdDatabase } from './database/database.js';

const Database = window.USE_LOCAL_DATABASE ? LocalDatabase : ProdDatabase;

import { Leaderboard } from './leaderboard/leaderboard.js';

import * as CONFETTI from '@tsparticles/confetti';
import * as UTILS from './utils.js';

export {Game};

// Tolerance for winning a game
const targetTol = 0.1; //10%

const errorScalingFactor = Math.log(3)/UTILS.logDist(2*(1+targetTol));

const GameState = {
  INIT: 'INIT',
  PLAY: 'PLAY',
  WIN: 'WIN',
  LOSE: 'LOSE',
  LEADERBOARD: 'LEADERBOARD',
};

class Game  {

  constructor(HTMLElements) {
    this.HTMLElements = HTMLElements;
    
    this.display = new GFXDisplay(this.HTMLElements.GFXDisplay);
    this.userInterface = new UserInterface(this.HTMLElements.UserInterface);
    
    this.database = new Database();
    this.leaderboard = new Leaderboard(this.database);

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

  getNumGuesses(numCitiesLocked, targetArea){
    // At least 3 guesses
    const minGuesses = 3;
    // 1 Guess per locked city
    const lockedFactor = numCitiesLocked;
    // 
    const optimalArea = 1;
    const areaFactor = Math.min(Math.floor(UTILS.logDist(targetArea, optimalArea)), 5);

    return minGuesses + lockedFactor + areaFactor;
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
    const seed = 1; //Prod
    //const seed = this.hash(today); //Prod
    //const seed = Math.floor(Math.random() * 0xFFFFFFFF); //Test

    const numCitiesLocked = UTILS.randomFromSeed(seed,0,2);
    // Get a random guess using our seed. This makes sure it is possible to win
    const targetGuess = this.userInterface.getRandomGuess(seed);

    // Get parameters of our guess
    this.targetArea = targetGuess.getArea();
    const cityList = targetGuess.getNames();
    const targetVal = this.targetArea;

    // Set initial number of guesses
    const numGuesses = this.getNumGuesses(numCitiesLocked, targetVal);
    this.guessCounter = numGuesses;
    this.initialGuessCount = numGuesses;

    this.userInterface.startGame(numCitiesLocked, cityList, targetVal, numGuesses);
    
    this.HTMLElements.titlePanel.style.display = 'none';
    this.currentState = GameState.PLAY;
  }
  
  bestGuessScore(bestGuessError){
    // A guess should give 50% the score of perfect guess @ target tol
    const scoreAtTargetTol = 0.5
    const fudgeFactor = Math.log10(scoreAtTargetTol)/Math.log10(1 - targetTol)
    return 10**(-bestGuessError*fudgeFactor);
  }

  guessesLeftScore(){
    return this.guessCounter / this.initialGuessCount;
  }

  getScore(guess){
    const guessError = UTILS.logDist(guess.getArea(), this.targetArea)

    const guessScore = this.bestGuessScore(guessError);
    const guessesLeftScore = this.guessesLeftScore();

    const bestGuessFactor = 1 / (this.initialGuessCount + 1);
    const guessesLeftFactor = this.initialGuessCount / (this.initialGuessCount + 1);

    const totalScore = (guessesLeftScore * guessesLeftFactor + guessScore * bestGuessFactor);

    return totalScore;
  }

  winGame() {
    this.celebrate(10);
    this.currentState = GameState.WIN;
    this.HTMLElements.winPanel.style.display = 'block';

  }

  loseGame() {
    this.currentState = GameState.LOSE;
    this.HTMLElements.losePanel.style.display = 'block';
  }

  async submitScore(){

    let bestGuess;
    let totalScore;

    try {
      bestGuess = this.guessHistory[0];
      totalScore = this.getScore(bestGuess);
    } catch (error) {
      if (window.DEBUG) {
        totalScore = parseFloat(document.getElementById('dbgWinScore').value);
      } else {
        this.userInterface.display(error.message);
      }
    }

    const username = this.HTMLElements.usernameInput.value.trim() || null;

    this.HTMLElements.submitScoreButton.disabled = true;
    this.HTMLElements.submitScoreButton.textContent = 'Submitting...';

    await this.database.saveScore(totalScore, username);

    this.showLeaderboard(username, totalScore);

  }

  // Calculate user's percentile ranking
  calculatePercentile(userScore, allScores) {
    if (allScores.length === 0) return 100;
    
    const betterScores = allScores.filter(score => score > userScore).length;
    return Math.round((1 - ((betterScores) / allScores.length)) * 100);
  }

  async showLeaderboard(username = null, totalScore = null){
    this.currentState = GameState.LEADERBOARD;
    this.HTMLElements.winPanel.style.display = 'none';
    this.HTMLElements.losePanel.style.display = 'none';
    this.HTMLElements.leaderboard.style.display = 'block';
    //

    let leaderboardHTML = '<h2>Leaderboard</h2>';

    const stats = await this.leaderboard.getStats();

    if( totalScore != null) // game won
    {
      const percentile = this.calculatePercentile(totalScore, stats.scores);
      leaderboardHTML += `<h3>Your Score: ${totalScore.toFixed(3)}</h3>`;
      leaderboardHTML += `<p>You scored better than ${percentile}% of players!</p>`;
    }

    leaderboardHTML += `<p>Average score: ${stats.average} (${stats.totalPlayers} total players)</p>`;
    
    // Add histogram
    leaderboardHTML += this.leaderboard.generateHistogramHTML(stats.histogram, totalScore);
    
    // Add top scores
    leaderboardHTML += this.leaderboard.generateTopScoresHTML(stats.topScores, totalScore, username);
    
    // Show leaderboard stats
    this.HTMLElements.leaderboard.innerHTML = leaderboardHTML;
  }


  /*
  // No guesses left
  endGame() {
    this.currentState = GameState.END;
    this.HTMLElements.endPanel.style.display = 'block';

    const bestGuess = this.guessHistory[0];
    const bestGuessError = UTILS.logDist(bestGuess.getArea(), this.targetArea)

    const bestGuessScore = this.bestGuessScore(bestGuessError);
    const guessesLeftScore = this.guessesLeftScore();

    const bestGuessFactor = 1 / (this.initialGuessCount + 1);
    const guessesLeftFactor = this.initialGuessCount / (this.initialGuessCount + 1);

    const totalScore = guessesLeftScore * guessesLeftFactor + bestGuessScore * bestGuessFactor;

    // Display initial score and username input
    let scoreHTML = `<div class="score-display">`;
    scoreHTML += `<h3>Your Score: ${totalScore.toFixed(3)}</h3>`;
    scoreHTML += `
      <div class="username-section">
        <label for="username-input">Enter username for leaderboard (optional):</label>
        <input type="text" id="username-input" maxlength="20" placeholder="Anonymous">
        <button id="submit-score-btn">Submit Score</button>
      </div>
      <div id="leaderboard-stats" style="display: none;"></div>
    `;
    scoreHTML += `</div>`;
    
    this.HTMLElements.endPanelScore.innerHTML = scoreHTML;

    // Add event listener for score submission
    document.getElementById('submit-score-btn').addEventListener('click', async () => {
      const usernameInput = document.getElementById('username-input');
      const username = usernameInput.value.trim() || null;
      
      // Disable button and show loading
      const submitBtn = document.getElementById('submit-score-btn');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';
      
      // Save score to database
      const saveSuccess = await this.database.saveScore(totalScore, username);
      
      // Get leaderboard stats
      const stats = await this.leaderboard.getStats(totalScore);
      
      // Generate leaderboard HTML
      let leaderboardHTML = '';
      if (saveSuccess && stats.totalPlayers > 0) {
        leaderboardHTML += `<p>You scored better than ${stats.percentile}% of players!</p>`;
        leaderboardHTML += `<p>Average score: ${stats.average} (${stats.totalPlayers} total players)</p>`;
        
        // Add histogram
        leaderboardHTML += this.leaderboard.generateHistogramHTML(stats.histogram, totalScore);
        
        // Add top scores
        leaderboardHTML += this.leaderboard.generateTopScoresHTML(stats.topScores, totalScore, username);
      } else if (!saveSuccess) {
        leaderboardHTML += `<p><em>Unable to connect to leaderboard</em></p>`;
      } else {
        leaderboardHTML += `<p><em>You're the first player! More stats will appear as others play.</em></p>`;
      }
      
      // Show leaderboard stats
      const statsDiv = document.getElementById('leaderboard-stats');
      statsDiv.innerHTML = leaderboardHTML;
      statsDiv.style.display = 'block';
      
      // Hide username section
      document.querySelector('.username-section').style.display = 'none';
    });
  }
  */

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
    const guessError = UTILS.logDist(guessArea, this.targetArea)
    const maxError = UTILS.logDist(1+targetTol)

    // Check if guess is close enough
    if( guessError < maxError  || 1){ // Debug
      this.winGame();
      return;
    }

    // Guess is not close enough, deduct guess
    this.guessCounter--;

    if(this.guessCounter == 0){
      this.loseGame();
      return;
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
    this.HTMLElements.winPanel.style.display = 'none';
    this.HTMLElements.losePanel.style.display = 'none';
    //Show the title screen
    this.HTMLElements.titlePanel.style.display = 'block';
  }

}



