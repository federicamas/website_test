import type {
  OklchColor,
  ObservedMetrics,
  PaletteSwatch,
  PaletteUsage,
  SeasonId,
} from "../types";
import { hexToOklch, oklchToHex, shiftOklch } from "./color";

type SeasonFamily = "spring" | "summer" | "autumn" | "winter";

type SeasonProfile = {
  id: SeasonId;
  label: string;
  family: SeasonFamily;
  centroid: ObservedMetrics;
  variant: {
    hueShift: number;
    lightnessShift: number;
    chromaShift: number;
    contrastBias: number;
  };
  copy: {
    fit: string;
    wear: string;
    avoid: string;
  };
};

type SwatchSeed = {
  name: string;
  hex: `#${string}`;
};

type FamilyPaletteSeed = Record<PaletteUsage, SwatchSeed[]>;

const familySeeds: Record<SeasonFamily, FamilyPaletteSeed> = {
  spring: {
    neutral: [
      { name: "Ivory Veil", hex: "#f6efdf" },
      { name: "Oat Silk", hex: "#e7dac2" },
      { name: "Warm Sand", hex: "#cfb496" },
      { name: "Honey Taupe", hex: "#ac8a6f" },
      { name: "Light Cocoa", hex: "#7e5e48" }
    ],
    signature: [
      { name: "Peach Bloom", hex: "#f6b483" },
      { name: "Apricot Sorbet", hex: "#f3a56b" },
      { name: "Marigold", hex: "#e7bb34" },
      { name: "Apple Leaf", hex: "#8fb458" },
      { name: "Lagoon Mint", hex: "#7cd7c3" },
      { name: "Clear Turquoise", hex: "#3ec7c9" },
      { name: "Warm Coral", hex: "#f37062" },
      { name: "Poppy Petal", hex: "#ec5b48" }
    ],
    accent: [
      { name: "Tangerine Flash", hex: "#f96d22" },
      { name: "Lime Pop", hex: "#b6cf2c" },
      { name: "Geranium", hex: "#ff5c5c" },
      { name: "Tropical Teal", hex: "#00a9ad" }
    ],
    metal: [
      { name: "Polished Gold", hex: "#d3ab47" },
      { name: "Light Bronze", hex: "#a8743f" }
    ],
    avoid: [
      { name: "Icy Blue", hex: "#bdd6f7" },
      { name: "Dusty Mauve", hex: "#a68ea3" },
      { name: "Blue Charcoal", hex: "#41515f" },
      { name: "Wine Night", hex: "#5d3141" }
    ]
  },
  summer: {
    neutral: [
      { name: "Soft White", hex: "#f2f0ee" },
      { name: "Dove Grey", hex: "#d5d3d5" },
      { name: "Rose Beige", hex: "#c4b3ae" },
      { name: "Mushroom", hex: "#988884" },
      { name: "Blue Navy", hex: "#536479" }
    ],
    signature: [
      { name: "Powder Blue", hex: "#a6c4dd" },
      { name: "Cornflower Mist", hex: "#7d99c8" },
      { name: "Seafoam", hex: "#a5c8ba" },
      { name: "Sage Haze", hex: "#93a78a" },
      { name: "Dusty Rose", hex: "#c79099" },
      { name: "Berry Soft", hex: "#b56d82" },
      { name: "Lavender Haze", hex: "#b7a6d0" },
      { name: "Periwinkle", hex: "#8b90d7" }
    ],
    accent: [
      { name: "Orchid Note", hex: "#9160b4" },
      { name: "Plum Cloud", hex: "#7f5b75" },
      { name: "Harbor Teal", hex: "#4d8c8a" },
      { name: "Raspberry Cool", hex: "#a34264" }
    ],
    metal: [
      { name: "Brushed Silver", hex: "#c2c5cb" },
      { name: "Pewter", hex: "#8d8f96" }
    ],
    avoid: [
      { name: "Golden Mustard", hex: "#c7981a" },
      { name: "Orange Peel", hex: "#ea6b1f" },
      { name: "Acid Lime", hex: "#bccf00" },
      { name: "Jet Black", hex: "#151617" }
    ]
  },
  autumn: {
    neutral: [
      { name: "Cream", hex: "#f2e0c0" },
      { name: "Camel Drift", hex: "#cbab77" },
      { name: "Warm Stone", hex: "#9e7f61" },
      { name: "Olive Bark", hex: "#6f6847" },
      { name: "Espresso", hex: "#4c352b" }
    ],
    signature: [
      { name: "Terracotta", hex: "#c96c4a" },
      { name: "Paprika", hex: "#a94e34" },
      { name: "Ochre", hex: "#b59029" },
      { name: "Moss", hex: "#6f7f34" },
      { name: "Forest Pine", hex: "#325445" },
      { name: "Petrol", hex: "#35616b" },
      { name: "Aubergine", hex: "#644557" },
      { name: "Cinnamon", hex: "#90533e" }
    ],
    accent: [
      { name: "Burnt Orange", hex: "#c9561d" },
      { name: "Copper Clay", hex: "#b1643e" },
      { name: "Deep Teal", hex: "#0b6f73" },
      { name: "Golden Olive", hex: "#8e8a19" }
    ],
    metal: [
      { name: "Antique Gold", hex: "#b48b3c" },
      { name: "Copper", hex: "#ad6a43" }
    ],
    avoid: [
      { name: "Blue White", hex: "#f3f8ff" },
      { name: "Icy Pink", hex: "#f6c9dd" },
      { name: "Electric Cobalt", hex: "#3657e5" },
      { name: "Neon Fuchsia", hex: "#f2399b" }
    ]
  },
  winter: {
    neutral: [
      { name: "Snow", hex: "#f7f7f7" },
      { name: "Cool Taupe", hex: "#b0a6aa" },
      { name: "Graphite", hex: "#59515c" },
      { name: "Ink Navy", hex: "#1e2d47" },
      { name: "Black Cherry", hex: "#271321" }
    ],
    signature: [
      { name: "True Red", hex: "#c31b32" },
      { name: "Ruby", hex: "#aa193f" },
      { name: "Emerald", hex: "#0a8f6b" },
      { name: "Cobalt", hex: "#2356d8" },
      { name: "Magenta", hex: "#c01f7a" },
      { name: "Royal Purple", hex: "#6045b8" },
      { name: "Iced Pink", hex: "#f4b8d8" },
      { name: "Pine Shadow", hex: "#14504b" }
    ],
    accent: [
      { name: "Electric Blue", hex: "#0077ff" },
      { name: "Fuchsia Beam", hex: "#ef2b9c" },
      { name: "Icy Lemon", hex: "#ebef9b" },
      { name: "Cherry Flame", hex: "#e22735" }
    ],
    metal: [
      { name: "Silver Chrome", hex: "#d1d6dc" },
      { name: "Gunmetal", hex: "#777f89" }
    ],
    avoid: [
      { name: "Warm Beige", hex: "#dbc79f" },
      { name: "Mustard Clay", hex: "#b48822" },
      { name: "Muted Peach", hex: "#d89f8e" },
      { name: "Dusty Olive", hex: "#857d52" }
    ]
  }
};

