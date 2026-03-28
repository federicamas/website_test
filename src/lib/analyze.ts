import type {
  AnalysisResult,
  AnalysisTraits,
  FeatureSelection,
  ObservedMetrics,
  SeasonId,
} from "../types";
import { average, hexToOklch, pairwiseSpread, warmnessFromOklch, undertoneStrengthFromOklch, calculate3DContrast } from "./color";
import { snapToHumanFeatureColor } from "./humanColors";
import { SEASON_MUSES, snapToHumanEyeColor } from "./muses";
import { generatePalette, getSeasonLabel, SEASON_ORDER, SEASON_PROFILES } from "./seasons";

const FEATURE_WEIGHTS = {
  skin: 0.35,
  hair: 0.35,
  eyes: 0.30,
} as const;

const normalizeSelection = (selection: FeatureSelection): FeatureSelection => ({
  hair: snapToHumanFeatureColor("hair", selection.hair),
  skin: snapToHumanFeatureColor("skin", selection.skin),
  eyes: snapToHumanEyeColor(selection.eyes),
});

const weightedAverage = (pairs: Array<[number, number]>) => {
  const totalWeight = pairs.reduce((sum, [, weight]) => sum + weight, 0);
  return pairs.reduce((sum, [value, weight]) => sum + value * weight, 0) / totalWeight;
};

const hueDistance = (left: number, right: number) => {
  const delta = Math.abs(left - right) % 360;
  return Math.min(delta, 360 - delta) / 180;
};

const featureDistance = (leftHex: `#${string}`, rightHex: `#${string}`) => {
  const left = hexToOklch(leftHex);
  const right = hexToOklch(rightHex);

  // Improved perceptual distance with better undertone and hue handling
  const lightnessDiff = Math.abs(left.l - right.l);
  const chromaDiff = Math.abs(left.c - right.c);
  const hueDiff = hueDistance(left.h, right.h);

  // Extract undertone strength to separate base undertone from surface variation
  const leftUndertone = undertoneStrengthFromOklch(left);
  const rightUndertone = undertoneStrengthFromOklch(right);
  const undertoneStrengthDiff = Math.abs(leftUndertone - rightUndertone);

  // Higher saturation makes hue differences more perceptually relevant
  const avgChroma = (left.c + right.c) / 2;
  const hueWeight = 0.6 + avgChroma * 0.4; // Ranges from 0.6 to 1.0
  
  // Hue-lightness interaction: same hue difference is more noticeable in light colors
  const lightnessBoost = 1 + (Math.max(left.l, right.l) - 0.4) * 0.3;

  // Reduced quadratic penalty on chroma (was too harsh)
  // More linear approach: chromaDiff * 4.2 instead of chromaDiff² * 6.4
  return (
    lightnessDiff * 2.8 * lightnessBoost +
    chromaDiff * 4.2 +
    undertoneStrengthDiff * 3.5 +
    hueDiff * hueWeight * 1.1
  );
};

const SEASON_REFERENCE_SELECTIONS = Object.fromEntries(
  SEASON_ORDER.map((seasonId) => [seasonId, normalizeSelection(SEASON_MUSES[seasonId].selection)]),
) as Record<SeasonId, FeatureSelection>;

export const deriveMetrics = (selection: FeatureSelection): ObservedMetrics => {
  const normalizedSelection = normalizeSelection(selection);
  const skin = hexToOklch(normalizedSelection.skin);
  const hair = hexToOklch(normalizedSelection.hair);
  const eyes = hexToOklch(normalizedSelection.eyes);

  const temperature = weightedAverage([
    [warmnessFromOklch(skin), FEATURE_WEIGHTS.skin],
    [warmnessFromOklch(hair), FEATURE_WEIGHTS.hair],
    [warmnessFromOklch(eyes), FEATURE_WEIGHTS.eyes],
  ]);

  const value = weightedAverage([
    [skin.l, FEATURE_WEIGHTS.skin],
    [hair.l, FEATURE_WEIGHTS.hair],
    [eyes.l, FEATURE_WEIGHTS.eyes],
  ]);

  const chroma = weightedAverage([
    [skin.c / 0.24, FEATURE_WEIGHTS.skin],
    [hair.c / 0.24, FEATURE_WEIGHTS.hair],
    [eyes.c / 0.24, FEATURE_WEIGHTS.eyes],
  ]);

  // Improved 3D contrast: now measures across lightness, chroma, and hue
  const contrast3D = calculate3DContrast([skin, hair, eyes]);
  // Also keep some lightness-based contrast for backward compatibility with trait classification
  const lightnessContrast = Math.min(
    1,
    Math.max(pairwiseSpread([skin.l, hair.l, eyes.l]), average([
      Math.abs(skin.l - hair.l),
      Math.abs(skin.l - eyes.l),
      Math.abs(hair.l - eyes.l),
    ]) * 1.3),
  );
  
  // Blend 3D and lightness-based contrasts
  const contrast = (contrast3D * 0.5 + lightnessContrast * 0.5);

  return {
    temperature: Math.max(-1, Math.min(1, temperature)),
    value: Math.max(0, Math.min(1, value)),
    chroma: Math.max(0, Math.min(1, chroma)),
    contrast: Math.max(0, Math.min(1, contrast)),
  };
};

