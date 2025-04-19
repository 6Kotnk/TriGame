import * as THREE from 'three';
import * as UTILS from './utils.js';

export function createSphere(scene) {
    const geometry = new THREE.SphereGeometry(0.02, 32, 32);
    const material = new THREE.MeshBasicMaterial();
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);
    return sphere;
  }
  
  export function moveSphereToCoord(sphere, coord) {
  
    let position = new THREE.Vector3();
  
    position.setFromSphericalCoords(
      1,
      UTILS.degToRad(-coord[0] + 90),
      UTILS.degToRad( coord[1] + 90),
    );
  
    const hasNaN = [position.x, position.y, position.z].some(Number.isNaN);
  
    if (hasNaN) {
        throw new Error(`Calculation resulted in NaN position components for input coord: ${JSON.stringify(coord)}.`);
    }
  
    sphere.position.copy(position);
    return sphere;
  }