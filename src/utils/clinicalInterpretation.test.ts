import { describe, it, expect } from "vitest";
import { generateInterpretation, getRiskLabel } from "./clinicalInterpretation";

describe("Clinical Interpretation Engine", () => {
  describe("generateInterpretation", () => {
    describe("HIGH RISK results", () => {
      it("should generate high risk interpretation for score >= 50", () => {
        const result = generateInterpretation({
          mirlungScore: 87,
          riskCategory: "HIGH RISK",
        });

        expect(result.summary).toContain("HIGH RISK");
        expect(result.summary).toContain("87.00%");
        expect(result.interpretation).toContain("high probability");
        expect(result.interpretation).toContain("lung malignancy");
        expect(result.recommendations.length).toBeGreaterThan(0);
      });

      it("should recommend PET scan for high risk + large nodule (>8mm)", () => {
        const result = generateInterpretation({
          mirlungScore: 75,
          riskCategory: "HIGH RISK",
          noduleSizeMm: 12,
        });

        expect(result.recommendations.some((r) => r.includes("PET scan") || r.includes("Histopathological"))).toBe(true);
        expect(result.followUpInterval).toContain("Immediate");
        expect(result.additionalTests).toContain("PET/CT scan");
      });

      it("should recommend shorter LDCT interval for high risk + medium nodule (6-8mm)", () => {
        const result = generateInterpretation({
          mirlungScore: 65,
          riskCategory: "HIGH RISK",
          noduleSizeMm: 7,
        });

        expect(result.recommendations.some((r) => r.includes("3 months") || r.includes("Shorter interval"))).toBe(true);
        expect(result.followUpInterval).toBe("3-6 months");
      });

      it("should recommend interval LDCT for high risk + small nodule (<6mm)", () => {
        const result = generateInterpretation({
          mirlungScore: 55,
          riskCategory: "HIGH RISK",
          noduleSizeMm: 4,
        });

        expect(result.recommendations.some((r) => r.includes("Interval LDCT"))).toBe(true);
      });
    });

    describe("LOW RISK results", () => {
      it("should generate low risk interpretation for score < 50", () => {
        const result = generateInterpretation({
          mirlungScore: 30,
          riskCategory: "LOW RISK",
        });

        expect(result.summary).toContain("LOW RISK");
        expect(result.summary).toContain("30.00%");
        expect(result.interpretation).toContain("low probability");
        expect(result.recommendations.length).toBeGreaterThan(0);
      });

      it("should recommend annual repeat for low risk + small nodule", () => {
        const result = generateInterpretation({
          mirlungScore: 20,
          riskCategory: "LOW RISK",
          noduleSizeMm: 3,
        });

        expect(result.recommendations.some((r) => r.includes("annually") || r.includes("periodically"))).toBe(true);
        expect(result.followUpInterval).toBe("12 months");
      });

      it("should recommend 6-month follow-up for low risk + larger nodule", () => {
        const result = generateInterpretation({
          mirlungScore: 40,
          riskCategory: "LOW RISK",
          noduleSizeMm: 7,
        });

        expect(result.followUpInterval).toBe("6 months");
      });
    });

    describe("Risk factors aggregation", () => {
      it("should include elevated score as risk factor", () => {
        const result = generateInterpretation({
          mirlungScore: 75,
          riskCategory: "HIGH RISK",
        });

        expect(result.riskFactors.some((f) => f.includes("Elevated"))).toBe(true);
      });

      it("should include age as risk factor for patients >= 55", () => {
        const result = generateInterpretation({
          mirlungScore: 60,
          riskCategory: "HIGH RISK",
          patientAge: 70,
        });

        expect(result.riskFactors.some((f) => f.includes("Age 70"))).toBe(true);
      });

      it("should include smoking history as risk factor", () => {
        const result = generateInterpretation({
          mirlungScore: 60,
          riskCategory: "HIGH RISK",
          smokingStatus: "Former smoker",
        });

        expect(result.riskFactors.some((f) => f.includes("Smoking"))).toBe(true);
      });

      it("should include family history as risk factor", () => {
        const result = generateInterpretation({
          mirlungScore: 60,
          riskCategory: "HIGH RISK",
          familyHistory: true,
        });

        expect(result.riskFactors.some((f) => f.includes("Family history"))).toBe(true);
      });

      it("should include large nodule as risk factor", () => {
        const result = generateInterpretation({
          mirlungScore: 60,
          riskCategory: "HIGH RISK",
          noduleSizeMm: 15,
        });

        expect(result.riskFactors.some((f) => f.includes("15mm"))).toBe(true);
      });

      it("should not include non-smoker as risk factor", () => {
        const result = generateInterpretation({
          mirlungScore: 60,
          riskCategory: "HIGH RISK",
          smokingStatus: "Never",
        });

        expect(result.riskFactors.some((f) => f.includes("Smoking"))).toBe(false);
      });
    });

    describe("Additional tests", () => {
      it("should recommend PET/CT for high risk", () => {
        const result = generateInterpretation({
          mirlungScore: 70,
          riskCategory: "HIGH RISK",
        });

        expect(result.additionalTests).toContain("PET/CT scan");
      });

      it("should recommend biopsy for high risk + large nodule", () => {
        const result = generateInterpretation({
          mirlungScore: 80,
          riskCategory: "HIGH RISK",
          noduleSizeMm: 10,
        });

        expect(result.additionalTests.some((t) => t.includes("biopsy") || t.includes("bronchoscopy"))).toBe(true);
      });

      it("should recommend follow-up LDCT for low risk", () => {
        const result = generateInterpretation({
          mirlungScore: 25,
          riskCategory: "LOW RISK",
        });

        expect(result.additionalTests.some((t) => t.includes("LDCT"))).toBe(true);
      });
    });
  });

  describe("getRiskLabel", () => {
    it("should return HIGH RISK with red for score >= 65", () => {
      const result = getRiskLabel(75);
      expect(result.label).toBe("HIGH RISK");
      expect(result.color).toBe("red");
    });

    it("should return HIGH RISK for score >= 50", () => {
      const result = getRiskLabel(55);
      expect(result.label).toBe("HIGH RISK");
      expect(result.color).toBe("red");
    });

    it("should return LOW RISK with amber for score 35-49", () => {
      const result = getRiskLabel(40);
      expect(result.label).toBe("LOW RISK");
      expect(result.color).toBe("amber");
    });

    it("should return LOW RISK with green for score < 35", () => {
      const result = getRiskLabel(20);
      expect(result.label).toBe("LOW RISK");
      expect(result.color).toBe("green");
    });

    it("should return LOW RISK for score 0", () => {
      const result = getRiskLabel(0);
      expect(result.label).toBe("LOW RISK");
      expect(result.color).toBe("green");
    });
  });
});
