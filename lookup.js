var spheres = Array(3).fill(null);
var lines = Array(3).fill(null);
var city_coords = Array(3).fill(null);
var city_vecs = Array(3).fill(null);

var triTexture
var mapTriangle;
var triMaterial

let historyResults = [];

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
        cities: `${city_names[0]}, ${city_names[1]}, ${city_names[2]}`,
        area: areaResult
    };

    // Add the latest result to the historyResults array
    historyResults.push(latestResult);

    // Sort the history by proximity to the target value
    historyResults.sort((a, b) => Math.abs(a.area - target_val) - Math.abs(b.area - target_val));

    // Limit the history to the top 9 results (keeping 1 spot for the latest result)
    if (historyResults.length > 9) {
        historyResults = historyResults.slice(0, 9);
    }

    // Clear the output div
    const outputDiv = document.getElementById("output");
    outputDiv.innerHTML = '';

    // Display the latest result with a clear demarcation
    const latestDiv = document.createElement("div");
    latestDiv.style.fontWeight = 'bold';
    latestDiv.style.marginBottom = '10px';
    latestDiv.textContent = `Newest Result: Cities: ${latestResult.cities} - Area: ${latestResult.area} million Km^2`;
    outputDiv.appendChild(latestDiv);

    // Demarcation between latest result and history
    const demarcationLine = document.createElement("hr");
    outputDiv.appendChild(demarcationLine);

    // Display the sorted history
    historyResults.forEach(result => {
        const resultDiv = document.createElement("div");
        resultDiv.textContent = `Cities: ${result.cities} - Area: ${result.area} million Km^2`;
        outputDiv.appendChild(resultDiv);
    });

//-------------------------------------------------------//
    
    for (let i = 0; i < city_coords.length; i++) {
        city_vecs[i] = coordsToVec(city_coords[i]);
    }


//-------------------------------------------------------//


    drawSphericalTriangleOutline(spheres, lines, city_vecs, new_dist);
    newCentralMeridian = drawSphericalTriangleFill(ctx, city_vecs);

}
