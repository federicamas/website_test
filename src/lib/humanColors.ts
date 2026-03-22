import type { FeatureKey, Hex } from "../types";
import { hexToOklch } from "./color";

export type HumanFeatureColorKey = Exclude<FeatureKey, "eyes">;

export type HumanFeatureColor = {
  id: string;
  label: string;
  hex: Hex;
  note: string;
};

type HumanColorProfile = {
  lightness: [number, number];
  chroma: [number, number];
  hueRanges: Array<[number, number]>;
  neutralHueAnchor?: number;
  neutralHueThreshold?: number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const normalizeHue = (hue: number) => {
  const normalized = hue % 360;
  return normalized < 0 ? normalized + 360 : normalized;
};

const hueDistance = (left: number, right: number) => {
  const delta = Math.abs(normalizeHue(left) - normalizeHue(right)) % 360;
  return Math.min(delta, 360 - delta);
};

const isHueInRange = (hue: number, [start, end]: [number, number]) =>
  start <= end ? hue >= start && hue <= end : hue >= start || hue <= end;

const clampHueToRanges = (hue: number, ranges: Array<[number, number]>) => {
  const normalized = normalizeHue(hue);

  if (ranges.some((range) => isHueInRange(normalized, range))) {
    return normalized;
  }

  return ranges.reduce(
    (best, [start, end]) => {
      const candidates = [normalizeHue(start), normalizeHue(end)];

      return candidates.reduce((currentBest, candidate) => {
        const distance = hueDistance(normalized, candidate);
        return distance < currentBest.distance ? { distance, hue: candidate } : currentBest;
      }, best);
    },
    { distance: Number.POSITIVE_INFINITY, hue: normalized },
  ).hue;
};

const weightedHueDistance = (left: number, right: number) => {
  const delta = Math.abs(left - right) % 360;
  return Math.min(delta, 360 - delta) / 180;
};

export const HUMAN_FEATURE_COLOR_PROFILES: Record<HumanFeatureColorKey, HumanColorProfile> = {
  hair: {
    lightness: [0.05, 0.8],
    chroma: [0.008, 0.12],
    hueRanges: [
      [0, 78],
      [330, 360],
    ],
  },
  skin: {
    lightness: [0.24, 0.94],
    chroma: [0.015, 0.11],
    hueRanges: [[18, 85]],
    neutralHueAnchor: 50,
    neutralHueThreshold: 0.025,
  },
};

export const HUMAN_HAIR_COLORS: HumanFeatureColor[] = [
  { id: "soft-black", label: "Soft Black", hex: "#241a1b", note: "near-black brunette" },
  { id: "espresso", label: "Espresso", hex: "#382922", note: "very deep brown" },
  { id: "dark-brown", label: "Dark Brown", hex: "#4f3529", note: "rich brunette depth" },
  { id: "chestnut", label: "Chestnut", hex: "#7a5638", note: "warm medium brown" },
  { id: "ash-brown", label: "Ash Brown", hex: "#78665d", note: "cool smoky brown" },
  { id: "taupe-brown", label: "Taupe Brown", hex: "#80736d", note: "muted neutral brown" },
  { id: "dark-blonde", label: "Dark Blonde", hex: "#96714c", note: "golden dark blonde" },
  { id: "honey-blonde", label: "Honey Blonde", hex: "#b89266", note: "warm light blonde" },
];

export const HUMAN_SKIN_COLORS: HumanFeatureColor[] = [
  { id: "porcelain", label: "Porcelain", hex: "#f1d6c5", note: "very fair neutral skin" },
  { id: "fair-rose", label: "Fair Rose", hex: "#e4c6bb", note: "fair cool-beige skin" },
  { id: "light-beige", label: "Light Beige", hex: "#edd1ac", note: "light warm beige" },
  { id: "soft-beige", label: "Soft Beige", hex: "#ddb29f", note: "light-medium neutral skin" },
  { id: "golden-beige", label: "Golden Beige", hex: "#d5ab7f", note: "sunny beige" },
  { id: "honey", label: "Honey", hex: "#c89463", note: "medium warm golden skin" },
  { id: "amber", label: "Amber", hex: "#a07256", note: "tan warm brown" },
  { id: "rich-brown", label: "Rich Brown", hex: "#8d5b3d", note: "deep warm brown" },
];

const FEATURE_OPTIONS: Record<HumanFeatureColorKey, HumanFeatureColor[]> = {
  hair: HUMAN_HAIR_COLORS,
  skin: HUMAN_SKIN_COLORS,
};

export const snapToHumanFeatureColor = (feature: HumanFeatureColorKey, hex: Hex): Hex => {
  const candidate = hexToOklch(hex);
  const profile = HUMAN_FEATURE_COLOR_PROFILES[feature];
  const clamped = {
    l: clamp(candidate.l, ...profile.lightness),
    c: clamp(candidate.c, ...profile.chroma),
    h:
      profile.neutralHueAnchor !== undefined &&
      profile.neutralHueThreshold !== undefined &&
      candidate.c < profile.neutralHueThreshold
        ? profile.neutralHueAnchor
        : clampHueToRanges(candidate.h, profile.hueRanges),
  };

  return FEATURE_OPTIONS[feature].reduce(
    (best, option) => {
      const current = hexToOklch(option.hex);
      const distance =
        Math.abs(clamped.l - current.l) * 2.3 +
        Math.abs(clamped.c - current.c) * 4.8 +
        weightedHueDistance(clamped.h, current.h) * 0.7;

      return distance < best.distance ? { distance, hex: option.hex } : best;
    },
    { distance: Number.POSITIVE_INFINITY, hex: FEATURE_OPTIONS[feature][0].hex },
  ).hex;
};

export const getHumanFeatureColorLabel = (feature: HumanFeatureColorKey, hex: Hex) =>
  FEATURE_OPTIONS[feature].find((option) => option.hex.toLowerCase() === hex.toLowerCase())?.label ??
  (feature === "hair" ? "Human hair" : "Human skin");
