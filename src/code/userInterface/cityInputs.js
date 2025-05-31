import cities from "../../assets/data/cities.json";
import { Guess } from "../guess";


export {CityInputs};

class CityInputs {

  constructor() {
    this.cityCoords = Array(3).fill(null);
    this.cityNames = Array(3).fill(null);
    
    //this.cityInputs = Array(3).fill(null);

    this.inputs = [
        document.getElementById("city1"),
        document.getElementById("city2"),
        document.getElementById("city3")
    ];

    this.locks = [
        document.getElementById("city1Lock"),
        document.getElementById("city2Lock"),
        document.getElementById("city3Lock")
    ];

    this.datalist = document.getElementById("cities"); // Shared this.datalist
    //const coordsDisplay = document.getElementById("coordsDisplay");

    // Attach event listeners to all inputs
    this.inputs.forEach(input => {
        input.addEventListener("input", this.handleInput);
        input.addEventListener("change", this.handleChange);
    });

  }

  setInputState(input, state) {
    // Remove all state classes
    input.classList.remove('valid', 'invalid', 'locked');
    
    // Add the new state class if specified
    if (state) {
      input.classList.add(state);
    }
  }

  lockCity(idx){
    const city = this.inputs[idx];
    const lock = this.locks[idx];

    city.value = cities[Math.floor(Math.random() * cities.length)].name;
    city.readOnly = true;
    city.dispatchEvent(new Event('input', { bubbles: true }));
    city.dispatchEvent(new Event('change', { bubbles: true }));
    this.setInputState(city, "locked");
    lock.innerHTML = "🔒";
  }

  unlockCity(idx){
    const city = this.inputs[idx];
    const lock = this.locks[idx];

    city.value = "";
    city.readOnly = false;
    //city.style.backgroundColor = '#FFFFFF';
    this.setInputState(city, null);
    lock.innerHTML = "";
  }

  lockCities(citiesLocked){

    for (let index = 0; index < citiesLocked; index++) {
      this.lockCity(index);
    }
  }

  getGuess(){
    const guess = new Guess();

    let CoordsValid = true; // Assume all coordinates are valid initially

    for (let i = 0; i < this.cityCoords.length; i++) {
      // Check if the current coordinate is "falsy" (null, undefined, etc.)
      if (!this.cityCoords[i]) {
        CoordsValid = false; // Found an invalid coordinate
        break; // Stop checking immediately, no need to check the rest
      }
    }
    if (!CoordsValid) {
      throw new Error("Make sure all cities are valid before submitting");
    }

    guess.setCoords(this.cityCoords);
    guess.setNames(this.cityNames);

    return guess;
  }

  handleInput = (event) => {
    const search = event.target.value.toLowerCase();

    this.datalist.innerHTML = ""; // Clear old suggestions

    if (search.length < 2) return; // Avoid searching too early

    const matches = cities
      .filter(city => city.name.toLowerCase().includes(search))
      .filter(match => !this.cityNames.includes(match.name))
      .slice(0, 10);



    matches.forEach(city => {
        const option = document.createElement("option");
        option.value = city.name;
        option.setAttribute("data-coords", city.coords);
        this.datalist.appendChild(option);
    });
  }



  handleChange = (event) => {
    const inputValue = event.target.value;
    const inputIdx = parseInt(event.target.id[event.target.id.length - 1]) - 1;



    let cityCoordStr = "";
    let selectedOption = "";

    try {
      selectedOption = Array.from(this.datalist.options).find(option => option.value === inputValue);
    } catch (error) {
      // Console log instead? Or pass up to game class
      //document.getElementById('dashboard').innerHTML = "Error loading data from this.datalist: " + error;
    }
    if (selectedOption) {
      cityCoordStr = selectedOption.getAttribute("data-coords");
      //this.inputs[inputIdx].style.backgroundColor = '#90EE90'; // Light green for match
      this.setInputState(this.inputs[inputIdx], "valid");
      this.cityCoords[inputIdx] = cityCoordStr.split(", ").map(Number);
      this.cityNames[inputIdx] = inputValue;
    } else {
      //this.inputs[inputIdx].style.backgroundColor = '#FFB6C1'; // Light pink for no match
      this.setInputState(this.inputs[inputIdx], "invalid");
      this.cityCoords[inputIdx] = null;
      this.cityNames[inputIdx] = null;
    }
    
    this.datalist.innerHTML = ""; // Clear old suggestions
  }


  reset(){

    this.cityCoords.fill(null);
    this.cityNames.fill(null);

    for (let index = 0; index < this.inputs.length; index++) {
      this.unlockCity(index);
    }
  }

}


