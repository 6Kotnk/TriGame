import cities from "../../assets/data/cities.json";
import { Guess } from "../guess";

import * as UTILS from '../utils.js';

export {CityInputs};

class CityInputs {

  constructor(HTMLElements) {
    this.HTMLElements = HTMLElements;
    
    this.cityCoords = Array(3).fill(null);
    this.cityNames = Array(3).fill(null);

    // Input fields
    this.inputs = [
        this.HTMLElements.city1,
        this.HTMLElements.city2,
        this.HTMLElements.city3
    ];

    // Lock icons for locked cities
    this.locks = [
        this.HTMLElements.city1Lock,
        this.HTMLElements.city2Lock,
        this.HTMLElements.city3Lock
    ];

    // Shared datalist, populated with all the cities
    this.datalist = this.HTMLElements.cities; 

    // Attach event listeners to all inputs
    this.inputs.forEach(input => {
        input.addEventListener("input", this.handleInput);
        input.addEventListener("change", this.handleChange);
    });

  }

  // Colors the inputs if they are valid
  setInputState(input, state) {
    // Remove all state classes
    input.classList.remove('valid', 'invalid', 'locked');
    
    // Add the new state class if specified
    if (state) {
      input.classList.add(state);
    }
  }

  // Make it so a city can't be changed
  lockCity(idx, cityValue){
    const city = this.inputs[idx];
    const lock = this.locks[idx];

    city.value = cityValue;
    city.readOnly = true;
    city.dispatchEvent(new Event('input', { bubbles: true }));
    city.dispatchEvent(new Event('change', { bubbles: true }));
    this.setInputState(city, "locked");
    lock.innerHTML = "🔒";
  }

  // Reset city so it can be changed again
  unlockCity(idx){
    const city = this.inputs[idx];
    const lock = this.locks[idx];

    city.value = "";
    city.readOnly = false;
    this.setInputState(city, null);
    lock.innerHTML = "";
  }

  lockCities(numCitiesLocked, cityList){
    for (let index = 0; index < numCitiesLocked; index++) {
      this.lockCity(index, cityList[index]);
    }

  }

  // Get a random guess with all cities valid
  getRandomGuess(seed){
    const guess = new Guess();
    const names = [];
    const coords = [];

    // Select 3 cities at random using the seed
    for (let index = 0; index < 3; index++) {
      // Mix the seed and the index, make sure index 0 does not multiply the seed by zero
      const randCity =  cities[UTILS.randomFromSeed(seed * 31 * (index + 1), 0, cities.length)];
      names.push(randCity.name);
      coords.push(randCity.coords.split(", ").map(Number));
    }
    guess.setNames(names)
    guess.setCoords(coords) 

    return guess;
  }

  // Get the currently input guess
  getGuess(){
    const guess = new Guess();

    let CoordsValid = true; // Assume all coordinates are valid initially

    for (let i = 0; i < this.cityCoords.length; i++) {
      // Check if the current coordinate is valid
      if (!this.cityCoords[i]) {
        CoordsValid = false; // Found an invalid coordinate
        break; // Stop checking immediately, no need to check the rest
      }
    }

    // This is caught in the game class and displayed on the dashboard
    if (!CoordsValid) {
      throw new Error("Make sure all cities are valid before submitting");
    }

    guess.setCoords(this.cityCoords);
    guess.setNames(this.cityNames);

    return guess;
  }

  // Triggers when the value in the input is being changed (char added/removed )
  // This handles the datalist (city suggestions)
  handleInput = (event) => {
    // Get field value and index
    const inputVal = event.target.value.toLowerCase();
    const inputIdx = parseInt(event.target.id[event.target.id.length - 1]) - 1;

    this.datalist.innerHTML = ""; // Clear old suggestions

    if (inputVal.length < 2) return; // Avoid searching too early

    // Make sure the value is a substring in the suggested city,
    // and that the suggested city is not already used elsewhere
    const matches = cities
      .filter(city => city.name.toLowerCase().includes(inputVal))
      .filter(match => this.cityNames[(inputIdx + 1)%3] != match.name)
      .filter(match => this.cityNames[(inputIdx + 2)%3] != match.name)
      .slice(0, 10);


    // Make datalist entries for all matches
    matches.forEach(city => {
      const option = document.createElement("option");
      option.value = city.name;
      option.setAttribute("data-coords", city.coords);
      this.datalist.appendChild(option);
    });
  }


  // Triggers when the value in the input actually changed (click of field/press enter)
  // This extracts the coords from the input city name, and colors the fields
  handleChange = (event) => {
    const inputVal = event.target.value;
    const inputIdx = parseInt(event.target.id[event.target.id.length - 1]) - 1;
    let cityCoordStr = "";
    let selectedOption = "";

    // Find the city in the datalist
    selectedOption = Array.from(this.datalist.options).find(option => option.value === inputVal);
    
    // If found
    if (selectedOption) {
      // Set the color
      cityCoordStr = selectedOption.getAttribute("data-coords");
      this.setInputState(this.inputs[inputIdx], "valid");
      // Extract name and coords
      this.cityCoords[inputIdx] = cityCoordStr.split(", ").map(Number);
      this.cityNames[inputIdx] = inputVal;
    } else {
      // Set the color
      this.setInputState(this.inputs[inputIdx], "invalid");
      // Make the name and coords invalid
      this.cityCoords[inputIdx] = null;
      this.cityNames[inputIdx] = null;
    }
    // Clear old suggestions
    this.datalist.innerHTML = ""; 
  }

  // Populate the input fields with cities from a guess
  populateFromGuess(guess) {
    for (let index = 0; index < 3; index++) {
      const input = this.inputs[index];
      const cityName = guess.cities[index].name;
      const coords = guess.cities[index].coords;
      
      // Set the input value
      input.value = cityName;
      
      // Update internal state
      this.cityNames[index] = cityName;
      this.cityCoords[index] = coords;
      
      // Set visual state to valid
      this.setInputState(input, "valid");
      
      // Trigger events to ensure everything is properly updated
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  reset(){
    this.cityCoords.fill(null);
    this.cityNames.fill(null);

    for (let index = 0; index < this.inputs.length; index++) {
      this.unlockCity(index);
    }
  }

}


