import * as THREE from 'three';

export {SphericalTriangleEdge};

const EDGE_CYLINDER_NUM = 315;

class SphericalTriangleEdge{

  constructor(scene) {
    this.edge = Array(EDGE_CYLINDER_NUM).fill(null);
    for (let idx = 0; idx < this.edge.length; idx++) {
      this.edge[idx] = this.createCylinder(scene); // Call the function in each iteration
    }
  }

  createCylinder(scene) {
    const geometry = new THREE.CylinderGeometry(0.01, 0.01, 0.01, 16);
    const material = new THREE.MeshBasicMaterial();
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
      this.edge[idx].position.copy(this.SLERP(vec1, vec2, idx/this.edge.length));
      const normalizedTarget = this.SLERPTangent(vec1, vec2, idx/this.edge.length).normalize();
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