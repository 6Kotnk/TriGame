import * as THREE from 'three';

export { AtmosphereLayer };

// Shaders from:
// https://github.com/franky-adl/threejs-earth/blob/main/src/index.js (atmosphere)
// https://github.com/bobbyroe/threejs-earth/blob/main/src/getFresnelMat.js (surface)

class AtmosphereLayer {
  constructor(scene, radius, renderOrder, atmOptions = {}, fresnelOptions = {}) {

    const {
      atmOpacity = 0.7,
      atmPowFactor = 4.1,
      atmMultiplier = 9.5,
    } = atmOptions;

    const {
      fresnelBias = 0.1,
      fresnelScale = 1.0,
      fresnelPower = 4.0,
    } = fresnelOptions;

    // Create atmosphere is made of two layers, one on the surface, the other above
    const atmosphereGeometry = new THREE.SphereGeometry(radius, 32, 32);
    const fresnelGeometry = new THREE.SphereGeometry(1, 32, 32);


    const fresnelMaterial = new THREE.ShaderMaterial({

      uniforms: {
        color1: { value: new THREE.Color(0x0088ff) },
        color2: { value: new THREE.Color(0x000000) },
        fresnelBias:  { value: fresnelBias },
        fresnelScale: { value: fresnelScale },
        fresnelPower: { value: fresnelPower },
      },

      vertexShader: `
        uniform float fresnelBias;
        uniform float fresnelScale;
        uniform float fresnelPower;
        
        varying float vReflectionFactor;
        
        void main() {
          vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
          vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
        
          vec3 worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );
        
          vec3 I = worldPosition.xyz - cameraPosition;
        
          vReflectionFactor = fresnelBias + fresnelScale * pow( 1.0 + dot( normalize( I ), worldNormal ), fresnelPower );
        
          gl_Position = projectionMatrix * mvPosition;
        }`,

      fragmentShader: `
        uniform vec3 color1;
        uniform vec3 color2;
        
        varying float vReflectionFactor;
        
        void main() {
          float f = clamp( vReflectionFactor, 0.0, 1.0 );
          gl_FragColor = vec4(mix(color2, color1, vec3(f)), f);
        }`,

      transparent: true,
      blending: THREE.AdditiveBlending,
    });



    const atmosphereMaterial = new THREE.ShaderMaterial({
    uniforms: {
      atmOpacity:     { value: atmOpacity },
      atmPowFactor:   { value: atmPowFactor },
      atmMultiplier:  { value: atmMultiplier }
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
    transparent: true,
    side: THREE.BackSide, // Render from inside to create proper glow
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });


    // Create the atmosphere mesh
    this.atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    this.fresnelMesh = new THREE.Mesh(fresnelGeometry, fresnelMaterial);
    this.atmosphereMesh.renderOrder = renderOrder;
    this.fresnelMesh.renderOrder = renderOrder;
    
    // Add to scene
    scene.add(this.atmosphereMesh);
    scene.add(this.fresnelMesh);
  }

}