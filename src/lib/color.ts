import type { Hex, OklchColor } from "../types";

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const normalizeHue = (hue: number) => {
  const normalized = hue % 360;
  return normalized < 0 ? normalized + 360 : normalized;
};

type Rgb = { r: number; g: number; b: number };
type Oklab = { l: number; a: number; b: number };

export const hexToRgb = (hex: Hex): Rgb => {
  const cleaned = hex.replace("#", "");
  const normalized =
    cleaned.length === 3
      ? cleaned
          .split("")
          .map((char) => `${char}${char}`)
          .join("")
      : cleaned;

  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    throw new Error(`Invalid hex color: ${hex}`);
  }

  return {
    r: parseInt(normalized.slice(0, 2), 16) / 255,
    g: parseInt(normalized.slice(2, 4), 16) / 255,
    b: parseInt(normalized.slice(4, 6), 16) / 255,
  };
};

export const rgbToHex = ({ r, g, b }: Rgb): Hex => {
  const toChannel = (value: number) =>
    Math.round(clamp(value, 0, 1) * 255)
      .toString(16)
      .padStart(2, "0");

  return `#${toChannel(r)}${toChannel(g)}${toChannel(b)}` as Hex;
};

const srgbToLinear = (channel: number) =>
  channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;

const linearToSrgb = (channel: number) =>
  channel <= 0.0031308
    ? channel * 12.92
    : 1.055 * channel ** (1 / 2.4) - 0.055;

export const rgbToOklab = ({ r, g, b }: Rgb): Oklab => {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);

  const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;

  const lRoot = Math.cbrt(l);
  const mRoot = Math.cbrt(m);
  const sRoot = Math.cbrt(s);

  return {
    l: 0.2104542553 * lRoot + 0.793617785 * mRoot - 0.0040720468 * sRoot,
    a: 1.9779984951 * lRoot - 2.428592205 * mRoot + 0.4505937099 * sRoot,
    b: 0.0259040371 * lRoot + 0.7827717662 * mRoot - 0.808675766 * sRoot,
  };
};

export const oklabToRgb = ({ l, a, b }: Oklab): Rgb => {
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b;

  const lCube = l_ ** 3;
  const mCube = m_ ** 3;
  const sCube = s_ ** 3;

  const lr =
    4.0767416621 * lCube - 3.3077115913 * mCube + 0.2309699292 * sCube;
  const lg =
    -1.2684380046 * lCube + 2.6097574011 * mCube - 0.3413193965 * sCube;
  const lb =
    -0.0041960863 * lCube - 0.7034186147 * mCube + 1.707614701 * sCube;

  return {
    r: clamp(linearToSrgb(lr), 0, 1),
    g: clamp(linearToSrgb(lg), 0, 1),
    b: clamp(linearToSrgb(lb), 0, 1),
  };
};

export const oklabToOklch = ({ l, a, b }: Oklab): OklchColor => {
  const c = Math.sqrt(a * a + b * b);
  const h = normalizeHue((Math.atan2(b, a) * 180) / Math.PI);
  return { l, c, h };
};

export const oklchToOklab = ({ l, c, h }: OklchColor): Oklab => {
  const hueRadians = (normalizeHue(h) * Math.PI) / 180;
  return {
    l,
    a: c * Math.cos(hueRadians),
    b: c * Math.sin(hueRadians),
  };
};

export const hexToOklch = (hex: Hex) => oklabToOklch(rgbToOklab(hexToRgb(hex)));

export const oklchToHex = (oklch: OklchColor): Hex =>
  rgbToHex(oklabToRgb(oklchToOklab(oklch)));

export const shiftOklch = (
  color: OklchColor,
  adjustments: Partial<OklchColor>,
): OklchColor => ({
  l: clamp(color.l + (adjustments.l ?? 0), 0.03, 0.98),
  c: clamp(color.c + (adjustments.c ?? 0), 0, 0.37),
  h: normalizeHue(color.h + (adjustments.h ?? 0)),
});

export const warmnessFromOklch = (color: OklchColor) => {
  const lab = oklchToOklab(color);
  return clamp(lab.b / 0.18, -1, 1);
};

export const formatOklch = (color: OklchColor) =>
  `oklch(${(color.l * 100).toFixed(1)}% ${color.c.toFixed(3)} ${Math.round(
    normalizeHue(color.h),
  )})`;

export const average = (values: number[]) =>
  values.reduce((sum, value) => sum + value, 0) / values.length;

export const pairwiseSpread = (values: number[]) => {
  const min = Math.min(...values);
  const max = Math.max(...values);
  return max - min;
};
