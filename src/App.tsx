import { useMemo, useState } from "react";
import { MinimalFigure } from "./components/MinimalFigure";
import { analyzeSelection } from "./lib/analyze";
import { formatOklch } from "./lib/color";
import {
  getHumanFeatureColorLabel,
  HUMAN_HAIR_COLORS,
  HUMAN_SKIN_COLORS,
  snapToHumanFeatureColor,
} from "./lib/humanColors";
import {
  getEyeColorLabel,
  HUMAN_EYE_COLORS,
  SEASON_MUSES,
  snapToHumanEyeColor,
} from "./lib/muses";
import { getSeasonLabel, SEASON_ORDER } from "./lib/seasons";
import type {
  FeatureKey,
  FeatureSelection,
  Hex,
  PaletteUsage,
  PortraitStudyId,
  SeasonId,
} from "./types";
import styles from "./App.module.css";

const FEATURE_LABELS: Record<FeatureKey, string> = {
  hair: "Hair",
  skin: "Skin",
  eyes: "Eyes",
};

const FEATURE_HINTS: Record<FeatureKey, string> = {
  hair: "Built from common human hair shades. Manual edits snap to the nearest swatch.",
  skin: "Built from common human skin tones. Manual edits snap to the nearest swatch.",
  eyes: "Based on common human iris colors. Manual edits are rounded back to the nearest swatch.",
};

const FEATURE_PRESETS = {
  hair: HUMAN_HAIR_COLORS,
  skin: HUMAN_SKIN_COLORS,
  eyes: HUMAN_EYE_COLORS,
} satisfies Record<FeatureKey, Array<{ id: string; label: string; hex: Hex; note: string }>>;

const normalizeSelection = (selection: FeatureSelection): FeatureSelection => ({
  hair: snapToHumanFeatureColor("hair", selection.hair),
  skin: snapToHumanFeatureColor("skin", selection.skin),
  eyes: snapToHumanEyeColor(selection.eyes),
});

const DEFAULT_SELECTION: FeatureSelection = normalizeSelection({
  hair: "#5c4033",
  skin: "#d6a77a",
  eyes: "#57735d",
});

const SECTION_COPY: Record<PaletteUsage, string> = {
  neutral: "Five foundations for tailoring, basics, and high-repeat pieces.",
  signature: "Eight core shades that carry your season most clearly.",
  accent: "Four stronger notes for punctuation and statement dressing.",
  metal: "Two finish options for jewelry, hardware, and shine.",
  avoid: "Four colors to keep away from the face when possible.",
};

const SECTION_TITLES: Record<PaletteUsage, string> = {
  neutral: "Neutrals",
  signature: "Signature Colors",
  accent: "Accent Colors",
  metal: "Metals",
  avoid: "Avoid Near The Face",
};

const FEATURE_ORDER: FeatureKey[] = ["hair", "skin", "eyes"];
const DEFAULT_PORTRAIT_STUDY: PortraitStudyId = "autumn";

const selectionMatches = (left: FeatureSelection, right: FeatureSelection) =>
  left.hair === right.hair && left.skin === right.skin && left.eyes === right.eyes;

const getFeatureColorLabel = (feature: FeatureKey, hex: Hex) =>
  feature === "eyes" ? getEyeColorLabel(hex) : getHumanFeatureColorLabel(feature, hex);

