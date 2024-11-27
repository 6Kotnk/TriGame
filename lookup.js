const target_tol = 0.1; //10%

var guessCounter = 0;

var spheres = Array(3).fill(null);
var lines = Array(3).fill(null);
var city_coords = Array(3).fill(null);
var city_vecs = Array(3).fill(null);

var triTexture
var mapTriangle;
var triMaterial

let historyResults = [];

var winState = 0;

function fetchAndProcessCSV() {
    url = 'https://raw.githubusercontent.com/6Kotnk/TriGame/main/city_names.csv';

    var city_names = Array(3).fill(null);

    for (let i = 0; i < city_names.length; i++) {
      city_names[i] = document.getElementById("city" + (i + 1)).value;
    }

    fetch(url)
        .then(response => response.text())
        .then(csvData => {
            processData(csvData, city_names);
        })
        .catch(error => {
            document.getElementById('output').innerHTML = "Error loading data: " + error;
        });
}

function displayResults(latestResult, historyResults) {
    const outputDiv = document.getElementById("output");
    outputDiv.innerHTML = '';
  
    // Display the latest result
    const latestDiv = document.createElement("div");
    latestDiv.className = "resultItem";
    latestDiv.innerHTML = `
      <p>${latestResult.cities[0]},</p>
      <p>${latestResult.cities[1]},</p>
      <p>${latestResult.cities[2]}</p>
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

function processData(csvData, city_names) {
    const rows = csvData.split("\r\n");

    // Remove header row and last empty row
    let cities = [];

    rows.forEach((row,i) => {
        const columns = row.split(";");
        dbg1 = columns;
        dbg2 = i;
        // Assuming city name is in the second column and coordinates in the last
        cities.push({
            name: columns[0],
            coord: columns[columns.length - 1]
        });
    });

    for (let i = 0; i < city_coords.length; i++) {
        city_coords[i] = findCoordinates(city_names[i], cities);
    }

    const areaResult = (sphericalExcess(city_coords) / 1e6).toFixed(2);
 
    // Latest result object
    const latestResult = {
        cities: [
          document.getElementById("city1").value,
          document.getElementById("city2").value,
          document.getElementById("city3").value
        ],
        area: areaResult
      };

    // Sort for easy equality checking
    latestResult.cities = latestResult.cities.sort();
    
    let resultNew = false;
    // Automatically add to history if no history
    if(historyResults.length == 0){
        resultNew = true;
    }
    else
    {
        resultNew = !historyResults.some(function(historyResult) {
            let equal = true;
                for (let idx = 0; idx < latestResult.cities.length; idx++) {
                    equal &= historyResult.cities[idx] == latestResult.cities[idx];  
                }
            return equal
            }
        );
    }

    if(resultNew){
        guessCounter += 1;
        historyResults.push(latestResult);
    }
    

    // Sort the history by proximity to the target value
    historyResults.sort((a, b) => Math.abs(a.area - target_val) - Math.abs(b.area - target_val));

    // Limit the history to the top 9 results (keeping 1 spot for the latest result)
    if (historyResults.length > 9) {
        historyResults = historyResults.slice(0, 9);
    }


    displayResults(latestResult, historyResults)
    
    for (let i = 0; i < city_coords.length; i++) {
        city_vecs[i] = coordsToVec(city_coords[i]);
    }

    if((areaResult == target_val) && winState < 2)
    {
        drawSphericalTriangle(ctx, spheres, lines, city_vecs, new_dist, 2);
        if(winState < 2)
        {
            epicWinGame();
        }

    }else if((areaResult < (target_val * (1 + target_tol))) && (areaResult > (target_val * (1 - target_tol)))){
        drawSphericalTriangle(ctx, spheres, lines, city_vecs, new_dist, 1);
        if(winState < 1)
        {
            winGame();
        }
    }else{
        drawSphericalTriangle(ctx, spheres, lines, city_vecs, new_dist, 0);
    }

    function winGame() {
        winState = 1;
        document.getElementById('winValue').textContent = guessCounter;
        document.getElementById('winPanel').style.display = 'block';

        var duration = 5 * 1000; // Duration in milliseconds
        var animationEnd = Date.now() + duration;
        var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };
    
        var interval = setInterval(function() {
            var timeLeft = animationEnd - Date.now();
    
            if (timeLeft <= 0) {
                return clearInterval(interval);
            }
    
            var particleCount = 100 * (timeLeft / duration);
            // Since particles fall down, start a bit higher than random
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: Math.random(), y: Math.random() - 0.2 } }));
        }, 100);
    }

    function epicWinGame() {
        winState = 2;
        continueGame();
        document.getElementById('epicWinValue').textContent = guessCounter;
        document.getElementById('epicWinPanel').style.display = 'block';

        var duration = 5 * 1000; // Duration in milliseconds
        var animationEnd = Date.now() + duration;
        var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };
    
        var interval = setInterval(function() {
            var timeLeft = animationEnd - Date.now();
    
            if (timeLeft <= 0) {
                return clearInterval(interval);
            }
    
            var particleCount = 500 * (timeLeft / duration);
            // Since particles fall down, start a bit higher than random
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: Math.random(), y: Math.random() - 0.2 } }));
        }, 10);
    }



}

function resetGame() {
    guessCounter = 0;
    winState = 0;
    document.getElementById('winPanel').style.display = 'none';
    document.getElementById('epicWinPanel').style.display = 'none';
    target_val = (10 + Math.random() * 90).toFixed(0);
    document.getElementById('target').textContent = `Target: ${target_val} million km²`;
    historyResults = [];
    const outputDiv = document.getElementById("output");
    outputDiv.innerHTML = '';

    for (let idx = 0; idx < lines.length; idx++) {
        scene.remove(lines[idx]);
        scene.remove(spheres[idx]);
    }
    scene.remove(mapTriangle);

}


function continueGame() {
    document.getElementById('winPanel').style.display = 'none';
}
