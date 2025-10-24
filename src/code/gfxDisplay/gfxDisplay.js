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
    this.loader = new THREE.ImageBitmapLoader();

    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.container.appendChild(this.renderer.domElement);
    this.renderer.setClearColor( 0x000000, 0 ); // Default color, only visible before textures load

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

    // Load textures
    this.loadTextures();

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

  // Since textures are loaded using thread pool, it needs to be async
  async loadTextures() {
    try {
      // Only load 8k textures if GPU has at least 8GB of RAM
      const highPerf = navigator.deviceMemory && navigator.deviceMemory >= 8;

      const texturesLoPromises = {
        albedoMap: this.loadTexture(albedoMapLoPath),
        bumpMap:   this.loadTexture(bumpMapLoPath),
        cloudsMap: this.loadTexture(cloudsMapLoPath),
        outlineMap:this.loadTexture(outlineMapLoPath),
        oceanMap:  this.loadTexture(oceanMapLoPath),
        skyMap:    this.loadTexture(skyMapLoPath),
      };

      // Load low-res first
      const texturesLo = {};
      for (const [key, promise] of Object.entries(texturesLoPromises)) {
        texturesLo[key] = await promise;
      }
      await this.applyTextures(texturesLo);

      // Conditionally load hi-res
      if (highPerf) {
        const texturesHiPromises = {
          albedoMap: this.loadTexture(albedoMapHiPath),
          bumpMap:   this.loadTexture(bumpMapHiPath),
          cloudsMap: this.loadTexture(cloudsMapHiPath),
          outlineMap:this.loadTexture(outlineMapHiPath),
          oceanMap:  this.loadTexture(oceanMapHiPath),
          skyMap:    this.loadTexture(skyMapHiPath),
        };

        const texturesHi = {};
        for (const [key, promise] of Object.entries(texturesHiPromises)) {
          texturesHi[key] = await promise;
        }

        await this.applyTextures(texturesHi);
      }

    } catch (error) {
      console.error('Error loading textures:', error);
    }
  }

  // Load a texture using ImageBitmapLoader
  async loadTexture(url) {

    this.loader.setOptions({ imageOrientation: 'flipY' });
    
    return new Promise((resolve, reject) => {
      this.loader.load(
        url,
        function(imageBitmap) {
          const texture = new THREE.CanvasTexture(imageBitmap);
          resolve(texture);
        },
        undefined,
        function(err) {
          console.log('An error happened');
          reject(err);
        }
      );
    });
  }

  // Apply textures individually with yielding to prevent blocking
  async applyTextures(textures){

    const waitUntilNextFrame = () => new Promise(resolve => requestAnimationFrame(resolve));

    // Apply background texture
    this.scene.background = textures.skyMap;
    textures.skyMap.colorSpace = THREE.SRGBColorSpace;
    textures.skyMap.mapping = THREE.EquirectangularReflectionMapping;
    await waitUntilNextFrame();

    // Apply earth albedo map
    this.earth.mesh.material.map = textures.albedoMap;
    this.earth.mesh.material.needsUpdate = true;
    await waitUntilNextFrame();

    // Apply earth bump map
    this.earth.mesh.material.bumpMap = textures.bumpMap;
    this.earth.mesh.material.needsUpdate = true;
    await waitUntilNextFrame();

    // Apply earth specular map (ocean)
    this.earth.mesh.material.specularMap = textures.oceanMap;
    this.earth.mesh.material.needsUpdate = true;
    await waitUntilNextFrame();

    // Apply country outlines
    this.countryOutlines.mesh.material.map = textures.outlineMap;
    this.countryOutlines.mesh.material.needsUpdate = true;
    await waitUntilNextFrame();

    // Apply clouds map
    this.clouds.mesh.material.map = textures.cloudsMap;
    this.clouds.mesh.material.needsUpdate = true;
    await waitUntilNextFrame();

    // Apply clouds trasnparency
    this.clouds.mesh.material.alphaMap = textures.cloudsMap;
    this.clouds.mesh.material.needsUpdate = true;
    await waitUntilNextFrame();
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