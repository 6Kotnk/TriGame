import { cityCoords } from './cities.js';
import { spheres } from './main.js';
import { arcs } from './main.js';
import { drawSphericalTriangleFill } from './triangleFill.js';
import { moveSphereToCoord } from './triangleVerts.js';
import { drawSphericalTriangleEdge } from './triangleOutline.js';

export { submitCities };
window.submitCities = submitCities;

function submitCities() {

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
    // Loop through and move spheres now that we know all coords are valid
    for (let idx = 0; idx < cityCoords.length; idx++) {
      moveSphereToCoord(spheres[idx], cityCoords[idx]);
      drawSphericalTriangleEdge(arcs[idx], cityCoords[idx], cityCoords[(idx + 1)%3]);
    }

    //moveSphereToCoord(spheres[0], cityCoords[0]);
    //moveSphereToCoord(spheres[1], cityCoords[1]);
    //drawSphericalTriangleEdge(arcs[0], cityCoords[0], cityCoords[1]);

    drawSphericalTriangleFill(cityCoords);

  } catch (error) {
    dashboard.innerHTML = "Error loading data during sphere movement: " + error;
  }
}