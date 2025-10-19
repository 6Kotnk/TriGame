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

function sigmoid(z) {
  return 1 / (1 + Math.exp(-z));
}

export function normalizeValue(value) {
  return 2 * (sigmoid(value) - 0.5);
}

export function getColorFromValue(value) {
  // value = 0 (good/green) → 1 (bad/red)
  // Define endpoints + midpoint in OkLab
  const okLabGreen  = { L: 0.75, a: -0.35, b:  0.25 };
  const okLabYellow = { L: 0.85, a:  0.05, b:  0.25 };
  const okLabRed    = { L: 0.70, a:  0.35, b:  0.15 };

  // Two-step interpolation: green→yellow→red
  let L, a, b;
  if (value < 0.5) {
    const t = value / 0.5; // 0 → 1
    L = okLabGreen.L + (okLabYellow.L - okLabGreen.L) * t;
    a = okLabGreen.a + (okLabYellow.a - okLabGreen.a) * t;
    b = okLabGreen.b + (okLabYellow.b - okLabGreen.b) * t;
  } else {
    const t = (value - 0.5) / 0.5; // 0 → 1
    L = okLabYellow.L + (okLabRed.L - okLabYellow.L) * t;
    a = okLabYellow.a + (okLabRed.a - okLabYellow.a) * t;
    b = okLabYellow.b + (okLabRed.b - okLabYellow.b) * t;
  }

  // Convert OkLab → sRGB
  const [red, green, blue] = oklabToSRGB(L, a, b);
  return `rgb(${Math.round(red * 255)}, ${Math.round(green * 255)}, ${Math.round(blue * 255)})`;
}

function oklabToSRGB(L, a, b) {
  // OkLab → linear sRGB → gamma-corrected sRGB
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;

  const r =  4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const b_ = -0.0045160939 * l - 0.0052021934 * m + 1.0101864085 * s;

  return [clamp(linearToSRGB(r)), clamp(linearToSRGB(g)), clamp(linearToSRGB(b_))];
}

function linearToSRGB(x) {
  return x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
}

function clamp(x) {
  return Math.min(1, Math.max(0, x));
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