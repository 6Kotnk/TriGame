import * as THREE from 'three';

export { AtmosphereLayer };

class AtmosphereLayer {
  constructor(scene, radius, renderOrder, options = {}) {
    const {
      atmOpacity = 0.7,
      atmPowFactor = 4.1,
      atmMultiplier = 9.5,
      transparent = true
    } = options;

    // Create atmosphere geometry (slightly larger than the planet)
    const atmosphereGeometry = new THREE.SphereGeometry(radius, 64, 64);

    // Atmospheric shader material based on the reference
    const atmosphereMaterial = new THREE.ShaderMaterial({
      uniforms: {
        atmOpacity: { value: atmOpacity },
        atmPowFactor: { value: atmPowFactor },
        atmMultiplier: { value: atmMultiplier }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 eyeVector;
        
        void main() {
          // modelMatrix transforms the coordinates local to the model into world space
          vec4 mvPos = modelViewMatrix * vec4( position, 1.0 );
          // normalMatrix is a matrix that is used to transform normals from object space to view space.
          vNormal = normalize( normalMatrix * normal );
          // vector pointing from camera to vertex in view space
          eyeVector = normalize(mvPos.xyz);
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 eyeVector;
        uniform float atmOpacity;
        uniform float atmPowFactor;
        uniform float atmMultiplier;
        
        void main() {
          // Starting from the atmosphere edge, dotP would increase from 0 to 1
          float dotP = dot( vNormal, eyeVector );
          // This factor is to create the effect of a realistic thickening of the atmosphere coloring
          float factor = pow(dotP, atmPowFactor) * atmMultiplier;
          // Adding in a bit of dotP to the color to make it whiter while thickening
          vec3 atmColor = vec3(0.35 + dotP/4.5, 0.35 + dotP/4.5, 1.0);
          // use atmOpacity to control the overall intensity of the atmospheric color
          gl_FragColor = vec4(atmColor, atmOpacity) * factor;
        }
      `,
      transparent: transparent,
      side: THREE.BackSide, // Render from inside to create proper glow
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    // Create the atmosphere mesh
    this.mesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    this.mesh.renderOrder = renderOrder;
    
    // Add to scene
    scene.add(this.mesh);
  }

  // Update atmospheric opacity
  setAtmOpacity(opacity) {
    this.mesh.material.uniforms.atmOpacity.value = opacity;
  }

  // Update atmospheric power factor (controls falloff)
  setAtmPowFactor(powFactor) {
    this.mesh.material.uniforms.atmPowFactor.value = powFactor;
  }

  // Update atmospheric multiplier (controls intensity)
  setAtmMultiplier(multiplier) {
    this.mesh.material.uniforms.atmMultiplier.value = multiplier;
  }

  // No longer need updateCameraPosition since the shader handles it automatically
  updateCameraPosition(cameraPosition) {
    // This method is kept for compatibility but no longer needed
    // The eye vector is calculated automatically in the vertex shader
  }

  // Rotate the atmosphere (if needed)
  rotateY(rotInRad) {
    this.mesh.rotateY(rotInRad);
  }
}