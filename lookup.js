
const R = 6371;  // Earth's radius in kilometers

function coordStringToArray(str) {
  return str.split(", ").map(Number);
}

function fetchAndProcessCSV() {
    url = 'http://localhost:8000/city_names.csv';
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
    //rows.shift(); 
    //rows.pop(); 
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
    const city1_coord_s = findCoordinates(city1_name, cities);
    const city2_coord_s = findCoordinates(city2_name, cities);
    const city3_coord_s = findCoordinates(city3_name, cities);

    city1_coord = coordStringToArray(city1_coord_s);
    city2_coord = coordStringToArray(city2_coord_s);
    city3_coord = coordStringToArray(city3_coord_s);

    //const output = `City 1: ${city1_coord_s}<br>City 2: ${city2_coord_s}<br>City 3: ${city3_coord_s}`;

    const area_skm = sphericalExcess(city1_coord, city2_coord, city3_coord);
    const area_mil_skm = area_skm / 1e6;
    const area_str = area_mil_skm.toFixed(2);

    const output = `Area: ` + area_str + ` million Km^2`;
    document.getElementById('output').innerHTML = output;

//-------------------------------------------------------//
    
    city1_vec = new THREE.Vector3();
    city2_vec = new THREE.Vector3();
    city3_vec = new THREE.Vector3();
    
    city1_vec.setFromSphericalCoords(
      1,
      THREE.Math.degToRad(-city1_coord[0] + 90),
      THREE.Math.degToRad( city1_coord[1] + 90),
    );
    
    city2_vec.setFromSphericalCoords(
      1,
      THREE.Math.degToRad(-city2_coord[0] + 90),
      THREE.Math.degToRad( city2_coord[1] + 90),
    );
    
    city3_vec.setFromSphericalCoords(
      1,
      THREE.Math.degToRad(-city3_coord[0] + 90),
      THREE.Math.degToRad( city3_coord[1] + 90),
    );

//-------------------------------------------------------//
    scene.remove(s1);
    scene.remove(s2);
    scene.remove(s3);

    scene.remove(t1);
    t1 = createLineBetweenPoints(city2_vec, city3_vec);
    scene.remove(t2);
    t2 = createLineBetweenPoints(city1_vec, city2_vec);
    scene.remove(t3);
    t3 = createLineBetweenPoints(city3_vec, city1_vec);
    
    scene.remove(triangle);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    newCentralMeridian = drawSphericalTriangle(ctx, city1_vec, city2_vec, city3_vec);
    
    triTexture = new THREE.CanvasTexture(canvas);
    triTexture.wrapS = THREE.RepeatWrapping;

    triTexture.offset.x = (-newCentralMeridian) / 360;

    triMaterial = new THREE.MeshBasicMaterial(
      { map: triTexture,     
        transparent: true,
        opacity: 0.5});

    triangle = new THREE.Mesh(sphereGeometry, triMaterial);
    scene.add(triangle);
    
}

function findCoordinates(cityName, cities) {
    const city = cities.find(c => c.name === cityName);
    if (city) {
        return city.coord;
    }
    //return 'Not found';
    return '0, 0';
}

function rotate(l, n) {
  return [...l.slice(n, l.length), ...l.slice(0, n)];
}

function degToRad(deg) {
  return deg * Math.PI / 180;
}

function haversine(coord1, coord2) {
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;
  const dLat = degToRad(lat2 - lat1);
  const dLon = degToRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(degToRad(lat1)) * Math.cos(degToRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  console.log(distance);
  return distance;
}

function sphericalExcess(coord1, coord2, coord3) {
  const a = haversine(coord2, coord3);
  const b = haversine(coord1, coord3);
  const c = haversine(coord1, coord2);
  const A = Math.acos((Math.cos(a / R) - Math.cos(b / R) * Math.cos(c / R)) / (Math.sin(b / R) * Math.sin(c / R)));
  const B = Math.acos((Math.cos(b / R) - Math.cos(a / R) * Math.cos(c / R)) / (Math.sin(a / R) * Math.sin(c / R)));
  const C = Math.acos((Math.cos(c / R) - Math.cos(a / R) * Math.cos(b / R)) / (Math.sin(a / R) * Math.sin(b / R)));
  const E = A + B + C - Math.PI;
  const area = E * R ** 2;
  return area;
}
