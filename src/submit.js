import { cityCoords } from './cities.js';
import { spheres } from './main.js';
import * as UTILS from './utils.js';

export { submitCities };
window.submitCities = submitCities;

function submitCities() {

  for (let idx = 0; idx < cityCoords.length; idx++) {
    //spheres[idx] = UTILS.createSphereAtPoint(scene, vec3, 1, undefined, "red"); // Create and assign the new sphere

    UTILS.moveSphereToCoord(spheres[idx], cityCoords[idx]);

  }
}