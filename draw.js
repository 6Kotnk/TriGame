
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

const mapTexture = textureLoader.load('https://raw.githubusercontent.com/6Kotnk/TriGame/main/WorldMap.png');

// General parameters
const radius = 1;
const detail = 10;
const delta = 0.01;

// Create the sphere geometry
//const sphereGeometry = new THREE.IcosahedronGeometry(radius, detail); // radius, segments (horizontal, vertical)
const sphereGeometry = new THREE.SphereGeometry(radius, 16,32);
const wireframeGeometry = new THREE.IcosahedronGeometry(radius + delta, detail); // radius, segments (horizontal, vertical)
//const wireframeGeometry = new THREE.SphereGeometry(radius + delta, 16,32);
const canvasGeometry = new THREE.SphereGeometry(radius + delta, 16,32);
const wireframeEdgeGeometry = new THREE.WireframeGeometry(wireframeGeometry); // radius, segments (horizontal, vertical)

// Create a material for the sphere (filled, optional color)
const mapMaterial = new THREE.MeshBasicMaterial(
  { map: mapTexture,     
    transparent: true,
    opacity: 1.0});

const blackMaterial = new THREE.LineBasicMaterial({ color: 0x000000 }); // Adjust color for contrast

// Create a mesh object from the geometry and material
const sphere = new THREE.Mesh(sphereGeometry, mapMaterial);
const wireframe = new THREE.LineSegments(wireframeEdgeGeometry, blackMaterial);

scene.add(sphere);
scene.add(wireframe);

camera.position.z = 5; // Move the camera back for better view

// Animation loop
function animate() {
  requestAnimationFrame(animate);
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