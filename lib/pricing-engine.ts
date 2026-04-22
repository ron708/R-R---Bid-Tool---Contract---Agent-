/**
 * PRICING ENGINE
 * Rates are PLACEHOLDERS — must be replaced with values extracted from the
 * Solarponics Excel bid tool once the password-protected file is reviewed.
 * All rate keys map directly to DefaultPricingConfig / ContractorIntegration in the DB.
 */

import { AttachmentType, PitchCategory, WorkScope } from "@prisma/client";

export interface PricingInputs {
  panelCount: number;
  railLinearFt?: number;
  attachmentCount?: number;
  attachmentType?: AttachmentType;
  pitchCategory?: PitchCategory;
  stories?: number;
  workScope: WorkScope;
  includePermit?: boolean;
  includeInspection?: boolean;
}

export interface RateTable {
  panelRemoval: number;
  railRemovalPerFt: number;
  attachmentRemoval: number;
  panelInstall: number;
  railInstallPerFt: number;
  attachmentInstall: number;
  pitchAdderMedium: number;
  pitchAdderSteep: number;
  storyAdder: number;
  permitFee: number;
  inspectionFee: number;
  laborRatePerHour: number;
  travelFlatFee: number;
}

export interface BidLineItemInput {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
  sortOrder: number;
}

export interface PricingResult {
  lineItems: BidLineItemInput[];
  subtotal: number;
  total: number;
}

export function calculateBid(inputs: PricingInputs, rates: RateTable): PricingResult {
  const items: BidLineItemInput[] = [];
  let order = 0;

  const addItem = (description: string, quantity: number, unit: string, unitPrice: number) => {
    const total = quantity * unitPrice;
    items.push({ description, quantity, unit, unitPrice, total, sortOrder: order++ });
  };

  const isRemoval = inputs.workScope === "FULL_RR" || inputs.workScope === "REMOVAL_ONLY";
  const isInstall = inputs.workScope === "FULL_RR" || inputs.workScope === "INSTALL_ONLY";

  // Panel removal
  if (isRemoval && inputs.panelCount > 0) {
    addItem("Solar Panel Removal", inputs.panelCount, "panel", rates.panelRemoval);
  }

  // Rail removal
  if (isRemoval && (inputs.railLinearFt ?? 0) > 0) {
    addItem("Rail System Removal", inputs.railLinearFt!, "lin ft", rates.railRemovalPerFt);
  }

  // Attachment removal
  if (isRemoval && (inputs.attachmentCount ?? 0) > 0) {
    addItem("Roof Attachment Removal", inputs.attachmentCount!, "ea", rates.attachmentRemoval);
  }

  // Panel install
  if (isInstall && inputs.panelCount > 0) {
    addItem("Solar Panel Reinstallation", inputs.panelCount, "panel", rates.panelInstall);
  }

  // Rail install
  if (isInstall && (inputs.railLinearFt ?? 0) > 0) {
    addItem("Rail System Reinstallation", inputs.railLinearFt!, "lin ft", rates.railInstallPerFt);
  }

  // Attachment install
  if (isInstall && (inputs.attachmentCount ?? 0) > 0) {
    addItem("Roof Attachment Reinstallation", inputs.attachmentCount!, "ea", rates.attachmentInstall);
  }

  // Pitch adder
  if (inputs.pitchCategory === "MEDIUM" && rates.pitchAdderMedium > 0) {
    addItem("Medium Pitch Adder (4–7/12)", inputs.panelCount, "panel", rates.pitchAdderMedium);
  }
  if (inputs.pitchCategory === "STEEP" && rates.pitchAdderSteep > 0) {
    addItem("Steep Pitch Adder (8+/12)", inputs.panelCount, "panel", rates.pitchAdderSteep);
  }

  // Story adder
  if ((inputs.stories ?? 1) >= 2 && rates.storyAdder > 0) {
    addItem("Multi-Story Adder", inputs.panelCount, "panel", rates.storyAdder);
  }

  // Travel
  if (rates.travelFlatFee > 0) {
    addItem("Travel / Mobilization", 1, "flat", rates.travelFlatFee);
  }

  // Permit
  if (inputs.includePermit && rates.permitFee > 0) {
    addItem("Permit Fee", 1, "flat", rates.permitFee);
  }

  // Inspection
  if (inputs.includeInspection && rates.inspectionFee > 0) {
    addItem("Inspection Fee", 1, "flat", rates.inspectionFee);
  }

  const subtotal = items.reduce((sum, i) => sum + i.total, 0);

  return { lineItems: items, subtotal, total: subtotal };
}
