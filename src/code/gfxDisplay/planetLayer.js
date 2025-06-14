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
      bumpScale = 1,
      specularMap = null,
      shininess = 30,
      specular = null,
    } = options;

    const layerGeometry = new THREE.SphereGeometry(height, 32, 32);
    //const layerGeometry = new THREE.IcosahedronGeometry(height, 12);
    const layerMaterial = new THREE.MeshPhongMaterial({
      map: map,
      transparent: transparent,
      alphaMap: alphaMap,
      opacity: opacity,
      bumpMap: bumpMap,
      bumpScale: bumpScale,
      specularMap: specularMap,
      shininess:  shininess,
      specular:  specular,
    });
    this.mesh = new THREE.Mesh(layerGeometry, layerMaterial);
    this.mesh.renderOrder = renderOrder;
    scene.add(this.mesh);
  }

  rotateY(rotInRad){
    this.mesh.rotateY(rotInRad);
  }

  changeMap(newMap, xOffset){
    const oldMap = this.mesh.material.map; 
    newMap.wrapS = THREE.RepeatWrapping;
    newMap.offset.x = xOffset;
    this.mesh.material.map = newMap;
    oldMap.dispose();

  }

}