/* eslint-disable no-useless-escape */
/**
 * Smart Form Parser - Document Intelligence
 * Extracts structured patient data from OCR text using pattern matching.
 * Designed to parse the Wardayahealth Patient Request Form (GE002 format).
 */

export interface ParsedPatientData {
  patientName?: string;
  patientId?: string; // NRIC / ID number
  sex?: string;
  dateOfBirth?: string;
  nationality?: string;
  physicianName?: string;
  facility?: string;
  dateBloodCollected?: string;
  contactNumber?: string;
  address?: string;
  ethnicity?: string;
  specimenType?: string;
  clinicalNotes?: string;
  confidence: number; // Overall parse confidence 0-100
  fieldsFound: number;
  fieldsTotal: number;
  rawText: string;
}

/**
 * Parse OCR text and extract patient form fields.
 * Uses multiple strategies: label-value pairs, pattern matching, and heuristics.
 */
export function parsePatientForm(ocrText: string): ParsedPatientData {
  const lines = ocrText.split("\n").map((l) => l.trim()).filter(Boolean);
  const fullText = lines.join(" ");
  const result: ParsedPatientData = {
    confidence: 0,
    fieldsFound: 0,
    fieldsTotal: 10,
    rawText: ocrText,
  };

  // --- Strategy 1: Label-Value pair extraction ---
  // Look for "Label: Value" or "Label Value" patterns

  // Patient Name
  result.patientName = extractField(lines, fullText, [
    /patient\s*name\s*[:\-]?\s*(.+)/i,
    /name\s*[:\-]\s*(.+)/i,
    /full\s*name\s*[:\-]?\s*(.+)/i,
  ]);

  // Patient ID / NRIC (Singapore NRIC: [STFGM] + 7 digits + [A-Z], but some systems use 8 digits)
  result.patientId = extractField(lines, fullText, [
    /patient\s*id\s*[:\-]?\s*([A-Z]\d{7,8}[A-Z])/i,
    /nric\s*[:\-]?\s*([A-Z]\d{7,8}[A-Z])/i,
    /id\s*(?:number|no\.?)\s*[:\-]?\s*(.+)/i,
    /passport\s*(?:number|no\.?)\s*[:\-]?\s*(.+)/i,
  ]);

  // Also try to find NRIC pattern anywhere in text
  if (!result.patientId) {
    const nricMatch = fullText.match(/[STFGM]\d{7,8}[A-Z]/i);
    if (nricMatch) result.patientId = nricMatch[0].toUpperCase();
  }

  // Sex / Gender
  result.sex = extractField(lines, fullText, [
    /(?:sex|gender)\s*[:\-]?\s*(male|female|m|f)/i,
  ]);
  if (result.sex) {
    const s = result.sex.toLowerCase();
    if (s === "m") result.sex = "Male";
    else if (s === "f") result.sex = "Female";
    else result.sex = s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  }

  // Date of Birth
  result.dateOfBirth = extractField(lines, fullText, [
    /(?:date\s*of\s*birth|dob|d\.o\.b\.?|birth\s*date)\s*[:\-]?\s*(\d{1,2}[\s\-\/\.]\w{3,9}[\s\-\/\.]\d{2,4})/i,
    /(?:date\s*of\s*birth|dob|d\.o\.b\.?)\s*[:\-]?\s*(\d{1,2}[\s\-\/\.]\d{1,2}[\s\-\/\.]\d{2,4})/i,
  ]);

  // Nationality
  result.nationality = extractField(lines, fullText, [
    /nationality\s*[:\-]?\s*(.+)/i,
    /citizen(?:ship)?\s*[:\-]?\s*(.+)/i,
  ]);

  // Physician / Doctor
  result.physicianName = extractField(lines, fullText, [
    /(?:ordering\s*)?physician\s*[:\-]?\s*((?:dr\.?\s*)?[a-z\s]+)/i,
    /(?:referring\s*)?doctor\s*[:\-]?\s*((?:dr\.?\s*)?[a-z\s]+)/i,
    /(?:dr\.?\s+[a-z]+(?:\s+[a-z]+){0,3})/i,
  ]);

  // Facility / Hospital
  result.facility = extractField(lines, fullText, [
    /facility\s*[:\-]?\s*(.+)/i,
    /hospital\s*[:\-]?\s*(.+)/i,
    /clinic\s*[:\-]?\s*(.+)/i,
    /(?:collected\s*(?:at|from))\s*[:\-]?\s*(.+)/i,
  ]);

  // Date of blood collected
  result.dateBloodCollected = extractField(lines, fullText, [
    /(?:date\s*(?:of\s*)?(?:blood\s*)?collect(?:ed|ion))\s*[:\-]?\s*(\d{1,2}[\s\-\/\.]\w{3,9}[\s\-\/\.]\d{2,4})/i,
    /(?:specimen|sample)\s*(?:date|collected)\s*[:\-]?\s*(\d{1,2}[\s\-\/\.]\w{3,9}[\s\-\/\.]\d{2,4})/i,
    /(?:blood\s*draw)\s*[:\-]?\s*(\d{1,2}[\s\-\/\.]\w{3,9}[\s\-\/\.]\d{2,4})/i,
  ]);

  // Contact Number
  result.contactNumber = extractField(lines, fullText, [
    /(?:contact|phone|tel|mobile)\s*(?:number|no\.?)?\s*[:\-]?\s*([\d\s\+\-()]{7,})/i,
  ]);

  // Ethnicity / Race
  result.ethnicity = extractField(lines, fullText, [
    /(?:ethnicity|race)\s*[:\-]?\s*(.+)/i,
  ]);

  // Specimen Type
  result.specimenType = extractField(lines, fullText, [
    /(?:specimen|sample)\s*(?:type)?\s*[:\-]?\s*(blood|serum|plasma|whole\s*blood|edta|swab)/i,
  ]);

  // Clinical Notes
  result.clinicalNotes = extractField(lines, fullText, [
    /(?:clinical\s*(?:notes|information|history))\s*[:\-]?\s*(.+)/i,
    /(?:diagnosis|indication)\s*[:\-]?\s*(.+)/i,
  ]);

  // --- Calculate confidence ---
  const fields = [
    result.patientName,
    result.patientId,
    result.sex,
    result.dateOfBirth,
    result.nationality,
    result.physicianName,
    result.facility,
    result.dateBloodCollected,
    result.contactNumber,
    result.ethnicity,
  ];

  result.fieldsFound = fields.filter(Boolean).length;
  result.confidence = Math.round((result.fieldsFound / result.fieldsTotal) * 100);

  return result;
}

// --- Helper: Extract a field value using multiple regex patterns ---
function extractField(
  lines: string[],
  fullText: string,
  patterns: RegExp[]
): string | undefined {
  // Try each pattern against individual lines first (more precise)
  for (const pattern of patterns) {
    for (const line of lines) {
      const match = line.match(pattern);
      if (match && match[1]) {
        const value = match[1].trim();
        // Filter out garbage
        if (value.length >= 1 && value.length <= 200) {
          return cleanValue(value);
        }
      }
    }
  }

  // Fall back to full text matching
  for (const pattern of patterns) {
    const match = fullText.match(pattern);
    if (match && match[1]) {
      const value = match[1].trim();
      if (value.length >= 1 && value.length <= 200) {
        return cleanValue(value);
      }
    }
    // If pattern has no capture group, return the full match
    if (match && !match[1]) {
      return cleanValue(match[0].trim());
    }
  }

  return undefined;
}

function cleanValue(value: string): string {
  // Remove trailing colons, pipes, and excess whitespace
  return value
    .replace(/[:\|]+$/, "")
    .replace(/\s+/g, " ")
    .trim();
}
