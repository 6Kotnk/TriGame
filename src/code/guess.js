import * as UTILS from './utils.js';
export {Guess};

// Earth's radius in kilometers. Used to calculate triangle area.
const R = 6371;  

class Guess {

  constructor() {
    this.cities = [];
    for (let idx = 0; idx < 3; idx++) {
      this.cities.push({ name: "", coords: [0, 0] });
    }
    this.colors = {
      verts: "white",
      edges: "white",
      fill: "cyan",
      outline: "pink",
    };
    this.area = null;
  }

  // Guess area has a constant dynamic range, so smaller areas need to be more precise to be exact.
  toFixedDynamicRange(number, dynamicRange = 10000) {
    if (number === 0) return "0";
    
    const absNumber = Math.abs(number);
    
    // Calculate rounding factor
    const factor = Math.max(1, dynamicRange / (10 * absNumber));
    
    // Round the number
    const rounded = Math.round(number * factor) / factor;
    
    // Calculate needed decimals
    const maxDecimals = Math.max(0, Math.ceil(Math.log10(factor)));
    
    let result = rounded.toFixed(maxDecimals);
    
    return result;
  }

  // Set the coords of the guess
  setCoords(coordsArray) {
    // Copy the coords
    for (let index = 0; index < this.cities.length; index++) {
      this.cities[index].coords = [...coordsArray[index]];
    }
    // Calculate area
    const areaInMetersSquared = this.sphericalTriangleArea(coordsArray);
    // Round, convert to millions
    this.area = this.toFixedDynamicRange(areaInMetersSquared / 1e6);
  }

  getCoords() {
    // Copy to array
    return this.cities.map(city => [...city.coords]);
  }

  setNames(namesArray) {
    // No need to copy explicitly, since we create a new object
    for (let index = 0; index < this.cities.length; index++) {
      // String form char array
      this.cities[index].name = String(namesArray[index]);
    }
  }

  getNames() {
    // Do not copy to array, leave as string
    return this.cities.map(city => city.name);
  }

  // Sort alphabetically
  sort() {
    this.cities.sort((a, b) => a.name.localeCompare(b.name));
  }

  getArea() {
    return this.area;
  }

  setColors(colors) {
    this.colors = colors;
  }

  // Get area of the spherical triangle
  sphericalTriangleArea(coords) {
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

  // Helper math function
  haversine(coord1, coord2) {
    const [lat1, lon1] = coord1;
    const [lat2, lon2] = coord2;
    const dLat = UTILS.degToRad(lat2 - lat1);
    const dLon = UTILS.degToRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(UTILS.degToRad(lat1)) * Math.cos(UTILS.degToRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  }

  // Check if two guesses are the same, assuming city names are sorted
  isEquivalentTo(other) {
    for (let index = 0; index < this.cities.length; index++) {
      if (this.cities[index].name !== other.cities[index].name) {
        return false;
      }
    }
    return true;
  }

  // Check if this guess is in list
  isInList(list) {
    for (let index = 0; index < list.length; index++) {
      const guessInList = list[index];
      if (this.isEquivalentTo(guessInList)) {
        return true;
      }
    }
    return false;
  }

}