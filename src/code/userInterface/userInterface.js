import { History } from "./history";
import { CityInputs } from "./cityInputs";

export {UserInterface};

class UserInterface {
  constructor() {
    this.history = new History();
    this.cityInputs = new CityInputs();
  }

  getInputCoords(){
    this.cityInputs.getCoords();
  }

  getInputNames(){
    this.cityInputs.getNames();
  }

  update(cityInputNames, triangleArea){
    this.history.update(cityInputNames, triangleArea);
  }

  addGuess(){
    this.history.displayResults();
  }

  reset(){
    this.cityInputs.reset();
    this.history.reset();
  }

}