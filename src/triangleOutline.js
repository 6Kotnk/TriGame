import * as THREE from 'three';

export {SphericalTriangleEdge};

const EDGE_CYLINDER_NUM = 315;

class SphericalTriangleEdge{

  constructor(scene) {
    this.edge = Array(EDGE_CYLINDER_NUM).fill(null);
    for (let idx = 0; idx < this.edge.length; idx++) {
      this.edge[idx] = createCylinder(scene); // Call the function in each iteration
    }
  }

  createCylinder(scene) {
    const geometry = new THREE.CylinderGeometry(0.01, 0.01, 0.01, 16);
    const material = new THREE.MeshBasicMaterial("");
    const cylinder = new THREE.Mesh(geometry, material);
    cylinder.material.color.set('blue');
    scene.add(cylinder);
    return cylinder;
  }

  SLERP(p, q, t){

    const theta = p.angleTo(q);
    const sinTheta = Math.sin(theta);
  
    // Calculate the SLERP scale factors
    const scaleP = Math.sin((1 - t) * theta) / sinTheta;
    const scaleQ = Math.sin(t * theta) / sinTheta;
  
    // Calculate the interpolated vector by scaling and adding the input vectors
    const result = new THREE.Vector3();
    result.addScaledVector(p, scaleP); 
    result.addScaledVector(q, scaleQ);
  
    return result
  }
  
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

  moveToVecPair(vec1, vec2){
    const defaultCylinderUp = new THREE.Vector3(0, 1, 0);
  
    for (let idx = 0; idx < this.edge.length; idx++) {
      this.edge[idx].position.copy(SLERP(vec1, vec2, idx/this.edge.length));
      const normalizedTarget = SLERPTangent(vec1, vec2, idx/this.edge.length).normalize();
      const quaternion = new THREE.Quaternion();
      quaternion.setFromUnitVectors(defaultCylinderUp, normalizedTarget);
      this.edge[idx].quaternion.copy(quaternion);
    }
  }
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





export function createArc(scene) {
  //const arc = Array(315).fill(null); // 100 pi + 1
  const arc = Array(315).fill(null); // 100 pi + 1
  for (let idx = 0; idx < arc.length; idx++) {
    arc[idx] = createCylinder(scene); // Call the function in each iteration
  }
  return arc;
}

export function createCylinder(scene) {
  const geometry = new THREE.CylinderGeometry(0.01, 0.01, 0.01, 16);
  const material = new THREE.MeshBasicMaterial("");
  const cylinder = new THREE.Mesh(geometry, material);
  cylinder.material.color.set('blue');
  scene.add(cylinder);
  return cylinder;
}

function SLERP(p, q, t){

  const theta = p.angleTo(q);
  const sinTheta = Math.sin(theta);

  // Calculate the SLERP scale factors
  const scaleP = Math.sin((1 - t) * theta) / sinTheta;
  const scaleQ = Math.sin(t * theta) / sinTheta;

  // Calculate the interpolated vector by scaling and adding the input vectors
  const result = new THREE.Vector3();
  result.addScaledVector(p, scaleP); 
  result.addScaledVector(q, scaleQ);

  return result
}

function SLERPTangent(p, q, t) {

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

export function configureArc(arc, vec1, vec2, color = "blue") {
  moveArcToCoordPair(arc, vec1, vec2);
  setArcColor(arc, color);
}

function moveArcToCoordPair(arc, vec1, vec2) {
  
  const arcAngle = vec2.angleTo(vec1);

  const defaultCylinderUp = new THREE.Vector3(0, 1, 0);

  for (let idx = 0; idx < arc.length; idx++) {
    arc[idx].position.copy(SLERP(vec1, vec2, idx/arc.length));
    const normalizedTarget = SLERPTangent(vec1, vec2, idx/arc.length).normalize();
    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(defaultCylinderUp, normalizedTarget);
    arc[idx].quaternion.copy(quaternion);
  }

  return arc;
}

export function setArcsScale(arcs, scale) {
  for (let arcIdx = 0; arcIdx < arcs.length; arcIdx++) {
    const arc = arcs[arcIdx];
    for (let cylinderIdx = 0; cylinderIdx < arc.length; cylinderIdx++) {
      arc[cylinderIdx].scale.set(scale,1,scale);
    }
  }
}

function setArcColor(arc, color) {
  for (let cylinderIdx = 0; cylinderIdx < arc.length; cylinderIdx++) {
    arc[cylinderIdx].material.color.set(color);
  }
}
