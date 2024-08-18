var spheres = Array(3).fill(null);
var lines = Array(3).fill(null);
var city_coords = Array(3).fill(null);
var city_vecs = Array(3).fill(null);

var triTexture
var mapTriangle;
var triMaterial

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


    const area_skm = sphericalExcess(city_coords);
    const area_mil_skm = area_skm / 1e6;
    const area_str = area_mil_skm.toFixed(2);

    const output = `Area: ` + area_str + ` million Km^2`;
    document.getElementById('output').innerHTML = output;

//-------------------------------------------------------//
    
    for (let i = 0; i < city_coords.length; i++) {
        city_vecs[i] = coordsToVec(city_coords[i]);
    }


//-------------------------------------------------------//


    drawSphericalTriangleOutline(spheres, lines, city_vecs, new_dist);
    newCentralMeridian = drawSphericalTriangleFill(ctx, city_vecs);

}
