import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

import albedoMapPath from   './assets/img/albedoMap8k.jpg'
import bumpMapPath from     './assets/img/bumpMap8k.png'

import cloudsMapPath from   './assets/img/cloudsMap8k.png'
import outlineMapPath from  './assets/img/outlineMap8k.png'
import lightMapPath from    './assets/img/lightMap8k.png'
import oceanMapPath from    './assets/img/oceanMap8k.png'

import skyMapPath from      './assets/img/starMap8k.jpg'

const scene = new THREE.Scene();
const canvas = document.getElementById('MapCanvas');

export {triangle};

import { SphericalTriangle } from './triangle.js';

const triangle = new SphericalTriangle(scene, canvas);

const container = document.getElementById('rightPanel');

// Set up the scene, camera, and renderer

const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);
renderer.setClearColor( 0x000000, 0 ); // the default
canvas.width = 3600;
canvas.height = 1800;

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
//scene.background = new THREE.Color("gray");

// Create a sphere to get a shadow
const earthGeometry = new THREE.SphereGeometry(1, 32, 32);
const cloudGeometry = new THREE.SphereGeometry(1.01, 32, 32);

const earthMaterial = new THREE.MeshStandardMaterial({
  map: albedoMap,
  bumpMap: bumpMap,
  bumpScale: 5,
});

const countryOutlineMaterial = new THREE.MeshStandardMaterial({
  map: outlineMap,
  transparent: true,
})

const cloudMaterial = new THREE.MeshStandardMaterial({
  map: cloudsMap,
  alphaMap: cloudsMap,
  transparent: true,
});

const earth = new THREE.Mesh(earthGeometry, earthMaterial);
earth.renderOrder = 1;
scene.add(earth);

const countryOutlines = new THREE.Mesh(earthGeometry, countryOutlineMaterial);
countryOutlines.renderOrder = 2;
scene.add(countryOutlines);

const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
clouds.renderOrder = 4;
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
controls.enablePan = false;

controls.addEventListener( 'change', getControlsZoom );

function getControlsZoom()
{
  
  const zoom = controls.maxDistance / controls.getDistance();

  const opacity = (zoom-1)**3/2.4
  const scale = 1/zoom;

  camera.children[0].position.set(5,5, 2*zoom);
  clouds.material.opacity = 1 - opacity;
  countryOutlines.material.opacity = Math.min(1,opacity);

  triangle.setScale(scale)

}


// Render loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    clouds.rotation.y += 0.001; // Slowly rotate clouds
    renderer.render(scene, camera);
}
animate();
