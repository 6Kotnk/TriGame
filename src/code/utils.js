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
  
  // Create smooth gradient from green (0) to yellow (0.5) to red (1)
  let r, g, b;
  
  if (value <= 0.5) {
    // Green to yellow
    const t = value * 2; // 0 to 1
    r = Math.round(255 * t);  // 0 to 255
    g = 255;                  // constant 255
    b = 0;                    // constant 0
  } else {
    // Yellow to red
    const t = (value - 0.5) * 2; // 0 to 1
    r = 255;                     // constant 255
    g = Math.round(255 * (1 - t)); // 255 to 0
    b = 0;                       // constant 0
  }
  
  return `rgb(${r}, ${g}, ${b})`;
}

export function getAccuracyColor(guessArea, targetArea) {
  if (!targetArea) return 'rgb(128, 128, 128)'; // Gray for unknown
  
  const error = logDist(guessArea, targetArea);
  // Normalize error to 0-1 range for color function
  const normalizedError = Math.min(error, 1.0);
  
  return getColorFromValue(normalizedError);
}