import { GuessHistory } from "./guessHistory";
import { CityInputs } from "./cityInputs";
import { Tour } from "./tour";
import { StateDisplay } from "./stateDisplay";
import { Slider } from "./slider";

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
    this.guessSlider = new Slider(this.HTMLElements.GuessSlider);
  }

  getRandomGuess(seed){
    return this.cityInputs.getRandomGuess(seed);
  }

  getNumGuesses(){
    return this.guessSlider.getSliderValue();
  }

  startTour(isDifficultyVisible) {
    this.tour.startTour(isDifficultyVisible);
  }

  startGame(numCitiesLocked, cityList, targetVal, guessNum){
    this.cityInputs.lockCities(numCitiesLocked, cityList);
    this.guessDisplay.update(guessNum);
    this.targetDisplay.update(targetVal);
  }

  getGuess(){
    return this.cityInputs.getGuess();
  }

  update(guessHistory, latestGuess, newCount){
    this.history.update(guessHistory, latestGuess);
    this.guessDisplay.update(newCount);
    this.clearDisplay();
  }

  reset(){
    this.cityInputs.reset();
    this.history.reset();
    this.guessDisplay.reset();
    this.targetDisplay.reset();
    this.clearDisplay();
  }

  //debug
  display(text){
    const outputDiv = this.errorDisplay;
    outputDiv.innerHTML = text;
  }

  clearDisplay(){
    const outputDiv = this.errorDisplay;
    outputDiv.innerHTML = "";
  }

}