const divs = 100;
const R = 6371;  // Earth's radius in kilometers
const mapScale = 10;

function createSphereAtPoint(position, scale, radius = 0.02, color = 0xff0000) {
  const geometry = new THREE.SphereGeometry(radius * scale, 32, 32);
  const material = new THREE.MeshBasicMaterial({ color: color });
  const sphere = new THREE.Mesh(geometry, material);
  sphere.position.copy(position);
  scene.add(sphere);
  return sphere;
}

function createLineBetweenPoints(point1, point2, scale, radius = 0.01, color = 0x0000ff) {
  const radialSegments = 16; // Number of segments around the radius of the torus
  const tubularSegments = 100; // Number of segments along the tube

  const arc = point2.angleTo(point1);
  
  const torusGeometry = new THREE.TorusGeometry(1, radius * scale, radialSegments, tubularSegments, arc);
  const material = new THREE.MeshBasicMaterial({ color: color });
  const torus = new THREE.Mesh(torusGeometry, material);

  normal_vec = new THREE.Vector3().crossVectors(point1, point2);

  up_vec = new THREE.Vector3().crossVectors(point1, new THREE.Vector3(0, 0, -Math.sign(normal_vec.z)));
  
  torus.up = up_vec;
  torus.lookAt(normal_vec);
  scene.add(torus);

  return torus;
}

function wrap360(value) {
  return ((value % 360) + 360) % 360;
}

function toLatLon(vec, c_mer = 0) {
    const longitude = Math.PI - Math.atan2(vec.z,vec.x);
    const latitude =  Math.acos(vec.y);
  
    // Convert radians to degrees
    const longitudeDegrees = wrap360((longitude * 180 / Math.PI) - c_mer);
    const latitudeDegrees = latitude * 180 / Math.PI;

    return { longitude: longitudeDegrees, latitude: latitudeDegrees };
}

function drawLine(ctx, curr_lon, curr_lat, next_lon, next_lat) {

  map_dist_sqrd = (curr_lon - next_lon)**2 + (curr_lat - next_lat)**2;
  
  if(map_dist_sqrd > ((360*mapScale / divs)**2) * 15) // One day actually calculate this
  {
    curr_lon -= 180;
    next_lon -= 180;
    curr_lat -= 90;
    next_lat -= 90;
    
    //iterpolate crossing point
    side_lon = Math.sign(curr_lon);
    curr_delta = 180 - side_lon * curr_lon;
    next_delta = 180 + side_lon * next_lon;

    lon_delta = curr_delta + next_delta;
    lat_delta = next_lat - curr_lat;
    mid_point_lat = curr_lat + (lat_delta * (curr_delta/lon_delta));

    side_lat = Math.sign(mid_point_lat);

    ctx.lineTo(mapScale*(side_lon *  180 + 180),mapScale*( mid_point_lat + 90));
    ctx.lineTo(mapScale*(side_lon *  180 + 180),mapScale*( side_lat * 90 + 90));
    ctx.lineTo(mapScale*(-side_lon * 180 + 180),mapScale*( side_lat * 90 + 90));
    ctx.lineTo(mapScale*(-side_lon * 180 + 180),mapScale*( mid_point_lat + 90));

    curr_lon += 180;
    next_lon += 180;
    curr_lat += 90;
    next_lat += 90;
    
  }
  
  ctx.lineTo(next_lon*mapScale, next_lat*mapScale);
}


