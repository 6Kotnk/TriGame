export {Guess};

const R = 6371;  // Earth's radius in kilometers

class Guess {
  constructor() {
    this.cities = [];
    for (let i = 0; i < 3; i++) {
      this.cities.push({ name: "", coords: [0, 0] });
    }
    this.colors = {
      verts: "white",
      edges: "white",
      fill: "cyan",
    };
    this.area = null;
  }

  degToRad(degrees) {
    return degrees * (Math.PI / 180);
  }

  setCoords(coordsArray) {
    for (let index = 0; index < this.cities.length; index++) {
      this.cities[index].coords = [...coordsArray[index]];
    }
    const areaInMetersSquared = this.sphericalTriangleArea(coordsArray);
    this.area = (areaInMetersSquared / 1e6).toFixed(2);
  }

  getCoords() {
    return this.cities.map(city => [...city.coords]);
  }

  setNames(namesArray) {
    for (let index = 0; index < this.cities.length; index++) {
      this.cities[index].name = String(namesArray[index]);
    }
  }

  getNames() {
    return this.cities.map(city => city.name);
  }

  sort() {
    this.cities.sort((a, b) => a.name.localeCompare(b.name));
  }

  getArea() {
    return this.area;
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

  isEquivalentTo(other) {
    for (let index = 0; index < this.cities.length; index++) {
      if (this.cities[index].name !== other.cities[index].name) {
        return false;
      }
    }
    return true;
  }

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