import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

import albedoMapPath from   '../../assets/img/albedoMap8k.jpg'
import bumpMapPath from     '../../assets/img/bumpMap8k.png'

import cloudsMapPath from   '../../assets/img/cloudsMap8k.png'
import outlineMapPath from  '../../assets/img/outlineMap8k.png'
import lightMapPath from    '../../assets/img/lightMap8k.png'
import oceanMapPath from    '../../assets/img/oceanMap8k.png'

import skyMapPath from      '../../assets/img/starMap8k.jpg'

import { SphericalTriangle } from './sphericalTriangle/sphericalTriangle.js';
import { PlanetLayer } from './planetLayer.js';

export {Display};


class Display {

  triangle;
  earth;
  countryOutlines;
  clouds;

  originalDistance;

  constructor() {
    this.scene = new THREE.Scene();

    const canvas = document.getElementById('MapCanvas');
    const container = document.getElementById('rightPanel');
    // Set up the this.scene, camera, and this.renderer

    this.camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });

    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);
    this.renderer.setClearColor( 0x000000, 0 ); // the default
    canvas.width = 3600;
    canvas.height = 1800;

    const textureLoader = new THREE.TextureLoader();

    const albedoMap = textureLoader.load(albedoMapPath);
    albedoMap.minFilter = THREE.LinearFilter;

    const bumpMap = textureLoader.load(bumpMapPath);
    const cloudsMap = textureLoader.load(cloudsMapPath);

    const outlineMap = textureLoader.load(outlineMapPath);
    const lightMap = textureLoader.load(lightMapPath);
    const oceanMap = textureLoader.load(oceanMapPath);
    const skyMap = textureLoader.load(skyMapPath);

    skyMap.colorSpace = THREE.SRGBColorSpace;

    skyMap.mapping = THREE.EquirectangularReflectionMapping;
    this.scene.background = skyMap;
    //this.scene.background = new THREE.Color("gray");

    // Create a sphere to get a shadow

    this.triangle = new SphericalTriangle(this.scene, canvas);

    this.earth = new PlanetLayer(this.scene, 1, 1, {
      map: albedoMap,
      bumpMap: bumpMap,
      bumpScale: 5
    });

    this.countryOutlines = new PlanetLayer(this.scene, 1, 2, {
        map: outlineMap,
        transparent: true,
    });

    this.clouds = new PlanetLayer(this.scene, 1.01, 4, {
      map: cloudsMap,
      alphaMap: cloudsMap,
      transparent: true,
    });

    // Add a light source
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 2);

    this.camera.add( light );
    this.scene.add( this.camera );

    // Set the camera position
    this.camera.position.set(0, 0, 5);
    this.camera.lookAt(0, 0, 0);

    // Add OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = 1.15;
    this.controls.maxDistance = 4;

    this.animate();

    this.controls.addEventListener( 'change', this.getControlsZoom );

    const resizeObserver = new ResizeObserver(this.onWindowResize);
    resizeObserver.observe(container);
  }

  getControlsZoom = () => {
    const zoom = this.controls.maxDistance / this.controls.getDistance( );
    const opacity = (zoom-1)**3/2.4
    const scale = 1/zoom;

    this.camera.children[0].position.set(5,5, 2*zoom);
    this.clouds.mesh.material.opacity = 1 - opacity;
    this.countryOutlines.mesh.material.opacity = Math.min(1,opacity);

    this.triangle.setScale(scale)
  }

  onWindowResize = () => {

    const container = document.getElementById('rightPanel');
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    
    this.renderer.setSize(width, height);
  }


  animate = () => {
    requestAnimationFrame(this.animate);
    this.controls.update();
    this.clouds.rotateY(0.001);
    this.renderer.render(this.scene, this.camera);
  }

  update(guess){
    this.triangle.setCoords(guess.getCoords());
    this.triangle.setColors(guess.colors);
    this.triangle.reconfigure();
  }

  setTriangleCoords(coords){
    this.triangle.setCoords(coords);
  }

  setTriangleColors(colors){
    this.triangle.setColors(colors);
  }

  reconfigure(){
    this.triangle.reconfigure();
  }

  reset(){
    this.triangle.reset();
  }


}

