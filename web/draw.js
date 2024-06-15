/*
var city1_coord = [35.68, 139.68];
var city2_coord = [48.80,   2.35];
var city3_coord = [6.93,   79.84];
*/

var city1_coord = [0, 0];
var city2_coord = [0, 0];
var city3_coord = [0, 0];

var s1;
var s2;
var s3;

var t1;
var t2;
var t3;

const divs = 100;


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

function drawTriangle(ctx, vec1, vec2, vec3, color = "cyan") {
    ctx.beginPath();      // Start the path for the triangle
    ctx.moveTo(vec1[1] + 180, -vec1[0] + 90);   // Move to the first vertex
    ctx.lineTo(vec2[1] + 180, -vec2[0] + 90);   // Draw line to the second vertex
    ctx.lineTo(vec3[1] + 180, -vec3[0] + 90);   // Draw line to the third vertex
    ctx.closePath();      // Close the path (draw line back to the first vertex)

    ctx.fillStyle = color; // Set the fill color
    ctx.fill();            // Fill the triangle
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

function drawCircle(ctx, lon, lan) {
  ctx.arc(lon, lan, 5, 0, 2 * Math.PI, false);
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
  
    s1 = createSphereAtPoint(vec1);
    s2 = createSphereAtPoint(vec2);
    s3 = createSphereAtPoint(vec3);
    let r = new THREE.Vector3();

    let { longitude: curr_lon, latitude: curr_lat } = toLatLon(vec1, newCentralMeridian);
    let next_lon = 0;
    let next_lat = 0;

    //let { longitude, latitude } = toLatLon(vec1, newCentralMeridian);

    ctx.moveTo(curr_lon, curr_lat);
    ctx.beginPath();      // Start the path for the triangle
  
    //drawCircle(ctx, curr_lon, curr_lat);

    for (let t = 0; t < vec1.angleTo(vec2); t += 2*Math.PI/divs) {
      r = interpolateBetweenPoints(vec1,vec2,t);
      ({ longitude: next_lon, latitude: next_lat } = toLatLon(r, newCentralMeridian));
      //ctx.lineTo(longitude, latitude);
      drawLine(ctx, curr_lon, curr_lat, next_lon, next_lat)
      curr_lon = next_lon;
      curr_lat = next_lat;
    }

    //drawCircle(ctx, curr_lon, curr_lat);

    //ctx.lineTo(longitude, latitude);
    for (let t = 0; t < vec2.angleTo(vec3); t += 2*Math.PI/divs) {
      r = interpolateBetweenPoints(vec2,vec3,t);
      ({ longitude: next_lon, latitude: next_lat } = toLatLon(r, newCentralMeridian));
      //ctx.lineTo(longitude, latitude);
      drawLine(ctx, curr_lon, curr_lat, next_lon, next_lat)
      curr_lon = next_lon;
      curr_lat = next_lat;
    }

    //drawCircle(ctx, curr_lon, curr_lat);

    //ctx.lineTo(longitude, latitude);
    for (let t = 0; t < vec3.angleTo(vec1); t += 2*Math.PI/divs) {
      r = interpolateBetweenPoints(vec3,vec1,t);
      ({ longitude: next_lon, latitude: next_lat } = toLatLon(r, newCentralMeridian));
      //ctx.lineTo(longitude, latitude);
      drawLine(ctx, curr_lon, curr_lat, next_lon, next_lat)
      curr_lon = next_lon;
      curr_lat = next_lat;
    }
    //ctx.lineTo(longitude, latitude);
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

function parametricCircle(n, t) {
  u = new THREE.Vector3();
  v = new THREE.Vector3();
  r = new THREE.Vector3();

  u.crossVectors(new THREE.Vector3(-n.y,n.x,Math.sqrt(1-n.x^2-n.y^2)), n).normalize();
  v.crossVectors(u,n);
  
  r = v.multiplyScalar(Math.sin(-t)).add(u.multiplyScalar(Math.cos(-t)));
  
  return r;
}












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

const container = document.getElementById('container');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Create renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);
renderer.setClearColor(0xffffff, 1); // Set background to white

const controls = new THREE.OrbitControls(camera, renderer.domElement);

const textureLoader = new THREE.TextureLoader();
//const canvas = document.createElement('canvas');
const canvas = document.getElementById('MapCanvas');
canvas.width =  360;
canvas.height = 180;

const ctx = canvas.getContext('2d');

//drawSphericalTriangle(ctx, city1_vec, city2_vec, city3_vec);

const mapTexture = textureLoader.load('http://localhost:8000/2560px-World_location_map_mono.png');
var triTexture = new THREE.CanvasTexture(canvas);

// General parameters
var radius = 1;
var detil = 10;
var delta = 0.01;


// Create the sphere geometry
//const sphereGeometry = new THREE.IcosahedronGeometry(radius, detil); // radius, segments (horizontal, vertical)
const sphereGeometry = new THREE.SphereGeometry(radius, 16,32);
const wireframeGeometry = new THREE.IcosahedronGeometry(radius + delta, detil); // radius, segments (horizontal, vertical)
//const wireframeGeometry = new THREE.SphereGeometry(radius + delta, 16,32);
const canvasGeometry = new THREE.SphereGeometry(radius + delta, 16,32);
const wireframeEdgeGeometry = new THREE.WireframeGeometry(wireframeGeometry); // radius, segments (horizontal, vertical)
const planeGeometry = new THREE.PlaneGeometry( 5, 5 );


// Create a material for the sphere (filled, optional color)
const mapMaterial = new THREE.MeshBasicMaterial(
  { map: mapTexture,     
    transparent: true,
    opacity: 1.0});

var triMaterial = new THREE.MeshBasicMaterial(
  { map: triTexture,     
    transparent: true,
    opacity: 0.5});

const blackMaterial = new THREE.LineBasicMaterial({ color: 0x000000 }); // Adjust color for contrast
const yellowMaterial = new THREE.MeshBasicMaterial({color: 0xff00ff, side: THREE.DoubleSide});

// Create a mesh object from the geometry and material
const sphere = new THREE.Mesh(sphereGeometry, mapMaterial);
const wireframe = new THREE.LineSegments(wireframeEdgeGeometry, blackMaterial);
var triangle = new THREE.Mesh(sphereGeometry, triMaterial);
const plane = new THREE.Mesh(planeGeometry, yellowMaterial);

//s1 = createSphereAtPoint(city1_vec);
//s2 = createSphereAtPoint(city2_vec);
//s3 = createSphereAtPoint(city3_vec);

//t1 = createLineBetweenPoints(city2_vec, city3_vec);
//t2 = createLineBetweenPoints(city1_vec, city2_vec);
//t3 = createLineBetweenPoints(city3_vec, city1_vec);

scene.add(sphere);
scene.add(wireframe);
scene.add(triangle);

camera.position.z = 5; // Move the camera back for better view

