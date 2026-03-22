import type { FeatureSelection, Hex, SeasonId } from "../types";
import { hexToOklch } from "./color";

export type HumanEyeColor = {
  id: string;
  label: string;
  hex: Hex;
  note: string;
};

export type SeasonMuse = {
  name: string;
  title: string;
  note: string;
  selection: FeatureSelection;
};

export const HUMAN_EYE_COLORS: HumanEyeColor[] = [
  { id: "mist-grey", label: "Mist Grey", hex: "#9aa1a1", note: "soft grey iris" },
  { id: "blue-grey", label: "Blue Grey", hex: "#8da0b0", note: "muted cool blue" },
  { id: "crystal-blue", label: "Crystal Blue", hex: "#6e92b8", note: "clear human blue" },
  { id: "sage-green", label: "Sage Green", hex: "#7b8d70", note: "greyed green" },
  { id: "olive-green", label: "Olive Green", hex: "#6c7348", note: "earthy green" },
  { id: "hazel", label: "Hazel", hex: "#8a6a42", note: "gold-green brown" },
  { id: "amber", label: "Amber", hex: "#a16b2f", note: "warm topaz amber" },
  { id: "light-brown", label: "Light Brown", hex: "#79553b", note: "warm medium brown" },
  { id: "deep-brown", label: "Deep Brown", hex: "#593e31", note: "rich brown" },
  { id: "espresso", label: "Espresso", hex: "#382922", note: "very deep brown" },
];

export const snapToHumanEyeColor = (hex: Hex): Hex => {
  const candidate = hexToOklch(hex);

  const hueDistance = (left: number, right: number) => {
    const delta = Math.abs(left - right) % 360;
    return Math.min(delta, 360 - delta) / 180;
  };

  return HUMAN_EYE_COLORS.reduce(
    (best, option) => {
      const current = hexToOklch(option.hex);
      const distance =
        Math.abs(candidate.l - current.l) * 2.2 +
        Math.abs(candidate.c - current.c) * 4.2 +
        hueDistance(candidate.h, current.h) * 0.6;

      return distance < best.distance ? { distance, hex: option.hex } : best;
    },
    { distance: Number.POSITIVE_INFINITY, hex: HUMAN_EYE_COLORS[0].hex },
  ).hex;
};

export const getEyeColorLabel = (hex: Hex) =>
  HUMAN_EYE_COLORS.find((option) => option.hex.toLowerCase() === hex.toLowerCase())?.label ??
  "Human iris";

export const SEASON_MUSES: Record<SeasonId, SeasonMuse> = {
  "bright-spring": {
    name: "Katherine Johnson",
    title: "Mathematician",
    note: "A bright, warm, high-clarity study with golden skin, dark espresso hair, and amber eyes.",
    selection: { hair: "#4f3529", skin: "#c89463", eyes: "#a16b2f" },
  },
  "true-spring": {
    name: "Jane Goodall",
    title: "Primatologist",
    note: "Warm Spring reference built around sunny skin, chestnut hair, and clear hazel eyes.",
    selection: { hair: "#7a5638", skin: "#d5ab7f", eyes: "#8a6a42" },
  },
  "light-spring": {
    name: "Rachel Carson",
    title: "Marine Biologist",
    note: "A lighter, airy Spring direction with soft golden beige skin and light warm brown contrast.",
    selection: { hair: "#96714c", skin: "#edd1ac", eyes: "#8a6a42" },
  },
  "light-summer": {
    name: "Ada Lovelace",
    title: "Mathematician",
    note: "A cool light palette study with gentle ash brown hair and blue-grey eyes.",
    selection: { hair: "#78665d", skin: "#e4c6bb", eyes: "#8da0b0" },
  },
  "true-summer": {
    name: "Rosalind Franklin",
    title: "Chemist",
    note: "Cool and refined: soft rosy skin, neutral taupe hair, and a steel blue iris.",
    selection: { hair: "#6c5f5c", skin: "#dcb6a8", eyes: "#6e92b8" },
  },
  "soft-summer": {
    name: "Barbara McClintock",
    title: "Geneticist",
    note: "A low-contrast, smoky Summer reference with muted taupe hair and sage-grey eyes.",
    selection: { hair: "#80736d", skin: "#cfae9c", eyes: "#7b8d70" },
  },
  "soft-autumn": {
    name: "Elinor Ostrom",
    title: "Economist",
    note: "Muted warmth, olive softness, and a blended hazel-to-sage relationship.",
    selection: { hair: "#6e5748", skin: "#c89a73", eyes: "#6c7348" },
  },
  "true-autumn": {
    name: "Wangari Maathai",
    title: "Biologist",
    note: "A warm, earthy Autumn study with rich brown depth and warm amber light in the iris.",
    selection: { hair: "#3f2a21", skin: "#8d5b3d", eyes: "#a16b2f" },
  },
  "dark-autumn": {
    name: "May-Britt Moser",
    title: "Neuroscientist",
    note: "Deep Autumn interpreted as dense brunette depth, grounded warmth, and dark brown eyes.",
    selection: { hair: "#34231d", skin: "#a07256", eyes: "#593e31" },
  },
  "dark-winter": {
    name: "Joan Robinson",
    title: "Economist",
    note: "An inky cool study with porcelain-to-olive coolness and very deep brown contrast.",
    selection: { hair: "#241a1b", skin: "#c59e94", eyes: "#382922" },
  },
  "true-winter": {
    name: "Marie Curie",
    title: "Physicist and Chemist",
    note: "True Winter here is crisp, cool, and high-contrast with dark hair and bright cool blue eyes.",
    selection: { hair: "#2d2329", skin: "#d8b4a4", eyes: "#6e92b8" },
  },
  "bright-winter": {
    name: "Esther Duflo",
    title: "Economist",
    note: "Bright Winter pushed toward sharp definition: cool skin, dark hair, and a clearer icy-blue iris.",
    selection: { hair: "#38272f", skin: "#ddb29f", eyes: "#8da0b0" },
  },
};
