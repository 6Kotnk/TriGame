import * as THREE from 'three';
import * as UTILS from '../../utils.js';

export {SphericalTriangleEdge};

const EDGE_THICKNESS = 0.01;
const EARTH_RADIUS = 1;

// Cylinders per radian (per length 1)
const EDGE_CYLINDER_NUM_PER_RADIAN = 50;
const EDGE_CYLINDER_DETAIL = 16;

const EDGE_CYLINDER_NUM = Math.ceil(2 * Math.PI * EDGE_CYLINDER_NUM_PER_RADIAN);
const EARTH_CIRCUMFERENCE = 2 * Math.PI * EARTH_RADIUS;
// Max edge length is half the circumference
const EDGE_CYLINDER_HEIGHT = (EARTH_CIRCUMFERENCE / 2) / EDGE_CYLINDER_NUM;


class SphericalTriangleEdge{

  constructor(scene) {
    // Fill the edge array with cylinders
    this.edge = Array(EDGE_CYLINDER_NUM).fill(null);
    for (let idx = 0; idx < this.edge.length; idx++) {
      this.edge[idx] = this.createCylinder(scene);
    }
  }

  createCylinder(scene) {
    const geometry = new THREE.CylinderGeometry(EDGE_THICKNESS, EDGE_THICKNESS, EDGE_CYLINDER_HEIGHT, EDGE_CYLINDER_DETAIL);
    const material = new THREE.MeshBasicMaterial();
    const cylinder = new THREE.Mesh(geometry, material);
    scene.add(cylinder);
    return cylinder;
  }

  
  // Tangent vector to the SLERP vector, in the direction of increasing t
  SLERPTangent(p, q, t) {
  
    const theta = p.angleTo(q);
    const sinTheta = Math.sin(theta);
  
    const coeff = theta / sinTheta;
    const cos_tTheta = Math.cos(t * theta); 
    const cos_1mtTheta = Math.cos((1 - t) * theta);
  
    const result = new THREE.Vector3();
    result.addScaledVector(q, coeff * cos_tTheta); 
    result.addScaledVector(p, -coeff * cos_1mtTheta); 
  
    return result;
  }

  // Move edge to between these two vectors
  moveToVecPair(vec1, vec2){
    const defaultCylinderUp = new THREE.Vector3(0, 1, 0);
  
    // Move all the cylinders
    for (let idx = 0; idx < this.edge.length; idx++) {
      // Position according to SLERP
      this.edge[idx].position.copy(UTILS.SLERP(vec1, vec2, idx/this.edge.length));
      // Direction according to SLERPTangent
      const normalizedTarget = this.SLERPTangent(vec1, vec2, idx/this.edge.length).normalize();
      // Rotation has to be referenced to the up vector of the cylinder, so we do some quaternion magic
      const quaternion = new THREE.Quaternion();
      quaternion.setFromUnitVectors(defaultCylinderUp, normalizedTarget);
      this.edge[idx].quaternion.copy(quaternion);
    }
  }

  // Scale the entire edge (only the radial components)
  setScale(scale){
    for (let cylinderIdx = 0; cylinderIdx < this.edge.length; cylinderIdx++) {
      this.edge[cylinderIdx].scale.set(scale,1,scale);
    }
  }

  setColor(color){
    for (let cylinderIdx = 0; cylinderIdx < this.edge.length; cylinderIdx++) {
      this.edge[cylinderIdx].material.color.set(color);
    }
  }
}