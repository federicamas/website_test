import type {
  AnalysisResult,
  AnalysisTraits,
  FeatureSelection,
  ObservedMetrics,
  SeasonId,
} from "../types";
import { average, hexToOklch, pairwiseSpread, warmnessFromOklch } from "./color";
import { snapToHumanFeatureColor } from "./humanColors";
import { SEASON_MUSES, snapToHumanEyeColor } from "./muses";
import { generatePalette, getSeasonLabel, SEASON_ORDER, SEASON_PROFILES } from "./seasons";

const FEATURE_WEIGHTS = {
  skin: 0.5,
  hair: 0.3,
  eyes: 0.2,
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

  return (
    Math.abs(left.l - right.l) * 2.6 +
    Math.abs(left.c - right.c) * 5.2 +
    hueDistance(left.h, right.h) * 0.8
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

  const rawContrast = average([
    Math.abs(skin.l - hair.l),
    Math.abs(skin.l - eyes.l),
    Math.abs(hair.l - eyes.l),
  ]);

  const contrast = Math.min(
    1,
    Math.max(pairwiseSpread([skin.l, hair.l, eyes.l]), rawContrast * 1.6),
  );

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

const classifyTraits = (metrics: ObservedMetrics): AnalysisTraits => ({
  undertone:
    metrics.temperature >= 0.42
      ? "warm"
      : metrics.temperature >= 0
        ? "neutral-warm"
        : metrics.temperature <= -0.42
          ? "cool"
          : "neutral-cool",
  depth: metrics.value >= 0.7 ? "light" : metrics.value <= 0.42 ? "deep" : "medium",
  clarity: metrics.chroma >= 0.62 ? "bright" : metrics.chroma <= 0.3 ? "soft" : "balanced",
  contrast: metrics.contrast >= 0.62 ? "high" : metrics.contrast <= 0.34 ? "low" : "medium-high",
});

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
  const confidence = Math.max(
    0.3,
    Math.min(0.97, 0.58 + (scored[0].score - scored[1].score) * 0.7 + scored[0].score * 0.08),
  );
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
