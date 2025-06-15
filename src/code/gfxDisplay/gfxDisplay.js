import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
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

import { SphericalTriangle } from './sphericalTriangle/sphericalTriangle.js';

export {GFXDisplay};

class GFXDisplay {
  constructor(HTMLElements) {
    this.HTMLElements = HTMLElements;
    this.textureLoader = new THREE.TextureLoader();
    this.isHighResLoaded = false;
    this.loadingProgress = 0;

    // Setup scene
    this.scene = new THREE.Scene();
    this.canvas = this.HTMLElements.mapCanvas;
    this.container = this.HTMLElements.containerDiv;
    this.camera = new THREE.PerspectiveCamera(75, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });

    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.container.appendChild(this.renderer.domElement);
    this.renderer.setClearColor(0x000000, 0);

    // Initialize triangle here
    this.triangle = new SphericalTriangle(this.scene, this.canvas);

    // Initialize with low-res textures first
    this.initializeLowRes();
  }

  async initializeLowRes() {
    try {
      // Load low-res textures first for quick initial render (still use regular loader for small files)
      const [albedoMapLo, bumpMapLo, cloudsMapLo, outlineMapLo, oceanMapLo, skyMapLo] = await Promise.all([
        this.loadTextureRegular(albedoMapLoPath),
        this.loadTextureRegular(bumpMapLoPath),
        this.loadTextureRegular(cloudsMapLoPath),
        this.loadTextureRegular(outlineMapLoPath),
        this.loadTextureRegular(oceanMapLoPath),
        this.loadTextureRegular(skyMapLoPath)
      ]);

      // Set up skymap
      skyMapLo.colorSpace = THREE.SRGBColorSpace;
      skyMapLo.mapping = THREE.EquirectangularReflectionMapping;
      this.scene.background = skyMapLo;

      // Create planet layers with low-res textures
      this.createPlanetLayers(albedoMapLo, bumpMapLo, cloudsMapLo, outlineMapLo, oceanMapLo);
      
      // Set up lighting and controls
      this.setupLightingAndControls();

      // Start animation loop
      this.animate();

      // Wait a bit for initial render, then start loading high-res
      setTimeout(() => {
        this.loadHighResTextures();
      }, 100);

    } catch (error) {
      console.error('Error loading low-res textures:', error);
    }
  }

  // Regular texture loader for low-res textures
  loadTextureRegular(path) {
    return new Promise((resolve, reject) => {
      this.textureLoader.load(path, resolve, undefined, reject);
    });
  }

  async loadHighResTextures() {
    try {
      // Show loading indicator if you want
      this.showLoadingProgress();

      // Load textures one by one using Web Workers
      const textureConfigs = [
        { path: albedoMapHiPath, name: 'albedo', priority: 1 },
        { path: bumpMapHiPath, name: 'bump', priority: 2 },
        { path: skyMapHiPath, name: 'sky', priority: 3 },
        { path: cloudsMapHiPath, name: 'clouds', priority: 4 },
        { path: outlineMapHiPath, name: 'outline', priority: 5 },
        { path: oceanMapHiPath, name: 'ocean', priority: 6 }
      ];

      // Sort by priority
      textureConfigs.sort((a, b) => a.priority - b.priority);

      // Load each texture individually with Web Workers
      for (const config of textureConfigs) {
        try {
          const texture = await this.loadTextureWithWorker(config.path, config.name);
          this.upgradeIndividualTexture(config.name, texture);
          this.loadingProgress = ((config.priority / textureConfigs.length) * 100);
          this.updateLoadingProgress();
          
          // Small delay to ensure smooth animation
          await this.nextFrame();
        } catch (error) {
          console.warn(`Failed to load ${config.name} high-res texture:`, error);
        }
      }

      this.isHighResLoaded = true;
      console.log('High-res textures loaded successfully');
      
      // Clean up worker
      if (this.textureWorker) {
        this.textureWorker.terminate();
        this.textureWorker = null;
      }
      
    } catch (error) {
      console.error('Error loading high-res textures:', error);
      // Low-res textures will continue to work
    }
  }

  async loadTexturesWithProgress(textureConfigs) {
    const textures = {};
    let loaded = 0;
    const total = textureConfigs.length;

    const loadPromises = textureConfigs.map(async (config) => {
      const texture = await this.loadTexture(config.path);
      loaded++;
      this.loadingProgress = (loaded / total) * 100;
      this.updateLoadingProgress();
      textures[config.name] = texture;
      return texture;
    });

    await Promise.all(loadPromises);
    return textures;
  }

  // Create inline Web Worker for texture decoding
  createTextureWorker() {
    const workerCode = `
      self.onmessage = async function(e) {
        const { imageUrl, id } = e.data;
        
        try {
          // Fetch the image
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          
          // Create ImageBitmap with flipY option
          const imageBitmap = await createImageBitmap(blob, {
            imageOrientation: 'flipY'
          });
          
          // Transfer the ImageBitmap back to main thread
          self.postMessage({
            success: true,
            imageBitmap: imageBitmap,
            id: id
          }, [imageBitmap]);
          
        } catch (error) {
          self.postMessage({
            success: false,
            error: error.message,
            id: id
          });
        }
      };
    `;
    
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    return new Worker(URL.createObjectURL(blob));
  }

  // Load texture using Web Worker
  async loadTextureWithWorker(path, id) {
    return new Promise((resolve, reject) => {
      if (!this.textureWorker) {
        this.textureWorker = this.createTextureWorker();
        this.pendingTextures = new Map();
        
        this.textureWorker.onmessage = (e) => {
          const { success, imageBitmap, error, id } = e.data;
          const { resolve: res, reject: rej } = this.pendingTextures.get(id);
          
          if (success) {
            const texture = new THREE.Texture();
            texture.image = imageBitmap;
            texture.needsUpdate = true;
            res(texture);
          } else {
            rej(new Error(error));
          }
          
          this.pendingTextures.delete(id);
        };
      }
      
      // Store resolve/reject for this texture
      this.pendingTextures.set(id, { resolve, reject });
      
      // Convert relative path to absolute URL
      const absoluteUrl = new URL(path, window.location.origin).href;
      
      // Send work to worker
      this.textureWorker.postMessage({ imageUrl: absoluteUrl, id: id });
    });
  }

  // Helper to yield control back to browser
  nextFrame() {
    return new Promise(resolve => {
      requestAnimationFrame(resolve);
    });
  }

  // Upgrade individual texture instead of all at once
  upgradeIndividualTexture(name, texture) {
    switch(name) {
      case 'albedo':
        this.earth.mesh.material.map = texture;
        this.earth.mesh.material.needsUpdate = true;
        break;
      case 'bump':
        this.earth.mesh.material.bumpMap = texture;
        this.earth.mesh.material.needsUpdate = true;
        break;
      case 'ocean':
        this.earth.mesh.material.specularMap = texture;
        this.earth.mesh.material.needsUpdate = true;
        break;
      case 'outline':
        this.countryOutlines.mesh.material.map = texture;
        this.countryOutlines.mesh.material.needsUpdate = true;
        break;
      case 'clouds':
        this.clouds.mesh.material.map = texture;
        this.clouds.mesh.material.alphaMap = texture;
        this.clouds.mesh.material.needsUpdate = true;
        break;
      case 'sky':
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.mapping = THREE.EquirectangularReflectionMapping;
        this.scene.background = texture;
        break;
    }
  }

  createPlanetLayers(albedoMap, bumpMap, cloudsMap, outlineMap, oceanMap) {
    // Base earth layer
    this.earth = new PlanetLayer(this.scene, 1, 2, {
      map: albedoMap,
      bumpMap: bumpMap,
      bumpScale: 1,
      specularMap: oceanMap,
      shininess: 100,
    });

    // Country outlines
    this.countryOutlines = new PlanetLayer(this.scene, 1, 3, {
      map: outlineMap,
      transparent: true,
    });

    // Clouds
    this.clouds = new PlanetLayer(this.scene, 1.01, 4, {
      map: cloudsMap,
      alphaMap: cloudsMap,
      transparent: true,
    });
  }

  upgradeToHighRes(textures) {
    // Set up high-res skymap
    textures.sky.colorSpace = THREE.SRGBColorSpace;
    textures.sky.mapping = THREE.EquirectangularReflectionMapping;
    this.scene.background = textures.sky;

    // Update earth materials with high-res textures
    this.earth.mesh.material.map = textures.albedo;
    this.earth.mesh.material.bumpMap = textures.bump;
    this.earth.mesh.material.specularMap = textures.ocean;
    this.earth.mesh.material.needsUpdate = true;

    // Update outline material
    this.countryOutlines.mesh.material.map = textures.outline;
    this.countryOutlines.mesh.material.needsUpdate = true;

    // Update clouds material
    this.clouds.mesh.material.map = textures.clouds;
    this.clouds.mesh.material.alphaMap = textures.clouds;
    this.clouds.mesh.material.needsUpdate = true;
  }

  setupLightingAndControls() {
    // Add light source
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 2);
    this.camera.add(light);
    this.scene.add(this.camera);

    // Set initial camera position
    this.camera.position.set(0, 0, 5);
    this.camera.lookAt(0, 0, 0);

    // Add OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enablePan = false;
    this.controls.minDistance = 1.15;
    this.controls.maxDistance = 4;

    // Event listeners
    this.controls.addEventListener('change', this.onZoom);
    const resizeObserver = new ResizeObserver(this.onWindowResize);
    resizeObserver.observe(this.container);
  }

  showLoadingProgress() {
    // Optional: Create a loading indicator
    // You could update a progress bar in your UI here
    console.log('Loading high-resolution textures...');
  }

  updateLoadingProgress() {
    // Optional: Update loading progress
    console.log(`Loading progress: ${this.loadingProgress.toFixed(1)}%`);
  }

  onZoom = () => {
    const zoom = this.controls.maxDistance / this.controls.getDistance();
    const opacity = (zoom-1)**3/2.4;
    const scale = 1/zoom;

    this.camera.children[0].position.set(5, 5, 2*zoom);
    this.clouds.mesh.material.opacity = 1 - opacity;
    this.countryOutlines.mesh.material.opacity = Math.min(1, opacity);
    this.triangle.setScale(scale);
  }

  onWindowResize = () => {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate = () => {
    this.controls.update();
    this.clouds.rotateY(0.001);
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.animate);
  }

  update(guess) {
    this.triangle.setCoords(guess.getCoords());
    this.triangle.setColors(guess.colors);
    this.triangle.reconfigure();
  }

  reset() {
    this.triangle.reset();
  }

  // Utility method to check if high-res is loaded
  isHighResReady() {
    return this.isHighResLoaded;
  }
}