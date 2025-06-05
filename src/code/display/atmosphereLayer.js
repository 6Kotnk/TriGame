import * as THREE from 'three';

export { AtmosphereLayer };

class AtmosphereLayer {
  constructor(scene, radius, renderOrder, options = {}) {
    const {
      atmOpacity = 0.7,
      atmPowFactor = 4.1,
      atmMultiplier = 9.5,
    } = options;

    // Create atmosphere geometry (slightly larger than the planet)
    const atmosphereGeometry = new THREE.SphereGeometry(radius, 64, 64);
    const atmosphereSurfaceGeometry = new THREE.SphereGeometry(1, 64, 64);


    // Atmospheric shader material based on the reference
    const atmosphereSurfaceMaterial = new THREE.ShaderMaterial({

      uniforms: {
        color1: { value: new THREE.Color(0x0088ff) },
        color2: { value: new THREE.Color(0x000000) },
        fresnelBias: { value: 0.1 },
        fresnelScale: { value: 1.0 },
        fresnelPower: { value: 4.0 },
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
        vec3 atmColor = vec3(0.25 + dotP/4.5, 0.25 + dotP/4.5, 1.0);
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
    this.mesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    this.surfaceMesh = new THREE.Mesh(atmosphereSurfaceGeometry, atmosphereSurfaceMaterial);
    this.mesh.renderOrder = renderOrder;
    this.surfaceMesh.renderOrder = renderOrder;
    
    // Add to scene
    scene.add(this.mesh);
    scene.add(this.surfaceMesh);
  }

}