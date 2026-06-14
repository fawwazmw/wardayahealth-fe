import { describe, it, expect } from "vitest";
import { parsePatientForm } from "./smartFormParser";

describe("Smart Form Parser", () => {
  describe("Patient Name extraction", () => {
    it("should extract patient name from 'Patient Name: John Doe'", () => {
      const result = parsePatientForm("Patient Name: John Doe\nSex: Male");
      expect(result.patientName).toBe("John Doe");
    });

    it("should extract patient name from 'Name: Jane Smith'", () => {
      const result = parsePatientForm("Name: Jane Smith");
      expect(result.patientName).toBe("Jane Smith");
    });

    it("should handle name with colon separator", () => {
      const result = parsePatientForm("Patient Name:   Ahmad bin Ibrahim  ");
      expect(result.patientName).toBe("Ahmad bin Ibrahim");
    });
  });

  describe("Patient ID / NRIC extraction", () => {
    it("should extract Singapore NRIC format", () => {
      const result = parsePatientForm("Patient ID: S12345678D\nName: Test");
      expect(result.patientId).toBe("S12345678D");
    });

    it("should find NRIC pattern anywhere in text", () => {
      const result = parsePatientForm("Some text with S98765432A embedded in it");
      expect(result.patientId).toBe("S98765432A");
    });

    it("should extract T-series NRIC", () => {
      const result = parsePatientForm("ID Number: T1234567B");
      expect(result.patientId).toBe("T1234567B");
    });

    it("should extract FIN (F-series)", () => {
      const result = parsePatientForm("The patient NRIC is F1234567N");
      expect(result.patientId).toBe("F1234567N");
    });
  });

  describe("Sex extraction", () => {
    it("should extract 'Male'", () => {
      const result = parsePatientForm("Sex: Male");
      expect(result.sex).toBe("Male");
    });

    it("should extract 'Female' and capitalize", () => {
      const result = parsePatientForm("Gender: female");
      expect(result.sex).toBe("Female");
    });

    it("should normalize 'M' to 'Male'", () => {
      const result = parsePatientForm("Sex: M");
      expect(result.sex).toBe("Male");
    });

    it("should normalize 'F' to 'Female'", () => {
      const result = parsePatientForm("Sex: F");
      expect(result.sex).toBe("Female");
    });
  });

  describe("Date of Birth extraction", () => {
    it("should extract DOB in DD-MMM-YYYY format", () => {
      const result = parsePatientForm("Date of Birth: 13-January-1949");
      expect(result.dateOfBirth).toBe("13-January-1949");
    });

    it("should extract DOB with 'DOB:' label", () => {
      const result = parsePatientForm("DOB: 25/12/1980");
      expect(result.dateOfBirth).toBe("25/12/1980");
    });

    it("should extract DOB with 'D.O.B.' label", () => {
      const result = parsePatientForm("D.O.B.: 01-Mar-1990");
      expect(result.dateOfBirth).toBe("01-Mar-1990");
    });
  });

  describe("Physician extraction", () => {
    it("should extract physician name", () => {
      const result = parsePatientForm("Ordering Physician: Dr. Johnny Loh");
      expect(result.physicianName).toContain("Dr");
      expect(result.physicianName).toContain("Johnny Loh");
    });

    it("should extract doctor name", () => {
      const result = parsePatientForm("Doctor: Dr. Sarah Tan");
      expect(result.physicianName).toContain("Dr");
    });
  });

  describe("Nationality extraction", () => {
    it("should extract nationality", () => {
      const result = parsePatientForm("Nationality: Singaporean");
      expect(result.nationality).toBe("Singaporean");
    });

    it("should extract citizenship", () => {
      const result = parsePatientForm("Citizenship: Malaysian");
      expect(result.nationality).toBe("Malaysian");
    });
  });

  describe("Facility extraction", () => {
    it("should extract facility name", () => {
      const result = parsePatientForm("Facility: Gleneagles Medical Centre");
      expect(result.facility).toBe("Gleneagles Medical Centre");
    });

    it("should extract hospital name", () => {
      const result = parsePatientForm("Hospital: Mount Elizabeth Hospital");
      expect(result.facility).toBe("Mount Elizabeth Hospital");
    });
  });

  describe("Confidence scoring", () => {
    it("should return high confidence when many fields found", () => {
      const text = [
        "Patient Name: John Doe",
        "Patient ID: S12345678D",
        "Sex: Male",
        "Date of Birth: 13-Jan-1949",
        "Nationality: Singaporean",
        "Ordering Physician: Dr. Loh",
        "Facility: Gleneagles",
        "Date of blood collected: 27-Feb-2026",
      ].join("\n");

      const result = parsePatientForm(text);
      expect(result.confidence).toBeGreaterThanOrEqual(60);
      expect(result.fieldsFound).toBeGreaterThanOrEqual(6);
    });

    it("should return low confidence when few fields found", () => {
      const result = parsePatientForm("Random text with no medical data");
      expect(result.confidence).toBeLessThan(30);
      expect(result.fieldsFound).toBeLessThan(3);
    });

    it("should return 0 confidence for empty text", () => {
      const result = parsePatientForm("");
      expect(result.fieldsFound).toBe(0);
      expect(result.confidence).toBe(0);
    });
  });

  describe("Full GE002-like form text", () => {
    it("should extract multiple fields from a realistic form", () => {
      const formText = `
        Patient Name: XXXX
        Sex: Female
        Patient ID: S12345678D
        Date of Birth: 13 January 1949
        Nationality: Singaporean
        Ordering Physician: Dr. Johnny Loh
        Facility: 6 Napier Road, Gleneagles Medical Centre SG 258499
        Date of blood collected: 27-Feb-26
      `;

      const result = parsePatientForm(formText);
      expect(result.patientName).toBeTruthy();
      expect(result.patientId).toBe("S12345678D");
      expect(result.sex).toBe("Female");
      expect(result.nationality).toBe("Singaporean");
      expect(result.fieldsFound).toBeGreaterThanOrEqual(5);
    });
  });
});
