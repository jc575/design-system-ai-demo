// Small color math helpers (OKLCH <-> sRGB, WCAG luminance). No dependencies.
export const toRad = (d) => (d * Math.PI) / 180;

export function oklchToLinear(L, C, hDeg) {
  const a = C * Math.cos(toRad(hDeg));
  const b = C * Math.sin(toRad(hDeg));
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}
export const luminanceOfLinear = ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
export const inGamut = (rgb, eps = 1e-4) => rgb.every((v) => v >= -eps && v <= 1 + eps);
const gamma = (v) => {
  const c = Math.min(1, Math.max(0, v));
  return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
};
export const linearToHex = (rgb) =>
  '#' + rgb.map((v) => Math.round(gamma(v) * 255).toString(16).padStart(2, '0')).join('');

export const hexLuminance = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((x) => {
    x /= 255;
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
export const contrast = (a, b) => {
  const [hi, lo] = [hexLuminance(a), hexLuminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

/** Find the colour at a given hue whose relative luminance equals targetY, with as much chroma as the sRGB gamut allows (capped at maxC). */
export function colorAtLuminance(targetY, hDeg, maxC) {
  const solveL = (C) => {
    let lo = 0, hi = 1;
    for (let i = 0; i < 40; i++) {
      const mid = (lo + hi) / 2;
      const y = luminanceOfLinear(oklchToLinear(mid, C, hDeg));
      if (y < targetY) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
  };
  let loC = 0, hiC = maxC;
  let L = solveL(hiC);
  if (inGamut(oklchToLinear(L, hiC, hDeg))) return { L, C: hiC, hex: linearToHex(oklchToLinear(L, hiC, hDeg)) };
  for (let i = 0; i < 30; i++) {
    const midC = (loC + hiC) / 2;
    const Lm = solveL(midC);
    if (inGamut(oklchToLinear(Lm, midC, hDeg))) loC = midC; else hiC = midC;
  }
  L = solveL(loC);
  return { L, C: loC, hex: linearToHex(oklchToLinear(L, loC, hDeg)) };
}
