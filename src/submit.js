import { cityCoords } from './cities.js';
import { spheres, arcs, triFill } from './main.js';

import { configureSphere } from './triangleVerts.js';
import { configureArc } from './triangleOutline.js';
import { drawFill } from './triangleFill.js';

window.submitCities = submitCities;

function configureTriangle(coords, spheres, arcs, fill, colors) {

  configureSpheres(coords, spheres, colors.spheres);
  configureArcs(coords, arcs, colors.arcs);
  configureFill(coords, fill, colors.fill);
}

function configureSpheres(coords, spheres, color) {
  for (let idx = 0; idx < coords.length; idx++) {
    configureSphere(spheres[idx], coords[idx], color);
  }
}

function configureArcs(coords, arcs, color) {
  for (let idx = 0; idx < coords.length; idx++) {
    configureArc(arcs[idx], coords[idx], coords[(idx + 1)%3], color);
  }
}

function configureFill(coords, fill, color) {
  drawFill(coords, fill, color);
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
    dashboard.innerHTML = "Error loading data during triangle movement: " + error;
  }
}