
/*
const container = document.getElementById('container');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);

// Create renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);
renderer.setClearColor(0x000000, 1); // Set background to black

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.minDistance = 1.15;
controls.maxDistance = 4;

//https://github.com/franky-adl/threejs-earth/blob/main/src/assets/Albedo.jpg
//https://raw.githubusercontent.com/6Kotnk/TriGame/main/WorldMap.jpg


const textureLoader = new THREE.TextureLoader();

const albedoMap = textureLoader.load('https://raw.githubusercontent.com/franky-adl/threejs-earth/main/src/assets/Albedo.jpg');
const bumpMap = textureLoader.load('https://raw.githubusercontent.com/franky-adl/threejs-earth/main/src/assets/Bump.jpg');

const cloudsMap = textureLoader.load('https://raw.githubusercontent.com/franky-adl/threejs-earth/main/src/assets/Clouds.png');


// General parameters
const radius = 1;
const cloudHeight = 0.005;

// Create the sphere geometry
const earthGeometry = new THREE.SphereGeometry(radius, 160, 320);
const cloudsGeometry = new THREE.SphereGeometry(radius + cloudHeight, 160, 320);

// Create a material for the sphere (filled, optional color)
const earthMaterial = new THREE.MeshStandardMaterial({
  map: albedoMap,
  bumpMap: bumpMap,
  bumpScale: 0.03,
  //shininess: 2,  // Controls the shininess of the material
  //specular: 0x555555,  // Specular highlight color
});

const cloudsMaterial = new THREE.MeshStandardMaterial({
  map: cloudsMap,
  alphaMap: cloudsMap,
  alphaTest: 0.5,
  transparent: true
});

// Create a mesh object from the geometry and material
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
const clouds = new THREE.Mesh(cloudsGeometry, cloudsMaterial);

// Add lighting to the scene
const directionalLight = new THREE.PointLight(0xffffff, 1);
directionalLight.position.set(5, 5, 2); // Position the light relative to the sphere

directionalLight.castShadow = true; // Enable shadow casting
directionalLight.shadow.mapSize.width = 1024; // Shadow resolution
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.camera.near = 0.001; // Near clipping plane
directionalLight.shadow.camera.far = 1000; // Far clipping plane

earth.receiveShadow = true
clouds.castShadow  = true
directionalLight.castShadow = true;

camera.add(directionalLight);
scene.add( camera );

// Add an ambient light to the scene
//const ambientLight = new THREE.AmbientLight(0x202020); // Soft white light
//scene.add(ambientLight);

// Add the entire group to the scene
scene.add(earth);
scene.add(clouds);

camera.position.z = 5; // Move the camera back for better view



// Animation loop
function animate() {
  requestAnimationFrame(animate);

  controls.update();
  clouds.rotation.y += 0.001; // Slowly rotate clouds

  renderer.render(scene, camera);

}

// Start the animation loop
animate();

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
});
*/

/*
const albedoMap = textureLoader.load('https://raw.githubusercontent.com/franky-adl/threejs-earth/main/src/assets/Albedo.jpg');
const bumpMap = textureLoader.load('https://raw.githubusercontent.com/franky-adl/threejs-earth/main/src/assets/Bump.jpg');

const cloudsMap = textureLoader.load('https://raw.githubusercontent.com/franky-adl/threejs-earth/main/src/assets/Clouds.png');
*/


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
