const container = document.getElementById('container');

// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);
renderer.setClearColor(0x000000, 1); // Set background to black

const textureLoader = new THREE.TextureLoader();

const albedoMap = textureLoader.load('https://raw.githubusercontent.com/6Kotnk/TriGame/newgfx/assets/albedoMap8k.jpg');
const bumpMap = textureLoader.load('https://raw.githubusercontent.com/6Kotnk/TriGame/newgfx/assets/bumpMap8k.jpg');
const cloudsMap = textureLoader.load('https://raw.githubusercontent.com/6Kotnk/TriGame/newgfx/assets/cloudMap8k.jpg');

const outlineMap = textureLoader.load('https://raw.githubusercontent.com/6Kotnk/TriGame/newgfx/assets/countryOutlineMap8k.jpg');
const lightMap = textureLoader.load('https://raw.githubusercontent.com/6Kotnk/TriGame/newgfx/assets/lightMap8k.jpg');
const oceanMap = textureLoader.load('https://raw.githubusercontent.com/6Kotnk/TriGame/newgfx/assets/oceanMap8k.jpg');
const skyMap = textureLoader.load('https://raw.githubusercontent.com/6Kotnk/TriGame/newgfx/assets/skyMap16k.jpg');



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
light.position.set(5, 5, 2);

camera.add(light);
scene.add( camera );


// Set the camera position
camera.position.set(0, 0, 5);
camera.lookAt(0, 0, 0);

// Add OrbitControls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.minDistance = 1.15;
controls.maxDistance = 4;

controls.addEventListener( 'change', getControlsZoom );

var originalDistance = null,
		zoomResult = document.getElementById( 'zoom' );

function getControlsZoom( )
{
		if( originalDistance == null )
				originalDistance = controls.getDistance( );
	
		var zoom = originalDistance / controls.getDistance( );
				zoom = Math.round(zoom*1e4)/1e4;
		
		zoomResult.innerHTML = 'Zoom = '+ zoom;

    camera.children[0].position.set(5,5, 2*zoom);
    clouds.material.opacity = 1.5/zoom - 0.5;

}

// Render loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    clouds.rotation.y += 0.001; // Slowly rotate clouds
    renderer.render(scene, camera);
}
animate();