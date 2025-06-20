export function randomFromSeed(seed, min, max){
  // Assume range of seed is larger than min and max
  return min + (seed % (max - min + 1));
}

export function degToRad(degrees) {
  return degrees * (Math.PI / 180);
}