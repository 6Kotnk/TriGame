import * as THREE from 'three';

export {PlanetLayer};

class PlanetLayer {

  constructor(scene, height, renderOrder, options = {}) {

    const {
      map = null,
      transparent = false,
      alphaMap = null,
      opacity = 1,
      bumpMap = null,
      bumpScale = 1
    } = options;

    const layerGeometry = new THREE.SphereGeometry(height, 32, 32);
    const layerMaterial = new THREE.MeshStandardMaterial({
      map: map,
      transparent: transparent,
      alphaMap: alphaMap,
      opacity: opacity,
      bumpMap: bumpMap,
      bumpScale: bumpScale,
    });
    this.layer = new THREE.Mesh(layerGeometry, layerMaterial);
    this.layer.renderOrder = renderOrder;
    scene.add(this.layer);
  }

  rotateY(rotInRad){
    this.layer.rotateY(rotInRad);
  }

  changeMap(newMap, xOffset){
    this.layer.rotateY(rotInRad);
    const oldMap = this.layer.material.map; 
    newMap.wrapS = THREE.RepeatWrapping;
    newMap.offset.x = xOffset;
    this.layer.material.map = newMap;
    oldMap.dispose();

  }

}