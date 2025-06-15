import * as THREE from 'three';

export {SphericalTriangleVertex};

const VERTEX_RADIUS = 0.02;
const VERTEX_DETAIL = 32;

class SphericalTriangleVertex {

  constructor(scene) {
    const geometry = new THREE.SphereGeometry(VERTEX_RADIUS, VERTEX_DETAIL, VERTEX_DETAIL);
    const material = new THREE.MeshBasicMaterial();
    this.vertex = new THREE.Mesh(geometry, material);
    scene.add(this.vertex);
  }

  moveToVec(vec){
    this.vertex.position.copy(vec);
  }
  setScale(scale){
    this.vertex.scale.set(scale,scale,scale);
  }
  setColor(color){
    this.vertex.material.color.set(color);
  }

}