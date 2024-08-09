var s1;
var s2;
var s3;

var t1;
var t2;
var t3;

const S1_IDX = 0;
const S2_IDX = 1;
const S3_IDX = 2;

const T1_IDX = 3;
const T2_IDX = 4;
const T3_IDX = 5;

var triangle_objects = [s1, s2, s3, t1, t2, t3];

var city1_coord;
var city2_coord;
var city3_coord;

var city1_vec = new THREE.Vector3();
var city2_vec = new THREE.Vector3();
var city3_vec = new THREE.Vector3();

var triTexture
var mapTriangle;
var triMaterial

function fetchAndProcessCSV() {
    url = 'https://raw.githubusercontent.com/6Kotnk/TriGame/main/city_names.csv';
    city1_name = document.getElementById("city1").value;
    city2_name = document.getElementById("city2").value;
    city3_name = document.getElementById("city3").value;
    fetch(url)
        .then(response => response.text())
        .then(csvData => {
            processData(csvData);
        })
        .catch(error => {
            document.getElementById('output').innerHTML = "Error loading data: " + error;
        });
}

function processData(csvData) {
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

    // Example to process Paris, Tokyo, and Colombo
    city1_coord = findCoordinates(city1_name, cities);
    city2_coord = findCoordinates(city2_name, cities);
    city3_coord = findCoordinates(city3_name, cities);

    const area_skm = sphericalExcess(city1_coord, city2_coord, city3_coord);
    const area_mil_skm = area_skm / 1e6;
    const area_str = area_mil_skm.toFixed(2);

    const output = `Area: ` + area_str + ` million Km^2`;
    document.getElementById('output').innerHTML = output;

//-------------------------------------------------------//
    
    city1_vec = coordsToVec(city1_coord);
    city2_vec = coordsToVec(city2_coord);
    city3_vec = coordsToVec(city3_coord);

//-------------------------------------------------------//

    scene.remove(mapTriangle);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    newCentralMeridian = drawSphericalTriangle(ctx,
        triangle_objects,
    [city1_vec, city2_vec, city3_vec]);
    
    triTexture = new THREE.CanvasTexture(canvas);
    triTexture.wrapS = THREE.RepeatWrapping;

    triTexture.offset.x = (-newCentralMeridian) / 360;

    triMaterial = new THREE.MeshBasicMaterial(
      { map: triTexture,     
        transparent: true,
        opacity: 0.5});

    mapTriangle = new THREE.Mesh(sphereGeometry, triMaterial);
    scene.add(mapTriangle);
    
}
