/**
 * Tier 1 Optimization Validation Script
 * Tests whether the improved algorithm correctly classifies reference muses into their own seasons
 */

import { analyzeSelection } from "./src/lib/analyze";
import { SEASON_MUSES } from "./src/lib/muses";
import { getSeasonLabel, SEASON_ORDER } from "./src/lib/seasons";

console.log("=".repeat(70));
console.log("TIER 1 OPTIMIZATION VALIDATION");
console.log("Testing if algorithm correctly classifies reference muses");
console.log("=".repeat(70));

let correctClassifications = 0;
let totalTests = 0;

// Test each muse against the algorithm
SEASON_ORDER.forEach((expectedSeasonId) => {
  const muse = SEASON_MUSES[expectedSeasonId];
  const result = analyzeSelection(muse.selection);
  const isCorrect = result.primarySeason === expectedSeasonId;
  
  totalTests++;
  if (isCorrect) correctClassifications++;

  const status = isCorrect ? "✓" : "✗";
  console.log(`\n${status} ${getSeasonLabel(expectedSeasonId)}`);
  console.log(`  Muse: ${muse.name} (${muse.title})`);
  console.log(`  Expected: ${expectedSeasonId}`);
  console.log(`  Got: ${result.primarySeason} (${getSeasonLabel(result.primarySeason)})`);
  console.log(`  Confidence: ${(result.confidence * 100).toFixed(1)}%`);
  console.log(`  Traits: ${result.traits.undertone}, ${result.traits.depth}, ${result.traits.clarity}, ${result.traits.contrast}`);
  
  if (!isCorrect) {
    console.log(`  Adjacent: ${getSeasonLabel(result.adjacentSeason)}`);
  }
});

console.log("\n" + "=".repeat(70));
console.log(`RESULTS: ${correctClassifications}/${totalTests} muses correctly classified`);
console.log(`Accuracy: ${((correctClassifications / totalTests) * 100).toFixed(1)}%`);
console.log("=".repeat(70));

if (correctClassifications === totalTests) {
  console.log("\n✓ All muses correctly classified! Tier 1 optimization successful.");
} else {
  console.log(`\n⚠ ${totalTests - correctClassifications} muse(s) misclassified. Fine-tuning needed.`);
}
