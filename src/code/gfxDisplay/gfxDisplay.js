import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

import albedoMapPath from   '../../assets/img/albedoMap.webp'
import bumpMapPath from     '../../assets/img/bumpMap.webp'

import cloudsMapPath from   '../../assets/img/cloudsMap.webp'
import outlineMapPath from  '../../assets/img/outlineMap.webp'
import oceanMapPath from    '../../assets/img/oceanMap.webp'

import skyMapPath from      '../../assets/img/starMap.webp'

import { SphericalTriangle } from './sphericalTriangle/sphericalTriangle.js';
import { PlanetLayer } from './planetLayer.js';

export {GFXDisplay};


class GFXDisplay {
  constructor(HTMLElements) {

    this.HTMLElements = HTMLElements;

    // Setup
    this.scene = new THREE.Scene();
    this.canvas = this.HTMLElements.mapCanvas;
    this.container = this.HTMLElements.containerDiv;
    this.camera = new THREE.PerspectiveCamera(75, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });

    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.container.appendChild(this.renderer.domElement);
    this.renderer.setClearColor( 0x000000, 0 ); // Default color, only visible before textures load

    // Get all the textures
    const textureLoader = new THREE.TextureLoader();
    const albedoMap = textureLoader.load(albedoMapPath);
    const bumpMap = textureLoader.load(bumpMapPath);
    const cloudsMap = textureLoader.load(cloudsMapPath);
    const outlineMap = textureLoader.load(outlineMapPath);
    const oceanMap = textureLoader.load(oceanMapPath);
    const skyMap = textureLoader.load(skyMapPath);

    // Set skymap as skymap
    skyMap.colorSpace = THREE.SRGBColorSpace;
    skyMap.mapping = THREE.EquirectangularReflectionMapping;
    this.scene.background = skyMap;

    // Spherical triangle that will be made between our cities
    this.triangle = new SphericalTriangle(this.scene, this.canvas);

    // Earth layers:

    // Base layer (regular earth)
    this.earth = new PlanetLayer(this.scene, 1, 2, {
      map: albedoMap,
      bumpMap: bumpMap,
      bumpScale: 1,
      specularMap: oceanMap,
      shininess: 100,
    });

    // City outlines appear when zoomed in
    this.countryOutlines = new PlanetLayer(this.scene, 1, 3, {
        map: outlineMap,
        transparent: true,
    });

    // Clouds appear when zoomed out
    this.clouds = new PlanetLayer(this.scene, 1.01, 4, {
      map: cloudsMap,
      alphaMap: cloudsMap,
      transparent: true,
    });

    // Add a light source
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 2);

    // Attach it to camera, so we always see the bright side
    this.camera.add( light );
    this.scene.add( this.camera );

    // Set the  initial camera position
    this.camera.position.set(0, 0, 5);
    this.camera.lookAt(0, 0, 0);

    // Add OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enablePan = false;
    this.controls.minDistance = 1.15;
    this.controls.maxDistance = 4;

    // Start drawing frames
    this.animate();

    // Event listener for zooming
    this.controls.addEventListener('change', this.onZoom );

    // If container is resized, resize this as well
    const resizeObserver = new ResizeObserver(this.onWindowResize);
    resizeObserver.observe(this.container);
  }

  onZoom = () => {
    // Get zoom amount
    const zoom = this.controls.maxDistance / this.controls.getDistance( );
    // Constants made up, could probably be better, but works good enough
    const opacity = (zoom-1)**3/2.4
    const scale = 1/zoom;

    // When zooming in the light is brought more inline with our view
    this.camera.children[0].position.set(5,5, 2*zoom);

    // Clouds fade out when zooming in
    this.clouds.mesh.material.opacity = 1 - opacity;
    // Country outlines fade in when zooming in
    this.countryOutlines.mesh.material.opacity = Math.min(1,opacity);

    // Rescale the triangle, so the outline is always a constant width on our display
    this.triangle.setScale(scale)
  }

  onWindowResize = () => {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    
    // Recalculate aspect ratio
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    
    // Set new size
    this.renderer.setSize(width, height);
  }

  // Called every frame
  animate = () => {
    this.controls.update();
    // Slowly rotate cloud layer
    this.clouds.rotateY(0.001);
    this.renderer.render(this.scene, this.camera);

    // We want another frame
    requestAnimationFrame(this.animate);
  }

  // Update the triangle
  update(guess){
    this.triangle.setCoords(guess.getCoords());
    this.triangle.setColors(guess.colors);
    this.triangle.reconfigure();
  }

  reset(){
    this.triangle.reset();
  }

}

