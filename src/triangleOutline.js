import * as THREE from 'three';
import * as UTILS from './utils.js';
import { scene } from './main.js';

export function createLineBetweenPoints(point1, point2, scale = 1, radius = 0.01, color = 0x0000ff) {
  const radialSegments = 16; // Number of segments around the radius of the torus
  const tubularSegments = 100; // Number of segments along the tube

  var vec1 = new THREE.Vector3();
  vec1.setFromSphericalCoords(
    1,
    UTILS.degToRad(-point1[0] + 90),
    UTILS.degToRad( point1[1] + 90),
  );
  
  var vec2 = new THREE.Vector3();
  vec2.setFromSphericalCoords(
    1,
    UTILS.degToRad(-point2[0] + 90),
    UTILS.degToRad( point2[1] + 90),
  );


  const arc = vec2.angleTo(vec1);
  
  const torusGeometry = new THREE.TorusGeometry(1, radius * scale, radialSegments, tubularSegments, arc);
  const material = new THREE.MeshBasicMaterial({ color: color });
  const torus = new THREE.Mesh(torusGeometry, material);

  var normal_vec = new THREE.Vector3().crossVectors(vec1, vec2);

  var up_vec = new THREE.Vector3().crossVectors(vec1, new THREE.Vector3(0, 0, -Math.sign(normal_vec.z)));
  
  torus.up = up_vec;
  torus.lookAt(normal_vec);
  scene.add(torus);

  return torus;
}