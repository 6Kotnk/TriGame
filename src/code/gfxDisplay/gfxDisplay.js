import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

import { SphericalTriangle } from './sphericalTriangle/sphericalTriangle.js';
import { PlanetLayer } from './planetLayer.js';

import albedoMapLoPath from   '../../assets/img/low_res/albedoMap.webp'
import bumpMapLoPath from     '../../assets/img/low_res/bumpMap.webp'
import cloudsMapLoPath from   '../../assets/img/low_res/cloudsMap.webp'
import outlineMapLoPath from  '../../assets/img/low_res/outlineMap.webp'
import oceanMapLoPath from    '../../assets/img/low_res/oceanMap.webp'
import skyMapLoPath from      '../../assets/img/low_res/starMap.webp'

import albedoMapHiPath from   '../../assets/img/high_res/albedoMap.webp'
import bumpMapHiPath from     '../../assets/img/high_res/bumpMap.webp'
import cloudsMapHiPath from   '../../assets/img/high_res/cloudsMap.webp'
import outlineMapHiPath from  '../../assets/img/high_res/outlineMap.webp'
import oceanMapHiPath from    '../../assets/img/high_res/oceanMap.webp'
import skyMapHiPath from      '../../assets/img/high_res/starMap.webp'


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

    // Load textures using createImageBitmap
    this.loadTexturesWithImageBitmap();

    // Spherical triangle that will be made between our cities
    this.triangle = new SphericalTriangle(this.scene, this.canvas);

    // Earth layers:

    // Base layer (regular earth)
    this.earth = new PlanetLayer(this.scene, 1, 2, {
      bumpScale: 1,
      shininess: 100,
    });

    // City outlines appear when zoomed in
    this.countryOutlines = new PlanetLayer(this.scene, 1, 3, {
        transparent: true,
    });

    // Clouds appear when zoomed out
    this.clouds = new PlanetLayer(this.scene, 1.01, 4, {
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

  // Helper function to load a single texture using createImageBitmap
async loadTextureFromImageBitmap(url) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    // Use flipY option to match Three.js expectations
    const imageBitmap = await createImageBitmap(blob, { imageOrientation: 'flipY' });
    
    const texture = new THREE.Texture(imageBitmap);
    // Set texture parameters before upload to optimize GPU transfer
    texture.generateMipmaps = false; // Disable mipmaps initially to speed up upload
    texture.needsUpdate = true;
    
    return texture;
  } catch (error) {
    console.error(`Failed to load texture from ${url}:`, error);
    return null;
  }
}

  // Load all textures using createImageBitmap
  async loadTexturesWithImageBitmap() {
    try {
      // Load low-resolution textures
      const texturesLoPromises = {
        albedoMap:  this.loadTextureFromImageBitmap(albedoMapLoPath),
        bumpMap:    this.loadTextureFromImageBitmap(bumpMapLoPath),
        cloudsMap:  this.loadTextureFromImageBitmap(cloudsMapLoPath),
        outlineMap: this.loadTextureFromImageBitmap(outlineMapLoPath),
        oceanMap:   this.loadTextureFromImageBitmap(oceanMapLoPath),
        skyMap:     this.loadTextureFromImageBitmap(skyMapLoPath),
      };

      // Load high-resolution textures
      const texturesHiPromises = {
        albedoMap:  this.loadTextureFromImageBitmap(albedoMapHiPath),
        bumpMap:    this.loadTextureFromImageBitmap(bumpMapHiPath),
        cloudsMap:  this.loadTextureFromImageBitmap(cloudsMapHiPath),
        outlineMap: this.loadTextureFromImageBitmap(outlineMapHiPath),
        oceanMap:   this.loadTextureFromImageBitmap(oceanMapHiPath),
        skyMap:     this.loadTextureFromImageBitmap(skyMapHiPath),
      };

      // Wait for low-resolution textures to load first
      const texturesLo = {};
      for (const [key, promise] of Object.entries(texturesLoPromises)) {
        texturesLo[key] = await promise;
      }

      // Apply low-resolution textures immediately
      await this.applyTextures(texturesLo);

      // Wait for high-resolution textures to load
      const texturesHi = {};
      for (const [key, promise] of Object.entries(texturesHiPromises)) {
        texturesHi[key] = await promise;
      }

      // Apply high-resolution textures (will replace low-res ones)
      await this.applyTextures(texturesHi);

    } catch (error) {
      console.error('Error loading textures:', error);
    }
  }

  // Apply textures individually with yielding to prevent blocking
  async applyTextures(textures){
    // Skip if textures aren't loaded yet
    if (!textures) return;

    // Helper function to yield control back to the browser
    const yieldToMain = () => new Promise(resolve => requestAnimationFrame(resolve));

    this.scene.background = textures.skyMap;
    textures.skyMap.colorSpace = THREE.SRGBColorSpace;
    textures.skyMap.mapping = THREE.EquirectangularReflectionMapping;
    await yieldToMain();

    // Apply earth albedo map
    this.earth.mesh.material.map = textures.albedoMap;
    this.earth.mesh.material.needsUpdate = true;
    await yieldToMain();

    // Apply earth bump map
    this.earth.mesh.material.bumpMap = textures.bumpMap;
    this.earth.mesh.material.needsUpdate = true;
    await yieldToMain();

    // Apply earth specular map (ocean)
    this.earth.mesh.material.specularMap = textures.oceanMap;
    this.earth.mesh.material.needsUpdate = true;
    await yieldToMain();

    // Apply country outlines
    this.countryOutlines.mesh.material.map = textures.outlineMap;
    this.countryOutlines.mesh.material.needsUpdate = true;
    await yieldToMain();

    // Apply clouds map
    this.clouds.mesh.material.map = textures.cloudsMap;
    this.clouds.mesh.material.needsUpdate = true;
    await yieldToMain();

    this.clouds.mesh.material.alphaMap = textures.cloudsMap;
    this.clouds.mesh.material.needsUpdate = true;
    await yieldToMain();
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