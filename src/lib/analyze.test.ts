import { describe, expect, it } from "vitest";
import { analyzeSelection } from "./analyze";
import { snapToHumanFeatureColor } from "./humanColors";
import { SEASON_MUSES, snapToHumanEyeColor } from "./muses";
import { SEASON_ORDER } from "./seasons";
import type { FeatureSelection } from "../types";

const normalizeSelection = (selection: FeatureSelection): FeatureSelection => ({
  hair: snapToHumanFeatureColor("hair", selection.hair),
  skin: snapToHumanFeatureColor("skin", selection.skin),
  eyes: snapToHumanEyeColor(selection.eyes),
});

describe("analyzeSelection", () => {
  it("returns all palette groups with the expected counts", () => {
    const result = analyzeSelection({
      hair: "#5c4033",
      skin: "#d6a77a",
      eyes: "#57735d",
    });

    expect(result.palette.neutral).toHaveLength(5);
    expect(result.palette.signature).toHaveLength(8);
    expect(result.palette.accent).toHaveLength(4);
    expect(result.palette.metal).toHaveLength(2);
    expect(result.palette.avoid).toHaveLength(4);
  });

  it("maps each normalized season study back to its intended season", () => {
    for (const seasonId of SEASON_ORDER) {
      const selection = normalizeSelection(SEASON_MUSES[seasonId].selection);
      const result = analyzeSelection(selection);

      expect(result.primarySeason).toBe(seasonId);
    }
  });

  it("drops confidence for ambiguous near-neutral inputs", () => {
    const result = analyzeSelection({
      hair: "#7b726d",
      skin: "#b59484",
      eyes: "#7d7b74",
    });

    expect(result.confidence).toBeLessThan(0.8);
    expect(result.primarySeason).not.toBe(result.adjacentSeason);
  });
});