export const SEASON_PROFILES: Record<SeasonId, SeasonProfile> = {
  "bright-spring": {
    id: "bright-spring",
    label: "Bright Spring",
    family: "spring",
    centroid: { temperature: 0.78, value: 0.73, chroma: 0.84, contrast: 0.66 },
    variant: { hueShift: 8, lightnessShift: 0.01, chromaShift: 0.03, contrastBias: 0.04 },
    copy: {
      fit: "Bright Spring sits at the warm, lively edge of the Spring family. It thrives on clear color and visible freshness.",
      wear: "Reach for crisp warm brights, polished light neutrals, and vivid aquatic tones near the face.",
      avoid: "Skip smoky cool colors and dusty dark shades when they sit close to your complexion."
    }
  },
  "true-spring": {
    id: "true-spring",
    label: "True Spring",
    family: "spring",
    centroid: { temperature: 0.95, value: 0.68, chroma: 0.75, contrast: 0.54 },
    variant: { hueShift: 2, lightnessShift: 0, chromaShift: 0.01, contrastBias: 0.01 },
    copy: {
      fit: "True Spring is the warmest Spring season, with golden clarity and a naturally sunny temperature.",
      wear: "Lean into clean warm shades, golden neutrals, and cheerful color that stays fresh instead of muted.",
      avoid: "Avoid blue-heavy cool shades and anything too greyed-out around the face."
    }
  },
  "light-spring": {
    id: "light-spring",
    label: "Light Spring",
    family: "spring",
    centroid: { temperature: 0.72, value: 0.85, chroma: 0.62, contrast: 0.38 },
    variant: { hueShift: -4, lightnessShift: 0.07, chromaShift: -0.02, contrastBias: -0.05 },
    copy: {
      fit: "Light Spring blends Spring warmth with a notably airy, delicate value range.",
      wear: "Favor pale warm lights, soft-clear pastels, and breezy golden neutrals.",
      avoid: "Avoid anything dense, heavy, or dramatically cool near the face."
    }
  },
  "light-summer": {
    id: "light-summer",
    label: "Light Summer",
    family: "summer",
    centroid: { temperature: -0.62, value: 0.84, chroma: 0.36, contrast: 0.34 },
    variant: { hueShift: -5, lightnessShift: 0.08, chromaShift: -0.01, contrastBias: -0.04 },
    copy: {
      fit: "Light Summer has Summer coolness but keeps a soft, luminous lightness throughout the palette.",
      wear: "Use airy cool pastels, powdery blues, and quiet rose-beige neutrals.",
      avoid: "Steer away from hot warm pigments and heavy black contrast near the face."
    }
  },
  "true-summer": {
    id: "true-summer",
    label: "True Summer",
    family: "summer",
    centroid: { temperature: -0.95, value: 0.72, chroma: 0.28, contrast: 0.36 },
    variant: { hueShift: -2, lightnessShift: 0, chromaShift: -0.03, contrastBias: -0.01 },
    copy: {
      fit: "True Summer is the coolest Summer season, defined by softness, refinement, and a blue-based calm.",
      wear: "Choose cool muted shades, misty blues, soft berry tones, and gentle greys.",
      avoid: "Skip yellow-heavy warmth, electric brights, and starkly dark accents around the face."
    }
  },
  "soft-summer": {
    id: "soft-summer",
    label: "Soft Summer",
    family: "summer",
    centroid: { temperature: -0.56, value: 0.65, chroma: 0.2, contrast: 0.24 },
    variant: { hueShift: 3, lightnessShift: -0.02, chromaShift: -0.05, contrastBias: -0.06 },
    copy: {
      fit: "Soft Summer sits where Summer drifts toward Autumn, keeping coolness while reducing saturation even further.",
      wear: "Favor smoky cool mid-tones, brushed neutrals, and low-contrast combinations.",
      avoid: "Avoid sharp primary color, very warm earth tones, and icy black-white contrast."
    }
  },
  "soft-autumn": {
    id: "soft-autumn",
    label: "Soft Autumn",
    family: "autumn",
    centroid: { temperature: 0.56, value: 0.58, chroma: 0.22, contrast: 0.26 },
    variant: { hueShift: -3, lightnessShift: 0.01, chromaShift: -0.04, contrastBias: -0.05 },
    copy: {
      fit: "Soft Autumn softens Autumn warmth into a muted, blended palette with gentle depth.",
      wear: "Use toned earth colors, olive-based neutrals, and softly warm combinations.",
      avoid: "Skip icy brightness, blue-white contrast, and ultra-clear jewel tones near the face."
    }
  },
  "true-autumn": {
    id: "true-autumn",
    label: "True Autumn",
    family: "autumn",
    centroid: { temperature: 0.95, value: 0.46, chroma: 0.31, contrast: 0.34 },
    variant: { hueShift: 1, lightnessShift: -0.02, chromaShift: 0, contrastBias: -0.01 },
    copy: {
      fit: "True Autumn is the warmest Autumn season, anchored by golden undertone and muted depth.",
      wear: "Reach for rich earthy shades, golden olives, cinnamon browns, and textured warmth.",
      avoid: "Avoid blue-based cools, icy pastels, and hard optical contrast close to your face."
    }
  },
  "dark-autumn": {
    id: "dark-autumn",
    label: "Dark Autumn",
    family: "autumn",
    centroid: { temperature: 0.68, value: 0.3, chroma: 0.4, contrast: 0.62 },
    variant: { hueShift: 6, lightnessShift: -0.08, chromaShift: 0.03, contrastBias: 0.06 },
    copy: {
      fit: "Dark Autumn blends Autumn warmth with Winter depth, creating a dramatic but still earthy palette.",
      wear: "Use deep warm neutrals, saturated forest tones, aubergine, and dense teal.",
      avoid: "Avoid chalky cool pastels and thin, dusty colors that cannot support your depth."
    }
  },
  "dark-winter": {
    id: "dark-winter",
    label: "Dark Winter",
    family: "winter",
    centroid: { temperature: -0.68, value: 0.28, chroma: 0.72, contrast: 0.76 },
    variant: { hueShift: -4, lightnessShift: -0.06, chromaShift: 0.02, contrastBias: 0.05 },
    copy: {
      fit: "Dark Winter pairs Winter coolness with substantial depth and naturally strong contrast.",
      wear: "Favor inky neutrals, jewel tones, and cool dramatic color stories with real weight.",
      avoid: "Avoid faded warm earth tones and powdery pastels that flatten your contrast."
    }
  },
  "true-winter": {
    id: "true-winter",
    label: "True Winter",
    family: "winter",
    centroid: { temperature: -0.98, value: 0.38, chroma: 0.88, contrast: 0.82 },
    variant: { hueShift: -1, lightnessShift: 0, chromaShift: 0.04, contrastBias: 0.03 },
    copy: {
      fit: "True Winter is the coolest Winter season, carrying crisp intensity and unmistakable clarity.",
      wear: "Wear blue-based brights, icy lights, black-and-white contrast, and clear jewel tones.",
      avoid: "Avoid muted warmth, dusty mid-tones, and softened earthy colors near the face."
    }
  },
  "bright-winter": {
    id: "bright-winter",
    label: "Bright Winter",
    family: "winter",
    centroid: { temperature: -0.8, value: 0.5, chroma: 0.94, contrast: 0.88 },
    variant: { hueShift: 5, lightnessShift: 0.03, chromaShift: 0.06, contrastBias: 0.06 },
    copy: {
      fit: "Bright Winter sits where Winter meets Spring, keeping coolness while pushing clarity to the front.",
      wear: "Choose high-impact cool brights, icy accents, and polished contrast with sharp definition.",
      avoid: "Avoid muddy softness, muted beige, and low-energy earthy shades around the face."
    }
  }
};

