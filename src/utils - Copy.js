import * as THREE from 'three';

export function degToRad(deg) {
  return deg * Math.PI / 180;
}

export function createSphereAtPoint(scene, position, scale, radius = 0.02, color = 0xff0000) {
  const geometry = new THREE.SphereGeometry(radius * scale, 32, 32);
  const material = new THREE.MeshBasicMaterial({ color: color });
  const sphere = new THREE.Mesh(geometry, material);
  sphere.position.copy(position);
  scene.add(sphere);
  return sphere;
}
