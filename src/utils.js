import * as THREE from 'three';

export function coordToVec(coord) {
  let vec = new THREE.Vector3();
  vec.setFromSphericalCoords(
    1,
    degToRad(-coord[0] + 90),
    degToRad( coord[1] + 90),
  );
  return vec;
}

export function degToRad(deg) {
  return deg * Math.PI / 180;
}