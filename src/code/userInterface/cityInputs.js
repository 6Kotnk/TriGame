import cities from "../../assets/data/cities.json";


export {CityInputs};

class CityInputs {

  constructor() {
    this.cityCoords = Array(3).fill(null);

    this.inputs = [
        document.getElementById("city1"),
        document.getElementById("city2"),
        document.getElementById("city3")
    ];

    this.datalist = document.getElementById("cities"); // Shared datalist
    //const coordsDisplay = document.getElementById("coordsDisplay");

    // Attach event listeners to all inputs
    this.inputs.forEach(input => {
        input.addEventListener("input", this.handleInput);
        input.addEventListener("change", this.handleChange);
    });

    window.submitCities = this.submitCities;

  }


  handleInput(event) {
    const search = event.target.value.toLowerCase();
    datalist.innerHTML = ""; // Clear old suggestions

    if (search.length < 2) return; // Avoid searching too early

    const matches = cities
        .filter(city => city.name.toLowerCase().includes(search))
        .slice(0, 10); // Limit to 10 results

    matches.forEach(city => {
        const option = document.createElement("option");
        option.value = city.name;
        option.setAttribute("data-coords", city.coords);
        datalist.appendChild(option);
    });
  }

  handleChange(event) {
    const inputValue = event.target.value;
    const inputIdx = parseInt(event.target.id[event.target.id.length - 1]) - 1;
    let cityCoordStr = "";
    let selectedOption = "";

    try {
      selectedOption = Array.from(datalist.options).find(option => option.value === inputValue);
    } catch (error) {
      // Console log instead? Or pass up to game class
      //document.getElementById('dashboard').innerHTML = "Error loading data from datalist: " + error;
    }
    if (selectedOption) {
      cityCoordStr = selectedOption.getAttribute("data-coords");
      inputs[inputIdx].style.backgroundColor = '#90EE90'; // Light green for match
      cityCoords[inputIdx] = cityCoordStr.split(", ").map(Number)
    } else {
      inputs[inputIdx].style.backgroundColor = '#FFB6C1'; // Light pink for no match
      cityCoords[inputIdx] = null
    }
    
    datalist.innerHTML = ""; // Clear old suggestions
  }
}


