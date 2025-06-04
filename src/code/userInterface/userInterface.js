import { History } from "./history";
import { CityInputs } from "./cityInputs";
import { GuessCounter } from "./guessCounter";

export {UserInterface};

class UserInterface {
  constructor() {
    this.history = new History();
    this.cityInputs = new CityInputs();
    this.guessCounter = new GuessCounter(document.getElementById("guessCounterValueDisplayPanel"), 5);
  }

  getRandomGuess(){
    return this.cityInputs.getRandomGuess();
  }

  lockCities(citiesLocked, cityList){
    this.cityInputs.lockCities(citiesLocked, cityList);
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
    const outputDiv = document.getElementById("error");
    outputDiv.innerHTML = text;
  }

  clearDisplay(){
    const outputDiv = document.getElementById("error");
    outputDiv.innerHTML = "";
  }

}