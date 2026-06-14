export interface LabTestData {
  // Patient Information
  patientName: string;
  patientLastName?: string;
  dateOfBirth?: string;
  sex?: string;
  mrn?: string;
  ethnicity?: string;
  ageGroup?: string;
  superPopulation?: string;
  population?: string;
  hispanicLatino?: string;
  bodyWeight?: number;
  treatmentHistory?: string;
  patientIdType?: string;
  idNumber?: string;
  contactNumber?: string;
  address?: string;

  // Test & Request Information
  testCaseId: string;
  testRequestReferenceNumber?: string;
  requester?: string;
  requesterAddress?: string;
  physicianName?: string;
  disease?: string;
  testComment?: string;
  panelId?: string;
  drugGroupId?: string;
  clinicalNotes?: string;
  reviewerName?: string;

  // Sample & Specimen Information
  sampleReferenceNumber?: string;
  sampleCollectionDate?: string;
  sampleReceivedDate?: string;
  sampleDescription?: string;
  platform?: string;
  dataType?: string;
  sampleFile?: string;
  specimenCollectedFrom?: string;
  specimenType?: string;
  specimenId?: string;
  specimenReceived?: string;

  // System Information
  reportStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface GenePanel {
  id: string;
  name: string;
  genes: string[];
}

export const GENE_PANELS: GenePanel[] = [
  {
    id: 'pgx-panel',
    name: 'Pharmacogenomics Panel',
    genes: [
      'ABCG2', 'CYP2C19', 'CYP2C9', 'CYP2D6', 'CYP3A5', 'CYP4F2',
      'DPYD', 'HLA-A', 'HLA-B-15-02', 'HLA-B-57-01', 'HLA-B-58-01',
      'NUDT15', 'SLCO1B1', 'TPMT', 'UGT1A1', 'VKORC1'
    ]
  }
];
