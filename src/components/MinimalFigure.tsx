import type { CSSProperties } from "react";
import {
  getHumanFeatureColorLabel,
  HUMAN_HAIR_COLORS,
  HUMAN_SKIN_COLORS,
} from "../lib/humanColors";
import { getEyeColorLabel, HUMAN_EYE_COLORS } from "../lib/muses";
import type { FeatureKey, FeatureSelection, Hex, PortraitStudyId } from "../types";
import styles from "./MinimalFigure.module.css";

type MinimalFigureProps = {
  selection: FeatureSelection;
  activePopover: { feature: FeatureKey; portraitId: PortraitStudyId } | null;
  onToggleFeature: (feature: FeatureKey, portraitId: PortraitStudyId) => void;
  onChangeColor: (feature: FeatureKey, value: string) => void;
};

const FEATURE_LABELS: Record<FeatureKey, string> = {
  hair: "Hair",
  eyes: "Eyes",
  skin: "Skin",
};

const FEATURE_HINTS: Record<FeatureKey, string> = {
  hair: "Pick the closest natural hair family. Manual edits snap to the nearest preset.",
  skin: "Pick the closest skin-tone family. Manual edits snap to the nearest preset.",
  eyes: "Pick the dominant iris color. Manual edits snap back to the nearest human eye shade.",
};

const FEATURE_ORDER: FeatureKey[] = ["hair", "skin", "eyes"];

const FEATURE_PRESETS = {
  hair: HUMAN_HAIR_COLORS,
  skin: HUMAN_SKIN_COLORS,
  eyes: HUMAN_EYE_COLORS,
} satisfies Record<FeatureKey, Array<{ id: string; label: string; hex: Hex; note: string }>>;

const PORTRAIT_STUDIES: Array<{
  id: PortraitStudyId;
  season: string;
  name: string;
  title: string;
  note: string;
  imageUrl: string;
  objectPosition: string;
  accent: string;
  wash: string;
}> = [
  {
    id: "spring",
    season: "Spring",
    name: "Shakira",
    title: "Pop star",
    note: "Warm blonde depth and bright skin contrast make this the lightest, clearest reference in the set.",
    imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Shakira%20Obama.PNG",
    objectPosition: "center 12%",
    accent: "#c47b35",
    wash: "linear-gradient(180deg, rgba(255, 228, 190, 0.08), rgba(228, 150, 76, 0.3))",
  },
  {
    id: "summer",
    season: "Summer",
    name: "Jennifer Doudna",
    title: "Biochemist",
    note: "The cooler, softer balance comes through in the ash-toned hair, muted skin, and lowered contrast.",
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Jennifer%20Doudna%20in%202021%20by%20Christopher%20Michel%20%28cropped%29.jpg",
    objectPosition: "center 14%",
    accent: "#7d94b0",
    wash: "linear-gradient(180deg, rgba(213, 227, 241, 0.08), rgba(108, 132, 162, 0.3))",
  },
  {
    id: "autumn",
    season: "Autumn",
    name: "Kaye Husbands Fealing",
    title: "Economist",
    note: "This portrait carries grounded warmth through richer skin, deeper hair, and a more muted overall finish.",
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Kaye_Husbands_Fealing.gif",
    objectPosition: "center 18%",
    accent: "#8a5937",
    wash: "linear-gradient(180deg, rgba(234, 206, 177, 0.06), rgba(132, 81, 49, 0.34))",
  },
  {
    id: "winter",
    season: "Winter",
    name: "Dua Lipa",
    title: "Pop star",
    note: "Dark hair against cool skin gives the sharpest, highest-contrast reference of the four families.",
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Dua_Lipa-69798_%28cropped%29.jpg",
    objectPosition: "center 10%",
    accent: "#564b78",
    wash: "linear-gradient(180deg, rgba(198, 205, 240, 0.08), rgba(67, 52, 98, 0.34))",
  },
];

const getFeatureColorLabel = (feature: FeatureKey, hex: Hex) =>
  feature === "eyes" ? getEyeColorLabel(hex) : getHumanFeatureColorLabel(feature, hex);

