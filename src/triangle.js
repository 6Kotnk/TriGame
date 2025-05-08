import * as THREE from 'three';

import { spheres, arcs, triFill } from './main.js';

import { configureSphere } from './triangleVerts.js';
import { configureArc } from './triangleOutline.js';
import { drawFill } from './triangleFill.js';

/*
import { SphericalTriangleVertex } from './SphericalTriangleVertex.js';
import { SphericalTriangleEdge } from './SphericalTriangleEdge.js';
import { SphericalTriangleFill } from './SphericalTriangleFill.js';
*/

import { SphericalTriangleVertex } from './triangleVerts.js';
import { SphericalTriangleEdge } from './triangleOutline.js';
import { SphericalTriangleFill } from './triangleFill.js';

export {SphericalTriangle};

class SphericalTriangle {

  constructor(scene, canvas) {

    this.verts = Array(3).fill(null);
    this.edges = Array(3).fill(null);

    for (let vert = 0; vert < verts.length; vert++) {
      this.verts[idx] = new SphericalTriangleVertex(scene);
    }

    for (let edge = 0; edge < edges.length; edge++) {
      this.edges[idx] = new SphericalTriangleEdge(scene);
    }

    this.fill = new SphericalTriangleFill(scene, canvas);

  }

}




function degToRad(deg) {
  return deg * Math.PI / 180;
}

function coordsToVecs(coords) {

  const vecs = Array(coords.length).fill(null);

  for (let idx = 0; idx < vecs.length; idx++) {
    vecs[idx] = new THREE.Vector3();

    vecs[idx].setFromSphericalCoords(
      1,
      degToRad(-coords[idx][0] + 90),
      degToRad( coords[idx][1] + 90),
    );
    const hasNaN = [vecs[idx].x, vecs[idx].y, vecs[idx].z].some(Number.isNaN);
    if (hasNaN) {
        throw new Error("NaN Error when translating coordinates to vector");
    }

  }

  return vecs;
}

export function configureTriangle(coords, colors) {
  const vecs = coordsToVecs(coords);

  configureSpheres(vecs, spheres, colors.spheres);
  configureArcs(vecs, arcs, colors.arcs);
  configureFill(vecs, triFill, colors.fill);
}

function configureSpheres(vecs, spheres, color) {
  for (let idx = 0; idx < vecs.length; idx++) {
    configureSphere(spheres[idx], vecs[idx], color);
  }
}

function configureArcs(vecs, arcs, color) {
  for (let idx = 0; idx < vecs.length; idx++) {
    configureArc(arcs[idx], vecs[idx], vecs[(idx + 1) % 3], color);
  }
}

function configureFill(vecs, triFill, color) {
  drawFill(vecs, triFill, color);
}


const R = 6371;  // Earth's radius in kilometers

function haversine(coord1, coord2) {
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;
  const dLat = degToRad(lat2 - lat1);
  const dLon = degToRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(degToRad(lat1)) * Math.cos(degToRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

export function triangleArea(coords) {
  const a = haversine(coords[0], coords[1]);
  const b = haversine(coords[1], coords[2]);
  const c = haversine(coords[2], coords[0]);
  const A = Math.acos((Math.cos(a / R) - Math.cos(b / R) * Math.cos(c / R)) / (Math.sin(b / R) * Math.sin(c / R)));
  const B = Math.acos((Math.cos(b / R) - Math.cos(a / R) * Math.cos(c / R)) / (Math.sin(a / R) * Math.sin(c / R)));
  const C = Math.acos((Math.cos(c / R) - Math.cos(a / R) * Math.cos(b / R)) / (Math.sin(a / R) * Math.sin(b / R)));
  const E = A + B + C - Math.PI;
  const area = E * R ** 2;
  return area;
}
