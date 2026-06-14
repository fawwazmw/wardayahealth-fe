interface HL7TemplateRow {
  obxRunNumber: number;
  geneName: string;
  section: number;
  geneSectionRunNumber: string;
  code: string;
  fixedKeyName: string;
  fixedValue: string;
  variableValue: string;
  fullTemplate: string;
}

// Complete standard template based on your Excel mapping table
const HL7_STANDARD_TEMPLATE: HL7TemplateRow[] = [
  // ABCG2 - 7 rows (OBX 1-7)
  {
    obxRunNumber: 1,
    geneName: "ABCG2",
    section: 4,
    geneSectionRunNumber: "4a",
    code: "ST",
    fixedKeyName: "ST|VARCONCEPT504^Variant Name^EPIC",
    fixedValue: "ABCG2 c.421C>A",
    variableValue: "",
    fullTemplate:
      "OBX|{obxRunNumber}|ST|VARCONCEPT504^Variant Name^EPIC|{geneSectionRunNumber}|ABCG2 c.421C>A|",
  },
  {
    obxRunNumber: 2,
    geneName: "ABCG2",
    section: 4,
    geneSectionRunNumber: "4a",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT514^Gene Studied^EPIC",
    fixedValue: "74^ABCG2^HGNC",
    variableValue: "",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT514^Gene Studied^EPIC|{geneSectionRunNumber}|74^ABCG2^HGNC|",
  },
  {
    obxRunNumber: 3,
    geneName: "ABCG2",
    section: 4,
    geneSectionRunNumber: "4a",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT505^Discrete Genetic Variant^EPIC",
    fixedValue: "rs2231142^NM_004827.3:c.421C>A^dbSNP",
    variableValue: "",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT505^Discrete Genetic Variant^EPIC|{geneSectionRunNumber}|rs2231142^NM_004827.3:c.421C>A^dbSNP|",
  },
  {
    obxRunNumber: 4,
    geneName: "ABCG2",
    section: 4,
    geneSectionRunNumber: "4a",
    code: "ST",
    fixedKeyName: "ST|VARCONCEPT506^Genotype Name^EPIC",
    fixedValue: "",
    variableValue: "{genotype}",
    fullTemplate:
      "OBX|{obxRunNumber}|ST|VARCONCEPT506^Genotype Name^EPIC|{geneSectionRunNumber}|{genotype}|",
  },
  {
    obxRunNumber: 5,
    geneName: "ABCG2",
    section: 4,
    geneSectionRunNumber: "4a",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT553^Variant Classification^EPIC",
    fixedValue: "^Drug response",
    variableValue: "",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT553^Variant Classification^EPIC|{geneSectionRunNumber}|^Drug response|",
  },
  {
    obxRunNumber: 6,
    geneName: "ABCG2",
    section: 4,
    geneSectionRunNumber: "4a",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT569^Pharmacogenomic Effect Type^EPIC",
    fixedValue: "^Transport",
    variableValue: "",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT569^Pharmacogenomic Effect Type^EPIC|{geneSectionRunNumber}|^Transport|",
  },
  {
    obxRunNumber: 7,
    geneName: "ABCG2",
    section: 4,
    geneSectionRunNumber: "4a",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT570^Pharmacogenomic Effect Value^EPIC",
    fixedValue: "",
    variableValue: "^{phenotype}",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT570^Pharmacogenomic Effect Value^EPIC|{geneSectionRunNumber}|^{phenotype}|",
  },

  // CYP2C19 - 5 rows (OBX 8-12)
  {
    obxRunNumber: 8,
    geneName: "CYP2C19",
    section: 4,
    geneSectionRunNumber: "4b",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT514^Gene Studied^EPIC",
    fixedValue: "2621^CYP2C19^HGNC",
    variableValue: "",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT514^Gene Studied^EPIC|{geneSectionRunNumber}|2621^CYP2C19^HGNC|",
  },
  {
    obxRunNumber: 9,
    geneName: "CYP2C19",
    section: 4,
    geneSectionRunNumber: "4b",
    code: "ST",
    fixedKeyName: "ST|VARCONCEPT506^Genotype Name^EPIC",
    fixedValue: "",
    variableValue: "{genotype}",
    fullTemplate:
      "OBX|{obxRunNumber}|ST|VARCONCEPT506^Genotype Name^EPIC|{geneSectionRunNumber}|{genotype}|",
  },
  {
    obxRunNumber: 10,
    geneName: "CYP2C19",
    section: 4,
    geneSectionRunNumber: "4b",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT553^Variant Classification^EPIC",
    fixedValue: "^Drug response",
    variableValue: "",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT553^Variant Classification^EPIC|{geneSectionRunNumber}|^Drug response|",
  },
  {
    obxRunNumber: 11,
    geneName: "CYP2C19",
    section: 4,
    geneSectionRunNumber: "4b",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT569^Pharmacogenomic Effect Type^EPIC",
    fixedValue: "^Metabolism",
    variableValue: "",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT569^Pharmacogenomic Effect Type^EPIC|{geneSectionRunNumber}|^Metabolism|",
  },
  {
    obxRunNumber: 12,
    geneName: "CYP2C19",
    section: 4,
    geneSectionRunNumber: "4b",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT570^Pharmacogenomic Effect Value^EPIC",
    fixedValue: "",
    variableValue: "^{phenotype}",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT570^Pharmacogenomic Effect Value^EPIC|{geneSectionRunNumber}|^{phenotype}|",
  },

  // CYP2C9 - 6 rows (OBX 13-18)
  {
    obxRunNumber: 13,
    geneName: "CYP2C9",
    section: 4,
    geneSectionRunNumber: "4c",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT514^Gene Studied^EPIC",
    fixedValue: "2623^CYP2C9^HGNC",
    variableValue: "",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT514^Gene Studied^EPIC|{geneSectionRunNumber}|2623^CYP2C9^HGNC|",
  },
  {
    obxRunNumber: 14,
    geneName: "CYP2C9",
    section: 4,
    geneSectionRunNumber: "4c",
    code: "ST",
    fixedKeyName: "ST|VARCONCEPT506^Genotype Name^EPIC",
    fixedValue: "",
    variableValue: "{genotype}",
    fullTemplate:
      "OBX|{obxRunNumber}|ST|VARCONCEPT506^Genotype Name^EPIC|{geneSectionRunNumber}|{genotype}|",
  },
  {
    obxRunNumber: 15,
    geneName: "CYP2C9",
    section: 4,
    geneSectionRunNumber: "4c",
    code: "NR",
    fixedKeyName: "NR|VARCONCEPT566^Activity Score^EPIC",
    fixedValue: "",
    variableValue: "{activityScore}",
    fullTemplate:
      "OBX|{obxRunNumber}|NR|VARCONCEPT566^Activity Score^EPIC|{geneSectionRunNumber}|{activityScore}|",
  },
  {
    obxRunNumber: 16,
    geneName: "CYP2C9",
    section: 4,
    geneSectionRunNumber: "4c",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT553^Variant Classification^EPIC",
    fixedValue: "^Drug response",
    variableValue: "",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT553^Variant Classification^EPIC|{geneSectionRunNumber}|^Drug response|",
  },
  {
    obxRunNumber: 17,
    geneName: "CYP2C9",
    section: 4,
    geneSectionRunNumber: "4c",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT569^Pharmacogenomic Effect Type^EPIC",
    fixedValue: "^Metabolism",
    variableValue: "",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT569^Pharmacogenomic Effect Type^EPIC|{geneSectionRunNumber}|^Metabolism|",
  },
  {
    obxRunNumber: 18,
    geneName: "CYP2C9",
    section: 4,
    geneSectionRunNumber: "4c",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT570^Pharmacogenomic Effect Value^EPIC",
    fixedValue: "",
    variableValue: "^{phenotype}",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT570^Pharmacogenomic Effect Value^EPIC|{geneSectionRunNumber}|^{phenotype}|",
  },

  // CYP2D6 - 6 rows (OBX 19-24)
  {
    obxRunNumber: 19,
    geneName: "CYP2D6",
    section: 4,
    geneSectionRunNumber: "4d",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT514^Gene Studied^EPIC",
    fixedValue: "2625^CYP2D6^HGNC",
    variableValue: "",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT514^Gene Studied^EPIC|{geneSectionRunNumber}|2625^CYP2D6^HGNC|",
  },
  {
    obxRunNumber: 20,
    geneName: "CYP2D6",
    section: 4,
    geneSectionRunNumber: "4d",
    code: "ST",
    fixedKeyName: "ST|VARCONCEPT506^Genotype Name^EPIC",
    fixedValue: "",
    variableValue: "{genotype}",
    fullTemplate:
      "OBX|{obxRunNumber}|ST|VARCONCEPT506^Genotype Name^EPIC|{geneSectionRunNumber}|{genotype}|",
  },
  {
    obxRunNumber: 21,
    geneName: "CYP2D6",
    section: 4,
    geneSectionRunNumber: "4d",
    code: "NR",
    fixedKeyName: "NR|VARCONCEPT566^Activity Score^EPIC",
    fixedValue: "",
    variableValue: "{activityScore}",
    fullTemplate:
      "OBX|{obxRunNumber}|NR|VARCONCEPT566^Activity Score^EPIC|{geneSectionRunNumber}|{activityScore}|",
  },
  {
    obxRunNumber: 22,
    geneName: "CYP2D6",
    section: 4,
    geneSectionRunNumber: "4d",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT553^Variant Classification^EPIC",
    fixedValue: "^Drug response",
    variableValue: "",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT553^Variant Classification^EPIC|{geneSectionRunNumber}|^Drug response|",
  },
  {
    obxRunNumber: 23,
    geneName: "CYP2D6",
    section: 4,
    geneSectionRunNumber: "4d",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT569^Pharmacogenomic Effect Type^EPIC",
    fixedValue: "^Metabolism",
    variableValue: "",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT569^Pharmacogenomic Effect Type^EPIC|{geneSectionRunNumber}|^Metabolism|",
  },
  {
    obxRunNumber: 24,
    geneName: "CYP2D6",
    section: 4,
    geneSectionRunNumber: "4d",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT570^Pharmacogenomic Effect Value^EPIC",
    fixedValue: "",
    variableValue: "^{phenotype}",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT570^Pharmacogenomic Effect Value^EPIC|{geneSectionRunNumber}|^{phenotype}|",
  },

  // CYP3A5 - 5 rows (OBX 25-29)
  {
    obxRunNumber: 25,
    geneName: "CYP3A5",
    section: 4,
    geneSectionRunNumber: "4e",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT514^Gene Studied^EPIC",
    fixedValue: "2638^CYP3A5^HGNC",
    variableValue: "",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT514^Gene Studied^EPIC|{geneSectionRunNumber}|2638^CYP3A5^HGNC|",
  },
  {
    obxRunNumber: 26,
    geneName: "CYP3A5",
    section: 4,
    geneSectionRunNumber: "4e",
    code: "ST",
    fixedKeyName: "ST|VARCONCEPT506^Genotype Name^EPIC",
    fixedValue: "",
    variableValue: "{genotype}",
    fullTemplate:
      "OBX|{obxRunNumber}|ST|VARCONCEPT506^Genotype Name^EPIC|{geneSectionRunNumber}|{genotype}|",
  },
  {
    obxRunNumber: 27,
    geneName: "CYP3A5",
    section: 4,
    geneSectionRunNumber: "4e",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT553^Variant Classification^EPIC",
    fixedValue: "^Drug response",
    variableValue: "",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT553^Variant Classification^EPIC|{geneSectionRunNumber}|^Drug response|",
  },
  {
    obxRunNumber: 28,
    geneName: "CYP3A5",
    section: 4,
    geneSectionRunNumber: "4e",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT569^Pharmacogenomic Effect Type^EPIC",
    fixedValue: "^Metabolism",
    variableValue: "",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT569^Pharmacogenomic Effect Type^EPIC|{geneSectionRunNumber}|^Metabolism|",
  },
  {
    obxRunNumber: 29,
    geneName: "CYP3A5",
    section: 4,
    geneSectionRunNumber: "4e",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT570^Pharmacogenomic Effect Value^EPIC",
    fixedValue: "",
    variableValue: "^{phenotype}",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT570^Pharmacogenomic Effect Value^EPIC|{geneSectionRunNumber}|^{phenotype}|",
  },

  // CYP4F2 - 5 rows (OBX 30-34)
  {
    obxRunNumber: 30,
    geneName: "CYP4F2",
    section: 4,
    geneSectionRunNumber: "4f",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT514^Gene Studied^EPIC",
    fixedValue: "2645^CYP4F2^HGNC",
    variableValue: "",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT514^Gene Studied^EPIC|{geneSectionRunNumber}|2645^CYP4F2^HGNC|",
  },
  {
    obxRunNumber: 31,
    geneName: "CYP4F2",
    section: 4,
    geneSectionRunNumber: "4f",
    code: "ST",
    fixedKeyName: "ST|VARCONCEPT506^Genotype Name^EPIC",
    fixedValue: "",
    variableValue: "{genotype}",
    fullTemplate:
      "OBX|{obxRunNumber}|ST|VARCONCEPT506^Genotype Name^EPIC|{geneSectionRunNumber}|{genotype}|",
  },
  {
    obxRunNumber: 32,
    geneName: "CYP4F2",
    section: 4,
    geneSectionRunNumber: "4f",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT553^Variant Classification^EPIC",
    fixedValue: "^Drug response",
    variableValue: "",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT553^Variant Classification^EPIC|{geneSectionRunNumber}|^Drug response|",
  },
  {
    obxRunNumber: 33,
    geneName: "CYP4F2",
    section: 4,
    geneSectionRunNumber: "4f",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT569^Pharmacogenomic Effect Type^EPIC",
    fixedValue: "^Metabolism",
    variableValue: "",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT569^Pharmacogenomic Effect Type^EPIC|{geneSectionRunNumber}|^Metabolism|",
  },
  {
    obxRunNumber: 34,
    geneName: "CYP4F2",
    section: 4,
    geneSectionRunNumber: "4f",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT570^Pharmacogenomic Effect Value^EPIC",
    fixedValue: "",
    variableValue: "^{phenotype}",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT570^Pharmacogenomic Effect Value^EPIC|{geneSectionRunNumber}|^{phenotype}|",
  },

  // DPYD - 6 rows (OBX 35-40)
  {
    obxRunNumber: 35,
    geneName: "DPYD",
    section: 4,
    geneSectionRunNumber: "4g",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT514^Gene Studied^EPIC",
    fixedValue: "3012^DPYD^HGNC",
    variableValue: "",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT514^Gene Studied^EPIC|{geneSectionRunNumber}|3012^DPYD^HGNC|",
  },
  {
    obxRunNumber: 36,
    geneName: "DPYD",
    section: 4,
    geneSectionRunNumber: "4g",
    code: "ST",
    fixedKeyName: "ST|VARCONCEPT506^Genotype Name^EPIC",
    fixedValue: "",
    variableValue: "{genotype}",
    fullTemplate:
      "OBX|{obxRunNumber}|ST|VARCONCEPT506^Genotype Name^EPIC|{geneSectionRunNumber}|{genotype}|",
  },
  {
    obxRunNumber: 37,
    geneName: "DPYD",
    section: 4,
    geneSectionRunNumber: "4g",
    code: "NR",
    fixedKeyName: "NR|VARCONCEPT566^Activity Score^EPIC",
    fixedValue: "",
    variableValue: "{activityScore}",
    fullTemplate:
      "OBX|{obxRunNumber}|NR|VARCONCEPT566^Activity Score^EPIC|{geneSectionRunNumber}|{activityScore}|",
  },
  {
    obxRunNumber: 38,
    geneName: "DPYD",
    section: 4,
    geneSectionRunNumber: "4g",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT553^Variant Classification^EPIC",
    fixedValue: "^Drug response",
    variableValue: "",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT553^Variant Classification^EPIC|{geneSectionRunNumber}|^Drug response|",
  },
  {
    obxRunNumber: 39,
    geneName: "DPYD",
    section: 4,
    geneSectionRunNumber: "4g",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT569^Pharmacogenomic Effect Type^EPIC",
    fixedValue: "^Metabolism",
    variableValue: "",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT569^Pharmacogenomic Effect Type^EPIC|{geneSectionRunNumber}|^Metabolism|",
  },
  {
    obxRunNumber: 40,
    geneName: "DPYD",
    section: 4,
    geneSectionRunNumber: "4g",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT570^Pharmacogenomic Effect Value^EPIC",
    fixedValue: "",
    variableValue: "^{phenotype}",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT570^Pharmacogenomic Effect Value^EPIC|{geneSectionRunNumber}|^{phenotype}|",
  },

  // HLA-A*31:01 - 8 rows (OBX 41-48)
  {
    obxRunNumber: 41,
    geneName: "HLA-A", // ✅ BENAR
    section: 2,
    geneSectionRunNumber: "2a",
    code: "ST",
    fixedKeyName: "ST|VARCONCEPT504^Variant Name^EPIC",
    fixedValue: "HLA-A *31:01",
    variableValue: "",
    fullTemplate:
      "OBX|{obxRunNumber}|ST|VARCONCEPT504^Variant Name^EPIC|{geneSectionRunNumber}|HLA-A *31:01|",
  },
  {
    obxRunNumber: 42,
    geneName: "HLA-A", // ✅ BENAR
    section: 2,
    geneSectionRunNumber: "2a",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT503^Variant Category^EPIC",
    fixedValue: "^Structural",
    variableValue: "",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT503^Variant Category^EPIC|{geneSectionRunNumber}|^Structural|",
  },
  {
    obxRunNumber: 43,
    geneName: "HLA-A",
    section: 2,
    geneSectionRunNumber: "2a",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT514^Gene Studied^EPIC",
    fixedValue: "4931^HLA-A^HGNC",
    variableValue: "",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT514^Gene Studied^EPIC|{geneSectionRunNumber}|4931^HLA-A^HGNC|",
  },
  {
    obxRunNumber: 44,
    geneName: "HLA-A",
    section: 2,
    geneSectionRunNumber: "2a",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT552^Genetic Variant Assessment^EPIC",
    fixedValue: "^Detected",
    variableValue: "",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT552^Genetic Variant Assessment^EPIC|{geneSectionRunNumber}|^Detected|",
  },
  {
    obxRunNumber: 45,
    geneName: "HLA-A",
    section: 2,
    geneSectionRunNumber: "2a",
    code: "ST",
    fixedKeyName: "ST|VARCONCEPT529^Allele Name^EPIC",
    fixedValue: "*31:01",
    variableValue: "",
    fullTemplate:
      "OBX|{obxRunNumber}|ST|VARCONCEPT529^Allele Name^EPIC|{geneSectionRunNumber}|*31:01|",
  },
  {
    obxRunNumber: 46,
    geneName: "HLA-A",
    section: 2,
    geneSectionRunNumber: "2a",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT553^Variant Classification^EPIC",
    fixedValue: "^Drug response",
    variableValue: "",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT553^Variant Classification^EPIC|{geneSectionRunNumber}|^Drug response|",
  },
  {
    obxRunNumber: 47,
    geneName: "HLA-A",
    section: 2,
    geneSectionRunNumber: "2a",
    code: "ST",
    fixedKeyName: "ST|VARCONCEPT539^Phenotype Description^EPIC",
    fixedValue: "",
    variableValue: "{phenotype}", // This should be "Negative" or "Positive"
    fullTemplate:
      "OBX|{obxRunNumber}|ST|VARCONCEPT539^Phenotype Description^EPIC|{geneSectionRunNumber}|{phenotype}|",
  },
  // For OBX 48 - Interpretation should show risk message
  {
    obxRunNumber: 48,
    geneName: "HLA-A",
    section: 2,
    geneSectionRunNumber: "2a",
    code: "ST",
    fixedKeyName: "ST|VARCONCEPT554^Interpretation^EPIC",
    fixedValue: "",
    variableValue: "{interpretation}", // This should be "No increased risk..." or "Increased risk..."
    fullTemplate:
      "OBX|{obxRunNumber}|ST|VARCONCEPT554^Interpretation^EPIC|{geneSectionRunNumber}|{interpretation}|",
  },
  {
    obxRunNumber: 49,
    geneName: "HLA-B-15-02",
    section: 2,
    geneSectionRunNumber: "2b",
    code: "ST",
    fixedKeyName: "ST|VARCONCEPT504^Variant Name^EPIC",
    fixedValue: "HLA-B *15:02",
    variableValue: "",
    fullTemplate:
      "OBX|{obxRunNumber}|ST|VARCONCEPT504^Variant Name^EPIC|{geneSectionRunNumber}|HLA-B *15:02|",
  },
  // Add missing templates between OBX 49-72:
  {
    obxRunNumber: 50,
    geneName: "HLA-B-15-02",
    section: 2,
    geneSectionRunNumber: "2b",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT503^Variant Category^EPIC",
    fixedValue: "^Structural",
    variableValue: "",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT503^Variant Category^EPIC|{geneSectionRunNumber}|^Structural|",
  },
  {
    obxRunNumber: 51,
    geneName: "HLA-B-15-02",
    section: 2,
    geneSectionRunNumber: "2b",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT514^Gene Studied^EPIC",
    fixedValue: "4932^HLA-B^HGNC",
    variableValue: "",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT514^Gene Studied^EPIC|{geneSectionRunNumber}|4932^HLA-B^HGNC|",
  },
  {
    obxRunNumber: 52,
    geneName: "HLA-B-15-02",
    section: 2,
    geneSectionRunNumber: "2b",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT552^Genetic Variant Assessment^EPIC",
    fixedValue: "^Detected",
    variableValue: "",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT552^Genetic Variant Assessment^EPIC|{geneSectionRunNumber}|^Detected|",
  },
  {
    obxRunNumber: 53,
    geneName: "HLA-B-15-02",
    section: 2,
    geneSectionRunNumber: "2b",
    code: "ST",
    fixedKeyName: "ST|VARCONCEPT529^Allele Name^EPIC",
    fixedValue: "*15:02",
    variableValue: "",
    fullTemplate:
      "OBX|{obxRunNumber}|ST|VARCONCEPT529^Allele Name^EPIC|{geneSectionRunNumber}|*15:02|",
  },
  {
    obxRunNumber: 54,
    geneName: "HLA-B-15-02",
    section: 2,
    geneSectionRunNumber: "2b",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT553^Variant Classification^EPIC",
    fixedValue: "^Drug response",
    variableValue: "",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT553^Variant Classification^EPIC|{geneSectionRunNumber}|^Drug response|",
  },
  {
    obxRunNumber: 55,
    geneName: "HLA-B-15-02",
    section: 2,
    geneSectionRunNumber: "2b",
    code: "ST",
    fixedKeyName: "ST|VARCONCEPT539^Phenotype Description^EPIC",
    fixedValue: "",
    variableValue: "{phenotype}",
    fullTemplate:
      "OBX|{obxRunNumber}|ST|VARCONCEPT539^Phenotype Description^EPIC|{geneSectionRunNumber}|{phenotype}|",
  },
  {
    obxRunNumber: 56,
    geneName: "HLA-B-15-02",
    section: 2,
    geneSectionRunNumber: "2b",
    code: "ST",
    fixedKeyName: "ST|VARCONCEPT554^Interpretation^EPIC",
    fixedValue: "",
    variableValue: "{interpretation}",
    fullTemplate:
      "OBX|{obxRunNumber}|ST|VARCONCEPT554^Interpretation^EPIC|{geneSectionRunNumber}|{interpretation}|",
  },

  // HLA-B *57:01 - OBX 57-64
  {
    obxRunNumber: 57,
    geneName: "HLA-B-57-01",
    section: 2,
    geneSectionRunNumber: "2c",
    code: "ST",
    fixedKeyName: "ST|VARCONCEPT504^Variant Name^EPIC",
    fixedValue: "HLA-B *57:01",
    variableValue: "",
    fullTemplate:
      "OBX|{obxRunNumber}|ST|VARCONCEPT504^Variant Name^EPIC|{geneSectionRunNumber}|HLA-B *57:01|",
  },
  {
    obxRunNumber: 58,
    geneName: "HLA-B-57-01",
    section: 2,
    geneSectionRunNumber: "2c",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT503^Variant Category^EPIC",
    fixedValue: "^Structural",
    variableValue: "",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT503^Variant Category^EPIC|{geneSectionRunNumber}|^Structural|",
  },
  {
    obxRunNumber: 59,
    geneName: "HLA-B-57-01",
    section: 2,
    geneSectionRunNumber: "2c",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT514^Gene Studied^EPIC",
    fixedValue: "4932^HLA-B^HGNC",
    variableValue: "",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT514^Gene Studied^EPIC|{geneSectionRunNumber}|4932^HLA-B^HGNC|",
  },
  {
    obxRunNumber: 60,
    geneName: "HLA-B-57-01",
    section: 2,
    geneSectionRunNumber: "2c",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT552^Genetic Variant Assessment^EPIC",
    fixedValue: "^Detected",
    variableValue: "",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT552^Genetic Variant Assessment^EPIC|{geneSectionRunNumber}|^Detected|",
  },
  {
    obxRunNumber: 61,
    geneName: "HLA-B-57-01",
    section: 2,
    geneSectionRunNumber: "2c",
    code: "ST",
    fixedKeyName: "ST|VARCONCEPT529^Allele Name^EPIC",
    fixedValue: "*57:01",
    variableValue: "",
    fullTemplate:
      "OBX|{obxRunNumber}|ST|VARCONCEPT529^Allele Name^EPIC|{geneSectionRunNumber}|*57:01|",
  },
  {
    obxRunNumber: 62,
    geneName: "HLA-B-57-01",
    section: 2,
    geneSectionRunNumber: "2c",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT553^Variant Classification^EPIC",
    fixedValue: "^Drug response",
    variableValue: "",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT553^Variant Classification^EPIC|{geneSectionRunNumber}|^Drug response|",
  },
  {
    obxRunNumber: 63,
    geneName: "HLA-B-57-01",
    section: 2,
    geneSectionRunNumber: "2c",
    code: "ST",
    fixedKeyName: "ST|VARCONCEPT539^Phenotype Description^EPIC",
    fixedValue: "",
    variableValue: "{phenotype}",
    fullTemplate:
      "OBX|{obxRunNumber}|ST|VARCONCEPT539^Phenotype Description^EPIC|{geneSectionRunNumber}|{phenotype}|",
  },
  {
    obxRunNumber: 64,
    geneName: "HLA-B-57-01",
    section: 2,
    geneSectionRunNumber: "2c",
    code: "ST",
    fixedKeyName: "ST|VARCONCEPT554^Interpretation^EPIC",
    fixedValue: "",
    variableValue: "{interpretation}",
    fullTemplate:
      "OBX|{obxRunNumber}|ST|VARCONCEPT554^Interpretation^EPIC|{geneSectionRunNumber}|{interpretation}|",
  },

  // HLA-B *58:01 - OBX 65-72
  {
    obxRunNumber: 65,
    geneName: "HLA-B-58-01",
    section: 2,
    geneSectionRunNumber: "2d",
    code: "ST",
    fixedKeyName: "ST|VARCONCEPT504^Variant Name^EPIC",
    fixedValue: "HLA-B *58:01",
    variableValue: "",
    fullTemplate:
      "OBX|{obxRunNumber}|ST|VARCONCEPT504^Variant Name^EPIC|{geneSectionRunNumber}|HLA-B *58:01|",
  },
  {
    obxRunNumber: 66,
    geneName: "HLA-B-58-01",
    section: 2,
    geneSectionRunNumber: "2d",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT503^Variant Category^EPIC",
    fixedValue: "^Structural",
    variableValue: "",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT503^Variant Category^EPIC|{geneSectionRunNumber}|^Structural|",
  },
  {
    obxRunNumber: 67,
    geneName: "HLA-B-58-01",
    section: 2,
    geneSectionRunNumber: "2d",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT514^Gene Studied^EPIC",
    fixedValue: "4932^HLA-B^HGNC",
    variableValue: "",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT514^Gene Studied^EPIC|{geneSectionRunNumber}|4932^HLA-B^HGNC|",
  },
  {
    obxRunNumber: 68,
    geneName: "HLA-B-58-01",
    section: 2,
    geneSectionRunNumber: "2d",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT552^Genetic Variant Assessment^EPIC",
    fixedValue: "^Detected",
    variableValue: "",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT552^Genetic Variant Assessment^EPIC|{geneSectionRunNumber}|^Detected|",
  },
  {
    obxRunNumber: 69,
    geneName: "HLA-B-58-01",
    section: 2,
    geneSectionRunNumber: "2d",
    code: "ST",
    fixedKeyName: "ST|VARCONCEPT529^Allele Name^EPIC",
    fixedValue: "*58:01",
    variableValue: "",
    fullTemplate:
      "OBX|{obxRunNumber}|ST|VARCONCEPT529^Allele Name^EPIC|{geneSectionRunNumber}|*58:01|",
  },
  {
    obxRunNumber: 70,
    geneName: "HLA-B-58-01",
    section: 2,
    geneSectionRunNumber: "2d",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT553^Variant Classification^EPIC",
    fixedValue: "^Drug response",
    variableValue: "",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT553^Variant Classification^EPIC|{geneSectionRunNumber}|^Drug response|",
  },
  {
    obxRunNumber: 71,
    geneName: "HLA-B-58-01",
    section: 2,
    geneSectionRunNumber: "2d",
    code: "ST",
    fixedKeyName: "ST|VARCONCEPT539^Phenotype Description^EPIC",
    fixedValue: "",
    variableValue: "{phenotype}",
    fullTemplate:
      "OBX|{obxRunNumber}|ST|VARCONCEPT539^Phenotype Description^EPIC|{geneSectionRunNumber}|{phenotype}|",
  },
  {
    obxRunNumber: 72,
    geneName: "HLA-B-58-01",
    section: 2,
    geneSectionRunNumber: "2d",
    code: "ST",
    fixedKeyName: "ST|VARCONCEPT554^Interpretation^EPIC",
    fixedValue: "",
    variableValue: "{interpretation}",
    fullTemplate:
      "OBX|{obxRunNumber}|ST|VARCONCEPT554^Interpretation^EPIC|{geneSectionRunNumber}|{interpretation}|",
  },

  // NUDT15 - 5 rows (OBX 73-77)
  {
    obxRunNumber: 73,
    geneName: "NUDT15",
    section: 4,
    geneSectionRunNumber: "4h",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT514^Gene Studied^EPIC",
    fixedValue: "23063^NUDT15^HGNC",
    variableValue: "",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT514^Gene Studied^EPIC|{geneSectionRunNumber}|23063^NUDT15^HGNC|",
  },
  {
    obxRunNumber: 74,
    geneName: "NUDT15",
    section: 4,
    geneSectionRunNumber: "4h",
    code: "ST",
    fixedKeyName: "ST|VARCONCEPT506^Genotype Name^EPIC",
    fixedValue: "",
    variableValue: "{genotype}",
    fullTemplate:
      "OBX|{obxRunNumber}|ST|VARCONCEPT506^Genotype Name^EPIC|{geneSectionRunNumber}|{genotype}|",
  },
  {
    obxRunNumber: 75,
    geneName: "NUDT15",
    section: 4,
    geneSectionRunNumber: "4h",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT553^Variant Classification^EPIC",
    fixedValue: "^Drug response",
    variableValue: "",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT553^Variant Classification^EPIC|{geneSectionRunNumber}|^Drug response|",
  },
  {
    obxRunNumber: 76,
    geneName: "NUDT15",
    section: 4,
    geneSectionRunNumber: "4h",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT569^Pharmacogenomic Effect Type^EPIC",
    fixedValue: "^Metabolism",
    variableValue: "",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT569^Pharmacogenomic Effect Type^EPIC|{geneSectionRunNumber}|^Metabolism|",
  },
  {
    obxRunNumber: 77,
    geneName: "NUDT15",
    section: 4,
    geneSectionRunNumber: "4h",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT570^Pharmacogenomic Effect Value^EPIC",
    fixedValue: "",
    variableValue: "^{phenotype}",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT570^Pharmacogenomic Effect Value^EPIC|{geneSectionRunNumber}|^{phenotype}|",
  },
  // SLCO1B1 - 5 rows (OBX 78-82)
  {
    obxRunNumber: 78,
    geneName: "SLCO1B1",
    section: 4,
    geneSectionRunNumber: "4i",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT514^Gene Studied^EPIC",
    fixedValue: "10959^SLCO1B1^HGNC",
    variableValue: "",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT514^Gene Studied^EPIC|{geneSectionRunNumber}|10959^SLCO1B1^HGNC|",
  },
  {
    obxRunNumber: 79,
    geneName: "SLCO1B1",
    section: 4,
    geneSectionRunNumber: "4i",
    code: "ST",
    fixedKeyName: "ST|VARCONCEPT506^Genotype Name^EPIC",
    fixedValue: "",
    variableValue: "{genotype}",
    fullTemplate:
      "OBX|{obxRunNumber}|ST|VARCONCEPT506^Genotype Name^EPIC|{geneSectionRunNumber}|{genotype}|",
  },
  {
    obxRunNumber: 80,
    geneName: "SLCO1B1",
    section: 4,
    geneSectionRunNumber: "4i",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT553^Variant Classification^EPIC",
    fixedValue: "^Drug response",
    variableValue: "",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT553^Variant Classification^EPIC|{geneSectionRunNumber}|^Drug response|",
  },
  {
    obxRunNumber: 81,
    geneName: "SLCO1B1",
    section: 4,
    geneSectionRunNumber: "4i",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT569^Pharmacogenomic Effect Type^EPIC",
    fixedValue: "^Transport",
    variableValue: "",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT569^Pharmacogenomic Effect Type^EPIC|{geneSectionRunNumber}|^Transport|",
  },
  {
    obxRunNumber: 82,
    geneName: "SLCO1B1",
    section: 4,
    geneSectionRunNumber: "4i",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT570^Pharmacogenomic Effect Value^EPIC",
    fixedValue: "",
    variableValue: "^{phenotype}",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT570^Pharmacogenomic Effect Value^EPIC|{geneSectionRunNumber}|^{phenotype}|",
  },

  // TPMT - 5 rows (OBX 83-87)
  {
    obxRunNumber: 83,
    geneName: "TPMT",
    section: 4,
    geneSectionRunNumber: "4j",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT514^Gene Studied^EPIC",
    fixedValue: "12014^TPMT^HGNC",
    variableValue: "",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT514^Gene Studied^EPIC|{geneSectionRunNumber}|12014^TPMT^HGNC|",
  },
  {
    obxRunNumber: 84,
    geneName: "TPMT",
    section: 4,
    geneSectionRunNumber: "4j",
    code: "ST",
    fixedKeyName: "ST|VARCONCEPT506^Genotype Name^EPIC",
    fixedValue: "",
    variableValue: "{genotype}",
    fullTemplate:
      "OBX|{obxRunNumber}|ST|VARCONCEPT506^Genotype Name^EPIC|{geneSectionRunNumber}|{genotype}|",
  },
  {
    obxRunNumber: 85,
    geneName: "TPMT",
    section: 4,
    geneSectionRunNumber: "4j",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT553^Variant Classification^EPIC",
    fixedValue: "^Drug response",
    variableValue: "",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT553^Variant Classification^EPIC|{geneSectionRunNumber}|^Drug response|",
  },
  {
    obxRunNumber: 86,
    geneName: "TPMT",
    section: 4,
    geneSectionRunNumber: "4j",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT569^Pharmacogenomic Effect Type^EPIC",
    fixedValue: "^Metabolism",
    variableValue: "",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT569^Pharmacogenomic Effect Type^EPIC|{geneSectionRunNumber}|^Metabolism|",
  },
  {
    obxRunNumber: 87,
    geneName: "TPMT",
    section: 4,
    geneSectionRunNumber: "4j",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT570^Pharmacogenomic Effect Value^EPIC",
    fixedValue: "",
    variableValue: "^{phenotype}",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT570^Pharmacogenomic Effect Value^EPIC|{geneSectionRunNumber}|^{phenotype}|",
  },

  // UGT1A1 - 5 rows (OBX 88-92)
  {
    obxRunNumber: 88,
    geneName: "UGT1A1",
    section: 4,
    geneSectionRunNumber: "4k",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT514^Gene Studied^EPIC",
    fixedValue: "12530^UGT1A1^HGNC",
    variableValue: "",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT514^Gene Studied^EPIC|{geneSectionRunNumber}|12530^UGT1A1^HGNC|",
  },
  {
    obxRunNumber: 89,
    geneName: "UGT1A1",
    section: 4,
    geneSectionRunNumber: "4k",
    code: "ST",
    fixedKeyName: "ST|VARCONCEPT506^Genotype Name^EPIC",
    fixedValue: "",
    variableValue: "{genotype}",
    fullTemplate:
      "OBX|{obxRunNumber}|ST|VARCONCEPT506^Genotype Name^EPIC|{geneSectionRunNumber}|{genotype}|",
  },
  {
    obxRunNumber: 90,
    geneName: "UGT1A1",
    section: 4,
    geneSectionRunNumber: "4k",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT553^Variant Classification^EPIC",
    fixedValue: "^Drug response",
    variableValue: "",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT553^Variant Classification^EPIC|{geneSectionRunNumber}|^Drug response|",
  },
  {
    obxRunNumber: 91,
    geneName: "UGT1A1",
    section: 4,
    geneSectionRunNumber: "4k",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT569^Pharmacogenomic Effect Type^EPIC",
    fixedValue: "^Metabolism",
    variableValue: "",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT569^Pharmacogenomic Effect Type^EPIC|{geneSectionRunNumber}|^Metabolism|",
  },
  {
    obxRunNumber: 92,
    geneName: "UGT1A1",
    section: 4,
    geneSectionRunNumber: "4k",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT570^Pharmacogenomic Effect Value^EPIC",
    fixedValue: "",
    variableValue: "^{phenotype}",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT570^Pharmacogenomic Effect Value^EPIC|{geneSectionRunNumber}|^{phenotype}|",
  },
  // VKORC1 - 10 rows (OBX 93-102)
  {
    obxRunNumber: 93,
    geneName: "VKORC1",
    section: 2,
    geneSectionRunNumber: "2e",
    code: "ST",
    fixedKeyName: "ST|VARCONCEPT504^Variant Name^EPIC",
    fixedValue: "VKORC1 c.-1639G/A",
    variableValue: "",
    fullTemplate:
      "OBX|{obxRunNumber}|ST|VARCONCEPT504^Variant Name^EPIC|{geneSectionRunNumber}|VKORC1 c.-1639G/A|",
  },
  {
    obxRunNumber: 94,
    geneName: "VKORC1",
    section: 2,
    geneSectionRunNumber: "2e",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT503^Variant Category^EPIC",
    fixedValue: "^Simple",
    variableValue: "",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT503^Variant Category^EPIC|{geneSectionRunNumber}|^Simple|",
  },
  {
    obxRunNumber: 95,
    geneName: "VKORC1",
    section: 2,
    geneSectionRunNumber: "2e",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT514^Gene Studied^EPIC",
    fixedValue: "23663^VKORC1^HGNC",
    variableValue: "",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT514^Gene Studied^EPIC|{geneSectionRunNumber}|23663^VKORC1^HGNC|",
  },
  {
    obxRunNumber: 96,
    geneName: "VKORC1",
    section: 2,
    geneSectionRunNumber: "2e",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT521^Molecular Consequence^EPIC",
    fixedValue: "^Regulatory Region Variant",
    variableValue: "",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT521^Molecular Consequence^EPIC|{geneSectionRunNumber}|^Regulatory Region Variant|",
  },
  {
    obxRunNumber: 97,
    geneName: "VKORC1",
    section: 2,
    geneSectionRunNumber: "2e",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT552^Genetic Variant Assessment^EPIC",
    fixedValue: "^Detected",
    variableValue: "",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT552^Genetic Variant Assessment^EPIC|{geneSectionRunNumber}|^Detected|",
  },
  {
    obxRunNumber: 98,
    geneName: "VKORC1",
    section: 2,
    geneSectionRunNumber: "2e",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT505^Discrete Genetic Variant^EPIC",
    fixedValue: "rs9923231^NM_024006.6:c.-1639G>A^dbSNP",
    variableValue: "",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT505^Discrete Genetic Variant^EPIC|{geneSectionRunNumber}|rs9923231^NM_024006.6:c.-1639G>A^dbSNP|",
  },
  {
    obxRunNumber: 99,
    geneName: "VKORC1",
    section: 2,
    geneSectionRunNumber: "2e",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT518^DNA Change^EPIC",
    fixedValue: "c.-1639G>A^c.-1639G>A^HGVS.c",
    variableValue: "",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT518^DNA Change^EPIC|{geneSectionRunNumber}|c.-1639G>A^c.-1639G>A^HGVS.c|",
  },
  {
    obxRunNumber: 100,
    geneName: "VKORC1",
    section: 2,
    geneSectionRunNumber: "2e",
    code: "CWE",
    fixedKeyName: "CWE|VARCONCEPT553^Variant Classification^EPIC",
    fixedValue: "^Drug response",
    variableValue: "",
    fullTemplate:
      "OBX|{obxRunNumber}|CWE|VARCONCEPT553^Variant Classification^EPIC|{geneSectionRunNumber}|^Drug response|",
  },
  {
    obxRunNumber: 101,
    geneName: "VKORC1",
    section: 2,
    geneSectionRunNumber: "2e",
    code: "ST",
    fixedKeyName: "ST|VARCONCEPT506^Genotype Name^EPIC",
    fixedValue: "",
    variableValue: "{genotype}",
    fullTemplate:
      "OBX|{obxRunNumber}|ST|VARCONCEPT506^Genotype Name^EPIC|{geneSectionRunNumber}|{genotype}|",
  },
  {
    obxRunNumber: 102,
    geneName: "VKORC1",
    section: 2,
    geneSectionRunNumber: "2e",
    code: "ST",
    fixedKeyName: "ST|VARCONCEPT554^Interpretation^EPIC",
    fixedValue: "",
    variableValue: "{interpretation}",
    fullTemplate:
      "OBX|{obxRunNumber}|ST|VARCONCEPT554^Interpretation^EPIC|{geneSectionRunNumber}|{interpretation}|",
  },

  // TODO: Add all remaining template rows for SLCO1B1, VKORC1, and all HLA genes
  // Following the exact same pattern as shown in your Excel file
];

