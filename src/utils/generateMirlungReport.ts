import { PDFDocument, rgb, StandardFonts, type PDFPage, type PDFFont } from "pdf-lib";

/**
 * Wardayahealth Medical Report Generator
 * Generates a PDF matching the GE002 Medical Report template.
 */

export interface MirlungReportData {
  reportId: string;
  patientName: string;
  patientId: string; // NRIC / ID number
  sex: string;
  dateOfBirth: string;
  nationality: string;
  orderingPhysician: string;
  facility: string;
  dateBloodCollected: string;
  dateOfReport: string;
  mirlungScore: number; // e.g. 87.00
  riskCategory: "LOW RISK" | "HIGH RISK";
}

// Colors
const BLACK = rgb(0, 0, 0);
const WHITE = rgb(1, 1, 1);
const GRAY = rgb(0.45, 0.45, 0.45);
const LIGHT_GRAY = rgb(0.92, 0.92, 0.92);
const TEAL = rgb(0.11, 0.67, 0.58); // Wardayahealth brand
const RED = rgb(0.8, 0.1, 0.1);
const GREEN = rgb(0.1, 0.55, 0.25);
const DARK_BG = rgb(0.12, 0.14, 0.18);

// Layout constants (A4)
const PAGE_W = 595;
const PAGE_H = 842;
const MARGIN_L = 45;
const MARGIN_R = 45;
const MARGIN_T = 45;
const MARGIN_B = 60;
const CONTENT_W = PAGE_W - MARGIN_L - MARGIN_R;

