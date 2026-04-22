/**
 * PRICING ENGINE — Cost-Plus Margin Model
 *
 * Derived from Solarponics Excel bid tool (reference/bid-tools/).
 * Formula: Contract Price = Total Costs / (1 - Profit Margin)
 *
 * Key rates (verified against Ewens, Rick 16-panel job = $4,369.63):
 *   - Inflation:   3% of parts
 *   - Sales Tax:   8.75% of (parts + inflation) — California
 *   - Labor:       $430/person/day
 *   - Warranty:    13% of (parts + labor)
 *   - Liability:   9.22% of all other costs combined
 *   - Service margin target: 35%
 */

export interface PricingInputs {
  // System info (for scope description, not pricing)
  panelCount: number;
  // Cost inputs — entered by estimator
  partsEstimate: number;      // actual hardware cost (flashings, mounts, etc.)
  morePartsEstimate?: number; // misc parts
  freightActual?: number;     // shipping cost if known (min $75 applied)
  milesFromJob: number;       // one-way miles for truck expense calc
  crewCount: number;          // number of crew members
  crewDays: number;           // crew days (can be 0.5, 1, 1.25, 2, etc.)
  commissionAmount: number;   // flat commission for sales rep
  subContractorCost?: number; // sub cost if applicable
  rackCost?: number;          // rack/railing cost from management
  permitFee?: number;         // flat permit fee if required
}

export interface RateTable {
  inflationRate: number;           // default 0.03
  salesTaxRate: number;            // default 0.0875 (CA)
  freightMin: number;              // default 75
  truckRatePerMile: number;        // default 6.25
  laborDailyRatePerPerson: number; // default 430
  warrantyReserveRate: number;     // default 0.13 (% of parts+labor)
  liabilityInsuranceRate: number;  // default 0.0922 (% of all other costs)
  profitMargin: number;            // default 0.35 (35% for service)
}

export const DEFAULT_RATES: RateTable = {
  inflationRate: 0.03,
  salesTaxRate: 0.0875,
  freightMin: 75,
  truckRatePerMile: 6.25,
  laborDailyRatePerPerson: 430,
  warrantyReserveRate: 0.13,
  liabilityInsuranceRate: 0.0922,
  profitMargin: 0.35,
};

export interface BidLineItemInput {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
  sortOrder: number;
  internal?: boolean; // true = excluded from customer-facing PDF
}

export interface PricingResult {
  lineItems: BidLineItemInput[];
  subtotal: number;   // total costs before margin
  total: number;      // contract price (after margin)
  grossProfit: number;
  profitPercent: number;
  depositAmount: number;   // 10% deposit
  finalPayment: number;    // 90% final
}

export function calculateBid(inputs: PricingInputs, rates: RateTable): PricingResult {
  const items: BidLineItemInput[] = [];
  let order = 0;

  const addItem = (
    description: string,
    quantity: number,
    unit: string,
    unitPrice: number,
    internal = false
  ): number => {
    const total = parseFloat((quantity * unitPrice).toFixed(2));
    items.push({ description, quantity, unit, unitPrice, total, sortOrder: order++, internal });
    return total;
  };

  // ── Parts ─────────────────────────────────────────────────────────────────
  const parts = inputs.partsEstimate || 0;
  const moreParts = inputs.morePartsEstimate || 0;
  if (parts > 0)      addItem("Parts & Materials", 1, "flat", parts);
  if (moreParts > 0)  addItem("Miscellaneous Parts", 1, "flat", moreParts);

  // ── Inflation compensation (3% of parts) ─────────────────────────────────
  const inflationBase = parts + moreParts;
  const inflation = parseFloat((inflationBase * rates.inflationRate).toFixed(2));
  if (inflation > 0)  addItem("Inflation Compensation", 1, "flat", inflation);

  // ── Sales Tax (CA: 8.75% of parts + inflation) ────────────────────────────
  const taxBase = inflationBase + inflation;
  const salesTax = parseFloat((taxBase * rates.salesTaxRate).toFixed(2));
  if (salesTax > 0)   addItem("Sales Tax", 1, "flat", salesTax);

  // ── Freight ───────────────────────────────────────────────────────────────
  const freight = Math.max(rates.freightMin, inputs.freightActual || 0);
  addItem("Freight (Ordering, Receiving, Inventory, Loading)", 1, "flat", freight);

  // ── Truck / Travel ────────────────────────────────────────────────────────
  const miles = inputs.milesFromJob || 0;
  const truckExpense = parseFloat((Math.max(freight, miles * rates.truckRatePerMile)).toFixed(2));
  if (miles > 0) {
    addItem(`Truck Expenses (${miles} mi)`, miles, "mi", rates.truckRatePerMile);
  } else {
    addItem("Truck Expenses", 1, "flat", rates.freightMin);
  }

  // ── Rack / Rail ───────────────────────────────────────────────────────────
  const rackCost = inputs.rackCost || 0;
  if (rackCost > 0) addItem("Rack / Rail System", 1, "flat", rackCost);

  // ── Sub Contractor (internal — baked into total, hidden from customer PDF) ──
  const subCost = inputs.subContractorCost || 0;
  if (subCost > 0) addItem("Sub Contractor", 1, "flat", subCost, true);

  // ── Commission ────────────────────────────────────────────────────────────
  const commission = inputs.commissionAmount || 0;
  if (commission > 0) addItem("Commission", 1, "flat", commission);

  // ── Permit ────────────────────────────────────────────────────────────────
  const permit = inputs.permitFee || 0;
  if (permit > 0) addItem("Permit Fees", 1, "flat", permit);

  // ── Labor ─────────────────────────────────────────────────────────────────
  const labor = parseFloat((inputs.crewCount * inputs.crewDays * rates.laborDailyRatePerPerson).toFixed(2));
  addItem(
    `Labor (${inputs.crewCount} crew × ${inputs.crewDays} day${inputs.crewDays !== 1 ? "s" : ""})`,
    inputs.crewCount * inputs.crewDays,
    "crew-day",
    rates.laborDailyRatePerPerson
  );

  // ── Warranty Reserve (13% of parts + labor) ───────────────────────────────
  const warrantyBase = parts + moreParts + labor;
  const warrantyReserve = parseFloat((warrantyBase * rates.warrantyReserveRate).toFixed(2));
  if (warrantyReserve > 0) addItem("Warranty Reserve", 1, "flat", warrantyReserve);

  // ── Liability Insurance (9.22% of all other costs) ────────────────────────
  const costsBeforeInsurance = items.reduce((s, i) => s + i.total, 0);
  const liabilityInsurance = parseFloat((costsBeforeInsurance * rates.liabilityInsuranceRate).toFixed(2));
  addItem("Liability Insurance", 1, "flat", liabilityInsurance);

  // ── Totals ─────────────────────────────────────────────────────────────────
  const subtotal = items.reduce((s, i) => s + i.total, 0);
  const total = parseFloat((subtotal / (1 - rates.profitMargin)).toFixed(2));
  const grossProfit = parseFloat((total - subtotal).toFixed(2));
  const profitPercent = parseFloat(((grossProfit / total) * 100).toFixed(2));

  // Payment schedule: 10% deposit, 90% final
  const depositAmount = parseFloat((total * 0.10).toFixed(2));
  const finalPayment = parseFloat((total - depositAmount).toFixed(2));

  return { lineItems: items, subtotal, total, grossProfit, profitPercent, depositAmount, finalPayment };
}