// Function to get activity score based on genotype
function getActivityScore(gene: string, genotype: string): string {
  const activityScoreMap: Record<string, Record<string, string>> = {
    ABCG2: {
      "C/C": "2",
      "C/A": "1.5",
      "A/A": "1",
      "421C/C": "2", // Handle both formats
      "421C/A": "1.5",
      "421A/A": "1",
    },
    CYP2C9: {
      "*1/*1": "2^2",
      "*1/*2": "1.5^2",
      "*1/*3": "1.5^2",
      "*2/*2": "1^1",
      "*2/*3": "0.5^1",
      "*3/*3": "0.5^0.5",
    },
    CYP2D6: {
      "*1/*1": "2^2",
      "*1/*2": "1.5^2",
      "*1/*4": "1^2",
      "*2/*2": "1^1",
      "*4/*4": "0^0",
      "*1/*36-*10": "1.25^1.25", // Add missing genotype
    },
    DPYD: {
      "*1/*1": "2^2",
      "*1/HapB3": "1.5^1.5",
      "HapB3/HapB3": "1^1",
    },
  };

  return activityScoreMap[gene]?.[genotype] || "2^2";
}

// Function to get interpretation for HLA genes
function getHLAInterpretation(gene: string, phenotype: string): string {
  const interpretationMap: Record<string, Record<string, string>> = {
    "HLA-A": {
      Negative: "No increased risk of carbamazepine hypersensitivity",
      Positive: "Increased risk of carbamazepine hypersensitivity",
    },
    "HLA-B-15-02": {
      Negative: "No increased risk of carbamazepine hypersensitivity",
      Positive: "Increased risk of carbamazepine hypersensitivity",
    },
    "HLA-B-57-01": {
      Negative: "No increased risk of abacavir hypersensitivity",
      Positive: "Increased risk of abacavir hypersensitivity",
    },
    "HLA-B-58-01": {
      Negative: "No increased risk of allopurinol hypersensitivity",
      Positive: "Increased risk of allopurinol hypersensitivity",
    },
  };

  return (
    interpretationMap[gene]?.[phenotype] ||
    "No increased risk of carbamazepine hypersensitivity"
  );
}

