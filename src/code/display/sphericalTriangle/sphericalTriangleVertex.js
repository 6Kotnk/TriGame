import * as THREE from 'three';

export {SphericalTriangleVertex};

class SphericalTriangleVertex {

  constructor(scene) {
    const geometry = new THREE.SphereGeometry(0.02, 32, 32);
    const material = new THREE.MeshBasicMaterial();
    this.vertex = new THREE.Mesh(geometry, material);
    this.vertex.material.color.set('red');
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