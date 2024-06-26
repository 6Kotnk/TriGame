 const divs = 100;
 const R = 6371;  // Earth's radius in kilometers

 function coordStringToArray(str) {
  return str.split(", ").map(Number);
}

 function createSphereAtPoint(position, radius = 0.05, color = 0xff0000) {
  const geometry = new THREE.SphereGeometry(radius, 32, 32);
  const material = new THREE.MeshBasicMaterial({ color: color });
  const sphere = new THREE.Mesh(geometry, material);
  sphere.position.copy(position);
  scene.add(sphere);
  return sphere;
}

 function createLineBetweenPoints(point1, point2, radius = 0.01, color = 0x0000ff) {
  const radialSegments = 16; // Number of segments around the radius of the torus
  const tubularSegments = 100; // Number of segments along the tube

  const arc = point2.angleTo(point1);
  
  const torusGeometry = new THREE.TorusGeometry(1, radius, radialSegments, tubularSegments, arc);
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
  
  if(map_dist_sqrd > ((360 / divs)**2) * 15) 
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

    ctx.lineTo(side_lon * 180  + 180, mid_point_lat + 90);
    ctx.lineTo(side_lon * 180  + 180, side_lat * 90 + 90);
    ctx.lineTo(-side_lon * 180 + 180, side_lat * 90 + 90);
    ctx.lineTo(-side_lon * 180 + 180, mid_point_lat + 90);

    curr_lon += 180;
    next_lon += 180;
    curr_lat += 90;
    next_lat += 90;
    
  }
  
  ctx.lineTo(next_lon, next_lat);
}


 function drawSphericalTriangle(ctx, vec1, vec2, vec3, color = "cyan") {

  let { longitude: lon1, latitude: lat1 } = toLatLon(vec1);
  let { longitude: lon2, latitude: lat2 } = toLatLon(vec2);
  let { longitude: lon3, latitude: lat3 } = toLatLon(vec3);
  
  const longitudes = [lon1, lon2, lon3];
  newCentralMeridian = (Math.min(...longitudes) + Math.max(...longitudes)) / 2;
  if((Math.max(...longitudes) - Math.min(...longitudes)) < 180)
  {
    newCentralMeridian -= 180;
  }
  
    // TODO make this parameters maybe?
    scene.remove(s1);
    scene.remove(s2);
    scene.remove(s3);

    s1 = createSphereAtPoint(vec1);
    s2 = createSphereAtPoint(vec2);
    s3 = createSphereAtPoint(vec3);

    let r = new THREE.Vector3();

    let { longitude: curr_lon, latitude: curr_lat } = toLatLon(vec1, newCentralMeridian);
    let next_lon = 0;
    let next_lat = 0;

    ctx.moveTo(curr_lon, curr_lat);
    ctx.beginPath();      // Start the path for the triangle

    for (let t = 0; t < vec1.angleTo(vec2); t += 2*Math.PI/divs) {
      r = interpolateBetweenPoints(vec1,vec2,t);
      ({ longitude: next_lon, latitude: next_lat } = toLatLon(r, newCentralMeridian));
      drawLine(ctx, curr_lon, curr_lat, next_lon, next_lat)
      curr_lon = next_lon;
      curr_lat = next_lat;
    }

    for (let t = 0; t < vec2.angleTo(vec3); t += 2*Math.PI/divs) {
      r = interpolateBetweenPoints(vec2,vec3,t);
      ({ longitude: next_lon, latitude: next_lat } = toLatLon(r, newCentralMeridian));
      drawLine(ctx, curr_lon, curr_lat, next_lon, next_lat)
      curr_lon = next_lon;
      curr_lat = next_lat;
    }

    for (let t = 0; t < vec3.angleTo(vec1); t += 2*Math.PI/divs) {
      r = interpolateBetweenPoints(vec3,vec1,t);
      ({ longitude: next_lon, latitude: next_lat } = toLatLon(r, newCentralMeridian));
      drawLine(ctx, curr_lon, curr_lat, next_lon, next_lat)
      curr_lon = next_lon;
      curr_lat = next_lat;
    }

    ctx.closePath();      // Close the path (draw line back to the first vertex)

    ctx.fillStyle = color; // Set the fill color
    ctx.fill();            // Fill the triangle

  return newCentralMeridian
}

 function interpolateBetweenPoints(point1, point2, t) {
  
  n = new THREE.Vector3().crossVectors(point1, point2);

  u = point1.clone();
  v = new THREE.Vector3().crossVectors(n, u).normalize();
  
  r = new THREE.Vector3();
  r = v.multiplyScalar(Math.sin(t)).add(u.multiplyScalar(Math.cos(t)));
  
  return r;
}
/*
 function parametricCircle(n, t) {
  u = new THREE.Vector3();
  v = new THREE.Vector3();
  r = new THREE.Vector3();

  u.crossVectors(new THREE.Vector3(-n.y,n.x,Math.sqrt(1-n.x^2-n.y^2)), n).normalize();
  v.crossVectors(u,n);
  
  r = v.multiplyScalar(Math.sin(-t)).add(u.multiplyScalar(Math.cos(-t)));
  
  return r;
}
*/
 function findCoordinates(cityName, cities) {
  const city = cities.find(c => c.name === cityName);
  if (city) {
      return city.coord;
  }
  throw new Error("City not found");
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