interface GeneData {
  gene: string;
  genotype: string;
  phenotype: string;
  interpretation?: string;
}

function generateOBXSegmentsForGenes(
  inputGenes: Array<{ gene: string; genotype: string; phenotype: string }>
): string[] {
  const obxSegments: string[] = [];
  const geneDataMap = new Map<string, GeneData>();

  console.log("=== DEBUG: Input Genes ===");
  inputGenes.forEach((inputGene, index) => {
    console.log(
      `${index + 1}. Original: "${inputGene.gene}" -> Genotype: "${
        inputGene.genotype
      }" -> Phenotype: "${inputGene.phenotype}"`
    );
  });

  // Enhanced gene name normalization
  inputGenes.forEach((inputGene) => {
    let normalizedGeneName = inputGene.gene.toUpperCase().trim();

    console.log(
      `🔍 Processing gene: "${inputGene.gene}" -> Normalized: "${normalizedGeneName}"`
    );

    // ✅ Enhanced HLA gene name normalization
    if (
      normalizedGeneName.includes("HLA-A") ||
      normalizedGeneName.includes("HLA A")
    ) {
      normalizedGeneName = "HLA-A";
      console.log(
        `✅ HLA-A detected: "${inputGene.gene}" -> "${normalizedGeneName}"`
      );
    } else if (
      normalizedGeneName.includes("HLA-B") ||
      normalizedGeneName.includes("HLA B")
    ) {
      if (
        normalizedGeneName.includes("15:02") ||
        normalizedGeneName.includes("15-02") ||
        normalizedGeneName.includes("*15:02")
      ) {
        normalizedGeneName = "HLA-B-15-02";
        console.log(
          `✅ HLA-B-15-02 detected: "${inputGene.gene}" -> "${normalizedGeneName}"`
        );
      } else if (
        normalizedGeneName.includes("57:01") ||
        normalizedGeneName.includes("57-01") ||
        normalizedGeneName.includes("*57:01")
      ) {
        normalizedGeneName = "HLA-B-57-01";
        console.log(
          `✅ HLA-B-57-01 detected: "${inputGene.gene}" -> "${normalizedGeneName}"`
        );
      } else if (
        normalizedGeneName.includes("58:01") ||
        normalizedGeneName.includes("58-01") ||
        normalizedGeneName.includes("*58:01")
      ) {
        normalizedGeneName = "HLA-B-58-01";
        console.log(
          `✅ HLA-B-58-01 detected: "${inputGene.gene}" -> "${normalizedGeneName}"`
        );
      } else {
        console.log(`⚠️ Unknown HLA-B variant: "${inputGene.gene}"`);
      }
    }

    // ✅ Create special handling for HLA genes with proper field mapping
    const processedData: GeneData = { ...inputGene };

    if (normalizedGeneName.startsWith("HLA-")) {
      // For HLA genes, we need to extract the phenotype status and interpretation
      // From your data: "Negative" goes to phenotype, risk message goes to interpretation

      // Parse the phenotype field which might contain both status and interpretation
      const phenotypeText = inputGene.phenotype || "";

      if (phenotypeText.toLowerCase().includes("negative")) {
        processedData.phenotype = "Negative";
        processedData.interpretation = getHLAInterpretation(
          normalizedGeneName,
          "Negative"
        );
      } else if (phenotypeText.toLowerCase().includes("positive")) {
        processedData.phenotype = "Positive";
        processedData.interpretation = getHLAInterpretation(
          normalizedGeneName,
          "Positive"
        );
      } else {
        // If we have the interpretation text directly, determine status from it
        if (phenotypeText.toLowerCase().includes("no increased risk")) {
          processedData.phenotype = "Negative";
          processedData.interpretation = phenotypeText;
        } else if (phenotypeText.toLowerCase().includes("increased risk")) {
          processedData.phenotype = "Positive";
          processedData.interpretation = phenotypeText;
        } else {
          processedData.phenotype = "Negative";
          processedData.interpretation = "No specific interpretation available";
        }
      }
    } else {
      // ✅ For non-HLA genes, keep the original phenotype and interpretation
      processedData.phenotype = inputGene.phenotype;
      processedData.interpretation = (inputGene as unknown as GeneData).interpretation || "";

      console.log(
        `🔧 Non-HLA Processing: ${normalizedGeneName} -> Phenotype: "${processedData.phenotype}"`
      );
    }

    console.log(`📝 Mapping: "${normalizedGeneName}" -> Data:`, processedData);
    geneDataMap.set(normalizedGeneName, processedData);
  });

  console.log("=== DEBUG: Gene Data Map ===");
  console.log("Available genes in map:", Array.from(geneDataMap.keys()));

  // Process ALL 102 templates in order
  HL7_STANDARD_TEMPLATE.forEach((templateRow) => {
    const geneData = geneDataMap.get(templateRow.geneName.toUpperCase());

    if (templateRow.obxRunNumber >= 41 && templateRow.obxRunNumber <= 72) {
      console.log(
        `🔍 OBX ${templateRow.obxRunNumber}: Template gene "${templateRow.geneName}" -> Found data:`,
        !!geneData
      );
    }

    let finalTemplate = templateRow.fullTemplate;

    if (geneData) {
      // ✅ Format genotype for display - Remove 421 prefix for ABCG2
      let displayGenotype = geneData.genotype;
      if (templateRow.geneName === "ABCG2" && displayGenotype.includes("421")) {
        displayGenotype = displayGenotype.replace(/421/g, "");
        console.log(
          `🔧 ABCG2 genotype converted: "${geneData.genotype}" -> "${displayGenotype}"`
        );
      } else if (
        templateRow.geneName === "VKORC1" &&
        displayGenotype.includes("-1639")
      ) {
        // Convert -1639A/A to A/A
        displayGenotype = displayGenotype.replace(/-1639/g, "");
        console.log(
          `🔧 VKORC1 genotype converted: "${geneData.genotype}" -> "${displayGenotype}"`
        );
      }

      let displayPhenotype = geneData.phenotype;
      if (templateRow.geneName.startsWith("HLA-")) {
        // For HLA genes, phenotype should be "Negative" or "Positive"
        displayPhenotype = geneData.phenotype;
      } else {
        // ✅ ONLY normalize specific genes - ABCG2 and SLCO1B1
        if (
          templateRow.geneName === "ABCG2" ||
          templateRow.geneName === "SLCO1B1"
        ) {
          const phenotypeLower = displayPhenotype.toLowerCase();
          if (
            phenotypeLower.includes("normal") &&
            (phenotypeLower.includes("function") ||
              phenotypeLower.includes("metabolizer"))
          ) {
            displayPhenotype = "Normal function";
          } else if (
            phenotypeLower.includes("poor") &&
            (phenotypeLower.includes("function") ||
              phenotypeLower.includes("metabolizer"))
          ) {
            displayPhenotype = "Poor function";
          } else if (
            phenotypeLower.includes("intermediate") &&
            (phenotypeLower.includes("function") ||
              phenotypeLower.includes("metabolizer"))
          ) {
            displayPhenotype = "Intermediate function";
          }
        }
        // ✅ For ALL OTHER genes, keep the original phenotype unchanged
        else {
          displayPhenotype = geneData.phenotype; // Keep original
        }

        console.log(
          `🔧 Phenotype for ${templateRow.geneName}: "${geneData.phenotype}" -> "${displayPhenotype}"`
        );
      }
      // ✅ Get interpretation for HLA genes
      let displayInterpretation = "";
      if (templateRow.geneName.startsWith("HLA-")) {
        displayInterpretation =
          geneData.interpretation ||
          getHLAInterpretation(templateRow.geneName, geneData.phenotype);
      } else if (templateRow.geneName === "VKORC1") {
        // Special handling for VKORC1 interpretation
        if (
          geneData.genotype?.includes("A/A") ||
          geneData.genotype?.includes("-1639A/A")
        ) {
          displayInterpretation = "High warfarin sensitivity";
        } else if (
          geneData.genotype?.includes("G/G") ||
          geneData.genotype?.includes("-1639G/G")
        ) {
          displayInterpretation = "Normal warfarin sensitivity";
        } else {
          displayInterpretation = "Intermediate warfarin sensitivity";
        }
      }

      // Replace placeholders
      finalTemplate = finalTemplate
        .replace(/{obxRunNumber}/g, templateRow.obxRunNumber.toString())
        .replace(/{geneSectionRunNumber}/g, templateRow.geneSectionRunNumber)
        .replace(/{genotype}/g, displayGenotype)
        .replace(/{phenotype}/g, displayPhenotype)
        .replace(
          /{activityScore}/g,
          getActivityScore(geneData.gene, geneData.genotype)
        )
        .replace(/{interpretation}/g, displayInterpretation);

      // Handle variable values
      if (templateRow.variableValue) {
        const parts = finalTemplate.split("|");
        if (parts.length >= 6) {
          const processedValue = templateRow.variableValue
            .replace(/{genotype}/g, displayGenotype)
            .replace(/{phenotype}/g, displayPhenotype)
            .replace(
              /{activityScore}/g,
              getActivityScore(geneData.gene, geneData.genotype)
            )
            .replace(/{interpretation}/g, displayInterpretation);

          parts[5] = processedValue;
          finalTemplate = parts.join("|");
        }
      }
    } else {
      // Use default/empty values if gene data not provided
      finalTemplate = finalTemplate
        .replace(/{obxRunNumber}/g, templateRow.obxRunNumber.toString())
        .replace(/{geneSectionRunNumber}/g, templateRow.geneSectionRunNumber)
        .replace(/{genotype}/g, "")
        .replace(/{phenotype}/g, "")
        .replace(/{activityScore}/g, "")
        .replace(/{interpretation}/g, "");

      // Handle variable values with empty data
      if (templateRow.variableValue) {
        const parts = finalTemplate.split("|");
        if (parts.length >= 6) {
          parts[5] = "";
          finalTemplate = parts.join("|");
        }
      }
    }

    obxSegments.push(finalTemplate);
  });

  console.log(`Generated ${obxSegments.length} OBX segments (should be 102)`);
  return obxSegments;
}

