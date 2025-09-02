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
    const toRad = d => d * Math.PI / 180;

    // great-circle distance in radians
    const arc = (p1, p2) => {
      const [lat1, lon1] = p1.map(toRad);
      const [lat2, lon2] = p2.map(toRad);
      const dLat = lat2 - lat1;
      const dLon = lon2 - lon1;
      const a = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2;
      return 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    };

    const a = arc(coords[0], coords[1]);
    const b = arc(coords[1], coords[2]);
    const c = arc(coords[2], coords[0]);

    const s = (a+b+c)/2;
    const t = Math.tan(s/2) * Math.tan((s-a)/2) * Math.tan((s-b)/2) * Math.tan((s-c)/2);
    const E = 4 * Math.atan(Math.sqrt(Math.max(0, t))); // max() to avoid tiny negative due to FP error

    return E * R * R; // in km²
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