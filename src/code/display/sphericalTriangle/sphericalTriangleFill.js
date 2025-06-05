import * as THREE from 'three';
import { PlanetLayer } from '../planetLayer';

export {SphericalTriangleFill};

const MAP_SCALE = 10;
const DIVS = 100;


class SphericalTriangleFill {

  constructor(scene, canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d');

    const map = new THREE.CanvasTexture(canvas);

    this.fillLayer = new PlanetLayer(scene, 1, 1, {
      map: map,
      transparent: true,
      opacity: 0.5,
    });

  }

  wrap360(value) {
    return ((value % 360) + 360) % 360;
  }
  
  toLatLon(vec, c_mer = 0) {
    const longitude = Math.PI - Math.atan2(vec.z,vec.x);
    const latitude =  Math.acos(vec.y);
  
    // Convert radians to degrees
    const longitudeDegrees = this.wrap360((longitude * 180 / Math.PI) - c_mer);
    const latitudeDegrees = latitude * 180 / Math.PI;
  
    return { longitude: longitudeDegrees, latitude: latitudeDegrees };
  }

  draw(vecs, color){
    let longitudes = [];

    vecs.forEach((vec, index) => {
      let { longitude: lon } = this.toLatLon(vec);
      longitudes[index] = lon;
    });
  
    let newCentralMeridian = (Math.min(...longitudes) + Math.max(...longitudes)) / 2;
    if((Math.max(...longitudes) - Math.min(...longitudes)) < 180)
    {
      newCentralMeridian -= 180;
    }
  
    let { longitude: curr_lon, latitude: curr_lat } = this.toLatLon(vecs[0], newCentralMeridian);
    let next_lon = 0;
    let next_lat = 0;
  
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  
    this.ctx.moveTo(curr_lon, curr_lat);
    this.ctx.beginPath();      // Start the path for the triangle
  
    let r = new THREE.Vector3();
  
    for (let idx = 0; idx < vecs.length; idx++) {
  
      let current_vec = vecs[idx];
      let next_vec = vecs[(idx + 1) % vecs.length];
  
      for (let t = 0; t < current_vec.angleTo(next_vec); t += 2*Math.PI/DIVS) {
        r = this.interpolateBetweenPoints(current_vec,next_vec,t);
        ({ longitude: next_lon, latitude: next_lat } = this.toLatLon(r, newCentralMeridian));
        this.drawLine(this.ctx, curr_lon, curr_lat, next_lon, next_lat)
        curr_lon = next_lon;
        curr_lat = next_lat;
      }
    }
  
    this.ctx.closePath();      // Close the path (draw line back to the first vertex)
    this.ctx.fillStyle = color; // Set the fill color
    this.ctx.fill();            // Fill the triangle

    const newMap = new THREE.CanvasTexture(this.canvas);
    const xOffset = (-newCentralMeridian) / 360;

    this.fillLayer.changeMap(newMap, xOffset)

  }

  interpolateBetweenPoints(point1, point2, t) {
  
    let n = new THREE.Vector3().crossVectors(point1, point2);
   
    let u = point1.clone();
    let v = new THREE.Vector3().crossVectors(n, u).normalize();
   
    let r = new THREE.Vector3();
    r = v.multiplyScalar(Math.sin(t)).add(u.multiplyScalar(Math.cos(t)));
    
    return r;
  }
  
  drawLine(ctx, curr_lon, curr_lat, next_lon, next_lat) {

    let map_dist_sqrd = (curr_lon - next_lon)**2 + (curr_lat - next_lat)**2;
    
    if(map_dist_sqrd > ((360 * MAP_SCALE / DIVS)**2) * 15) // One day actually calculate this
    {
      curr_lon -= 180;
      next_lon -= 180;
      curr_lat -= 90;
      next_lat -= 90;
      
      //interpolate crossing point
      let side_lon = Math.sign(curr_lon);
      let curr_delta = 180 - side_lon * curr_lon;
      let next_delta = 180 + side_lon * next_lon;
  
      let lon_delta = curr_delta + next_delta;
      let lat_delta = next_lat - curr_lat;
      let mid_point_lat = curr_lat + (lat_delta * (curr_delta/lon_delta));
  
      let side_lat = Math.sign(mid_point_lat);
  
      ctx.lineTo(MAP_SCALE*(side_lon *  180 + 180),MAP_SCALE*( mid_point_lat + 90));
      ctx.lineTo(MAP_SCALE*(side_lon *  180 + 180),MAP_SCALE*( side_lat * 90 + 90));
      ctx.lineTo(MAP_SCALE*(-side_lon * 180 + 180),MAP_SCALE*( side_lat * 90 + 90));
      ctx.lineTo(MAP_SCALE*(-side_lon * 180 + 180),MAP_SCALE*( mid_point_lat + 90));
  
      curr_lon += 180;
      next_lon += 180;
      curr_lat += 90;
      next_lat += 90;
    }
    
    ctx.lineTo(next_lon*MAP_SCALE, next_lat*MAP_SCALE);
  }

}
