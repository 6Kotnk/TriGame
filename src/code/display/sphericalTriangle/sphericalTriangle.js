import * as THREE from 'three';

import { SphericalTriangleVertex } from './sphericalTriangleVertex.js';
import { SphericalTriangleEdge } from './sphericalTriangleEdge.js';
import { SphericalTriangleFill } from './sphericalTriangleFill.js';

export {SphericalTriangle};

const R = 6371;  // Earth's radius in kilometers

class SphericalTriangle {

  verts;
  edges;
  fill;
  coords;
  vecs;
  colors;

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

  }

  setCoords(coords){
    this.coords = coords;
    this.vecs = this.coordsToVecs(coords);
  }

  setColors(colors){
    this.colors = colors;
  }

  setScale(scale){
    for (let vert = 0; vert < this.verts.length; vert++) {
      this.verts[vert].setScale(scale);
    }

    for (let edge = 0; edge < this.edges.length; edge++) {
      this.edges[edge].setScale(scale);
    }
  }

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

  getArea(){
    return this.triangleArea(this.coords);
  }

  degToRad(deg) {
    return deg * Math.PI / 180;
  }

  coordsToVecs(coords) {

    const vecs = Array(coords.length).fill(null);

    for (let idx = 0; idx < vecs.length; idx++) {
      vecs[idx] = new THREE.Vector3();

      vecs[idx].setFromSphericalCoords(
        1,
        this.degToRad(-coords[idx][0] + 90),
        this.degToRad( coords[idx][1] + 90),
      );
      const hasNaN = [vecs[idx].x, vecs[idx].y, vecs[idx].z].some(Number.isNaN);
      if (hasNaN) {
          throw new Error("NaN Error when translating coordinates to vector");
      }

    }
    return vecs;
  }

  haversine(coord1, coord2) {
    const [lat1, lon1] = coord1;
    const [lat2, lon2] = coord2;
    const dLat = this.degToRad(lat2 - lat1);
    const dLon = this.degToRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(this.degToRad(lat1)) * Math.cos(this.degToRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  }

  triangleArea(coords) {
    const a = this.haversine(coords[0], coords[1]);
    const b = this.haversine(coords[1], coords[2]);
    const c = this.haversine(coords[2], coords[0]);
    const A = Math.acos((Math.cos(a / R) - Math.cos(b / R) * Math.cos(c / R)) / (Math.sin(b / R) * Math.sin(c / R)));
    const B = Math.acos((Math.cos(b / R) - Math.cos(a / R) * Math.cos(c / R)) / (Math.sin(a / R) * Math.sin(c / R)));
    const C = Math.acos((Math.cos(c / R) - Math.cos(a / R) * Math.cos(b / R)) / (Math.sin(a / R) * Math.sin(b / R)));
    const E = A + B + C - Math.PI;
    const area = E * R ** 2;
    return area;
  }

  reset(){
    this.coords = Array(3).fill(null);
    this.vecs = Array(3).fill(new THREE.Vector3(0, 0, 0));
    this.reconfigure();
  }

}