function App() {
  const [selection, setSelection] = useState<FeatureSelection>(DEFAULT_SELECTION);
  const [activePopover, setActivePopover] = useState<{
    feature: FeatureKey;
    portraitId: PortraitStudyId;
  } | null>({ feature: "skin", portraitId: DEFAULT_PORTRAIT_STUDY });

  const result = useMemo(() => analyzeSelection(selection), [selection]);
  const featuredMuse = SEASON_MUSES[result.primarySeason];
  const activeMuseSeason = useMemo(
    () =>
      SEASON_ORDER.find((seasonId) =>
        selectionMatches(selection, normalizeSelection(SEASON_MUSES[seasonId].selection)),
      ) ?? null,
    [selection],
  );

  const handleChangeColor = (feature: FeatureKey, value: string) => {
    setSelection((current) => ({
      ...current,
      [feature]:
        feature === "eyes"
          ? snapToHumanEyeColor(value as Hex)
          : snapToHumanFeatureColor(feature, value as Hex),
    }));
  };

  const applySeasonMuse = (seasonId: SeasonId) => {
    setSelection(normalizeSelection(SEASON_MUSES[seasonId].selection));
    setActivePopover(null);
  };

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.hero}>
          <div>
            <h1>Fabi&apos;s Fashionist Fantasy</h1>
          </div>
          <div className={styles.heroCopy}>
            <p>
              Transforms your natural coloring into a clear, personalized guide for choosing
              clothing, tones, and combinations that enhance your style.
            </p>
            <div className={styles.heroMeta}>
              <span className={styles.tag}>12-season framework</span>
              <span className={styles.tag}>Human feature presets</span>
              <span className={styles.tag}>Photographic portrait references</span>
            </div>
          </div>
        </header>

        <main className={styles.mainGrid}>
          <section className={styles.studio}>
            <div className={styles.panel}>
              <MinimalFigure
                selection={selection}
                activePopover={activePopover}
                onToggleFeature={(feature, portraitId) =>
                  setActivePopover((current) =>
                    current?.feature === feature && current.portraitId === portraitId
                      ? null
                      : { feature, portraitId },
                  )
                }
                onChangeColor={handleChangeColor}
              />
            </div>

            <section className={`${styles.panel} ${styles.musePanel}`}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Season Studies</h3>
                <span className={styles.sectionHint}>
                  Editorial presets inspired by women in science and economics. Load one, then tune it.
                </span>
              </div>
              <div className={styles.museGrid}>
                {SEASON_ORDER.map((seasonId) => {
                  const muse = SEASON_MUSES[seasonId];
                  const normalizedMuseSelection = normalizeSelection(muse.selection);
                  const selected = activeMuseSeason === seasonId;
                  const suggested = result.primarySeason === seasonId;

                  return (
                    <button
                      key={seasonId}
                      type="button"
                      className={`${styles.museButton} ${selected ? styles.museButtonActive : ""}`}
                      aria-pressed={selected}
                      onClick={() => applySeasonMuse(seasonId)}
                    >
                      <span className={styles.museSeasonLine}>
                        <span className={styles.museSeason}>{getSeasonLabel(seasonId)}</span>
                        {suggested ? <span className={styles.museBadge}>Match</span> : null}
                      </span>
                      <span className={styles.museName}>{muse.name}</span>
                      <span className={styles.museRole}>{muse.title}</span>
                      <span className={styles.museSwatches} aria-hidden="true">
                        <span className={styles.museSwatch} style={{ background: normalizedMuseSelection.hair }} />
                        <span className={styles.museSwatch} style={{ background: normalizedMuseSelection.skin }} />
                        <span className={styles.museSwatch} style={{ background: normalizedMuseSelection.eyes }} />
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <div className={`${styles.panel} ${styles.controls}`}>
              {FEATURE_ORDER.map((feature) => (
                <label
                  key={feature}
                  className={`${styles.control} ${feature === "eyes" ? styles.eyeControl : ""}`}
                >
                  <span className={styles.controlHeader}>
                    <span className={styles.controlLabel}>{FEATURE_LABELS[feature]}</span>
                    <span
                      className={styles.chip}
                      style={{ background: selection[feature] }}
                      aria-hidden="true"
                    />
                  </span>
                  <span className={styles.hex}>
                    {selection[feature].toUpperCase()} / {getFeatureColorLabel(feature, selection[feature])}
                  </span>
                  <div
                    className={styles.eyeOptions}
                    role="radiogroup"
                    aria-label={`${FEATURE_LABELS[feature]} color presets`}
                  >
                    {FEATURE_PRESETS[feature].map((option) => {
                      const selected = option.hex === selection[feature];
                      return (
                        <button
                          key={option.id}
                          type="button"
                          className={`${styles.eyeOption} ${selected ? styles.eyeOptionActive : ""}`}
                          aria-label={`${FEATURE_LABELS[feature]} color ${option.label}`}
                          aria-pressed={selected}
                          onClick={() => handleChangeColor(feature, option.hex)}
                        >
                          <span
                            className={styles.eyeOptionDot}
                            style={{ background: option.hex }}
                            aria-hidden="true"
                          />
                          <span className={styles.eyeOptionLabel}>{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  <span className={styles.controlHint}>{FEATURE_HINTS[feature]}</span>
                  <input
                    className={`${styles.input} ${feature === "eyes" ? styles.eyeInput : ""}`}
                    type="color"
                    aria-label={`${FEATURE_LABELS[feature]} color`}
                    value={selection[feature]}
                    onFocus={() =>
                      setActivePopover((current) => ({
                        feature,
                        portraitId: current?.portraitId ?? DEFAULT_PORTRAIT_STUDY,
                      }))
                    }
                    onChange={(event) => handleChangeColor(feature, event.target.value)}
                  />
                </label>
              ))}
            </div>
          </section>

          <aside className={styles.results}>
            <section className={`${styles.panel} ${styles.seasonCard}`}>
              <div className={styles.seasonHeading}>
                <div>
                  <p className={styles.eyebrow}>Best-Fit Season</p>
                  <h2>{getSeasonLabel(result.primarySeason)}</h2>
                  <p className={styles.hex}>Adjacent season: {getSeasonLabel(result.adjacentSeason)}</p>
                </div>
                <div className={styles.confidence}>
                  Confidence
                  <strong>{Math.round(result.confidence * 100)}%</strong>
                </div>
              </div>

              <div className={styles.traitRow}>
                <span className={styles.traitPill}>Undertone: {result.traits.undertone}</span>
                <span className={styles.traitPill}>Depth: {result.traits.depth}</span>
                <span className={styles.traitPill}>Clarity: {result.traits.clarity}</span>
                <span className={styles.traitPill}>Contrast: {result.traits.contrast}</span>
              </div>

              <div className={styles.bodyCopy}>
                <p>{result.explanation.whyItFits}</p>
                <p>
                  <strong>Wear more often:</strong> {result.explanation.wearMoreOften}
                </p>
                <p>
                  <strong>Avoid near the face:</strong> {result.explanation.avoidNearFace}
                </p>
              </div>
            </section>

            <section className={`${styles.panel} ${styles.museSpotlight}`}>
              <div className={styles.museSpotlightHeader}>
                <div>
                  <p className={styles.eyebrow}>Season Muse</p>
                  <h3 className={styles.museSpotlightName}>{featuredMuse.name}</h3>
                  <p className={styles.museSpotlightRole}>{featuredMuse.title}</p>
                </div>
                <button
                  type="button"
                  className={styles.loadMuseButton}
                  onClick={() => applySeasonMuse(result.primarySeason)}
                >
                  Load Study
                </button>
              </div>
              <p className={styles.museSpotlightCopy}>{featuredMuse.note}</p>
              <p className={styles.museDisclaimer}>
                These are editorial references, not verified public color typings of the real people.
              </p>
            </section>

            {(Object.keys(result.palette) as PaletteUsage[]).map((usage) => (
              <section key={usage} className={`${styles.panel} ${styles.section}`}>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>{SECTION_TITLES[usage]}</h3>
                  <span className={styles.sectionHint}>{SECTION_COPY[usage]}</span>
                </div>

                <div className={styles.swatchGrid}>
                  {result.palette[usage].map((swatch) => (
                    <article key={`${usage}-${swatch.name}`} className={styles.swatch}>
                      <div
                        className={styles.swatchColor}
                        style={{ background: swatch.hex }}
                        aria-label={`${swatch.name} ${swatch.hex}`}
                      />
                      <div>
                        <div className={styles.swatchName}>{swatch.name}</div>
                        <div className={styles.swatchCode}>
                          <div>{swatch.hex.toUpperCase()}</div>
                          <div>{formatOklch(swatch.oklch)}</div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}

            <section className={`${styles.panel} ${styles.disclaimer}`}>
              Seasonal color analysis is a styling heuristic, not a medical or scientific diagnosis.
              The objective part here is the color-space math: selections are converted into OKLCH
              values, scored against 12 seasonal archetypes, and then used to personalize the
              palette output.
            </section>
          </aside>
        </main>
      </div>
    </div>
  );
}

export default App;



