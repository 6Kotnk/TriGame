export {History};

class History {

  constructor() {
    this.historyResults = [];
  }

  reset() {
    historyResults = [];
    const outputDiv = document.getElementById("dashboard");
    outputDiv.innerHTML = '';
  }

  update(cityInputNames, triangleArea) {
      
    // Latest result object
    const latestResult = {
        cities: cityInputNames,
        area: triangleArea,
    };

    // Sort for easy equality checking
    cityInputNames = cityInputNames.sort();

    let resultNew = false;
    // Automatically add to history if no history
    if(historyResults.length == 0){
        resultNew = true;
    }
    else
    {
        resultNew = !historyResults.some(function(historyResult) {
            let equal = true;
                for (let idx = 0; idx < cityInputNames.length; idx++) {
                    equal &= historyResult.cities[idx] == cityInputNames[idx];  
                }
            return equal
            }
        );
    }

    if(resultNew){
        gameSM.guessCounter += 1;
        historyResults.push(latestResult);
    }


    // Sort the history by proximity to the target value
    historyResults.sort((a, b) => Math.abs(a.area - gameSM.targetVal) - Math.abs(b.area - gameSM.targetVal));

    // Limit the history to the top 9 results (keeping 1 spot for the latest result)
    if (historyResults.length > 9) {
        historyResults = historyResults.slice(0, 9);
    }

    this.displayResults(latestResult, historyResults, gameSM.guessCounter);
  }

  displayResults(latestResult, historyResults, guessCounter) {
    const outputDiv = document.getElementById("dashboard");
    outputDiv.innerHTML = '';

    // Display the latest result
    const latestDiv = document.createElement("div");
    latestDiv.className = "resultItem";
    latestDiv.innerHTML = `
      <p>${cityInputNames[0]},</p>
      <p>${cityInputNames[1]},</p>
      <p>${cityInputNames[2]}</p>
      <p class="area">Area: ${latestResult.area} million km<sup>2</sup></p>
    `;

    // Add a separator
    const separator1 = document.createElement("hr");
    const separator2 = document.createElement("hr");

    const attemptCounter = document.createElement("div");
    attemptCounter.className = "resultItem";
    attemptCounter.innerHTML = `
    Guess counter: 
    ${guessCounter}
    `;

    outputDiv.appendChild(attemptCounter);

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

    historyResults.forEach(result => {
      const resultDiv = document.createElement("div");
      resultDiv.className = "resultItem";
      resultDiv.innerHTML = `
        <p>${result.cities[0]},</p>
        <p>${result.cities[1]},</p>
        <p>${result.cities[2]}</p>
        <p class="area">Area: ${result.area} million km<sup>2</sup></p>
      `;
      outputDiv.appendChild(resultDiv);
    });
  }

}
