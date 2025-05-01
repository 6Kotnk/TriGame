import * as THREE from 'three';
import { canvas } from './main.js';
import * as UTILS from './utils.js';

const mapScale = 10;
const divs = 100;

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

function interpolateBetweenPoints(point1, point2, t) {
  
  let n = new THREE.Vector3().crossVectors(point1, point2);
 
  let u = point1.clone();
  let v = new THREE.Vector3().crossVectors(n, u).normalize();
 
  let r = new THREE.Vector3();
  r = v.multiplyScalar(Math.sin(t)).add(u.multiplyScalar(Math.cos(t)));
  
  return r;
}

export function drawFill(coords, fill, color) {
  var vecs = Array(3).fill(null);
  for (let idx = 0; idx < vecs.length; idx++) {
    vecs[idx] = new THREE.Vector3();
    vecs[idx].setFromSphericalCoords(
      1,
      UTILS.degToRad(-coords[idx][0] + 90),
      UTILS.degToRad( coords[idx][1] + 90),
    );
  }

  const ctx = canvas.getContext('2d');

  let longitudes = [];

  vecs.forEach((vec, index) => {
    let { longitude: lon } = toLatLon(vec);
    longitudes[index] = lon;
  });

  let newCentralMeridian = (Math.min(...longitudes) + Math.max(...longitudes)) / 2;
  if((Math.max(...longitudes) - Math.min(...longitudes)) < 180)
  {
    newCentralMeridian -= 180;
  }

  let { longitude: curr_lon, latitude: curr_lat } = toLatLon(vecs[0], newCentralMeridian);
  let next_lon = 0;
  let next_lat = 0;

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

  let newMap = new THREE.CanvasTexture(canvas);
  let oldMap = fill.material.map; 
  newMap.wrapS = THREE.RepeatWrapping;

  newMap.offset.x = (-newCentralMeridian) / 360;
  fill.material.map = newMap;
  oldMap.dispose();

}

function drawLine(ctx, curr_lon, curr_lat, next_lon, next_lat) {

  let map_dist_sqrd = (curr_lon - next_lon)**2 + (curr_lat - next_lat)**2;
  
  if(map_dist_sqrd > ((360*mapScale / divs)**2) * 15) // One day actually calculate this
  {
    curr_lon -= 180;
    next_lon -= 180;
    curr_lat -= 90;
    next_lat -= 90;
    
    //iterpolate crossing point
    let side_lon = Math.sign(curr_lon);
    let curr_delta = 180 - side_lon * curr_lon;
    let next_delta = 180 + side_lon * next_lon;

    let lon_delta = curr_delta + next_delta;
    let lat_delta = next_lat - curr_lat;
    let mid_point_lat = curr_lat + (lat_delta * (curr_delta/lon_delta));

    let side_lat = Math.sign(mid_point_lat);

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
