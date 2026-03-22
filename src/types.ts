export type Hex = `#${string}`;

export type FeatureKey = "hair" | "skin" | "eyes";

export type FeatureSelection = {
  hair: Hex;
  skin: Hex;
  eyes: Hex;
};

export type PortraitStudyId = "spring" | "summer" | "autumn" | "winter";

export type SeasonId =
  | "bright-spring"
  | "true-spring"
  | "light-spring"
  | "light-summer"
  | "true-summer"
  | "soft-summer"
  | "soft-autumn"
  | "true-autumn"
  | "dark-autumn"
  | "dark-winter"
  | "true-winter"
  | "bright-winter";

export type AnalysisTraits = {
  undertone: "warm" | "neutral-warm" | "neutral-cool" | "cool";
  depth: "light" | "medium" | "deep";
  clarity: "bright" | "balanced" | "soft";
  contrast: "low" | "medium-high" | "high";
};

export type OklchColor = {
  l: number;
  c: number;
  h: number;
};

export type PaletteUsage =
  | "neutral"
  | "signature"
  | "accent"
  | "metal"
  | "avoid";

export type PaletteSwatch = {
  name: string;
  hex: Hex;
  oklch: OklchColor;
  usage: PaletteUsage;
};

export type AnalysisResult = {
  primarySeason: SeasonId;
  adjacentSeason: SeasonId;
  confidence: number;
  traits: AnalysisTraits;
  palette: Record<PaletteUsage, PaletteSwatch[]>;
  explanation: {
    whyItFits: string;
    wearMoreOften: string;
    avoidNearFace: string;
  };
};

export type ObservedMetrics = {
  temperature: number;
  value: number;
  chroma: number;
  contrast: number;
};
