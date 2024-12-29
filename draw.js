const container = document.getElementById('container');

// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);
renderer.setClearColor(0x000000, 1); // Set background to black

const textureLoader = new THREE.TextureLoader();

const albedoMap = textureLoader.load('https://raw.githubusercontent.com/franky-adl/threejs-earth/main/src/assets/Albedo.jpg');
const bumpMap = textureLoader.load('https://raw.githubusercontent.com/franky-adl/threejs-earth/main/src/assets/Bump.jpg');
const cloudsMap = textureLoader.load('https://raw.githubusercontent.com/franky-adl/threejs-earth/main/src/assets/Clouds.png');


// Create a sphere to get a shadow
const earthGeometry = new THREE.SphereGeometry(1, 32, 32);
const earthMaterial = new THREE.MeshStandardMaterial({
  map: albedoMap,
  bumpMap: bumpMap,
  bumpScale: 0.01,
});
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
scene.add(earth);


// Create a sphere to cast a shadow
const cloudGeometry = new THREE.SphereGeometry(1.02, 32, 32);
const cloudMaterial = new THREE.MeshStandardMaterial({
  map: cloudsMap,
  alphaMap: cloudsMap,
  transparent: true,
});


//const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0x0077ff });
const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
scene.add(clouds);

// Add a light source
const light = new THREE.PointLight(0xffffff, 1, 100);
light.position.set(5, 5, 5);

camera.add(light);
scene.add( camera );


// Set the camera position
camera.position.set(5, 5, 5);
camera.lookAt(0, 0, 0);

// Add OrbitControls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Render loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    clouds.rotation.y += 0.001; // Slowly rotate clouds
    renderer.render(scene, camera);
}
animate();
