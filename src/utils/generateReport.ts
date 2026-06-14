import { PDFDocument, rgb, StandardFonts, PDFPage } from "pdf-lib";
import { saveAs } from "file-saver";

interface ReportData {
  labAccessionNo?: string;
  sampleReferenceNumber?: string;
  name?: string;
  nric?: string;
  idNumber?: string;
  dob?: string;
  requester?: string;
  comments?: string;
  clinicalNotes?: string;
  location?: string;
  race?: string;
  ethnicity?: string;
  sex?: string;
  age?: string;
  patientAgeGroup?: string;
  dateReceived?: string;
  sampleReceivedDate?: string;
  dateReport?: string;
  reportDate?: string;
  pgxPanel?: Array<{ gene: string; genotype: string; phenotype: string }>;
  assayInformation?: string;
  disclaimer?: string;
  signedBy?: string[];
  [key: string]: unknown;
}

// Function to generate and download report PDF
export async function generateReport(data: ReportData, fileName: string) {
  const blob = await generatePDF(data);
  saveAs(blob, fileName);
  return blob;
}

// Function to generate PDF blob without downloading
export async function generateReportBlob(data: ReportData) {
  return await generatePDF(data);
}

// Main PDF generation function with multi-page layout (A4)
async function generatePDF(data: ReportData) {
  // A4 paper dimensions
  const pageWidth = 595;
  const pageHeight = 842;
  const topMargin = 50;
  const bottomMargin = 50;
  const leftMargin = 50;
  const rightMargin = 50;
  const blackColor = rgb(0, 0, 0);
  const grayColor = rgb(0.5, 0.5, 0.5);
  const lightGrayColor = rgb(0.95, 0.95, 0.95);

  // Create PDF document and first page
  const pdfDoc = await PDFDocument.create();
  let page: PDFPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let yPos = pageHeight - topMargin;
  let _pageNumber = 1;
  const totalPages = 2; // We know we'll have 2 pages

  // Embed standard fonts
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // --- Helper Functions ---
  function ensureSpace(requiredSpace: number) {
    if (yPos - requiredSpace < bottomMargin) {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      yPos = pageHeight - topMargin;
      _pageNumber++;
    }
  }

  function wrapText(
    text: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    font: any,
    fontSize: number,
    maxWidth: number
  ): string[] {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    words.forEach((word) => {
      const testLine = currentLine + (currentLine ? " " : "") + word;
      const testLineWidth = font.widthOfTextAtSize(testLine, fontSize);
      if (testLineWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });
    if (currentLine) {
      lines.push(currentLine);
    }
    return lines;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function centerX(pageW: number, text: string, font: any, fontSize: number) {
    return (pageW - font.widthOfTextAtSize(text, fontSize)) / 2;
  }

  // Function to draw page footer
  function drawFooter(pageNum: number, isLastPage: boolean = false) {
    const footerY = bottomMargin + 20;
    page.drawLine({
      start: { x: leftMargin, y: footerY + 10 },
      end: { x: pageWidth - rightMargin, y: footerY + 10 },
      thickness: 0.5,
      color: grayColor,
    });

    page.drawText(
      `Report Printed On: ${
        data.reportDate || new Date().toLocaleDateString()
      }`,
      {
        x: leftMargin,
        y: footerY,
        size: 8,
        font: fontRegular,
        color: grayColor,
      }
    );

    // Add Report Released On (empty for now)
    page.drawText(`Report Released On:`, {
      x: leftMargin,
      y: footerY - 12,
      size: 8,
      font: fontRegular,
      color: grayColor,
    });

    // Page number at bottom right
    const pageText = isLastPage
      ? `Page ${pageNum} of ${totalPages} (End of report)`
      : `Page ${pageNum} of ${totalPages}`;
    page.drawText(pageText, {
      x: pageWidth - rightMargin - 120,
      y: footerY,
      size: 8,
      font: fontRegular,
      color: grayColor,
    });

    if (isLastPage) {
      page.drawText("Restricted", {
        x: pageWidth - rightMargin - 50,
        y: footerY - 12,
        size: 8,
        font: fontBold,
        color: grayColor,
      });
    }
  }

  // Function to draw hospital header
  function drawHospitalHeader() {
    // Hospital Logo and Info Section
    const hospitalName = "TAN TOCK SENG HOSPITAL";
    const address = "11 Jalan Tan Tock Seng, Singapore 308433";
    const labName = "MOLECULAR DIAGNOSTIC LABORATORY";
    const reportStatus = "FINAL REPORT";

    // Draw hospital name (centered, large font)
    const hospitalNameWidth = fontBold.widthOfTextAtSize(hospitalName, 18);
    page.drawText(hospitalName, {
      x: (pageWidth - hospitalNameWidth) / 2,
      y: yPos,
      size: 18,
      font: fontBold,
      color: blackColor,
    });
    yPos -= 25;

    // Draw address (centered)
    page.drawText(address, {
      x: centerX(pageWidth, address, fontRegular, 11),
      y: yPos,
      size: 11,
      font: fontRegular,
    });
    yPos -= 20;

    // Draw lab name (centered, bold)
    page.drawText(labName, {
      x: centerX(pageWidth, labName, fontBold, 12),
      y: yPos,
      size: 12,
      font: fontBold,
      color: blackColor,
    });
    yPos -= 15;

    // Draw FINAL REPORT status (centered, bold)
    page.drawText(reportStatus, {
      x: centerX(pageWidth, reportStatus, fontBold, 14),
      y: yPos,
      size: 14,
      font: fontBold,
      color: blackColor,
    });
    yPos -= 30;

    // Horizontal line separator
    page.drawLine({
      start: { x: leftMargin, y: yPos },
      end: { x: pageWidth - rightMargin, y: yPos },
      thickness: 1,
      color: blackColor,
    });
    yPos -= 25;
  }

  // Function to draw patient information section
  function drawPatientInfo() {
    // Create two-column layout for patient info
    const columnWidth = (pageWidth - leftMargin - rightMargin - 20) / 2;

    // Left column - Patient Demographics
    const leftInfo = [
      {
        label: "Lab Accession No",
        value: data.labAccessionNo || data.sampleReferenceNumber || "-",
      },
      { label: "Name", value: data.name || "-" },
      { label: "NRIC", value: data.nric || data.idNumber || "-" },
      { label: "DOB", value: data.dob || "-" },
      {
        label: "Requested By",
        value: data.requester || "-",
      },
      { label: "Comments", value: data.comments || data.clinicalNotes || "-" },
    ];

    let leftColumnY = yPos;
    leftInfo.forEach((item) => {
      page.drawText(`${item.label}:`, {
        x: leftMargin,
        y: leftColumnY,
        size: 10,
        font: fontBold,
      });

      const valueText = String(item.value);
      const wrappedValue = wrapText(
        valueText,
        fontRegular,
        10,
        columnWidth - 100
      );

      let valueY = leftColumnY;
      wrappedValue.forEach((line) => {
        page.drawText(line, {
          x: leftMargin + 100,
          y: valueY,
          size: 10,
          font: fontRegular,
        });
        valueY -= 12;
      });

      leftColumnY = valueY - 5;
    });

    // Right column - Additional Info
    const rightColumnX = leftMargin + columnWidth + 20;
    const rightInfo = [
      { label: "Location", value: data.location || data.requester || "-" },
      { label: "Race", value: data.race || data.ethnicity || "-" },
      { label: "Sex", value: data.sex || "-" },
      { label: "Age", value: data.age || data.patientAgeGroup || "-" },
      {
        label: "Date Received",
        value: data.dateReceived || data.sampleReceivedDate || "-",
      },
      { label: "Date Report", value: data.dateReport || "-" },
    ];

    let rightColumnY = yPos;
    rightInfo.forEach((item) => {
      page.drawText(`${item.label}:`, {
        x: rightColumnX,
        y: rightColumnY,
        size: 10,
        font: fontBold,
      });

      page.drawText(String(item.value), {
        x: rightColumnX + 100,
        y: rightColumnY,
        size: 10,
        font: fontRegular,
      });

      rightColumnY -= 15;
    });

    // Update yPos to the lowest point
    yPos = Math.min(leftColumnY, rightColumnY) - 25;
  }

  //=========================
  // PAGE 1
  //=========================
  ensureSpace(120);

  // Draw hospital header
  drawHospitalHeader();

  // === PATIENT INFORMATION SECTION (2 COLUMNS) ===
  ensureSpace(160);
  drawPatientInfo();

  // === MOLECULAR SECTION TITLE ===
  ensureSpace(60);

  page.drawRectangle({
    x: leftMargin,
    y: yPos - 5,
    width: pageWidth - leftMargin - rightMargin,
    height: 25,
    color: lightGrayColor,
  });

  const molecularTitle = "MOLECULAR (Test done in TTSH MDL)";
  page.drawText(molecularTitle, {
    x: leftMargin + 10,
    y: yPos,
    size: 12,
    font: fontBold,
    color: blackColor,
  });
  yPos -= 35;

  // === PGX TARGETED PANEL TABLE ===
  ensureSpace(50);

  // Table title
  page.drawText("PGX Targeted Panel", {
    x: leftMargin,
    y: yPos,
    size: 12,
    font: fontBold,
    color: blackColor,
  });
  yPos -= 20;

  // Table headers
  const tableHeaders = ["Gene", "Genotype", "Predicted Phenotype"];
  const tableWidth = pageWidth - leftMargin - rightMargin;

  // Calculate column widths: Gene (25%), Genotype (25%), Phenotype (50%)
  const colWidths = [tableWidth * 0.25, tableWidth * 0.25, tableWidth * 0.5];

  // Draw table header background
  page.drawRectangle({
    x: leftMargin,
    y: yPos - 20,
    width: tableWidth,
    height: 20,
    color: lightGrayColor,
  });

  // Draw table headers
  let currentX = leftMargin;
  tableHeaders.forEach((header, index) => {
    page.drawText(header, {
      x: currentX + 5,
      y: yPos - 15,
      size: 10,
      font: fontBold,
    });
    currentX += colWidths[index];
  });
  yPos -= 25;

  // Draw table top border
  page.drawLine({
    start: { x: leftMargin, y: yPos + 5 },
    end: { x: pageWidth - rightMargin, y: yPos + 5 },
    thickness: 0.5,
    color: grayColor,
  });

  // Draw pgxPanel data rows
  const pgxPanelData = data.pgxPanel || [
    // Default empty row if no data
    { gene: "-", genotype: "-", phenotype: "-" },
  ];

  pgxPanelData.forEach((result: { gene?: string; genotype?: string; phenotype?: string }, rowIndex: number) => {
    const rowData = [
      result.gene || "-",
      result.genotype || "-",
      result.phenotype || "-",
    ];

    // Calculate row height based on wrapped text
    const wrappedTexts = rowData.map((text, colIndex) =>
      wrapText(String(text), fontRegular, 9, colWidths[colIndex] - 10)
    );
    const maxLines = Math.max(...wrappedTexts.map((lines) => lines.length));
    const rowHeight = Math.max(maxLines * 12, 20);

    ensureSpace(rowHeight + 5);

    // Alternate row background
    if (rowIndex % 2 === 1) {
      page.drawRectangle({
        x: leftMargin,
        y: yPos - rowHeight,
        width: tableWidth,
        height: rowHeight,
        color: lightGrayColor,
      });
    }

    // Draw cell content
    let cellX = leftMargin;
    wrappedTexts.forEach((lines, colIndex) => {
      let cellY = yPos - 12;
      lines.forEach((line) => {
        page.drawText(line, {
          x: cellX + 5,
          y: cellY,
          size: 9,
          font: fontRegular,
        });
        cellY -= 12;
      });
      cellX += colWidths[colIndex];
    });

    yPos -= rowHeight;

    // Draw row border
    page.drawLine({
      start: { x: leftMargin, y: yPos },
      end: { x: pageWidth - rightMargin, y: yPos },
      thickness: 0.5,
      color: grayColor,
    });
  });

  // Draw vertical table borders
  let verticalLineX = leftMargin;
  for (let i = 0; i <= tableHeaders.length; i++) {
    page.drawLine({
      start: { x: verticalLineX, y: yPos },
      end: { x: verticalLineX, y: yPos + 25 + pgxPanelData.length * 20 },
      thickness: 0.5,
      color: grayColor,
    });
    if (i < tableHeaders.length) {
      verticalLineX += colWidths[i];
    }
  }

  yPos -= 20;

  // // === FOOTER SECTION ===
  // ensureSpace(80);

  // Material Submitted
  page.drawText("Material Submitted: Blood (EDTA)", {
    x: leftMargin,
    y: yPos,
    size: 10,
    font: fontBold,
    color: blackColor,
  });
  yPos -= 50;

  // Add page 1 footer
  drawFooter(1);

  //=========================
  // PAGE 2
  //=========================
  // Force a new page
  page = pdfDoc.addPage([pageWidth, pageHeight]);
  yPos = pageHeight - topMargin;
  _pageNumber = 2;

  // Draw hospital header on page 2
  drawHospitalHeader();

  // Draw patient info on page 2
  ensureSpace(160);
  drawPatientInfo();

  // Default text for Assay Information if not provided
  const assayInformationText =
    data.assayInformation ||
    "The test is intended to provide information to help in making medication decisions. " +
      "This pharmacogenomic test analyzes genetic variants that affect drug metabolism, efficacy, and toxicity. " +
      "The test examines key genes involved in drug absorption, distribution, metabolism, and excretion (ADME) processes. " +
      "Testing was performed using next-generation sequencing (NGS) technology with comprehensive coverage of pharmacogenetically relevant genes. " +
      "Results are interpreted according to Clinical Pharmacogenetics Implementation Consortium (CPIC) guidelines and other established clinical guidelines.";

  // Default text for Disclaimer if not provided
  const disclaimerText =
    data.disclaimer ||
    "This test does not detect all variants of the gene tested. Non-detected variants, other genetic and/or " +
      "non-genetic factors that are not tested by this assay may influence drug metabolism. " +
      "This test is not intended to diagnose any specific disease and does not replace other medical tests. " +
      "A negative result for one or more variants analyzed does not rule out the presence of other variants that may affect metabolism. " +
      "These results should be evaluated in the context of the patient's clinical presentation, other laboratory findings, and family history. " +
      "This test was developed and its performance characteristics determined by the Molecular Diagnostic Laboratory, " +
      "Tan Tock Seng Hospital. It has not been cleared or approved by the Health Sciences Authority.";

  // === ASSAY INFORMATION SECTION ===
  ensureSpace(60);

  page.drawRectangle({
    x: leftMargin,
    y: yPos - 5,
    width: pageWidth - leftMargin - rightMargin,
    height: 25,
    color: lightGrayColor,
  });

  const assayTitle = "ASSAY INFORMATION";
  page.drawText(assayTitle, {
    x: leftMargin + 10,
    y: yPos,
    size: 12,
    font: fontBold,
    color: blackColor,
  });
  yPos -= 35;

  // Draw assay information text
  const wrappedAssayInfo = wrapText(
    assayInformationText,
    fontRegular,
    10,
    pageWidth - leftMargin - rightMargin
  );

  wrappedAssayInfo.forEach((line) => {
    ensureSpace(15);
    page.drawText(line, {
      x: leftMargin,
      y: yPos,
      size: 10,
      font: fontRegular,
    });
    yPos -= 15;
  });
  yPos -= 25;

  // === DISCLAIMER SECTION ===
  ensureSpace(60);

  page.drawRectangle({
    x: leftMargin,
    y: yPos - 5,
    width: pageWidth - leftMargin - rightMargin,
    height: 25,
    color: lightGrayColor,
  });

  const disclaimerTitle = "DISCLAIMER";
  page.drawText(disclaimerTitle, {
    x: leftMargin + 10,
    y: yPos,
    size: 12,
    font: fontBold,
    color: blackColor,
  });
  yPos -= 35;

  // Draw disclaimer text
  const wrappedDisclaimer = wrapText(
    disclaimerText,
    fontRegular,
    10,
    pageWidth - leftMargin - rightMargin
  );

  wrappedDisclaimer.forEach((line) => {
    ensureSpace(15);
    page.drawText(line, {
      x: leftMargin,
      y: yPos,
      size: 10,
      font: fontRegular,
    });
    yPos -= 15;
  });
  yPos -= 25;

  // === SIGNED BY SECTION ===
  ensureSpace(80);

  const signedByTitle = "Signed by:";
  page.drawText(signedByTitle, {
    x: leftMargin,
    y: yPos,
    size: 10,
    font: fontBold,
    color: blackColor,
  });
  yPos -= 20;

  // Default signatories if not provided
  const signatories = data.signedBy || [
    "Dr Ong Kiat Hoe, Senior Consultant Haematologist",
    "Dr Goh Lui Ling, Senior Principal Scientific Officer",
  ];

  signatories.forEach((signatory: string) => {
    page.drawText(signatory, {
      x: leftMargin,
      y: yPos,
      size: 10,
      font: fontRegular,
      color: blackColor,
    });
    yPos -= 20;
  });

  // Draw page 2 footer (last page)
  drawFooter(2, true);

  // Save PDF and return Blob
  const pdfBytes = await pdfDoc.save();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new Blob([pdfBytes as any], { type: "application/pdf" });
}

export default generatePDF;
