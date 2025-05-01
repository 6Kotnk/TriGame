import * as THREE from 'three';

import { cityCoords } from './cities.js';
import { spheres, arcs, triFill } from './main.js';

import { configureSphere } from './triangleVerts.js';
import { configureArc } from './triangleOutline.js';
import { drawFill } from './triangleFill.js';

//import { displayResults } from './dashboard.js';

window.submitCities = submitCities;

var target_val = 73;
document.getElementById('target').textContent = `Target: ${target_val} million km²`;
const target_tol = 0.1; //10%
var guessCounter = 0;
const historyResults = [];



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




    //------------------------------------------------------------------------------------

    const areaResult = (sphericalExcess(cityCoords) / 1e6).toFixed(2);
 
    // Latest result object
    const latestResult = {
        cities: [
          document.getElementById("city1").value,
          document.getElementById("city2").value,
          document.getElementById("city3").value
        ],
        area: areaResult
      };

    // Sort for easy equality checking
    latestResult.cities = latestResult.cities.sort();
    
    let resultNew = false;
    // Automatically add to history if no history
    if(historyResults.length == 0){
        resultNew = true;
    }
    else
    {
        resultNew = !historyResults.some(function(historyResult) {
            let equal = true;
                for (let idx = 0; idx < latestResult.cities.length; idx++) {
                    equal &= historyResult.cities[idx] == latestResult.cities[idx];  
                }
            return equal
            }
        );
    }

    if(resultNew){
        guessCounter += 1;
        historyResults.push(latestResult);
    }
    

    // Sort the history by proximity to the target value
    historyResults.sort((a, b) => Math.abs(a.area - target_val) - Math.abs(b.area - target_val));

    // Limit the history to the top 9 results (keeping 1 spot for the latest result)
    if (historyResults.length > 9) {
        historyResults = historyResults.slice(0, 9);
    }

    //------------------------------------------------------------------------------------

    displayResults(latestResult, historyResults);







    

  } catch (error) {
    dashboard.innerHTML = "Error loading data during triangle movement: " + error.stack;
  }
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
  console.log(distance);
  return distance;
}

function sphericalExcess(coords) {
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

function displayResults(latestResult, historyResults) {
  const outputDiv = document.getElementById("dashboard");
  outputDiv.innerHTML = '';

  // Display the latest result
  const latestDiv = document.createElement("div");
  latestDiv.className = "resultItem";
  latestDiv.innerHTML = `
    <p>${latestResult.cities[0]},</p>
    <p>${latestResult.cities[1]},</p>
    <p>${latestResult.cities[2]}</p>
    <p class="area">Area: ${latestResult.area} million km<sup>2</sup></p>
  `;

  // Add a separator
  const separator1 = document.createElement("hr");
  const separator2 = document.createElement("hr");

  const attemptCounter = document.createElement("div");
  attemptCounter.className = "resultItem";
  attemptCounter.innerHTML = `
  Guess counter: 
  ${guessCounter}
  `;

  outputDiv.appendChild(attemptCounter);

  outputDiv.appendChild(separator1);

  const latestHeader = document.createElement("h3");
  latestHeader.textContent = "Newest Result:";
  outputDiv.appendChild(latestHeader);

  outputDiv.appendChild(latestDiv);

  outputDiv.appendChild(separator2);

  // Display the history
  const historyHeader = document.createElement("h3");
  historyHeader.textContent = "History:";
  outputDiv.appendChild(historyHeader);

  historyResults.forEach(result => {
    const resultDiv = document.createElement("div");
    resultDiv.className = "resultItem";
    resultDiv.innerHTML = `
      <p>${result.cities[0]},</p>
      <p>${result.cities[1]},</p>
      <p>${result.cities[2]}</p>
      <p class="area">Area: ${result.area} million km<sup>2</sup></p>
    `;
    outputDiv.appendChild(resultDiv);
  });
}
