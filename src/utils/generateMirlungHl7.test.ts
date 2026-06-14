import { describe, it, expect } from "vitest";
import { generateMirlungHl7, type MirlungHl7Data } from "./generateMirlungHl7";

describe("mirLung Dx HL7 Generator", () => {
  const baseData: MirlungHl7Data = {
    patientName: "John Doe",
    patientId: "S12345678D",
    dateOfBirth: "19490113",
    sex: "Male",
    orderingPhysician: "Dr. Johnny Loh",
    facility: "Gleneagles Medical Centre",
    testCaseId: "GE002",
    mirlungScore: 87.0,
    riskCategory: "HIGH RISK",
    specimenType: "Blood",
    collectionDate: "20260227",
    reportDate: "20260304",
  };

  describe("Message structure", () => {
    it("should generate a non-empty HL7 message", () => {
      const hl7 = generateMirlungHl7(baseData);
      expect(hl7.length).toBeGreaterThan(0);
    });

    it("should contain MSH segment", () => {
      const hl7 = generateMirlungHl7(baseData);
      expect(hl7).toContain("MSH|");
    });

    it("should contain PID segment", () => {
      const hl7 = generateMirlungHl7(baseData);
      expect(hl7).toContain("PID|");
    });

    it("should contain PV1 segment", () => {
      const hl7 = generateMirlungHl7(baseData);
      expect(hl7).toContain("PV1|");
    });

    it("should contain ORC segment", () => {
      const hl7 = generateMirlungHl7(baseData);
      expect(hl7).toContain("ORC|");
    });

    it("should contain OBR segment", () => {
      const hl7 = generateMirlungHl7(baseData);
      expect(hl7).toContain("OBR|");
    });

    it("should contain OBX segments", () => {
      const hl7 = generateMirlungHl7(baseData);
      expect(hl7).toContain("OBX|1|");
      expect(hl7).toContain("OBX|2|");
      expect(hl7).toContain("OBX|3|");
    });

    it("should contain SPM segment", () => {
      const hl7 = generateMirlungHl7(baseData);
      expect(hl7).toContain("SPM|");
    });
  });

  describe("MSH segment", () => {
    it("should specify ORU^R01 message type", () => {
      const hl7 = generateMirlungHl7(baseData);
      const msh = hl7.split("\r\n").find((s) => s.startsWith("MSH|"));
      expect(msh).toContain("ORU^R01^ORU_R01");
    });

    it("should specify HL7 version 2.5.1", () => {
      const hl7 = generateMirlungHl7(baseData);
      const msh = hl7.split("\r\n").find((s) => s.startsWith("MSH|"));
      expect(msh).toContain("2.5.1");
    });

    it("should include AVERYWELL as sending application", () => {
      const hl7 = generateMirlungHl7(baseData);
      const msh = hl7.split("\r\n").find((s) => s.startsWith("MSH|"));
      expect(msh).toContain("AVERYWELL");
    });
  });

  describe("PID segment", () => {
    it("should include patient ID", () => {
      const hl7 = generateMirlungHl7(baseData);
      const pid = hl7.split("\r\n").find((s) => s.startsWith("PID|"));
      expect(pid).toContain("S12345678D");
    });

    it("should include patient name in HL7 format (Last^First)", () => {
      const hl7 = generateMirlungHl7(baseData);
      const pid = hl7.split("\r\n").find((s) => s.startsWith("PID|"));
      expect(pid).toContain("Doe^John");
    });

    it("should include sex code M for Male", () => {
      const hl7 = generateMirlungHl7(baseData);
      const pid = hl7.split("\r\n").find((s) => s.startsWith("PID|"));
      expect(pid).toContain("|M|");
    });

    it("should include sex code F for Female", () => {
      const hl7 = generateMirlungHl7({ ...baseData, sex: "Female" });
      const pid = hl7.split("\r\n").find((s) => s.startsWith("PID|"));
      expect(pid).toContain("|F|");
    });
  });

  describe("OBX segments - Results", () => {
    it("should include mirLung score as numeric value", () => {
      const hl7 = generateMirlungHl7(baseData);
      const obx1 = hl7.split("\r\n").find((s) => s.startsWith("OBX|1|"));
      expect(obx1).toContain("NM");
      expect(obx1).toContain("87.00");
      expect(obx1).toContain("%");
    });

    it("should include risk category", () => {
      const hl7 = generateMirlungHl7(baseData);
      const obx2 = hl7.split("\r\n").find((s) => s.startsWith("OBX|2|"));
      expect(obx2).toContain("HIGH RISK");
    });

    it("should flag high risk with 'H' abnormal flag", () => {
      const hl7 = generateMirlungHl7(baseData);
      const obx1 = hl7.split("\r\n").find((s) => s.startsWith("OBX|1|"));
      expect(obx1).toContain("|H|");
    });

    it("should flag low risk with 'N' normal flag", () => {
      const hl7 = generateMirlungHl7({
        ...baseData,
        mirlungScore: 30,
        riskCategory: "LOW RISK",
      });
      const obx1 = hl7.split("\r\n").find((s) => s.startsWith("OBX|1|"));
      expect(obx1).toContain("|N|");
    });

    it("should include interpretation text", () => {
      const hl7 = generateMirlungHl7(baseData);
      const obx3 = hl7.split("\r\n").find((s) => s.startsWith("OBX|3|"));
      expect(obx3).toContain("FT"); // Formatted text type
      expect(obx3).toContain("High probability");
    });

    it("should include low risk interpretation for low scores", () => {
      const hl7 = generateMirlungHl7({
        ...baseData,
        mirlungScore: 25,
        riskCategory: "LOW RISK",
      });
      const obx3 = hl7.split("\r\n").find((s) => s.startsWith("OBX|3|"));
      expect(obx3).toContain("Low probability");
    });
  });

  describe("Edge cases", () => {
    it("should handle score of 0", () => {
      const hl7 = generateMirlungHl7({
        ...baseData,
        mirlungScore: 0,
        riskCategory: "LOW RISK",
      });
      expect(hl7).toContain("0.00");
    });

    it("should handle score of 100", () => {
      const hl7 = generateMirlungHl7({
        ...baseData,
        mirlungScore: 100,
        riskCategory: "HIGH RISK",
      });
      expect(hl7).toContain("100.00");
    });

    it("should handle empty patient name", () => {
      const hl7 = generateMirlungHl7({
        ...baseData,
        patientName: "",
      });
      expect(hl7).toContain("PID|");
    });

    it("should handle missing dates", () => {
      const hl7 = generateMirlungHl7({
        ...baseData,
        collectionDate: "",
        reportDate: "",
        dateOfBirth: "",
      });
      expect(hl7).toContain("MSH|");
      expect(hl7).toContain("OBX|1|");
    });
  });
});
