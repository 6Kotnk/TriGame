export {GuessHistory};

class GuessHistory {

  constructor(HTMLElements) {
    this.HTMLElements = HTMLElements;
    this.outputDiv = this.HTMLElements.history;
    this.historyResults = [];
    this.onGuessClick = null; // Callback function for when a guess is clicked
  }

  update(guessList, latestGuess) {
      
    // Clear the div
    this.outputDiv.innerHTML = '';

    // Create the latest result
    const latestDiv = this.createGuessDiv(latestGuess);
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
      const resultDiv = this.createGuessDiv(guessList[index]);
      this.outputDiv.appendChild(resultDiv);
    }
  }

  // Create a clickable div element for a guess
  createGuessDiv(guess) {
    const resultDiv = document.createElement("div");
    resultDiv.className = "resultItem";
    resultDiv.style.borderColor = guess.colors.outline;
    resultDiv.innerHTML = this.guessToHTML(guess);
    
    // Add click handler to make the div clickable
    resultDiv.style.cursor = 'pointer';
    resultDiv.addEventListener('click', () => {
      if (this.onGuessClick) {
        this.onGuessClick(guess);
      }
    });
    
    return resultDiv;
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

  // Clear the dashboard
  reset() {
    this.historyResults = [];
    this.outputDiv = this.HTMLElements.history;
    this.outputDiv.innerHTML = '';
  }

}
