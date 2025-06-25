import * as UTILS from '../utils.js';

export {GuessHistory};

class GuessHistory {

  constructor(HTMLElements) {
    this.HTMLElements = HTMLElements;
    this.outputDiv = this.HTMLElements.history;
    this.historyResults = [];
    this.targetArea = null;
  }

  update(guessList, latestGuess) {
      
    // Clear the div
    this.outputDiv.innerHTML = '';

    // Create the latest result
    const latestDiv = document.createElement("div");
    latestDiv.className = "resultItem";
    latestDiv.style.borderColor = UTILS.getAccuracyColor(latestGuess.getArea(), this.targetArea);
    latestDiv.innerHTML = this.guessToHTML(latestGuess);
    // Create a separator    
    const separator = document.createElement("hr");

    // Start creating the history

    // Add a separator
    this.outputDiv.appendChild(separator);

    // Newest header + result 
    const latestHeader = document.createElement("h3");
    latestHeader.textContent = "Newest Result:";
    this.outputDiv.appendChild(latestHeader);
    this.outputDiv.appendChild(latestDiv);

    // Another separator
    this.outputDiv.appendChild(separator);

    // Display the history
    // Header
    const historyHeader = document.createElement("h3");
    historyHeader.textContent = "History:";
    this.outputDiv.appendChild(historyHeader);

    // Loop over the list, add a entry for each guess
    for (let index = 0; index < guessList.length; index++) {
      const resultDiv = document.createElement("div");
      resultDiv.className = "resultItem";
      resultDiv.style.borderColor = UTILS.getAccuracyColor(guessList[index].getArea(), this.targetArea);
      resultDiv.innerHTML = this.guessToHTML(guessList[index]);
      this.outputDiv.appendChild(resultDiv);
    }
  }

  // Make the HTML for a guess
  guessToHTML(guess){
    const HTML = `
      <p>${guess.cities[0].name},</p>
      <p>${guess.cities[1].name},</p>
      <p>${guess.cities[2].name} </p>
      <p class="area">Area: ${guess.area} million km<sup>2</sup></p>
    `;
    return HTML;
  }

  // Set target area for accuracy calculations
  setTargetArea(targetArea) {
    this.targetArea = targetArea;
  }

  // Clear the dashboard
  reset() {
    this.historyResults = [];
    this.outputDiv = this.HTMLElements.history;
    this.outputDiv.innerHTML = '';
    this.targetArea = null;
  }

}
