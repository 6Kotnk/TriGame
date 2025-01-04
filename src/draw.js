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
const bumpMap = textureLoader.load('https://raw.githubusercontent.com/6Kotnk/TriGame/newgfx/assets/bumpMap8k.png');
const cloudsMap = textureLoader.load('https://raw.githubusercontent.com/6Kotnk/TriGame/newgfx/assets/cloudMap8k.png');

const outlineMap = textureLoader.load('https://raw.githubusercontent.com/6Kotnk/TriGame/newgfx/assets/countryOutlineMap8k.png');
const lightMap = textureLoader.load('https://raw.githubusercontent.com/6Kotnk/TriGame/newgfx/assets/lightMap8k.png');
const oceanMap = textureLoader.load('https://raw.githubusercontent.com/6Kotnk/TriGame/newgfx/assets/oceanMap8k.png');
const skyMap = textureLoader.load('https://raw.githubusercontent.com/6Kotnk/TriGame/newgfx/assets/skyMap16k.jpg');



// Create a sphere to get a shadow
const earthGeometry = new THREE.SphereGeometry(1, 32, 32);
const earthMaterial = new THREE.MeshStandardMaterial({
  map: albedoMap,
  bumpMap: bumpMap,
  bumpScale: 0.01,
});
const outlineMaterial = new THREE.MeshStandardMaterial({
  map: outlineMap,
  alphaMap: outlineMap,
  transparent: true,
});

// Create a sphere to cast a shadow
const cloudGeometry = new THREE.SphereGeometry(1.02, 32, 32);
const cloudMaterial = new THREE.MeshStandardMaterial({
  map: cloudsMap,
  alphaMap: cloudsMap,
  transparent: true,
});


//const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0x0077ff });

const earth = new THREE.Mesh(earthGeometry, earthMaterial);
scene.add(earth);
const outlines = new THREE.Mesh(earthGeometry, outlineMaterial);
scene.add(outlines);
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
    //clouds.material.opacity = 1.5/(zoom^2) - 0.5;
    var opacity = (zoom-1)**3/2.4

    clouds.material.opacity = 1 - opacity;
    outlines.material.opacity = opacity;

}

// Render loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    clouds.rotation.y += 0.001; // Slowly rotate clouds
    renderer.render(scene, camera);
}
animate();
