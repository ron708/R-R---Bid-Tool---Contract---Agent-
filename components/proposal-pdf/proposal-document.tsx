import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Bid, BidLineItem, Customer, Contractor, SolarponicsConfig } from "@prisma/client";

const styles = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 10, padding: 40, color: "#1a1a1a" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24, paddingBottom: 16, borderBottomWidth: 2, borderBottomColor: "#1E3A5F" },
  companyName: { fontSize: 20, fontFamily: "Helvetica-Bold", color: "#1E3A5F" },
  companySubtext: { fontSize: 8, color: "#6b7280", marginTop: 2 },
  bidMeta: { textAlign: "right" },
  bidNumber: { fontSize: 14, fontFamily: "Helvetica-Bold", color: "#F97316" },
  sectionTitle: { fontSize: 11, fontFamily: "Helvetica-Bold", color: "#1E3A5F", marginBottom: 6, marginTop: 16, borderBottomWidth: 1, borderBottomColor: "#e5e7eb", paddingBottom: 3 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 3 },
  label: { color: "#6b7280" },
  bold: { fontFamily: "Helvetica-Bold" },
  table: { marginTop: 8 },
  tableHeader: { flexDirection: "row", backgroundColor: "#1E3A5F", padding: "6 8", borderRadius: 3 },
  tableHeaderText: { color: "white", fontFamily: "Helvetica-Bold", fontSize: 9 },
  tableRow: { flexDirection: "row", padding: "5 8", borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  col1: { flex: 3 },
  col2: { flex: 1, textAlign: "center" },
  col3: { flex: 1, textAlign: "right" },
  total: { flexDirection: "row", justifyContent: "flex-end", marginTop: 10, paddingTop: 8, borderTopWidth: 2, borderTopColor: "#1E3A5F" },
  totalAmount: { fontSize: 16, fontFamily: "Helvetica-Bold", color: "#F97316" },
  terms: { fontSize: 8, color: "#6b7280", marginTop: 20, lineHeight: 1.5 },
  signatureSection: { marginTop: 32, flexDirection: "row", gap: 40 },
  signatureBox: { flex: 1, borderTopWidth: 1, borderTopColor: "#374151", paddingTop: 6 },
  signatureLabel: { fontSize: 8, color: "#6b7280" },
  badge: { backgroundColor: "#fef3c7", padding: "2 6", borderRadius: 3, fontSize: 8, color: "#92400e" },
});

interface Props {
  bid: Bid & { lineItems: BidLineItem[]; customer: Customer; contractor: Contractor };
  config: SolarponicsConfig;
}

const scopeLabel: Record<string, string> = {
  FULL_RR: "Full Remove & Replace (R&R)",
  REMOVAL_ONLY: "Solar System Removal Only",
  INSTALL_ONLY: "Solar System Reinstallation Only",
};

const roofLabel: Record<string, string> = {
  COMP_SHINGLE: "Composition Shingle", TILE: "Tile", METAL: "Metal",
  FLAT_TPO: "Flat (TPO)", FLAT_EPDM: "Flat (EPDM)", FLAT_MOD_BIT: "Flat (Modified Bitumen)",
};

