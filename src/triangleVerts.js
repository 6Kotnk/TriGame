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

export function createSphere(scene) {
  const geometry = new THREE.SphereGeometry(0.02, 32, 32);
  const material = new THREE.MeshBasicMaterial();
  const sphere = new THREE.Mesh(geometry, material);
  sphere.material.color.set('red');
  scene.add(sphere);
  return sphere;
}
  
export function configureSphere(sphere, vec, color) {
  moveSphereToCoord(sphere, vec);
  setSphereColor(sphere, color)

}

function moveSphereToCoord(sphere, vec) {
  sphere.position.copy(vec);
  return sphere;
}

export function setSpheresScale(spheres, scale) {
  for (let idx = 0; idx < spheres.length; idx++) {
    spheres[idx].scale.set(scale,scale,scale);
  }
}

function setSphereColor(sphere, color) {
  sphere.material.color.set(color);
}
