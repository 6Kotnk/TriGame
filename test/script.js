var city1_coord = [0, 0];
var city2_coord = [0, 0];
var city3_coord = [0, 0];

var s1;
var s2;
var s3;

var t1;
var t2;
var t3;

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

function toLatLon(vec) {
    const longitude = Math.PI - Math.atan2(vec.z,vec.x);
    const latitude =  Math.acos(vec.y);
  
    // Convert radians to degrees
    const longitudeDegrees = longitude * 180 / Math.PI;
    const latitudeDegrees = latitude * 180 / Math.PI;

    return { longitude: longitudeDegrees, latitude: latitudeDegrees };
}

function drawSphericalTriangle(ctx, vec1, vec2, vec3, color = "cyan") {

    s1 = createSphereAtPoint(vec1);
    s2 = createSphereAtPoint(vec2);
    s3 = createSphereAtPoint(vec3);

  
    const divs = 100;
    let r = new THREE.Vector3();

    ctx.beginPath();      // Start the path for the triangle
    let { longitude, latitude } = toLatLon(vec1);

    ctx.moveTo(longitude, latitude);
  
    for (let t = 0; t < vec1.angleTo(vec2); t += 2*Math.PI/divs) {
      r = interpolateBetweenPoints(vec1,vec2,t);
      ({ longitude, latitude } = toLatLon(r));
      ctx.lineTo(longitude, latitude);
    }
    ctx.lineTo(longitude, latitude);
    for (let t = 0; t < vec2.angleTo(vec3); t += 2*Math.PI/divs) {
      r = interpolateBetweenPoints(vec2,vec3,t);
      ({ longitude, latitude } = toLatLon(r));
      ctx.lineTo(longitude, latitude);
    }
    ctx.lineTo(longitude, latitude);
    for (let t = 0; t < vec3.angleTo(vec1); t += 2*Math.PI/divs) {
      r = interpolateBetweenPoints(vec3,vec1,t);
      ({ longitude, latitude } = toLatLon(r));
      ctx.lineTo(longitude, latitude);
    }
    ctx.lineTo(longitude, latitude);
    ctx.closePath();      // Close the path (draw line back to the first vertex)

    ctx.fillStyle = color; // Set the fill color
    ctx.fill();            // Fill the triangle
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

const controls = new THREE.OrbitControls(camera, renderer.domElement);

const textureLoader = new THREE.TextureLoader();
const canvas = document.createElement('canvas');
canvas.width =  360;
canvas.height = 180;

const ctx = canvas.getContext('2d');

// Create a cube
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  
  // Rotate the cube for some simple animation
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  
  renderer.render(scene, camera);
}

// Start the animation loop
animate();

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
