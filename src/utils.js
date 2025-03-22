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

export function createSphere(scene) {
  const geometry = new THREE.SphereGeometry(0.02, 32, 32);
  const material = new THREE.MeshBasicMaterial();
  const sphere = new THREE.Mesh(geometry, material);
  scene.add(sphere);
  return sphere;
}

export function moveSphereToCoord(sphere, coord) {

  let position = new THREE.Vector3();

  try {
    position.setFromSphericalCoords(
      1,
      degToRad(-coord[0] + 90),
      degToRad( coord[1] + 90),
    );
  } catch (error) {
    document.getElementById('dashboard').innerHTML = "Error loading data: " + error;
  }
  sphere.position.copy(position);
  return sphere;
}