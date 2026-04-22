import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Bid, BidLineItem, Customer, Contractor, SolarponicsConfig } from "@prisma/client";

// ─── Styles ───────────────────────────────────────────────────────────────────

const NAVY = "#1E3A5F";
const ORANGE = "#F97316";
const GRAY = "#6b7280";
const LIGHT = "#f3f4f6";

const s = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 9.5, padding: 40, color: "#1a1a1a", lineHeight: 1.4 },

  // Header
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20, paddingBottom: 14, borderBottomWidth: 2, borderBottomColor: NAVY },
  companyBlock: { flex: 1 },
  companyName: { fontSize: 18, fontFamily: "Helvetica-Bold", color: NAVY, marginBottom: 2 },
  companyMeta: { fontSize: 7.5, color: GRAY },
  metaBlock: { alignItems: "flex-end" },
  docTitle: { fontSize: 7.5, color: GRAY, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 },
  proposalNum: { fontSize: 14, fontFamily: "Helvetica-Bold", color: ORANGE },
  proposalDate: { fontSize: 7.5, color: GRAY, marginTop: 3 },
  partnerBadge: { marginTop: 6, backgroundColor: "#fef3c7", padding: "2 6", borderRadius: 2 },
  partnerBadgeText: { fontSize: 7.5, color: "#92400e" },

  // Section
  sectionTitle: { fontSize: 10, fontFamily: "Helvetica-Bold", color: NAVY, marginBottom: 5, marginTop: 14, borderBottomWidth: 1, borderBottomColor: "#e5e7eb", paddingBottom: 3 },

  // Two-column rows
  row2: { flexDirection: "row", gap: 16, marginBottom: 3 },
  half: { flex: 1 },
  label: { color: GRAY },
  bold: { fontFamily: "Helvetica-Bold" },

  // Line item table
  table: { marginTop: 6 },
  tableHead: { flexDirection: "row", backgroundColor: NAVY, padding: "5 8", borderRadius: 2 },
  tableHeadText: { color: "white", fontFamily: "Helvetica-Bold", fontSize: 8.5 },
  tableRow: { flexDirection: "row", padding: "4 8", borderBottomWidth: 1, borderBottomColor: LIGHT },
  tDesc: { flex: 4 },
  tQty: { flex: 1.5, textAlign: "center" },
  tAmt: { flex: 1.5, textAlign: "right" },

  // Totals
  totalsBlock: { marginTop: 10, alignItems: "flex-end" },
  totalsRow: { flexDirection: "row", gap: 40, marginBottom: 2 },
  totalsLabel: { color: GRAY, textAlign: "right", width: 120 },
  totalsValue: { textAlign: "right", width: 80 },
  grandTotal: { flexDirection: "row", gap: 40, marginTop: 6, paddingTop: 6, borderTopWidth: 2, borderTopColor: NAVY },
  grandTotalLabel: { fontFamily: "Helvetica-Bold", fontSize: 12, textAlign: "right", width: 120 },
  grandTotalValue: { fontSize: 16, fontFamily: "Helvetica-Bold", color: ORANGE, textAlign: "right", width: 80 },

  // Payment schedule
  paymentTable: { marginTop: 6, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 2 },
  paymentRow: { flexDirection: "row", padding: "5 10", borderBottomWidth: 1, borderBottomColor: LIGHT },
  paymentRowLast: { flexDirection: "row", padding: "5 10" },

  // T&C
  tcTitle: { fontSize: 9, fontFamily: "Helvetica-Bold", color: NAVY, marginBottom: 4, marginTop: 12 },
  tcText: { fontSize: 8, color: "#374151", lineHeight: 1.5 },

  // Signature
  sigSection: { marginTop: 28, flexDirection: "row", gap: 40 },
  sigBox: { flex: 1 },
  sigLine: { borderTopWidth: 1, borderTopColor: "#374151", marginBottom: 4, marginTop: 28 },
  sigLabel: { fontSize: 8, color: GRAY },

  // Notice pages
  noticeTitle: { fontSize: 13, fontFamily: "Helvetica-Bold", color: NAVY, marginBottom: 12, textAlign: "center" },
  noticeText: { fontSize: 9, lineHeight: 1.6, color: "#1a1a1a" },
  noticeBold: { fontFamily: "Helvetica-Bold" },
  noticeBox: { borderWidth: 1.5, borderColor: NAVY, padding: 14, borderRadius: 3, marginTop: 16 },

  // Footer
  footer: { position: "absolute", bottom: 24, left: 40, right: 40, borderTopWidth: 1, borderTopColor: LIGHT, paddingTop: 6, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 7, color: GRAY },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface Props {
  bid: Bid & { lineItems: BidLineItem[]; customer: Customer; contractor: Contractor };
  config: SolarponicsConfig;
}