const scoreSeason = (seasonId: SeasonId, selection: FeatureSelection) => {
  const referenceSelection = SEASON_REFERENCE_SELECTIONS[seasonId];
  const distance = weightedAverage([
    [featureDistance(selection.skin, referenceSelection.skin), FEATURE_WEIGHTS.skin],
    [featureDistance(selection.hair, referenceSelection.hair), FEATURE_WEIGHTS.hair],
    [featureDistance(selection.eyes, referenceSelection.eyes), FEATURE_WEIGHTS.eyes],
  ]);

  return Math.max(0, 1 - distance);
};

const classifyTraits = (metrics: ObservedMetrics): AnalysisTraits => {
  // Improved thresholds calibrated with undertone-first approach
  // and 3D contrast measurement
  const undertone =
    metrics.temperature >= 0.35
      ? "warm"
      : metrics.temperature >= -0.10
        ? "neutral-warm"
        : metrics.temperature <= -0.40
          ? "cool"
          : "neutral-cool";

  // Depth boundaries: adjusted for better visual accuracy
  const depth = metrics.value >= 0.66 ? "light" : metrics.value <= 0.44 ? "deep" : "medium";

  // Clarity thresholds: refined for saturation perception with new 3D contrast
  const clarity = metrics.chroma >= 0.56 ? "bright" : metrics.chroma <= 0.33 ? "soft" : "balanced";

  // Contrast thresholds: adjusted for 3D contrast space
  const contrast = metrics.contrast >= 0.45 ? "high" : metrics.contrast <= 0.28 ? "low" : "medium-high";

  return { undertone, depth, clarity, contrast };
};

const createExplanation = (
  primary: SeasonId,
  adjacent: SeasonId,
  traits: AnalysisTraits,
) => {
  const primaryProfile = SEASON_PROFILES[primary];

  return {
    whyItFits: `You read as ${traits.undertone}, ${traits.depth}, and ${traits.clarity}, which places you closest to ${getSeasonLabel(
      primary,
    )}. ${primaryProfile.copy.fit} ${getSeasonLabel(
      adjacent,
    )} appears next because your coloring also brushes against that neighboring set of traits.`,
    wearMoreOften: primaryProfile.copy.wear,
    avoidNearFace: primaryProfile.copy.avoid,
  };
};

export const analyzeSelection = (selection: FeatureSelection): AnalysisResult => {
  const normalizedSelection = normalizeSelection(selection);
  const metrics = deriveMetrics(normalizedSelection);
  const scored = SEASON_ORDER
    .map((seasonId) => ({
      seasonId,
      score: scoreSeason(seasonId, normalizedSelection),
    }))
    .sort((a, b) => b.score - a.score);

  const primarySeason = scored[0].seasonId;
  const adjacentSeason = scored[1].seasonId;

  // More accurate confidence: accounts for score gaps and clustering
  const scoreDiff = scored[0].score - scored[1].score;
  const isClusteredResult = scored[2] && scored[0].score - scored[2].score < 0.14;
  const baseConfidence = 0.54 + scoreDiff * 0.82 + scored[0].score * 0.13;
  const adjustedConfidence = isClusteredResult ? baseConfidence * 0.82 : baseConfidence;
  const confidence = Math.max(0.32, Math.min(0.96, adjustedConfidence));
  const traits = classifyTraits(metrics);

  return {
    primarySeason,
    adjacentSeason,
    confidence,
    traits,
    palette: generatePalette(primarySeason, metrics),
    explanation: createExplanation(primarySeason, adjacentSeason, traits),
  };
};
