import * as THREE from 'three';
import * as UTILS from './utils.js';
import { scene } from './main.js';

export function createArc(scene) {
  const arc = Array(315).fill(null); // 100 pi + 1
  for (let idx = 0; idx < arc.length; idx++) {
    arc[idx] = createCylinder(scene); // Call the function in each iteration
  }
  return arc;
}

export function createCylinder(scene) {
  const geometry = new THREE.CylinderGeometry(0.1, 0.1, 0.1, 32);
  const material = new THREE.MeshBasicMaterial();
  const cylinder = new THREE.Mesh(geometry, material);
  scene.add(cylinder);
  return cylinder;
}

export function drawSphericalTriangleEdge(arc, coord1, coord2, scale = 1, radius = 0.01, color = 0x0000ff) {

  var vec1 = UTILS.coordToVec(coord1);
  var vec2 = UTILS.coordToVec(coord2);
  
  const arcAngle = vec2.angleTo(vec1);
  
  /*
  const torusGeometry = new THREE.TorusGeometry(1, radius * scale, radialSegments, tubularSegments, arcAngle);
  const material = new THREE.MeshBasicMaterial({ color: color });
  const torus = new THREE.Mesh(torusGeometry, material);
  */

  var normal_vec = new THREE.Vector3().crossVectors(vec1, vec2);

  var up_vec = new THREE.Vector3().crossVectors(vec1, new THREE.Vector3(0, 0, -Math.sign(normal_vec.z)));
  
  arc[0].position.copy(vec1);

  arc[0].up.set(up_vec);

  arc[0].lookAt(normal_vec);
  /*
  torus.up = up_vec;
  torus.lookAt(normal_vec);
  scene.add(torus);
*/
  return arc;
}

/* 
export function createLineBetweenPoints(point1, point2, scale = 1, radius = 0.01, color = 0x0000ff) {
  const radialSegments = 16; // Number of segments around the radius of the torus
  const tubularSegments = 100; // Number of segments along the tube

  var vec1 = UTILS.coordToVec(point1);
  var vec2 = UTILS.coordToVec(point2);
  
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
*/