export function ProposalDocument({ bid, config }: Props) {
  const address = [config.address, config.city, config.state, config.zip].filter(Boolean).join(", ");
  const siteAddress = [bid.customer.siteAddress, bid.customer.siteCity, bid.customer.siteState].filter(Boolean).join(", ");

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>{config.companyName}</Text>
            {config.licenseNumber && <Text style={styles.companySubtext}>License #{config.licenseNumber}</Text>}
            {address && <Text style={styles.companySubtext}>{address}</Text>}
            {config.phone && <Text style={styles.companySubtext}>{config.phone}</Text>}
            {config.email && <Text style={styles.companySubtext}>{config.email}</Text>}
          </View>
          <View style={styles.bidMeta}>
            <Text style={{ fontSize: 8, color: "#6b7280", marginBottom: 4 }}>SOLAR R&R PROPOSAL</Text>
            <Text style={styles.bidNumber}>{bid.bidNumber}</Text>
            <Text style={{ fontSize: 8, color: "#6b7280", marginTop: 4 }}>Date: {formatDate(bid.createdAt)}</Text>
            <View style={{ ...styles.badge, marginTop: 6 }}>
              <Text>Strategic Partner: {bid.contractor.name}</Text>
            </View>
          </View>
        </View>

        {/* Customer */}
        <Text style={styles.sectionTitle}>CUSTOMER INFORMATION</Text>
        <View style={styles.row}>
          <Text><Text style={styles.label}>Name: </Text>{bid.customer.firstName} {bid.customer.lastName}</Text>
          {bid.customer.phone && <Text><Text style={styles.label}>Phone: </Text>{bid.customer.phone}</Text>}
        </View>
        <View style={styles.row}>
          <Text><Text style={styles.label}>Site Address: </Text>{siteAddress}</Text>
          {bid.customer.email && <Text><Text style={styles.label}>Email: </Text>{bid.customer.email}</Text>}
        </View>

        {/* Scope of Work */}
        <Text style={styles.sectionTitle}>SCOPE OF WORK</Text>
        <Text style={{ marginBottom: 4 }}>{scopeLabel[bid.workScope] ?? bid.workScope}</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16, marginTop: 4 }}>
          <Text><Text style={styles.label}>Panels: </Text>{bid.panelCount}{bid.panelBrand ? ` (${bid.panelBrand}${bid.panelModel ? " " + bid.panelModel : ""})` : ""}</Text>
          {bid.systemSizeKw && <Text><Text style={styles.label}>System Size: </Text>{bid.systemSizeKw} kW</Text>}
          {bid.inverterType && <Text><Text style={styles.label}>Inverter: </Text>{bid.inverterType}{bid.inverterBrand ? ` (${bid.inverterBrand})` : ""}</Text>}
          {bid.roofType && <Text><Text style={styles.label}>Roof Type: </Text>{roofLabel[bid.roofType] ?? bid.roofType}</Text>}
          {bid.pitchCategory && <Text><Text style={styles.label}>Pitch: </Text>{bid.pitchCategory}</Text>}
          {bid.stories > 1 && <Text><Text style={styles.label}>Stories: </Text>{bid.stories}</Text>}
          {bid.railLinearFt && <Text><Text style={styles.label}>Rail: </Text>{bid.railLinearFt} lin ft</Text>}
          {bid.attachmentType && <Text><Text style={styles.label}>Attachment: </Text>{bid.attachmentType}</Text>}
        </View>
        {bid.notes && (
          <Text style={{ marginTop: 6, fontStyle: "italic", color: "#374151" }}>Note: {bid.notes}</Text>
        )}

        {/* Pricing */}
        <Text style={styles.sectionTitle}>PRICING</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={{ ...styles.tableHeaderText, ...styles.col1 }}>Description</Text>
            <Text style={{ ...styles.tableHeaderText, ...styles.col2 }}>Qty / Unit</Text>
            <Text style={{ ...styles.tableHeaderText, ...styles.col3 }}>Amount</Text>
          </View>
          {bid.lineItems.map((item, i) => (
            <View key={i} style={{ ...styles.tableRow, backgroundColor: i % 2 === 0 ? "white" : "#f9fafb" }}>
              <Text style={styles.col1}>{item.description}</Text>
              <Text style={{ ...styles.col2, color: "#6b7280" }}>{item.quantity} {item.unit}</Text>
              <Text style={styles.col3}>{formatCurrency(item.total)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.total}>
          <View>
            <View style={styles.row}>
              <Text style={{ ...styles.label, marginRight: 40 }}>Subtotal</Text>
              <Text>{formatCurrency(bid.subtotal ?? 0)}</Text>
            </View>
            <View style={{ ...styles.row, marginTop: 6 }}>
              <Text style={{ ...styles.bold, marginRight: 40, fontSize: 12 }}>TOTAL</Text>
              <Text style={styles.totalAmount}>{formatCurrency(bid.total ?? 0)}</Text>
            </View>
          </View>
        </View>

        {/* Terms */}
        {config.termsConditions && (
          <>
            <Text style={styles.sectionTitle}>TERMS & CONDITIONS</Text>
            <Text style={styles.terms}>{config.termsConditions}</Text>
          </>
        )}

        {/* Signatures */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <Text style={{ height: 30 }}></Text>
            <Text style={styles.signatureLabel}>Customer Signature</Text>
            <Text style={{ ...styles.signatureLabel, marginTop: 4 }}>{bid.customer.firstName} {bid.customer.lastName}</Text>
            <Text style={{ ...styles.signatureLabel, marginTop: 12 }}>Date: _________________</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={{ height: 30 }}></Text>
            <Text style={styles.signatureLabel}>Authorized Representative</Text>
            <Text style={{ ...styles.signatureLabel, marginTop: 4 }}>{config.companyName}</Text>
            <Text style={{ ...styles.signatureLabel, marginTop: 12 }}>Date: _________________</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