const adjustSeed = (
  seed: SwatchSeed,
  usage: PaletteUsage,
  profile: SeasonProfile,
  metrics: ObservedMetrics,
): PaletteSwatch => {
  const base = hexToOklch(seed.hex);
  const centroid = profile.centroid;
  const tempDrift = (metrics.temperature - centroid.temperature) * 8;
  const valueDrift = (metrics.value - centroid.value) * 0.09;
  const chromaDrift = (metrics.chroma - centroid.chroma) * 0.07;
  const contrastLift =
    (metrics.contrast - centroid.contrast + profile.variant.contrastBias) * 0.02;

  const usageAdjustments: Record<PaletteUsage, Partial<OklchColor>> = {
    neutral: { c: chromaDrift * 0.2 - 0.01, l: valueDrift + contrastLift * 0.5 },
    signature: {
      c: chromaDrift + profile.variant.chromaShift,
      l: valueDrift + profile.variant.lightnessShift,
      h: tempDrift + profile.variant.hueShift,
    },
    accent: {
      c: chromaDrift + profile.variant.chromaShift + 0.015,
      l: valueDrift * 0.5 + profile.variant.lightnessShift,
      h: tempDrift + profile.variant.hueShift * 1.2,
    },
    metal: {
      c: chromaDrift * 0.25,
      l: valueDrift * 0.4,
      h: tempDrift * 0.35 + profile.variant.hueShift * 0.2,
    },
    avoid: { c: 0, l: 0, h: profile.variant.hueShift * -0.35 },
  };

  const personalized = shiftOklch(base, usageAdjustments[usage]);

  return {
    name: seed.name,
    usage,
    oklch: personalized,
    hex: oklchToHex(personalized),
  };
};

export const generatePalette = (seasonId: SeasonId, metrics: ObservedMetrics) => {
  const profile = SEASON_PROFILES[seasonId];
  const seed = familySeeds[profile.family];

  return {
    neutral: seed.neutral.map((entry) => adjustSeed(entry, "neutral", profile, metrics)),
    signature: seed.signature.map((entry) =>
      adjustSeed(entry, "signature", profile, metrics),
    ),
    accent: seed.accent.map((entry) => adjustSeed(entry, "accent", profile, metrics)),
    metal: seed.metal.map((entry) => adjustSeed(entry, "metal", profile, metrics)),
    avoid: seed.avoid.map((entry) => adjustSeed(entry, "avoid", profile, metrics)),
  };
};

export const SEASON_ORDER = Object.keys(SEASON_PROFILES) as SeasonId[];

export const getSeasonLabel = (seasonId: SeasonId) => SEASON_PROFILES[seasonId].label;