const scopeLabel: Record<string, string> = {
  FULL_RR: "Full Solar System Remove & Replace (R&R)",
  REMOVAL_ONLY: "Solar System Removal Only",
  INSTALL_ONLY: "Solar System Reinstallation Only",
};

const roofLabel: Record<string, string> = {
  COMP_SHINGLE: "Composition Shingle", TILE: "Tile", METAL: "Metal",
  FLAT_TPO: "Flat — TPO", FLAT_EPDM: "Flat — EPDM", FLAT_MOD_BIT: "Flat — Modified Bitumen",
};

const pitchLabel: Record<string, string> = {
  LOW: "Low (1–3/12)", MEDIUM: "Medium (4–7/12)", STEEP: "Steep (8+/12)",
};

const inverterLabel: Record<string, string> = {
  STRING: "String Inverter", MICROINVERTER: "Microinverter", POWER_OPTIMIZER: "Power Optimizer",
};

function PageFooter({ config, bidNumber }: { config: SolarponicsConfig; bidNumber: string }) {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerText}>{config.companyName} | {config.licenseNumber} | {config.phone}</Text>
      <Text style={s.footerText}>Proposal #{bidNumber}</Text>
      <Text style={s.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
    </View>
  );
}

// ─── Document ─────────────────────────────────────────────────────────────────

