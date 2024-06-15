
/**
 * Creates a small sphere at a given position in 3D space.
 * 
 * @param {THREE.Vector3} position - The position in 3D space where the sphere will be placed.
 * @param {number} [radius=0.1] - The radius of the sphere.
 * @param {number} [color=0xff0000] - The color of the sphere, default is red.
 * @returns {THREE.Mesh} - The sphere mesh.
 */
function createSphereAtPoint(position, radius = 0.05, color = 0xff0000) {
  const geometry = new THREE.SphereGeometry(radius, 32, 32);
  const material = new THREE.MeshBasicMaterial({ color: color });
  const sphere = new THREE.Mesh(geometry, material);
  sphere.position.copy(position);
  scene.add(sphere);
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
}


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
const controls = new THREE.OrbitControls(camera, renderer.domElement);

const textureLoader = new THREE.TextureLoader();

const texture = textureLoader.load('http://localhost:8000/2560px-World_location_map_mono.svg.png');

// General parameters
var radius = 1;
var detil = 10;
var delta = 0.0001;


renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.setClearColor(0xffffff, 1); // Set background to white

// Create the sphere geometry
//const sphereGeometry = new THREE.IcosahedronGeometry(radius, detil); // radius, segments (horizontal, vertical)
const sphereGeometry = new THREE.SphereGeometry(radius, 16,32);
//const wireframeGeometry = new THREE.IcosahedronGeometry(radius + delta, detil); // radius, segments (horizontal, vertical)
const wireframeGeometry = new THREE.SphereGeometry(radius + delta, 16,32);
const wireframeEdgeGeometry = new THREE.WireframeGeometry(wireframeGeometry); // radius, segments (horizontal, vertical)
const planeGeometry = new THREE.PlaneGeometry( 5, 5 );




// Create a material for the sphere (filled, optional color)
const mapMaterial = new THREE.MeshBasicMaterial(
  { map: texture,     
    transparent: true,
    opacity: 1.0});

const blackMaterial = new THREE.LineBasicMaterial({ color: 0x000000 }); // Adjust color for contrast
const yellowMaterial = new THREE.MeshBasicMaterial({color: 0xff00ff, side: THREE.DoubleSide});

// Create a mesh object from the geometry and material
const sphere = new THREE.Mesh(sphereGeometry, mapMaterial);
const wireframe = new THREE.LineSegments(wireframeEdgeGeometry, blackMaterial);
const plane = new THREE.Mesh(planeGeometry, yellowMaterial);

city1_coord = [1, 35.68, 139.68];
city2_coord = [1, 48.80,   2.35];
city3_coord = [1,  6.93,  79.84];
  
city1_vec = new THREE.Vector3();
city2_vec = new THREE.Vector3();
city3_vec = new THREE.Vector3();

city1_vec.setFromSphericalCoords(
  1,
  THREE.Math.degToRad(-city1_coord[1] + 90),
  THREE.Math.degToRad( city1_coord[2] + 90),
);

city2_vec.setFromSphericalCoords(
  1,
  THREE.Math.degToRad(-city2_coord[1] + 90),
  THREE.Math.degToRad( city2_coord[2] + 90),
);

city3_vec.setFromSphericalCoords(
  1,
  THREE.Math.degToRad(-city3_coord[1] + 90),
  THREE.Math.degToRad( city3_coord[2] + 90),
);



createSphereAtPoint(city2_vec);
createSphereAtPoint(city3_vec);
createSphereAtPoint(city1_vec);

createLineBetweenPoints(city2_vec, city3_vec);
createLineBetweenPoints(city1_vec, city2_vec);
createLineBetweenPoints(city3_vec, city1_vec);

scene.add(sphere);
scene.add(wireframe);





camera.position.z = 5; // Move the camera back for better view

function animate() {
		
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  //controls.update(); // Update OrbitControls
}

animate();