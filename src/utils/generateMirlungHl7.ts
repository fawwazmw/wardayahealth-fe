/**
 * mirLung Dx HL7 v2.5.1 Message Generator
 * Generates an ORU^R01 observation result message for mirLung Dx results.
 */

export interface MirlungHl7Data {
  patientName: string;
  patientId: string;
  dateOfBirth: string; // YYYYMMDD
  sex: string; // M, F, O, U
  orderingPhysician: string;
  facility: string;
  testCaseId: string;
  mirlungScore: number;
  riskCategory: string;
  specimenType: string;
  collectionDate: string; // YYYYMMDD
  reportDate: string; // YYYYMMDD
}

function hl7Timestamp(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}

function formatName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[parts.length - 1]}^${parts.slice(0, -1).join(" ")}`;
  }
  return `${name}^`;
}

function sexCode(sex: string): string {
  const s = (sex || "").toLowerCase();
  if (s === "male" || s === "m") return "M";
  if (s === "female" || s === "f") return "F";
  return "U";
}

/**
 * Generate an HL7 v2.5.1 ORU^R01 message for mirLung Dx results.
 */
export function generateMirlungHl7(data: MirlungHl7Data): string {
  const ts = hl7Timestamp();
  const msgId = `AVERYWELL${ts}${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const segments: string[] = [];

  // MSH - Message Header
  segments.push(
    [
      "MSH",
      "^~\\&",
      "AVERYWELL_LIS",
      data.facility || "AVERYWELL",
      "RECEIVING_APP",
      "RECEIVING_FAC",
      ts,
      "",
      "ORU^R01^ORU_R01",
      msgId,
      "P",
      "2.5.1",
      "",
      "",
      "AL",
      "NE",
      "",
      "",
      "",
      "",
      "",
      "",
      "UNICODE UTF-8",
    ].join("|")
  );

  // PID - Patient Identification
  segments.push(
    [
      "PID",
      "1",
      "",
      data.patientId || "",
      "",
      formatName(data.patientName),
      "",
      data.dateOfBirth || "",
      sexCode(data.sex),
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ].join("|")
  );

  // PV1 - Patient Visit
  segments.push(
    [
      "PV1",
      "1",
      "O",
      "",
      "",
      "",
      "",
      formatName(data.orderingPhysician),
    ].join("|")
  );

  // ORC - Common Order
  segments.push(
    [
      "ORC",
      "RE",
      data.testCaseId,
      data.testCaseId,
      "",
      "CM",
    ].join("|")
  );

  // OBR - Observation Request
  segments.push(
    [
      "OBR",
      "1",
      data.testCaseId,
      data.testCaseId,
      "MIRLUNG^mirLung Dx - Lung Nodule Risk Stratification^L",
      "",
      data.collectionDate || ts.slice(0, 8),
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      formatName(data.orderingPhysician),
      "",
      "",
      "",
      "",
      "",
      "",
      data.reportDate || ts.slice(0, 8),
      "",
      "F",
    ].join("|")
  );

  // OBX-1 - mirLung Dx Score
  segments.push(
    [
      "OBX",
      "1",
      "NM",
      "MIRLUNG_SCORE^mirLung Dx Integrated Risk^L",
      "1",
      data.mirlungScore.toFixed(2),
      "%",
      "",
      data.mirlungScore >= 50 ? "H" : "N",
      "",
      "",
      "F",
      "",
      "",
      ts,
    ].join("|")
  );

  // OBX-2 - Risk Category
  segments.push(
    [
      "OBX",
      "2",
      "ST",
      "MIRLUNG_RISK^mirLung Dx Risk Category^L",
      "2",
      data.riskCategory,
      "",
      "",
      data.riskCategory.includes("HIGH") ? "H" : "N",
      "",
      "",
      "F",
      "",
      "",
      ts,
    ].join("|")
  );

  // OBX-3 - Interpretation
  const interpretation = data.mirlungScore >= 50
    ? "High probability of molecular expression patterns associated with lung malignancy. Correlation with histopathological findings recommended."
    : "Low probability of molecular expression patterns associated with lung malignancy. Continued surveillance recommended.";

  segments.push(
    [
      "OBX",
      "3",
      "FT",
      "MIRLUNG_INTERP^mirLung Dx Interpretation^L",
      "3",
      interpretation,
      "",
      "",
      "",
      "",
      "",
      "F",
      "",
      "",
      ts,
    ].join("|")
  );

  // SPM - Specimen
  segments.push(
    [
      "SPM",
      "1",
      data.testCaseId,
      "",
      `${data.specimenType || "Blood"}^^L`,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      data.collectionDate || "",
    ].join("|")
  );

  return segments.join("\r\n") + "\r\n";
}

/**
 * Generate HL7 and trigger download.
 */
export function downloadMirlungHl7(data: MirlungHl7Data, fileName: string): void {
  const hl7 = generateMirlungHl7(data);
  const blob = new Blob([hl7], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(url);
  a.remove();
}
