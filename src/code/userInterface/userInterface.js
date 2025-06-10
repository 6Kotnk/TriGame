import { History } from "./history";
import { CityInputs } from "./cityInputs";
import { Tour } from "./tour";
import { GuessCounter } from "./guessCounter";
import { GuessSlider } from "./guessSlider";

export {UserInterface};

class UserInterface {
  constructor(HTMLElements) {

    this.HTMLElements = HTMLElements;

    this.errorDisplay = HTMLElements.errorDisplay;

    this.history = new History(this.HTMLElements.History);
    this.cityInputs = new CityInputs(this.HTMLElements.CityInputs);
    this.tour = new Tour(this.HTMLElements.Tour);
    this.guessCounter = new GuessCounter(this.HTMLElements.GuessCounter);
    this.guessSlider = new GuessSlider(this.HTMLElements.GuessSlider);
  }

  getRandomGuess(){
    return this.cityInputs.getRandomGuess();
  }

  startTour(isDifficultyVisible) {
    this.tour.startTour(isDifficultyVisible);
  }

  startGame(citiesLocked, cityList){
    this.cityInputs.lockCities(citiesLocked, cityList);
    this.guessCounter.update(this.guessSlider.getSliderValue());
    return this.guessSlider.getSliderValue();
  }

  getGuess(){
    return this.cityInputs.getGuess();
  }

  update(guessHistory, latestGuess, newCount){
    this.history.update(guessHistory, latestGuess);
    this.guessCounter.update(newCount);
    this.clearDisplay();
  }

  reset(){
    this.cityInputs.reset();
    this.history.reset();
    this.guessCounter.reset();
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