const Popover = ({
  feature,
  value,
  className,
  onChangeColor,
}: {
  feature: FeatureKey;
  value: string;
  className: string;
  onChangeColor: (feature: FeatureKey, value: string) => void;
}) => {
  const options = FEATURE_PRESETS[feature];

  return (
    <div className={`${styles.popover} ${className}`} role="dialog" aria-label={`${feature} color picker`}>
      <p className={styles.popoverTitle}>{FEATURE_LABELS[feature]}</p>
      <p className={styles.popoverHint}>{FEATURE_HINTS[feature]}</p>
      <div className={styles.eyeSwatchGroup} role="radiogroup" aria-label={`${FEATURE_LABELS[feature]} color presets`}>
        {options.map((option) => {
          const selected = option.hex.toLowerCase() === value.toLowerCase();
          return (
            <button
              key={option.id}
              type="button"
              className={`${styles.eyeSwatch} ${selected ? styles.eyeSwatchActive : ""}`}
              aria-label={`${FEATURE_LABELS[feature]} color ${option.label}`}
              aria-pressed={selected}
              onClick={() => onChangeColor(feature, option.hex)}
            >
              <span className={styles.eyeSwatchDot} style={{ background: option.hex }} aria-hidden="true" />
              <span>
                <span className={styles.eyeSwatchName}>{option.label}</span>
                <span className={styles.eyeSwatchNote}>{option.note}</span>
              </span>
            </button>
          );
        })}
      </div>
      <input
        aria-label={`${feature} color`}
        className={`${styles.colorInput} ${feature === "eyes" ? styles.colorInputCompact : ""}`}
        type="color"
        value={value}
        onChange={(event) => onChangeColor(feature, event.target.value)}
      />
      <p className={styles.popoverHint}>Current match: {getFeatureColorLabel(feature, value as Hex)}</p>
    </div>
  );
};

export const MinimalFigure = ({
  selection,
  activePopover,
  onToggleFeature,
  onChangeColor,
}: MinimalFigureProps) => {
  return (
    <div
      className={styles.figureShell}
      aria-label="Season portrait studies for selecting hair, skin, and eye colors"
    >
      <div className={styles.figureBackdrop} aria-hidden="true" />

      <div className={styles.figureIntro}>
        <p className={styles.figureNoteLabel}>Portrait Quartet</p>
        <p className={styles.figureIntroText}>
          Pick the picture that looks most like you, then fine-tune the hair, skin, and eye colors.
        </p>
      </div>

      <div className={styles.portraitGrid}>
        {PORTRAIT_STUDIES.map((portrait) => {
          const isActivePortrait = activePopover?.portraitId === portrait.id;
          const activeFeature = isActivePortrait ? activePopover.feature : null;

          return (
            <article
              key={portrait.id}
              className={`${styles.portraitCard} ${isActivePortrait ? styles.portraitCardActive : ""}`}
              style={
                {
                  "--portrait-accent": portrait.accent,
                  "--portrait-wash": portrait.wash,
                } as CSSProperties
              }
            >
              <div className={styles.photoFrame}>
                <img
                  className={styles.portraitImage}
                  src={portrait.imageUrl}
                  alt={`${portrait.name}, ${portrait.title}, used as an editorial ${portrait.season.toLowerCase()} palette reference.`}
                  loading="lazy"
                  style={{ objectPosition: portrait.objectPosition }}
                />
                <div className={styles.photoWash} aria-hidden="true" />
                <div className={styles.portraitMeta}>
                  <span className={styles.portraitSeason}>{portrait.season}</span>
                  <p className={styles.portraitName}>{portrait.name}</p>
                  <p className={styles.portraitRole}>{portrait.title}</p>
                </div>
              </div>

              <div className={styles.hotspotRow} role="group" aria-label={`${portrait.season} portrait controls`}>
                {FEATURE_ORDER.map((feature) => (
                  <button
                    key={`${portrait.id}-${feature}`}
                    type="button"
                    className={`${styles.hotspot} ${activeFeature === feature ? styles.hotspotActive : ""}`}
                    aria-haspopup="dialog"
                    aria-expanded={activeFeature === feature}
                    aria-controls={`${portrait.id}-${feature}-popover`}
                    onClick={() => onToggleFeature(feature, portrait.id)}
                  >
                    <span className={styles.hotspotLabel}>{FEATURE_LABELS[feature]}</span>
                    <span
                      className={styles.hotspotSwatch}
                      style={{ background: selection[feature] }}
                      aria-hidden="true"
                    />
                  </button>
                ))}
              </div>

              <p className={styles.portraitNote}>{portrait.note}</p>

              {activeFeature ? (
                <div id={`${portrait.id}-${activeFeature}-popover`} className={styles.popoverDock}>
                  <Popover
                    feature={activeFeature}
                    value={selection[activeFeature]}
                    className={styles.portraitPopover}
                    onChangeColor={onChangeColor}
                  />
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      <div className={styles.figureNote}>
        <p className={styles.figureNoteLabel}>Editorial Note</p>
        <p className={styles.figureNoteText}>
          These portraits are visual references inferred from public photos, not verified public
          seasonal typings. The hair, skin, and eye controls still drive the exact same analysis
          engine as before.
        </p>
      </div>
    </div>
  );
};





