export {GuessHistory};

class GuessHistory {

  constructor(HTMLElements) {
    this.HTMLElements = HTMLElements;
    this.historyResults = [];
  }

  reset() {
    this.historyResults = [];
    const outputDiv = this.HTMLElements.history;
    outputDiv.innerHTML = '';
  }

  update(guessList, latestGuess) {
      
    const outputDiv = this.HTMLElements.history;
    outputDiv.innerHTML = '';

    // Display the latest result
    const latestDiv = document.createElement("div");
    latestDiv.className = "resultItem";

    latestDiv.innerHTML = this.guessToHTML(latestGuess);

    // Add a separator
    const separator1 = document.createElement("hr");
    const separator2 = document.createElement("hr");

    outputDiv.appendChild(separator1);

    const latestHeader = document.createElement("h3");
    latestHeader.textContent = "Newest Result:";
    outputDiv.appendChild(latestHeader);

    outputDiv.appendChild(latestDiv);

    outputDiv.appendChild(separator2);

    // Display the history
    const historyHeader = document.createElement("h3");
    historyHeader.textContent = "History:";
    outputDiv.appendChild(historyHeader);

    for (let index = 0; index < guessList.length; index++) {
      const resultDiv = document.createElement("div");
      resultDiv.className = "resultItem";
      resultDiv.innerHTML = this.guessToHTML(guessList[index]);
      outputDiv.appendChild(resultDiv);
    }
  }

  guessToHTML(guess){
    const HTML = `
      <p>${guess.cities[0].name},</p>
      <p>${guess.cities[1].name},</p>
      <p>${guess.cities[2].name} </p>
      <p class="area">Area: ${guess.area} million km<sup>2</sup></p>
    `;
    return HTML;
  }

}
