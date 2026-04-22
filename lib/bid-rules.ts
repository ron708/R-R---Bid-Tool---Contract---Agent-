/**
 * Solarponics R&R Bid Business Rules
 *
 * These values are fixed by Solarponics policy and never exposed to
 * partner estimators in the UI — they are applied automatically.
 */

export const COMMISSION_AMOUNT = 400;      // always $400, not user-editable
export const CREW_COUNT = 2;               // always 2-person crew
export const PARTS_PANEL_MULTIPLIER = 1.5; // qty factor: each panel = 1.5 units
export const PARTS_UNIT_COST = 35;         // $/unit of parts

/** Parts estimate = panelCount × 1.5 × $35 */
export function calcPartsEstimate(panelCount: number): number {
  return panelCount * PARTS_PANEL_MULTIPLIER * PARTS_UNIT_COST;
}

/**
 * Crew days lookup by panel count + roof type + stories.
 *
 * Base (comp shingle, 1-story):
 *   ≤ 20 panels  → 1.3 days
 *   21–34 panels → 1.5 days
 *   35–40 panels → 2.0 days
 *
 * Modifiers (additive):
 *   Tile roof    → +0.2
 *   2+ stories   → +0.1
 */
export function calcCrewDays(
  panelCount: number,
  roofType: string,
  stories: number
): number {
  let days: number;
  if (panelCount <= 20) days = 1.3;
  else if (panelCount <= 34) days = 1.5;
  else days = 2.0;

  if (roofType === "TILE") days += 0.2;
  if (stories >= 2) days += 0.1;

  return parseFloat(days.toFixed(1));
}

/** Returns all auto-calculated cost fields for a bid */
export function calcBidDefaults(
  panelCount: number,
  roofType: string,
  stories: number
) {
  return {
    partsEstimate: calcPartsEstimate(panelCount),
    morePartsEstimate: 0,
    crewCount: CREW_COUNT,
    crewDays: calcCrewDays(panelCount, roofType, stories),
    commissionAmount: COMMISSION_AMOUNT,
  };
}
