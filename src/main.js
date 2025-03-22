import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import * as UTILS from './utils.js';

import albedoMapPath from   './assets/img/albedoMap8k.jpg'
import bumpMapPath from     './assets/img/bumpMap8k.png'

import cloudsMapPath from   './assets/img/cloudsMap8k.png'
import outlineMapPath from  './assets/img/outlineMap8k.png'
import lightMapPath from    './assets/img/lightMap8k.png'
import oceanMapPath from    './assets/img/oceanMap8k.png'

import skyMapPath from      './assets/img/starMap8k.jpg'

export const spheres = Array(3).fill(null);

var target_val = 73;
document.getElementById('target').textContent = `Target: ${target_val} million km²`;
const container = document.getElementById('rightPanel');

// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);
renderer.setClearColor( 0x000000, 0 ); // the default

for (let idx = 0; idx < spheres.length; idx++) {
  spheres[idx] = UTILS.createSphere(scene);
}


const textureLoader = new THREE.TextureLoader();

const albedoMap = textureLoader.load(albedoMapPath);
const bumpMap = textureLoader.load(bumpMapPath);
const cloudsMap = textureLoader.load(cloudsMapPath);

const outlineMap = textureLoader.load(outlineMapPath);
const lightMap = textureLoader.load(lightMapPath);
const oceanMap = textureLoader.load(oceanMapPath);
const skyMap = textureLoader.load(skyMapPath);

skyMap.colorSpace = THREE.SRGBColorSpace;

skyMap.mapping = THREE.EquirectangularReflectionMapping;
scene.background = skyMap;

// Create a sphere to get a shadow
const earthGeometry = new THREE.SphereGeometry(1, 32, 32);
const earthMaterial = new THREE.MeshStandardMaterial({
  map: albedoMap,
  bumpMap: bumpMap,
  bumpScale: 5,
});

const outlineGeometry = new THREE.SphereGeometry(1, 32, 32);
const outlineMaterial = new THREE.MeshStandardMaterial({
  map: outlineMap,
  transparent: true,
})

// Create a sphere to cast a shadow
const cloudGeometry = new THREE.SphereGeometry(1.01, 32, 32);
const cloudMaterial = new THREE.MeshStandardMaterial({
  map: cloudsMap,
  alphaMap: cloudsMap,
  transparent: true,
});

const earth = new THREE.Mesh(earthGeometry, earthMaterial);
scene.add(earth);
const outlines = new THREE.Mesh(outlineGeometry, outlineMaterial);
scene.add(outlines);
const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
scene.add(clouds);

// Add a light source
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 2);

camera.add( light );
scene.add( camera );

// Set the camera position
camera.position.set(0, 0, 5);
camera.lookAt(0, 0, 0);

// Add OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.minDistance = 1.15;
controls.maxDistance = 4;

controls.addEventListener( 'change', getControlsZoom );

var originalDistance = null

function getControlsZoom( )
{
		if( originalDistance == null )
				originalDistance = controls.getDistance( );
	
		var zoom = originalDistance / controls.getDistance( );
				zoom = Math.round(zoom*1e4)/1e4;

    camera.children[0].position.set(5,5, 2*zoom);
    clouds.material.opacity = 1.5/(zoom^2) - 0.5;
    var opacity = (zoom-1)**3/2.4

    clouds.material.opacity = 1 - opacity;
    outlines.material.opacity = opacity;

    var sphereSize = 3/zoom;

    for (let idx = 0; idx < spheres.length; idx++) {
      spheres[idx].scale.set(sphereSize,sphereSize,sphereSize);
    }

}

// Render loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    clouds.rotation.y += 0.001; // Slowly rotate clouds
    renderer.render(scene, camera);
}
animate();
