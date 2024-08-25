var new_dist = 4;
var old_dist = 4;

const target_val = (10 + Math.random() * 90).toFixed(2);
document.getElementById('target').textContent = `Target: ${target_val} million Km^2`;

const container = document.getElementById('rightPanel');
const outputDiv = document.getElementById("output");

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);

// Create renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);
renderer.setClearColor(0xe0e0e0, 1); // Set background to white

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.minDistance = 1.15;
controls.maxDistance = 4;
//controls.maxPolarAngle = Math.PI;

const textureLoader = new THREE.TextureLoader();
const canvas = document.getElementById('MapCanvas');
canvas.width = 3600;
canvas.height = 1800;

const ctx = canvas.getContext('2d');

const mapTexture = textureLoader.load('https://raw.githubusercontent.com/6Kotnk/TriGame/main/WorldMap.png');

// General parameters
const radius = 1;
const detail = 10;
const delta = 0.01;

// Create the sphere geometry
const sphereGeometry = new THREE.SphereGeometry(radius, 160, 320);
const wireframeGeometry = new THREE.IcosahedronGeometry(radius + delta, detail);
const canvasGeometry = new THREE.SphereGeometry(radius, 160, 320);
const wireframeEdgeGeometry = new THREE.WireframeGeometry(wireframeGeometry);

// Create a material for the sphere (filled, optional color)
const mapMaterial = new THREE.MeshBasicMaterial({
  map: mapTexture,
  transparent: true,
  opacity: 1.0
});

const blackMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });

// Create a mesh object from the geometry and material
const sphere = new THREE.Mesh(sphereGeometry, mapMaterial);
const wireframe = new THREE.LineSegments(wireframeEdgeGeometry, blackMaterial);

scene.add(sphere);

camera.position.z = 5; // Move the camera back for better view

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);

  new_dist = controls.target.distanceTo(controls.object.position) - 1;
  tolerance = 0.01;

  if ((Math.abs(new_dist - old_dist) > tolerance) &&
      city_vecs[0] != null) {
    old_dist = new_dist;
    drawSphericalTriangleOutline(spheres, lines, city_vecs, new_dist);
  }
}

// Start the animation loop
animate();

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
});