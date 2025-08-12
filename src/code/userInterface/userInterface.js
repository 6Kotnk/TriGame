import { GuessHistory } from "./guessHistory";
import { CityInputs } from "./cityInputs";
import { Tour } from "./tour";
import { StateDisplay } from "./stateDisplay";

export {UserInterface};

class UserInterface {
  constructor(HTMLElements) {

    this.HTMLElements = HTMLElements;

    this.errorDisplay = HTMLElements.errorDisplay;

    this.history = new GuessHistory(this.HTMLElements.History);
    this.cityInputs = new CityInputs(this.HTMLElements.CityInputs);
    this.tour = new Tour(this.HTMLElements.Tour);
    this.guessDisplay = new StateDisplay(this.HTMLElements.GuessDisplay);
    this.targetDisplay = new StateDisplay(this.HTMLElements.TargetDisplay);

    // Set up the callback for when a guess is clicked in history
    this.history.onGuessClick = (guess) => this.onHistoryGuessClick(guess);
  }

  getRandomGuess(seed){
    return this.cityInputs.getRandomGuess(seed);
  }


  startTour(isDifficultyVisible) {
    this.tour.startTour(isDifficultyVisible);
  }

  startGame(numCitiesLocked, cityList, targetVal, guessNum){
    this.cityInputs.lockCities(numCitiesLocked, cityList);
    this.guessDisplay.update(guessNum, guessNum);
    this.targetDisplay.update(targetVal);
  }

  getGuess(){
    return this.cityInputs.getGuess();
  }

  // Handle when a history guess is clicked
  onHistoryGuessClick(guess) {
    this.cityInputs.populateFromGuess(guess);
    // Set the display callback to update the triangle display
    if (this.onGuessSelected) {
      this.onGuessSelected(guess);
    }
  }

  update(guessHistory, latestGuess, newCount, totalCount = null){
    this.history.update(guessHistory, latestGuess);
    this.guessDisplay.update(newCount, totalCount);
    this.clearDisplay();
  }

  reset(){
    this.cityInputs.reset();
    this.history.reset();
    this.guessDisplay.reset();
    this.targetDisplay.reset();
    this.clearDisplay();
  }

  display(text){
    const outputDiv = this.errorDisplay;
    outputDiv.innerHTML = text;
  }

  clearDisplay(){
    const outputDiv = this.errorDisplay;
    outputDiv.innerHTML = "";
  }

}