export async function generateMirlungReport(data: MirlungReportData): Promise<Blob> {
  const doc = await PDFDocument.create();
  const fontReg = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  const page = doc.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN_T;

  // --- Helpers ---
  const drawText = (
    text: string,
    x: number,
    yPos: number,
    opts: { font?: PDFFont; size?: number; color?: ReturnType<typeof rgb> } = {}
  ) => {
    page.drawText(text, {
      x,
      y: yPos,
      size: opts.size ?? 9,
      font: opts.font ?? fontReg,
      color: opts.color ?? BLACK,
    });
  };

  const drawLine = (x1: number, y1: number, x2: number, y2: number, thickness = 0.5) => {
    page.drawLine({
      start: { x: x1, y: y1 },
      end: { x: x2, y: y2 },
      thickness,
      color: LIGHT_GRAY,
    });
  };

  const drawRect = (
    x: number,
    yPos: number,
    w: number,
    h: number,
    color: ReturnType<typeof rgb>
  ) => {
    page.drawRectangle({ x, y: yPos, width: w, height: h, color });
  };

  // --- HEADER: "Medical Report" banner ---
  drawRect(MARGIN_L, y - 28, CONTENT_W, 28, DARK_BG);
  drawText("Medical Report", MARGIN_L + 12, y - 20, {
    font: fontBold,
    size: 13,
    color: WHITE,
  });
  const confText = "CONFIDENTIAL";
  const confW = fontBold.widthOfTextAtSize(confText, 9);
  drawText(confText, PAGE_W - MARGIN_R - confW - 12, y - 19, {
    font: fontBold,
    size: 9,
    color: TEAL,
  });
  y -= 40;

  // --- PATIENT INFORMATION SECTION ---
  drawText("Patient Information", MARGIN_L, y, {
    font: fontBold,
    size: 10,
    color: TEAL,
  });
  y -= 5;
  drawLine(MARGIN_L, y, PAGE_W - MARGIN_R, y, 1);
  y -= 16;

  // Two-column patient info layout
  const col1X = MARGIN_L;
  const col2X = MARGIN_L + 280;
  const labelSize = 8;
  const valueSize = 9;
  const rowH = 22;

  const drawField = (
    label: string,
    value: string,
    x: number,
    yPos: number
  ) => {
    drawText(label, x, yPos, { size: labelSize, color: GRAY });
    drawText(value || "—", x, yPos - 11, { font: fontBold, size: valueSize });
  };

  drawField("Patient Name", data.patientName, col1X, y);
  drawField("Report ID", data.reportId, col2X, y);
  y -= rowH;

  drawField("Patient ID", data.patientId, col1X, y);
  drawField("Sex", data.sex, col2X, y);
  y -= rowH;

  drawField("Date of Birth", data.dateOfBirth, col1X, y);
  drawField("Nationality", data.nationality, col2X, y);
  y -= rowH;

  drawField("Ordering Physician", data.orderingPhysician, col1X, y);
  drawField("Facility", data.facility, col2X, y);
  y -= rowH;

  drawField("Date of blood collected", data.dateBloodCollected, col1X, y);
  drawField("Date of report", data.dateOfReport, col2X, y);
  y -= rowH + 8;

  // --- TEST PERFORMED SECTION ---
  drawText("Test Performed", MARGIN_L, y, {
    font: fontBold,
    size: 10,
    color: TEAL,
  });
  y -= 5;
  drawLine(MARGIN_L, y, PAGE_W - MARGIN_R, y, 1);
  y -= 16;

  drawText("Test Assay", MARGIN_L, y, { size: labelSize, color: GRAY });
  y -= 12;
  drawText("Wardayahealth Risk Panel\u2122 \u2013 Lung Nodule Risk Stratification", MARGIN_L, y, {
    font: fontBold,
    size: 10,
  });
  y -= 24;

  // --- RESULTS SECTION ---
  drawText("Results", MARGIN_L, y, {
    font: fontBold,
    size: 10,
    color: TEAL,
  });
  y -= 5;
  drawLine(MARGIN_L, y, PAGE_W - MARGIN_R, y, 1);
  y -= 20;

  // Score display
  drawText("Wardayahealth Risk Panel\u2122 integrated risk", MARGIN_L, y, {
    size: 10,
  });
  y -= 22;

  const scoreText = `${data.mirlungScore.toFixed(2)}%`;
  const isHigh = data.riskCategory === "HIGH RISK";
  const scoreColor = isHigh ? RED : GREEN;

  drawText(scoreText, MARGIN_L, y, {
    font: fontBold,
    size: 28,
    color: scoreColor,
  });

  // Risk category badge
  const badgeX = MARGIN_L + fontBold.widthOfTextAtSize(scoreText, 28) + 20;
  const badgeW = fontBold.widthOfTextAtSize(data.riskCategory, 10) + 20;
  drawRect(badgeX, y - 4, badgeW, 24, scoreColor);
  drawText(data.riskCategory, badgeX + 10, y + 3, {
    font: fontBold,
    size: 10,
    color: WHITE,
  });
  y -= 36;

  // --- RISK CATEGORY TABLE ---
  drawText("Risk Category Table", MARGIN_L, y, {
    font: fontBold,
    size: 10,
    color: TEAL,
  });
  y -= 5;
  drawLine(MARGIN_L, y, PAGE_W - MARGIN_R, y, 1);
  y -= 6;

  // Table header
  const tableX = MARGIN_L;
  const colW0 = 120; // Risk Category
  const colW1 = 125; // <6mm
  const colW2 = 125; // 6-8mm
  const colW3 = CONTENT_W - colW0 - colW1 - colW2; // >8mm
  const headerH = 22;

  drawRect(tableX, y - headerH, CONTENT_W, headerH, DARK_BG);
  drawText("Risk Category", tableX + 6, y - 14, {
    font: fontBold,
    size: 8,
    color: WHITE,
  });
  drawText("<6 mm", tableX + colW0 + 6, y - 14, {
    font: fontBold,
    size: 8,
    color: WHITE,
  });
  drawText("6\u20138 mm", tableX + colW0 + colW1 + 6, y - 14, {
    font: fontBold,
    size: 8,
    color: WHITE,
  });
  drawText(">8 mm", tableX + colW0 + colW1 + colW2 + 6, y - 14, {
    font: fontBold,
    size: 8,
    color: WHITE,
  });
  y -= headerH;

  // Row: Low (<50%)
  const rowLowH = 52;
  drawRect(tableX, y - rowLowH, colW0, rowLowH, rgb(0.93, 0.98, 0.93));
  drawText("Low (<50%)", tableX + 6, y - 14, {
    font: fontBold,
    size: 8,
    color: GREEN,
  });

  const lowRec1 = wrapTextLines(
    "Wardayahealth Risk Panel to be repeated periodically (e.g., annually) to monitor biological changes.",
    fontReg,
    7,
    colW1 - 12
  );
  drawWrapped(page, lowRec1, tableX + colW0 + 6, y - 10, fontReg, 7, 9);

  const lowRec2 = wrapTextLines(
    "Longer LDCT surveillance as per nodule guidelines with Wardayahealth Risk Panel repeat testing (e.g., every 6 months).",
    fontReg,
    7,
    colW2 - 12
  );
  drawWrapped(page, lowRec2, tableX + colW0 + colW1 + 6, y - 10, fontReg, 7, 9);

  const lowRec3 = wrapTextLines(
    "Interval LDCT surveillance as per nodule guidelines with Wardayahealth Risk Panel repeat testing (e.g., every 6 months).",
    fontReg,
    7,
    colW3 - 12
  );
  drawWrapped(
    page,
    lowRec3,
    tableX + colW0 + colW1 + colW2 + 6,
    y - 10,
    fontReg,
    7,
    9
  );

  // Row borders
  drawLine(tableX, y - rowLowH, tableX + CONTENT_W, y - rowLowH);
  y -= rowLowH;

  // Row: High (>50%)
  const rowHighH = 52;
  drawRect(tableX, y - rowHighH, colW0, rowHighH, rgb(0.98, 0.93, 0.93));
  drawText("High (>50%)", tableX + 6, y - 14, {
    font: fontBold,
    size: 8,
    color: RED,
  });

  const highRec1 = wrapTextLines(
    "Interval LDCT surveillance as per nodule guidelines with Wardayahealth Risk Panel repeat testing (e.g., every 6 months).",
    fontReg,
    7,
    colW1 - 12
  );
  drawWrapped(page, highRec1, tableX + colW0 + 6, y - 10, fontReg, 7, 9);

  const highRec2 = wrapTextLines(
    "Shorter interval (e.g., 3 months) for LDCT surveillance as per nodule guidelines with Wardayahealth Risk Panel repeat testing.",
    fontReg,
    7,
    colW2 - 12
  );
  drawWrapped(page, highRec2, tableX + colW0 + colW1 + 6, y - 10, fontReg, 7, 9);

  const highRec3 = wrapTextLines(
    "Histopathological correlation and/or PET scan.",
    fontReg,
    7,
    colW3 - 12
  );
  drawWrapped(
    page,
    highRec3,
    tableX + colW0 + colW1 + colW2 + 6,
    y - 10,
    fontReg,
    7,
    9
  );

  drawLine(tableX, y - rowHighH, tableX + CONTENT_W, y - rowHighH);

  // Vertical column lines for the table
  const tableTop = y + rowLowH + headerH;
  const tableBottom = y - rowHighH;
  drawLine(tableX + colW0, tableTop, tableX + colW0, tableBottom);
  drawLine(tableX + colW0 + colW1, tableTop, tableX + colW0 + colW1, tableBottom);
  drawLine(
    tableX + colW0 + colW1 + colW2,
    tableTop,
    tableX + colW0 + colW1 + colW2,
    tableBottom
  );
  // Outer border
  page.drawRectangle({
    x: tableX,
    y: tableBottom,
    width: CONTENT_W,
    height: tableTop - tableBottom,
    borderColor: LIGHT_GRAY,
    borderWidth: 0.5,
  });

  y -= rowHighH + 16;

  // Highlight current risk row
  if (isHigh) {
    // Draw indicator arrow or highlight for High row
    drawRect(tableX - 4, y + rowHighH + 4, 3, rowHighH - 2, RED);
  } else {
    drawRect(tableX - 4, y + rowHighH + rowHighH + headerH + 4, 3, rowLowH - 2, GREEN);
  }

  // --- INTERPRETATION SECTION ---
  drawText("Interpretation", MARGIN_L, y, {
    font: fontBold,
    size: 10,
    color: TEAL,
  });
  y -= 5;
  drawLine(MARGIN_L, y, PAGE_W - MARGIN_R, y, 1);
  y -= 14;

  const interpretationText = isHigh
    ? "The Wardayahealth Risk Panel\u2122 result indicates a high probability of molecular expression patterns associated with lung malignancy. Correlation with histopathological findings and/or PET imaging, together with comprehensive clinical evaluation, is recommended for confirmatory assessment. This result should be interpreted in conjunction with clinical and radiological findings and is not intended to replace histopathological diagnosis."
    : "The Wardayahealth Risk Panel\u2122 result indicates a low probability of molecular expression patterns associated with lung malignancy. Continued surveillance as per clinical guidelines is recommended. This result should be interpreted in conjunction with clinical and radiological findings and is not intended to replace histopathological diagnosis.";

  const interpLines = wrapTextLines(interpretationText, fontReg, 8.5, CONTENT_W);
  drawWrapped(page, interpLines, MARGIN_L, y, fontReg, 8.5, 12);
  y -= interpLines.length * 12 + 16;

  // --- FOOTER ---
  const footerY = MARGIN_B - 10;
  drawLine(MARGIN_L, footerY + 15, PAGE_W - MARGIN_R, footerY + 15, 0.5);
  drawText(
    "Wardayahealth | Connected care. Confident decisions.",
    MARGIN_L,
    footerY,
    { size: 7, color: GRAY }
  );
  const pageText = "Page 1 of 1";
  const pageTextW = fontReg.widthOfTextAtSize(pageText, 7);
  drawText(pageText, PAGE_W - MARGIN_R - pageTextW, footerY, {
    size: 7,
    color: GRAY,
  });

  // Serialize
  const pdfBytes = await doc.save();
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
}

// --- Text wrapping helpers ---

function wrapTextLines(
  text: string,
  font: PDFFont,
  fontSize: number,
  maxWidth: number
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(test, fontSize) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function drawWrapped(
  page: PDFPage,
  lines: string[],
  x: number,
  y: number,
  font: PDFFont,
  fontSize: number,
  lineHeight: number
) {
  for (let i = 0; i < lines.length; i++) {
    page.drawText(lines[i], {
      x,
      y: y - i * lineHeight,
      size: fontSize,
      font,
      color: BLACK,
    });
  }
}
