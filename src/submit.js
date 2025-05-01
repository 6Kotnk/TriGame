import * as THREE from 'three';

import { cityCoords } from './cities.js';
import { spheres, arcs, triFill } from './main.js';

import { configureSphere } from './triangleVerts.js';
import { configureArc } from './triangleOutline.js';
import { drawFill } from './triangleFill.js';

window.submitCities = submitCities;

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

function configureTriangle(coords, spheres, arcs, fill, colors) {
  const vecs = coordsToVecs(coords);

  configureSpheres(vecs, spheres, colors.spheres);
  configureArcs(vecs, arcs, colors.arcs);
  configureFill(vecs, fill, colors.fill);
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

function configureFill(vecs, fill, color) {
  drawFill(vecs, fill, color);
}

export function submitCities() {

  const dashboard = document.getElementById('dashboard');
  if (!dashboard) {
    console.error("Dashboard element not found!");
    return; // Exit if the dashboard element doesn't exist
  }

  let allCoordsValid = true; // Assume all coordinates are valid initially

  for (let i = 0; i < cityCoords.length; i++) {
    // Check if the current coordinate is "falsy" (null, undefined, etc.)
    if (!cityCoords[i]) {
      allCoordsValid = false; // Found an invalid coordinate
      break; // Stop checking immediately, no need to check the rest
    }
  }

  if (!allCoordsValid) {
    dashboard.innerHTML = "Make sure all cities are valid before submitting";
    return;
  }

  dashboard.innerHTML = "";

  try {

    const colors = {
      spheres: "white",
      arcs: "white",
      fill: "cyan",
    };
    configureTriangle(cityCoords, spheres, arcs, triFill, colors)

  } catch (error) {
    dashboard.innerHTML = "Error loading data during triangle movement: " + error.stack;
  }
}