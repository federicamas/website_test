import { describe, expect, it } from "vitest";
import {
  getHumanFeatureColorLabel,
  HUMAN_HAIR_COLORS,
  HUMAN_SKIN_COLORS,
  snapToHumanFeatureColor,
} from "./humanColors";

const HAIR_SWATCHES = new Set(HUMAN_HAIR_COLORS.map((option) => option.hex));
const SKIN_SWATCHES = new Set(HUMAN_SKIN_COLORS.map((option) => option.hex));

describe("snapToHumanFeatureColor", () => {
  it("reduces vivid hair picks to one of the curated human hair swatches", () => {
    const snapped = snapToHumanFeatureColor("hair", "#00ff00");

    expect(HAIR_SWATCHES.has(snapped)).toBe(true);
  });

  it("reduces extreme skin picks to one of the curated human skin swatches", () => {
    const snapped = snapToHumanFeatureColor("skin", "#275bff");

    expect(SKIN_SWATCHES.has(snapped)).toBe(true);
  });

  it("returns readable labels for curated human feature swatches", () => {
    expect(getHumanFeatureColorLabel("hair", "#241a1b")).toBe("Soft Black");
    expect(getHumanFeatureColorLabel("skin", "#8d5b3d")).toBe("Rich Brown");
  });
});