export function ProposalDocument({ bid, config }: Props) {
  const companyAddress = [config.address, config.city, config.state, config.zip].filter(Boolean).join(", ");
  const siteAddress = [bid.customer.siteAddress, bid.customer.siteCity, bid.customer.siteState, bid.customer.siteZip].filter(Boolean).join(", ");
  const depositAmt = bid.depositAmount ?? (bid.total ? bid.total * 0.10 : 0);
  const finalAmt = bid.finalPayment ?? (bid.total ? bid.total * 0.90 : 0);
  // Filter out internal items (e.g. sub-contractor cost) from customer-facing document
  const visibleLineItems = bid.lineItems.filter((item) => !item.internal);

  return (
    <Document>

      {/* ── Page 1: Agreement & Pricing ─────────────────────────────────────── */}
      <Page size="LETTER" style={s.page}>

        {/* Header */}
        <View style={s.header}>
          <View style={s.companyBlock}>
            <Text style={s.companyName}>{config.companyName}</Text>
            {config.licenseNumber && <Text style={s.companyMeta}>{config.licenseNumber}</Text>}
            {companyAddress && <Text style={s.companyMeta}>{companyAddress}</Text>}
            {config.phone && <Text style={s.companyMeta}>{config.phone}</Text>}
            {config.email && <Text style={s.companyMeta}>{config.email}</Text>}
          </View>
          <View style={s.metaBlock}>
            <Text style={s.docTitle}>Solar R&R Service Agreement</Text>
            <Text style={s.proposalNum}>{bid.bidNumber}</Text>
            <Text style={s.proposalDate}>Date: {formatDate(bid.createdAt)}</Text>
            <View style={s.partnerBadge}>
              <Text style={s.partnerBadgeText}>Strategic Partner: {bid.contractor.name}</Text>
            </View>
          </View>
        </View>

        {/* Customer Information */}
        <Text style={s.sectionTitle}>CUSTOMER INFORMATION</Text>
        <View style={s.row2}>
          <View style={s.half}>
            <Text><Text style={s.label}>Name: </Text>{bid.customer.firstName} {bid.customer.lastName}</Text>
          </View>
          <View style={s.half}>
            {bid.customer.phone && <Text><Text style={s.label}>Phone: </Text>{bid.customer.phone}</Text>}
          </View>
        </View>
        <View style={s.row2}>
          <View style={s.half}>
            <Text><Text style={s.label}>Site Address: </Text>{siteAddress || bid.customer.siteAddress}</Text>
          </View>
          <View style={s.half}>
            {bid.customer.email && <Text><Text style={s.label}>Email: </Text>{bid.customer.email}</Text>}
          </View>
        </View>

        {/* Scope of Work */}
        <Text style={s.sectionTitle}>SCOPE OF WORK</Text>
        <Text style={{ marginBottom: 5, fontFamily: "Helvetica-Bold" }}>{scopeLabel[bid.workScope] ?? bid.workScope}</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          <Text><Text style={s.label}>Panels: </Text>{bid.panelCount}{bid.panelBrand ? ` — ${bid.panelBrand}` : ""}{bid.panelModel ? ` ${bid.panelModel}` : ""}</Text>
          {bid.systemSizeKw && <Text><Text style={s.label}>System Size: </Text>{bid.systemSizeKw} kW</Text>}
          {bid.inverterType && <Text><Text style={s.label}>Inverter: </Text>{inverterLabel[bid.inverterType] ?? bid.inverterType}{bid.inverterBrand ? ` — ${bid.inverterBrand}` : ""}</Text>}
          {bid.roofType && <Text><Text style={s.label}>Roof Type: </Text>{roofLabel[bid.roofType] ?? bid.roofType}</Text>}
          {bid.pitchCategory && <Text><Text style={s.label}>Pitch: </Text>{pitchLabel[bid.pitchCategory] ?? bid.pitchCategory}</Text>}
          {bid.stories > 1 && <Text><Text style={s.label}>Stories: </Text>{bid.stories}</Text>}
          {bid.railLinearFt && <Text><Text style={s.label}>Rail: </Text>{bid.railLinearFt} linear ft</Text>}
          {bid.attachmentType && <Text><Text style={s.label}>Attachment: </Text>{bid.attachmentType}</Text>}
          {bid.attachmentCount && <Text><Text style={s.label}>Attachment Count: </Text>{bid.attachmentCount}</Text>}
        </View>
        {bid.notes && (
          <Text style={{ marginTop: 5, color: "#374151", fontStyle: "italic" }}>Note: {bid.notes}</Text>
        )}

        {/* Pricing */}
        <Text style={s.sectionTitle}>PRICING</Text>
        <View style={s.table}>
          <View style={s.tableHead}>
            <Text style={{ ...s.tableHeadText, ...s.tDesc }}>Description</Text>
            <Text style={{ ...s.tableHeadText, ...s.tQty }}>Qty / Unit</Text>
            <Text style={{ ...s.tableHeadText, ...s.tAmt }}>Amount</Text>
          </View>
          {visibleLineItems.map((item, i) => (
            <View key={i} style={{ ...s.tableRow, backgroundColor: i % 2 === 0 ? "white" : "#f9fafb" }}>
              <Text style={s.tDesc}>{item.description}</Text>
              <Text style={{ ...s.tQty, color: GRAY }}>{item.unit === "flat" ? "—" : `${item.quantity} ${item.unit}`}</Text>
              <Text style={s.tAmt}>{formatCurrency(item.total)}</Text>
            </View>
          ))}
        </View>

        <View style={s.totalsBlock}>
          <View style={s.totalsRow}>
            <Text style={s.totalsLabel}>Subtotal (Costs)</Text>
            <Text style={s.totalsValue}>{formatCurrency(bid.subtotal ?? 0)}</Text>
          </View>
          <View style={s.grandTotal}>
            <Text style={s.grandTotalLabel}>CONTRACT TOTAL</Text>
            <Text style={s.grandTotalValue}>{formatCurrency(bid.total ?? 0)}</Text>
          </View>
        </View>

        {/* Payment Schedule */}
        <Text style={s.sectionTitle}>PAYMENT SCHEDULE</Text>
        <View style={s.paymentTable}>
          <View style={s.paymentRow}>
            <View style={{ flex: 2 }}>
              <Text style={s.bold}>Deposit — Due upon signing</Text>
              <Text style={{ ...s.label, fontSize: 8 }}>10% of contract total</Text>
            </View>
            <View style={{ flex: 1, alignItems: "flex-end" }}>
              <Text style={{ ...s.bold, color: NAVY, fontSize: 11 }}>{formatCurrency(depositAmt)}</Text>
            </View>
          </View>
          <View style={s.paymentRowLast}>
            <View style={{ flex: 2 }}>
              <Text style={s.bold}>Balance — Due upon completion</Text>
              <Text style={{ ...s.label, fontSize: 8 }}>90% of contract total, collected by Strategic Partner</Text>
            </View>
            <View style={{ flex: 1, alignItems: "flex-end" }}>
              <Text style={{ ...s.bold, color: NAVY, fontSize: 11 }}>{formatCurrency(finalAmt)}</Text>
            </View>
          </View>
        </View>

        <PageFooter config={config} bidNumber={bid.bidNumber} />
      </Page>

      {/* ── Page 2: Terms & Conditions ──────────────────────────────────────── */}
      <Page size="LETTER" style={s.page}>
        <View style={s.header}>
          <View style={s.companyBlock}>
            <Text style={s.companyName}>{config.companyName}</Text>
            {config.licenseNumber && <Text style={s.companyMeta}>{config.licenseNumber}</Text>}
          </View>
          <View style={s.metaBlock}>
            <Text style={s.proposalNum}>{bid.bidNumber}</Text>
            <Text style={s.proposalDate}>{bid.customer.firstName} {bid.customer.lastName}</Text>
          </View>
        </View>

        <Text style={s.sectionTitle}>TERMS & CONDITIONS</Text>
        {config.termsConditions && (
          <Text style={s.tcText}>{config.termsConditions}</Text>
        )}

        {/* Signatures */}
        <Text style={{ ...s.sectionTitle, marginTop: 20 }}>AUTHORIZATION & SIGNATURES</Text>
        <Text style={{ fontSize: 8.5, color: "#374151", marginBottom: 10 }}>
          By signing below, both parties agree to the scope of work, pricing, payment schedule, and all terms and conditions set forth in this agreement.
        </Text>
        <View style={s.sigSection}>
          <View style={s.sigBox}>
            <View style={s.sigLine} />
            <Text style={s.sigLabel}>Customer Signature</Text>
            <Text style={{ ...s.sigLabel, marginTop: 3 }}>Print Name: {bid.customer.firstName} {bid.customer.lastName}</Text>
            <Text style={{ ...s.sigLabel, marginTop: 10 }}>Date: ___________________________</Text>
          </View>
          <View style={s.sigBox}>
            <View style={s.sigLine} />
            <Text style={s.sigLabel}>Authorized Representative — {config.companyName}</Text>
            <Text style={{ ...s.sigLabel, marginTop: 3 }}>Print Name: ___________________________</Text>
            <Text style={{ ...s.sigLabel, marginTop: 10 }}>Date: ___________________________</Text>
          </View>
        </View>

        <PageFooter config={config} bidNumber={bid.bidNumber} />
      </Page>

      {/* ── Page 3: Preexisting Conditions Notice ────────────────────────────── */}
      <Page size="LETTER" style={s.page}>
        <View style={s.header}>
          <View style={s.companyBlock}>
            <Text style={s.companyName}>{config.companyName}</Text>
            {config.licenseNumber && <Text style={s.companyMeta}>{config.licenseNumber}</Text>}
          </View>
          <View style={s.metaBlock}>
            <Text style={s.proposalNum}>{bid.bidNumber}</Text>
          </View>
        </View>

        <Text style={s.noticeTitle}>PREEXISTING CONDITIONS NOTICE</Text>
        <Text style={s.noticeText}>
          The following notice is provided to all customers prior to commencement of solar system remove and replace (R&R) services:
        </Text>

        <View style={s.noticeBox}>
          <Text style={{ ...s.noticeText, ...s.noticeBold, marginBottom: 6 }}>
            IMPORTANT — PLEASE READ CAREFULLY BEFORE SIGNING
          </Text>
          <Text style={s.noticeText}>
            Solar equipment, including panels, inverters, racking, wiring, and related components, may have pre-existing conditions that are not visible until the equipment is removed. These conditions may include, but are not limited to:
          </Text>
          <Text style={{ ...s.noticeText, marginTop: 8, marginLeft: 10 }}>
            • Micro-cracks in solar panels not visible from the exterior{"\n"}
            • Corrosion, oxidation, or deterioration of mounting hardware{"\n"}
            • Roof deck damage, dry rot, or water intrusion beneath the array{"\n"}
            • Wiring degradation, improper installations, or code violations{"\n"}
            • Pre-existing inverter or optimizer faults{"\n"}
            • Animal nesting or debris beneath the array
          </Text>
          <Text style={{ ...s.noticeText, marginTop: 10 }}>
            {config.companyName} and its Strategic Partner are <Text style={s.noticeBold}>not responsible</Text> for pre-existing conditions discovered during removal. Any additional repairs required to address such conditions will be identified and quoted separately before any additional work is performed.
          </Text>
          <Text style={{ ...s.noticeText, marginTop: 10 }}>
            Customer acknowledges receipt of this notice and agrees that {config.companyName} is not liable for pre-existing damage that was not caused by the R&R services performed under this agreement.
          </Text>
        </View>

        <View style={{ ...s.sigSection, marginTop: 40 }}>
          <View style={s.sigBox}>
            <View style={s.sigLine} />
            <Text style={s.sigLabel}>Customer Signature — Preexisting Conditions Acknowledgment</Text>
            <Text style={{ ...s.sigLabel, marginTop: 3 }}>Print Name: {bid.customer.firstName} {bid.customer.lastName}</Text>
            <Text style={{ ...s.sigLabel, marginTop: 10 }}>Date: ___________________________</Text>
          </View>
        </View>

        <PageFooter config={config} bidNumber={bid.bidNumber} />
      </Page>

      {/* ── Page 4: 5-Day Right to Cancel ────────────────────────────────────── */}
      <Page size="LETTER" style={s.page}>
        <View style={s.header}>
          <View style={s.companyBlock}>
            <Text style={s.companyName}>{config.companyName}</Text>
            {config.licenseNumber && <Text style={s.companyMeta}>{config.licenseNumber}</Text>}
          </View>
          <View style={s.metaBlock}>
            <Text style={s.proposalNum}>{bid.bidNumber}</Text>
          </View>
        </View>

        <Text style={s.noticeTitle}>NOTICE OF CANCELLATION</Text>
        <Text style={{ ...s.noticeText, textAlign: "center", marginBottom: 12 }}>
          (California Business and Professions Code § 7159 — Five-Day Right to Cancel)
        </Text>

        <View style={s.noticeBox}>
          <Text style={{ ...s.noticeText, ...s.noticeBold, marginBottom: 8, fontSize: 10 }}>
            YOU, THE BUYER, MAY CANCEL THIS CONTRACT AT ANY TIME PRIOR TO MIDNIGHT OF THE FIFTH BUSINESS DAY AFTER THE DATE OF THIS TRANSACTION.
          </Text>
          <Text style={s.noticeText}>
            To cancel this contract, mail or deliver a signed and dated copy of this cancellation notice, or any other written notice, to:
          </Text>
          <Text style={{ ...s.noticeText, marginTop: 8, marginLeft: 10, fontFamily: "Helvetica-Bold" }}>
            {config.companyName}{"\n"}
            {config.address}{"\n"}
            {config.city}, {config.state} {config.zip}{"\n"}
            {config.phone}
          </Text>
          <Text style={{ ...s.noticeText, marginTop: 12 }}>
            NOT LATER THAN MIDNIGHT OF: ___________________________
          </Text>
          <Text style={{ ...s.noticeText, marginTop: 12, fontStyle: "italic" }}>
            If you cancel, any payments made by you under the contract will be returned within 10 days following receipt by the seller of your cancellation notice.
          </Text>
        </View>

        <Text style={{ ...s.noticeText, marginTop: 20, ...s.noticeBold }}>
          I HEREBY CANCEL THIS CONTRACT:
        </Text>

        <View style={{ ...s.sigSection, marginTop: 20 }}>
          <View style={s.sigBox}>
            <View style={s.sigLine} />
            <Text style={s.sigLabel}>Customer Signature</Text>
            <Text style={{ ...s.sigLabel, marginTop: 3 }}>Print Name: {bid.customer.firstName} {bid.customer.lastName}</Text>
            <Text style={{ ...s.sigLabel, marginTop: 10 }}>Date: ___________________________</Text>
          </View>
          <View style={s.sigBox}>
            <Text style={{ fontSize: 8, color: GRAY, marginTop: 4 }}>
              Cut here and retain copy for your records.
            </Text>
          </View>
        </View>

        <Text style={{ ...s.footerText, marginTop: 30, textAlign: "center", color: GRAY }}>
          ©2025 {config.companyName} | {config.licenseNumber} | Form 25-003-A-SVC
        </Text>

        <PageFooter config={config} bidNumber={bid.bidNumber} />
      </Page>

    </Document>
  );
}
