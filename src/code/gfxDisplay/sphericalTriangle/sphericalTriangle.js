import * as THREE from 'three';
import * as UTILS from '../../utils.js';

import { SphericalTriangleVertex } from './sphericalTriangleVertex.js';
import { SphericalTriangleEdge } from './sphericalTriangleEdge.js';
import { SphericalTriangleFill } from './sphericalTriangleFill.js';

export {SphericalTriangle};

class SphericalTriangle {

  constructor(scene, canvas) {

    this.verts = Array(3).fill(null);
    this.edges = Array(3).fill(null);

    for (let vert = 0; vert < this.verts.length; vert++) {
      this.verts[vert] = new SphericalTriangleVertex(scene);
    }

    for (let edge = 0; edge < this.edges.length; edge++) {
      this.edges[edge] = new SphericalTriangleEdge(scene);
    }

    this.fill = new SphericalTriangleFill(scene, canvas);

    // Color of the triangle components
    this.colors = {
      verts: "white",
      edges: "white",
      fill: "cyan",
    };
  }

  setCoords(coords){
    this.coords = coords;
    // Convert to vec3
    this.vecs = this.coordsToVecs(coords);
  }

  setColors(colors){
    this.colors = colors;
  }

  // Scale the outline
  setScale(scale){
    for (let vert = 0; vert < this.verts.length; vert++) {
      this.verts[vert].setScale(scale);
    }

    for (let edge = 0; edge < this.edges.length; edge++) {
      this.edges[edge].setScale(scale);
    }
  }

  // Apply the latest coords and colors
  reconfigure(){
    for (let vert = 0; vert < this.verts.length; vert++) {
      this.verts[vert].moveToVec(this.vecs[vert]);
      this.verts[vert].setColor(this.colors.verts);
    }

    for (let edge = 0; edge < this.edges.length; edge++) {
      this.edges[edge].moveToVecPair(this.vecs[edge], this.vecs[(edge + 1) % this.edges.length]);
      this.edges[edge].setColor(this.colors.edges);
    }

    this.fill.draw(this.vecs, this.colors.fill)
  }

  // Convert coordinate pair list to a  list of unit Three.js vec3
  coordsToVecs(coords) {
    const vecs = Array(coords.length).fill(null);

    for (let idx = 0; idx < vecs.length; idx++) {
      vecs[idx] = new THREE.Vector3();

      vecs[idx].setFromSphericalCoords(
        1,// Unit vec3
        // convert from latlon to spherical coords
        UTILS.degToRad(-coords[idx][0] + 90),
        UTILS.degToRad( coords[idx][1] + 90),
      );

      // Error checking
      const hasNaN = [vecs[idx].x, vecs[idx].y, vecs[idx].z].some(Number.isNaN);
      if (hasNaN) {
          throw new Error("NaN Error when translating coordinates to vector");
      }

    }
    return vecs;
  }

  // Hide the triangle back into the Earth
  reset(){
    this.coords = Array(3).fill(null);
    this.vecs = Array(3).fill(new THREE.Vector3(0, 0, 0));
    this.reconfigure();
  }

}