interface HL7MessageData {
  patient_name?: string;
  date_of_birth?: string | null;
  sex?: string;
  mrn?: string;
  id_number?: string;
  patient_address?: string;
  patient_contact_number?: string;
  test_case_id?: string;
  specimen_type?: string;
  specimen_id?: string;
  specimen_collected_from?: string;
  specimen_received?: string | null;
  test_information?: string;
  lab_result_summary?: string;
  physician_name?: string;
  pgxPanel?: Array<{ gene: string; genotype: string; phenotype: string }>;
  testResults?: Array<Record<string, unknown>>;
}

export function buildHL7Message(data: HL7MessageData): string {
  console.log("Data received in buildHL7Message:", data);

  const currentDateTime = new Date()
    .toISOString()
    .replace(/[-:T]/g, "")
    .slice(0, 14);
  const messageControlId = `LAB${Math.floor(Math.random() * 100000)}`;

  // MSH, PID, PV1, ORC, OBR segments (unchanged)
  const mshSegment = [
    "MSH",
    "^~\\&",
    "LIS",
    "LIS",
    "EMR",
    "EMR",
    currentDateTime,
    "",
    "ORU^R01",
    messageControlId,
    "P",
    "2.3",
    "",
    "",
    "AL",
    "NE",
  ].join("|");

  const patientNameParts = (data.patient_name || "").split(" ");
  const lastName = patientNameParts[patientNameParts.length - 1] || "";
  const firstName = patientNameParts.slice(0, -1).join(" ") || "";

  const pidSegment = [
    "PID",
    "",
    "",
    data.id_number || data.mrn || "",
    "",
    `${lastName}^${firstName}`,
    "",
    data.date_of_birth ? data.date_of_birth.replace(/-/g, "") : "",
    data.sex || "U",
    "",
    "C^Chinese",
    data.patient_address || "Hospital Address",
    "",
    data.patient_contact_number || "Contact Number",
    "",
    "",
    "",
    "",
    data.test_case_id || "",
  ].join("|");

  const pv1Segment = [
    "PV1",
    "",
    "I",
    "HOSPITAL^NONE^^^HOSPITAL",
    "",
    "",
    "",
    "15799F^" + (data.physician_name || "UNKNOWN PHYSICIAN"),
    "15799F^" + (data.physician_name || "UNKNOWN PHYSICIAN"),
    "",
    "HOSPITAL",
    "",
    "",
    "",
    "",
    "",
    "15799F^" + (data.physician_name || "UNKNOWN PHYSICIAN"),
    "NA",
    (data.test_case_id || "UNKNOWN") +
      "^^^^I~" +
      (data.test_case_id || "UNKNOWN") +
      "^^^^O",
    "SELF^19991130000000",
    "",
    "",
    "",
    "",
    "",
    currentDateTime.slice(0, 12) + "59",
  ].join("|");

  const labAccessionNo = String(data.test_case_id || `${currentDateTime}001`);

  const orcSegment = [
    "ORC",
    "NW",
    "",
    labAccessionNo + "^LAB",
    "",
    "A",
    "",
    "^^^" + currentDateTime.slice(0, 12) + "00^^R",
    "",
    "",
    "",
    "",
    "15799F^" + (data.physician_name || "UNKNOWN PHYSICIAN"),
    "HOSPITAL^^^^HOSPITAL^^^^HOSPITAL",
  ].join("|");

  const obrSegment = [
    "OBR",
    "1",
    "",
    labAccessionNo + "^LABDNL",
    "PGXP^PGX Targeted Panel",
    "",
    "",
    currentDateTime.slice(0, 12) + "29",
    "",
    "",
    "",
    "",
    "",
    "",
    currentDateTime.slice(0, 12) + "29",
    data.specimen_type || "EDTA",
    "15799F^" + (data.physician_name || "UNKNOWN PHYSICIAN"),
    "",
    labAccessionNo.length >= 10 ? labAccessionNo.slice(-10) : labAccessionNo,
    "",
    labAccessionNo.length >= 10 ? labAccessionNo.slice(-10) : labAccessionNo,
    labAccessionNo + "-" + messageControlId,
    currentDateTime,
    "",
    "GL^24^52^036",
    "C",
    "",
    "^^^^^R",
  ].join("|");

  // Generate OBX segments based on input genes
  let obxSegments: string[] = [];

  if (data.pgxPanel && data.pgxPanel.length > 0) {
    console.log("Processing PGX Panel:", data.pgxPanel);
    obxSegments = generateOBXSegmentsForGenes(data.pgxPanel); // ✅ Changed function name
  } else {
    // Generate empty templates if no pgxPanel data
    obxSegments = generateOBXSegmentsForGenes([]); // ✅ Generate all with empty data
  }

  console.log("Generated OBX Segments:", obxSegments);

  // Combine all segments
  return [
    mshSegment,
    pidSegment,
    pv1Segment,
    orcSegment,
    obrSegment,
    ...obxSegments,
  ].join("\r\n");
}
