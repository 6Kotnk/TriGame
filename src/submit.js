import { cityCoords } from './cities.js';

//import { configureTriangle, triangleArea } from './triangle.js';
import { updateDashboard } from './dashboard.js';
import { gameSM } from './gamestate.js';

import { triangle } from './main.js';


window.submitCities = submitCities;

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
      verts: "white",
      edges: "white",
      fill: "cyan",
    };
    /*
    configureTriangle(cityCoords, colors);
    */
    triangle.setCoords(cityCoords);
    triangle.setColors(colors);
    triangle.reconfigure();

    const attemptVal = (triangle.getArea()/ 1e6).toFixed(2);
    updateDashboard(attemptVal, gameSM);
    gameSM.evaluateGuess(attemptVal);
    

  } catch (error) {
    dashboard.innerHTML = "Error loading data during triangle movement: " + error.stack;
  }
}