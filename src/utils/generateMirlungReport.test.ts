import { describe, it, expect } from "vitest";
import { generateMirlungReport, type MirlungReportData } from "./generateMirlungReport";

describe("mirLung Dx Report Generator", () => {
  const baseData: MirlungReportData = {
    reportId: "GE002",
    patientName: "John Doe",
    patientId: "S12345678D",
    sex: "Male",
    dateOfBirth: "13 January 1949",
    nationality: "Singaporean",
    orderingPhysician: "Dr. Johnny Loh",
    facility: "Gleneagles Medical Centre",
    dateBloodCollected: "27-Feb-26",
    dateOfReport: "04-Mar-26",
    mirlungScore: 87.0,
    riskCategory: "HIGH RISK",
  };

  it("should generate a valid PDF blob", async () => {
    const blob = await generateMirlungReport(baseData);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe("application/pdf");
    expect(blob.size).toBeGreaterThan(0);
  });

  it("should generate a PDF with reasonable size (1-100KB)", async () => {
    const blob = await generateMirlungReport(baseData);
    expect(blob.size).toBeGreaterThan(1000); // At least 1KB
    expect(blob.size).toBeLessThan(100000); // Less than 100KB
  });

  it("should generate PDF for HIGH RISK patient", async () => {
    const blob = await generateMirlungReport({
      ...baseData,
      mirlungScore: 87.0,
      riskCategory: "HIGH RISK",
    });
    expect(blob.size).toBeGreaterThan(0);
  });

  it("should generate PDF for LOW RISK patient", async () => {
    const blob = await generateMirlungReport({
      ...baseData,
      mirlungScore: 25.5,
      riskCategory: "LOW RISK",
    });
    expect(blob.size).toBeGreaterThan(0);
  });

  it("should generate PDF with edge case score 0%", async () => {
    const blob = await generateMirlungReport({
      ...baseData,
      mirlungScore: 0,
      riskCategory: "LOW RISK",
    });
    expect(blob.size).toBeGreaterThan(0);
  });

  it("should generate PDF with edge case score 100%", async () => {
    const blob = await generateMirlungReport({
      ...baseData,
      mirlungScore: 100,
      riskCategory: "HIGH RISK",
    });
    expect(blob.size).toBeGreaterThan(0);
  });

  it("should generate PDF with minimal data (N/A fields)", async () => {
    const blob = await generateMirlungReport({
      reportId: "TEST001",
      patientName: "Unknown",
      patientId: "N/A",
      sex: "N/A",
      dateOfBirth: "N/A",
      nationality: "N/A",
      orderingPhysician: "N/A",
      facility: "N/A",
      dateBloodCollected: "N/A",
      dateOfReport: "N/A",
      mirlungScore: 50,
      riskCategory: "HIGH RISK",
    });
    expect(blob.size).toBeGreaterThan(0);
  });

  it("should generate PDF with long patient name", async () => {
    const blob = await generateMirlungReport({
      ...baseData,
      patientName: "Muhammad Ahmad bin Abdullah Al-Rashid",
    });
    expect(blob.size).toBeGreaterThan(0);
  });

  it("should generate PDF with score at boundary (50%)", async () => {
    const blob = await generateMirlungReport({
      ...baseData,
      mirlungScore: 50.0,
      riskCategory: "HIGH RISK",
    });
    expect(blob.size).toBeGreaterThan(0);
  });

  it("should generate PDF with score just below boundary (49.99%)", async () => {
    const blob = await generateMirlungReport({
      ...baseData,
      mirlungScore: 49.99,
      riskCategory: "LOW RISK",
    });
    expect(blob.size).toBeGreaterThan(0);
  });
});
