export function randomFromSeed(seed, min, max){
  // Assume range of seed is larger than min and max
  return min + (seed % (max - min + 1));
}

export function degToRad(degrees) {
  return degrees * (Math.PI / 180);
}

export function logDist(a, b = 1) {
  return Math.abs(Math.log10(a) - Math.log10(b));
}

export function getColorFromValue(value) {
  // Input: value from 0 (good/green) to 1 (bad/red)
  // Output: RGB color string
  
  if (value < 0 || value > 1) {
    return 'rgb(128, 128, 128)'; // Gray for invalid values
  }
  
  // Rotate through hues while keeping saturation and lightness constant
  // Green (120°) → Yellow (60°) → Red (0°)
  const hue = 120 - (value * 120); // 120° to 0°
  const saturation = 60; 
  const lightness = 50;  
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export function getAccuracyColor(guessArea, targetArea) {
  if (!targetArea) return 'rgb(128, 128, 128)'; // Gray for unknown
  
  const error = logDist(guessArea, targetArea);
  // Normalize error to 0-1 range for color function
  const normalizedError = Math.min(error, 1.0);
  
  return getColorFromValue(normalizedError);
}

export function SLERP(p, q, t) {
  const theta = p.angleTo(q);
  const sinTheta = Math.sin(theta);

  // Calculate the SLERP scale factors
  const scaleP = Math.sin((1 - t) * theta) / sinTheta;
  const scaleQ = Math.sin(t * theta) / sinTheta;

  // Calculate the interpolated vector by scaling and adding the input vectors
  const result = p.clone().multiplyScalar(scaleP).add(q.clone().multiplyScalar(scaleQ));

  return result;
}