function drawSphericalTriangleFill(ctx, vecs, color = "cyan") {

  let longitudes = [];

  vecs.forEach((vec, index) => {
    let { longitude: lon } = toLatLon(vec);
    longitudes[index] = lon;
  });

  newCentralMeridian = (Math.min(...longitudes) + Math.max(...longitudes)) / 2;
  if((Math.max(...longitudes) - Math.min(...longitudes)) < 180)
  {
    newCentralMeridian -= 180;
  }

  let { longitude: curr_lon, latitude: curr_lat } = toLatLon(vecs[0], newCentralMeridian);
  let next_lon = 0;
  let next_lat = 0;

  scene.remove(mapTriangle);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.moveTo(curr_lon, curr_lat);
  ctx.beginPath();      // Start the path for the triangle

  let r = new THREE.Vector3();

  for (let idx = 0; idx < vecs.length; idx++) {

    let current_vec = vecs[idx];
    let next_vec = vecs[(idx + 1) % vecs.length];

    for (let t = 0; t < current_vec.angleTo(next_vec); t += 2*Math.PI/divs) {
      r = interpolateBetweenPoints(current_vec,next_vec,t);
      ({ longitude: next_lon, latitude: next_lat } = toLatLon(r, newCentralMeridian));
      drawLine(ctx, curr_lon, curr_lat, next_lon, next_lat)
      curr_lon = next_lon;
      curr_lat = next_lat;
    }
    
  }

  ctx.closePath();      // Close the path (draw line back to the first vertex)
  ctx.fillStyle = color; // Set the fill color
  ctx.fill();            // Fill the triangle

  triTexture = new THREE.CanvasTexture(canvas);
  triTexture.wrapS = THREE.RepeatWrapping;

  triTexture.offset.x = (-newCentralMeridian) / 360;

  triMaterial = new THREE.MeshBasicMaterial(
    { map: triTexture,     
      transparent: true,
      opacity: 0.5});

  mapTriangle = new THREE.Mesh(sphereGeometry, triMaterial);
  scene.add(mapTriangle);

  return newCentralMeridian

}


function drawSphericalTriangleOutline(spheres, lines, vecs, scale) {

  for (let idx = 0; idx < vecs.length; idx++) {

    let current_vec = vecs[idx];
    let next_vec = vecs[(idx + 1) % vecs.length];

    scene.remove(lines[idx]);
    scene.remove(spheres[idx]);
    lines[idx] = createLineBetweenPoints(current_vec, next_vec, scale);
    spheres[idx] = createSphereAtPoint(current_vec, scale); // Create and assign the new sphere

  }

}

function interpolateBetweenPoints(point1, point2, t) {
  
  n = new THREE.Vector3().crossVectors(point1, point2);

  u = point1.clone();
  v = new THREE.Vector3().crossVectors(n, u).normalize();
  
  r = new THREE.Vector3();
  r = v.multiplyScalar(Math.sin(t)).add(u.multiplyScalar(Math.cos(t)));
  
  return r;
}

function findCoordinates(cityName, cities) {
  const city = cities.find(c => c.name === cityName);
  if (city) {
    const city_coord = city.coord.split(", ").map(Number)
    return city_coord;
  }
  throw new Error("City not found");
}

function coordsToVec(city_coord) {
  var city_vec = new THREE.Vector3();

  city_vec.setFromSphericalCoords(
    1,
    THREE.Math.degToRad(-city_coord[0] + 90),
    THREE.Math.degToRad( city_coord[1] + 90),
  );

  return city_vec;
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
  return distance;
}

function sphericalExcess(coords) {

  const sides = [];
  const angles = [];

  // Calculate the sides
  for (let idx = 0; idx < 3;idx++) {
    const next_idx = (idx + 1) % 3; // Wrap around to form pairs (1,2), (0,2), (0,1)
    sides[idx] = haversine(coords[idx], coords[next_idx]);
  }

  // Calculate the angles
  for (let idx = 0; idx < 3; idx++) {
    const [a, b, c] = [
      sides[idx],
      sides[(idx + 1) % 3],
      sides[(idx + 2) % 3]
    ];
    angles[idx] = Math.acos(
      (Math.cos(a / R) - Math.cos(b / R) * Math.cos(c / R)) /
      (Math.sin(b / R) * Math.sin(c / R))
    );
  }


  const E = angles.reduce((sum, angle) => sum + angle, 0) - Math.PI;
  const area = E * R ** 2;
  return area;
}