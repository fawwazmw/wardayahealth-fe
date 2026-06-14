import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { App, DatePicker, Select, Spin, Switch } from "antd";
import dayjs from "dayjs";
import debounce from "lodash/debounce";
import {
  ScanLine,
  FileImage,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  User,
  Calendar,
  MapPin,
  Stethoscope,
  CreditCard,
  Send,
  ClipboardList,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { extractText, type OcrProgress } from "@/utils/ocr";
import { parsePatientForm, type ParsedPatientData } from "@/utils/smartFormParser";
import { axiosInstance } from "@/providers/authProvider";

type ScanStatus = "idle" | "scanning" | "parsed" | "submitting" | "done" | "error";
type IntakeStep = 1 | 2;

type ExistingPatient = {
  id: number;
  name: string;
  patient_id_code?: string | null;
  id_number?: string | null;
  sex?: "Male" | "Female" | "Other" | null;
  date_of_birth?: string | null;
  ethnicity?: string | null;
  nationality?: string | null;
  smoking_status?: string | null;
  family_history_lung_cancer?: boolean | null;
  clinical_notes?: string | null;
  patient_contact_number?: string | null;
};

type ScanFormState = {
  selectedPatientId?: number;
  patientName: string;
  patientId: string;
  sex: string;
  dateOfBirth: string;
  nationality: string;
  physicianName: string;
  facility: string;
  dateBloodCollected: string;
  contactNumber: string;
  ethnicity: string;
  specimenType: string;
  specimenId: string;
  clinicalNotes: string;
  testCaseId: string;
  disease: string;
  sampleReferenceNumber: string;
  specimenReceived: string;
  reviewerName: string;
  smokingStatus: string;
  familyHistoryLungCancer: boolean;
  emphysema: boolean;
  testInformation: string;
  labResultSummary: string;
  bm5: string;
};

const DATE_FORMATS = ["YYYY-MM-DD", "DD-MMM-YY", "DD MMMM YYYY", "DD/MM/YYYY"];

const defaultFormState: ScanFormState = {
  selectedPatientId: undefined,
  patientName: "",
  patientId: "",
  sex: "",
  dateOfBirth: "",
  nationality: "",
  physicianName: "",
  facility: "",
  dateBloodCollected: "",
  contactNumber: "",
  ethnicity: "",
  specimenType: "",
  specimenId: "",
  clinicalNotes: "",
  testCaseId: "",
  disease: "Lung Nodule Risk Stratification",
  sampleReferenceNumber: "",
  specimenReceived: "",
  reviewerName: "",
  smokingStatus: "",
  familyHistoryLungCancer: false,
  emphysema: false,
  testInformation: "",
  labResultSummary: "",
  bm5: "",
};

const normalizeText = (value?: string | null) => value?.trim().toLowerCase() ?? "";

const parseFlexibleDate = (value: string) => {
  if (!value) return null;
  const parsed = dayjs(value, DATE_FORMATS, true);
  return parsed.isValid() ? parsed : null;
};

const getPatientLabel = (patient: ExistingPatient) =>
  `${patient.name} • ${patient.patient_id_code || patient.id_number || `Patient #${patient.id}`}`;

const buildPatientPayload = (form: ScanFormState) => ({
  patientIdCode: form.patientId || `P-${Date.now()}`,
  name: form.patientName,
  sex: normalizeSex(form.sex),
  dateOfBirth: toIsoDate(form.dateOfBirth),
  nationality: form.nationality || undefined,
  ethnicity: form.ethnicity || undefined,
  idNumber: form.patientId || undefined,
  contactNumber: form.contactNumber || undefined,
  smokingStatus: form.smokingStatus || undefined,
  familyHistoryLungCancer: form.familyHistoryLungCancer,
  clinicalNotes: form.labResultSummary || form.clinicalNotes || undefined,
});

const matchesExistingPatient = (
  patient: ExistingPatient,
  payload: ReturnType<typeof buildPatientPayload>
) => {
  const patientCode = normalizeText(patient.patient_id_code);
  const patientIdNumber = normalizeText(patient.id_number);
  const payloadCode = normalizeText(payload.patientIdCode);
  const payloadIdNumber = normalizeText(payload.idNumber);

  if (payloadCode && (patientCode === payloadCode || patientIdNumber === payloadCode)) {
    return true;
  }

  if (payloadIdNumber && (patientIdNumber === payloadIdNumber || patientCode === payloadIdNumber)) {
    return true;
  }

  return (
    normalizeText(patient.name) === normalizeText(payload.name) &&
    (!!payload.dateOfBirth && patient.date_of_birth === payload.dateOfBirth)
  );
};

function normalizeSex(value: string) {
  const normalized = value.trim().toLowerCase();
  if (normalized === "male" || normalized === "m") return "Male";
  if (normalized === "female" || normalized === "f") return "Female";
  if (normalized) return "Other";
  return undefined;
}

function toIsoDate(value: string) {
  const parsed = parseFlexibleDate(value);
  return parsed ? parsed.format("YYYY-MM-DD") : undefined;
}

export const ScanDocument: React.FC = () => {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [status, setStatus] = useState<ScanStatus>("idle");
  const [step, setStep] = useState<IntakeStep>(1);
  const [progress, setProgress] = useState<OcrProgress>({ status: "", progress: 0 });
  const [parsed, setParsed] = useState<ParsedPatientData | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [form, setForm] = useState<ScanFormState>(defaultFormState);
  const [patientOptions, setPatientOptions] = useState<ExistingPatient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<ExistingPatient | null>(null);
  const [searchingPatients, setSearchingPatients] = useState(false);

  const updateField = <K extends keyof ScanFormState>(key: K, value: ScanFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const fetchPatientOptions = useCallback(async (query: string) => {
    const term = query.trim();
    if (term.length < 2) {
      setSearchingPatients(false);
      setPatientOptions((current) =>
        selectedPatient
          ? [selectedPatient, ...current.filter((item) => item.id !== selectedPatient.id)]
          : []
      );
      return;
    }

    setSearchingPatients(true);
    try {
      const response = await axiosInstance.get("/patients", {
        params: { search: term, limit: 8 },
      });
      const items = Array.isArray(response.data) ? response.data : [];
      const merged = selectedPatient
        ? [selectedPatient, ...items.filter((item: ExistingPatient) => item.id !== selectedPatient.id)]
        : items;
      setPatientOptions(merged);
    } catch {
      message.warning("Could not load patient matches. You can still continue with a new patient.");
    } finally {
      setSearchingPatients(false);
    }
  }, [selectedPatient, message]);

  const debouncedPatientSearch = useMemo(
    () => debounce((value: string) => void fetchPatientOptions(value), 300),
    [fetchPatientOptions]
  );

  useEffect(() => {
    return () => debouncedPatientSearch.cancel();
  }, [debouncedPatientSearch]);

  const applyPatientToForm = (patient: ExistingPatient | null) => {
    if (!patient) return;

    setForm((prev) => ({
      ...prev,
      selectedPatientId: patient.id,
      patientName: patient.name,
      patientId: patient.id_number || patient.patient_id_code || prev.patientId,
      sex: patient.sex || prev.sex,
      dateOfBirth: patient.date_of_birth || prev.dateOfBirth,
      nationality: patient.nationality || prev.nationality,
      ethnicity: patient.ethnicity || prev.ethnicity,
      contactNumber: patient.patient_contact_number || prev.contactNumber,
      smokingStatus: patient.smoking_status || prev.smokingStatus,
      familyHistoryLungCancer:
        patient.family_history_lung_cancer ?? prev.familyHistoryLungCancer,
      labResultSummary: prev.labResultSummary || patient.clinical_notes || "",
    }));
  };

  const handleFileSelect = async (file: File) => {
    const validTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      message.error("Please upload a JPEG, PNG, or PDF file.");
      return;
    }

    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    } else {
      setPreview(null);
    }

    setStatus("scanning");
    setErrorMsg("");
    setStep(1);
    setSelectedPatient(null);
    setPatientOptions([]);

    try {
      const ocrResult = await extractText(file, (p) => setProgress(p));

      if (!ocrResult.text || ocrResult.text.trim().length < 10) {
        throw new Error(
          "Could not extract readable text from the document. Please ensure the image is clear and well-lit."
        );
      }

      const parsedData = parsePatientForm(ocrResult.text);
      setParsed(parsedData);

      setForm({
        ...defaultFormState,
        patientName: parsedData.patientName || "",
        patientId: parsedData.patientId || "",
        sex: parsedData.sex || "",
        dateOfBirth: parsedData.dateOfBirth || "",
        nationality: parsedData.nationality || "",
        physicianName: parsedData.physicianName || "",
        facility: parsedData.facility || "",
        dateBloodCollected: parsedData.dateBloodCollected || "",
        contactNumber: parsedData.contactNumber || "",
        ethnicity: parsedData.ethnicity || "",
        specimenType: parsedData.specimenType || "Blood",
        clinicalNotes: parsedData.clinicalNotes || "",
        disease: "Lung Nodule Risk Stratification",
      });

      setStatus("parsed");
      message.success(
        `Document scanned. Extracted ${parsedData.fieldsFound} of ${parsedData.fieldsTotal} fields (${parsedData.confidence}% confidence).`
      );
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "OCR failed");
    }
  };

  const validatePatientStep = () => {
    if (!form.patientName.trim()) {
      message.error("Patient name is required.");
      return false;
    }
    if (!form.patientId.trim()) {
      message.error("Patient ID / MRN is required.");
      return false;
    }
    if (!form.physicianName.trim()) {
      message.error("Ordering physician is required.");
      return false;
    }
    if (!form.specimenType.trim()) {
      message.error("Specimen type is required.");
      return false;
    }
    return true;
  };

  const validateOrderStep = () => {
    if (!form.testCaseId.trim()) {
      message.error("Test case ID is required.");
      return false;
    }
    if (!form.facility.trim()) {
      message.error("Collection site / requester is required.");
      return false;
    }
    if (!form.specimenReceived.trim()) {
      message.error("Specimen received date is required.");
      return false;
    }
    if (!form.specimenId.trim()) {
      message.error("Specimen ID is required.");
      return false;
    }
    if (!form.testInformation.trim()) {
      message.error("Test information is required.");
      return false;
    }
    if (!form.labResultSummary.trim()) {
      message.error("Lab result summary is required.");
      return false;
    }
    return true;
  };

  const resolvePatientId = async () => {
    if (form.selectedPatientId) {
      return form.selectedPatientId;
    }

    const payload = buildPatientPayload(form);
    const lookupTerm = form.patientId || form.patientName;

    if (lookupTerm) {
      const response = await axiosInstance.get("/patients", {
        params: { search: lookupTerm, limit: 10 },
      });
      const candidates = Array.isArray(response.data) ? response.data : [];
      const existingMatch = candidates.find((patient: ExistingPatient) =>
        matchesExistingPatient(patient, payload)
      );

      if (existingMatch) {
        return existingMatch.id;
      }
    }

    const createdPatient = await axiosInstance.post("/patients", payload);
    return createdPatient.data.id as number;
  };

  const handleSubmit = async () => {
    if (!validatePatientStep() || !validateOrderStep()) {
      return;
    }

    setStatus("submitting");

    try {
      const patientId = await resolvePatientId();

      await axiosInstance.post("/clinical-diagnostics", {
        patient_id: patientId,
        patient_name: form.patientName,
        test_case_id: form.testCaseId,
        physician_name: form.physicianName,
        disease: form.disease || "Lung Nodule Risk Stratification",
        specimen_type: form.specimenType || "Blood",
        specimen_id: form.specimenId || undefined,
        report_status: "Pending",
        ethnicity: form.ethnicity || undefined,
        requester: form.facility || undefined,
        clinical_notes: form.clinicalNotes || undefined,
        reviewer_name: form.reviewerName || undefined,
        test_information: form.testInformation || undefined,
        lab_result_summary: form.labResultSummary || undefined,
        id_number: form.patientId || undefined,
        mrn: form.patientId || undefined,
        sex: normalizeSex(form.sex),
        date_of_birth: toIsoDate(form.dateOfBirth),
        sample_collection_date: toIsoDate(form.dateBloodCollected),
        sample_received_date: toIsoDate(form.specimenReceived),
        sample_reference_number: form.sampleReferenceNumber || undefined,
        smoking_status: form.smokingStatus || undefined,
        family_history_lung_cancer: form.familyHistoryLungCancer ? "true" : "false",
        emphysema: form.emphysema ? "true" : "false",
        bm5: form.bm5 ? Number(form.bm5) : undefined,
      });

      setStatus("done");
      message.success("OCR intake completed and test order created.");
      setTimeout(() => navigate("/test-orders"), 1500);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Submission failed");
    }
  };

  const handleReset = () => {
    setStatus("idle");
    setStep(1);
    setParsed(null);
    setPreview(null);
    setErrorMsg("");
    setProgress({ status: "", progress: 0 });
    setForm(defaultFormState);
    setSelectedPatient(null);
    setPatientOptions([]);
  };

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate("/test-orders")}
          className="mb-2 inline-flex items-center gap-1 text-sm text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Test Orders
        </button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--primary))] text-white">
            <ScanLine className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[hsl(var(--foreground))]">Scan Into Test Order</h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Use OCR for patient intake first, then complete the required order details before submission.
            </p>
          </div>
        </div>
      </div>

      {status === "idle" && (
        <Card className="border-2 border-dashed">
          <CardContent className="p-0">
            <div className="flex flex-col items-center justify-center py-16">
              <div className="mb-6 flex h-[72px] w-[72px] items-center justify-center rounded-2xl bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]">
                <FileImage className="h-8 w-8" />
              </div>
              <h2 className="mb-1 text-lg font-semibold text-[hsl(var(--foreground))]">
                Upload Patient Request Form
              </h2>
              <p className="mb-6 max-w-md text-center text-sm text-[hsl(var(--muted-foreground))]">
                Upload a scanned form (JPEG, PNG) or PDF. Wardayahealth will extract patient
                details, help you match an existing record, then guide you through order completion.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                  e.target.value = "";
                }}
              />
              <Button onClick={() => fileInputRef.current?.click()} className="gap-2">
                <ScanLine className="h-4 w-4" />
                Select Document
              </Button>
              <p className="mt-4 text-xs text-[hsl(var(--muted-foreground))]">Supported: JPEG, PNG, PDF</p>
            </div>
          </CardContent>
        </Card>
      )}

      {status === "scanning" && (
        <Card>
          <CardContent className="py-16">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="mb-4 h-10 w-10 animate-spin text-[hsl(var(--primary))]" />
              <h3 className="mb-2 text-base font-semibold text-[hsl(var(--foreground))]">
                Scanning Document...
              </h3>
              <p className="mb-4 text-sm text-[hsl(var(--muted-foreground))]">
                {progress.status || "Initializing OCR engine..."}
              </p>
              <div className="h-2 w-64 overflow-hidden rounded-full bg-[hsl(var(--muted))]">
                <div
                  className="h-full rounded-full bg-[hsl(var(--primary))] transition-all duration-300"
                  style={{ width: `${progress.progress}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">{progress.progress}%</p>
            </div>
          </CardContent>
        </Card>
      )}

      {status === "error" && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <AlertCircle className="h-7 w-7" />
              </div>
              <h3 className="mb-2 text-base font-semibold text-[hsl(var(--foreground))]">Error</h3>
              <p className="mb-6 max-w-md text-center text-sm text-[hsl(var(--muted-foreground))]">
                {errorMsg}
              </p>
              <Button variant="outline" onClick={handleReset}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {(status === "parsed" || status === "submitting") && parsed && (
        <div className="space-y-4">
          <Card>
            <CardContent className="py-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2
                    className={cn(
                      "h-5 w-5",
                      parsed.confidence >= 60 ? "text-emerald-600" : "text-amber-500"
                    )}
                  />
                  <div>
                    <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                      Extracted {parsed.fieldsFound} of {parsed.fieldsTotal} fields
                    </p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      Review the OCR result, then complete the order details before submitting.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={parsed.confidence >= 60 ? "success" : "warning"}>
                    {parsed.confidence}% confidence
                  </Badge>
                  <Badge variant="default">Step {step} of 2</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-[1.2fr_2fr]">
            {preview && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                    <FileImage className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                    Scanned Document
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  <img
                    src={preview}
                    alt="Scanned document"
                    className="max-h-[460px] w-full rounded-lg border border-[hsl(var(--border))] object-contain"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <StepCard
                      active={step === 1}
                      title="Patient Review"
                      description="Confirm OCR details and match an existing patient if needed."
                      icon={<User className="h-4 w-4" />}
                    />
                    <StepCard
                      active={step === 2}
                      title="Order Details"
                      description="Complete the required fields for a valid test order."
                      icon={<ClipboardList className="h-4 w-4" />}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {step === 1 && (
                <>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                        <User className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                        Match Or Create Patient
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-0">
                      <div>
                        <Label className="mb-1 flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))]">
                          <CreditCard className="h-3.5 w-3.5" />
                          Existing Patient
                        </Label>
                        <Select
                          showSearch
                          allowClear
                          value={form.selectedPatientId}
                          placeholder="Search by patient name or MRN"
                          filterOption={false}
                          onSearch={(value) => debouncedPatientSearch(value)}
                          onChange={(value) => {
                            if (!value) {
                              setSelectedPatient(null);
                              updateField("selectedPatientId", undefined);
                              return;
                            }

                            const patient =
                              patientOptions.find((option) => option.id === value) || null;
                            setSelectedPatient(patient);
                            updateField("selectedPatientId", value);
                            applyPatientToForm(patient);
                          }}
                          notFoundContent={
                            searchingPatients ? (
                              <div className="py-2 text-center">
                                <Spin size="small" />
                              </div>
                            ) : (
                              "No patient found. Keep the OCR values to create a new patient."
                            )
                          }
                          options={patientOptions.map((patient) => ({
                            label: getPatientLabel(patient),
                            value: patient.id,
                          }))}
                        />
                      </div>
                      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 px-4 py-3 text-sm text-[hsl(var(--muted-foreground))]">
                        Select an existing patient to reuse demographics, or leave it empty and the
                        test order will create a new patient from the OCR data.
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                        <User className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                        Patient Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-0">
                      <FormField
                        icon={<User className="h-3.5 w-3.5" />}
                        label="Patient Name"
                        value={form.patientName}
                        onChange={(v) => updateField("patientName", v)}
                        required
                      />
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <FormField
                          icon={<CreditCard className="h-3.5 w-3.5" />}
                          label="Patient ID / MRN"
                          value={form.patientId}
                          onChange={(v) => updateField("patientId", v)}
                          required
                          mono
                        />
                        <FormField
                          label="Contact Number"
                          value={form.contactNumber}
                          onChange={(v) => updateField("contactNumber", v)}
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <SelectField
                          label="Sex"
                          value={form.sex}
                          onChange={(v) => updateField("sex", v)}
                          options={[
                            { label: "Male", value: "Male" },
                            { label: "Female", value: "Female" },
                            { label: "Other", value: "Other" },
                          ]}
                        />
                        <DateField
                          label="Date of Birth"
                          value={form.dateOfBirth}
                          onChange={(v) => updateField("dateOfBirth", v)}
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <FormField
                          label="Nationality"
                          value={form.nationality}
                          onChange={(v) => updateField("nationality", v)}
                        />
                        <FormField
                          label="Ethnicity"
                          value={form.ethnicity}
                          onChange={(v) => updateField("ethnicity", v)}
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <FormField
                          icon={<Stethoscope className="h-3.5 w-3.5" />}
                          label="Ordering Physician"
                          value={form.physicianName}
                          onChange={(v) => updateField("physicianName", v)}
                          required
                        />
                        <FormField
                          icon={<MapPin className="h-3.5 w-3.5" />}
                          label="Collection Site / Requester"
                          value={form.facility}
                          onChange={(v) => updateField("facility", v)}
                        />
                      </div>
                      <div>
                        <Label className="mb-1 flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))]">
                          <Stethoscope className="h-3.5 w-3.5" />
                          Intake Notes
                        </Label>
                        <TextAreaField
                          value={form.clinicalNotes}
                          onChange={(value) => updateField("clinicalNotes", value)}
                          rows={4}
                          placeholder="OCR notes or additional intake context"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {step === 2 && (
                <>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                        <ClipboardList className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                        Test Order Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-0">
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <FormField
                          label="Test Case ID"
                          value={form.testCaseId}
                          onChange={(v) => updateField("testCaseId", v)}
                          placeholder="Example: TC-001"
                          required
                        />
                        <FormField
                          label="Disease / Indication"
                          value={form.disease}
                          onChange={(v) => updateField("disease", v)}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <FormField
                          label="Specimen Type"
                          value={form.specimenType}
                          onChange={(v) => updateField("specimenType", v)}
                          placeholder="e.g., Whole Blood"
                          required
                        />
                        <FormField
                          label="Specimen ID"
                          value={form.specimenId}
                          onChange={(v) => updateField("specimenId", v)}
                          placeholder="Example: SPC-001"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <FormField
                          label="Sample Reference Number"
                          value={form.sampleReferenceNumber}
                          onChange={(v) => updateField("sampleReferenceNumber", v)}
                          placeholder="Example: SKH-161"
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <DateField
                          label="Collection Date"
                          value={form.dateBloodCollected}
                          onChange={(v) => updateField("dateBloodCollected", v)}
                        />
                        <DateField
                          label="Specimen Received Date"
                          value={form.specimenReceived}
                          onChange={(v) => updateField("specimenReceived", v)}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <FormField
                          label="AI Reviewer"
                          value={form.reviewerName}
                          onChange={(v) => updateField("reviewerName", v)}
                          placeholder="Example: Wardaya AI Reviewer v1"
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <SelectField
                          label="Smoking Status"
                          value={form.smokingStatus}
                          onChange={(v) => updateField("smokingStatus", v)}
                          options={[
                            { label: "Never", value: "Never" },
                            { label: "Former", value: "Former" },
                            { label: "Current", value: "Current" },
                          ]}
                        />
                        <FormField
                          label="BM5 (Optional)"
                          value={form.bm5}
                          onChange={(v) => updateField("bm5", v)}
                          placeholder="Example: 32.1"
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <ToggleField
                          label="Family History of Lung Cancer"
                          checked={form.familyHistoryLungCancer}
                          onChange={(checked) => updateField("familyHistoryLungCancer", checked)}
                        />
                        <ToggleField
                          label="Emphysema"
                          checked={form.emphysema}
                          onChange={(checked) => updateField("emphysema", checked)}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                        <Stethoscope className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                        Clinical Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-0">
                      <div>
                        <Label className="mb-1 flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))]">
                          <ClipboardList className="h-3.5 w-3.5" />
                          Test Information
                          <span className="text-red-500">*</span>
                        </Label>
                        <TextAreaField
                          value={form.testInformation}
                          onChange={(value) => updateField("testInformation", value)}
                          rows={5}
                          placeholder="State the requested test, indication, and any notes needed before analysis."
                        />
                      </div>
                      <div>
                        <Label className="mb-1 flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))]">
                          <Stethoscope className="h-3.5 w-3.5" />
                          Lab Result Summary
                          <span className="text-red-500">*</span>
                        </Label>
                        <TextAreaField
                          value={form.labResultSummary}
                          onChange={(value) => updateField("labResultSummary", value)}
                          rows={6}
                          placeholder="Add the structured summary or intake notes you want stored with the order."
                        />
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleReset}>
                Scan Another
              </Button>
              {step === 2 && (
                <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
                  <ChevronLeft className="h-4 w-4" />
                  Back To Patient Review
                </Button>
              )}
            </div>
            {step === 1 ? (
              <Button
                onClick={() => {
                  if (validatePatientStep()) setStep(2);
                }}
                className="gap-2"
              >
                Continue To Order Details
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={status === "submitting"} className="gap-2">
                {status === "submitting" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {status === "submitting" ? "Creating Test Order..." : "Create Test Order"}
              </Button>
            )}
          </div>
        </div>
      )}

      {status === "done" && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h3 className="mb-2 text-base font-semibold text-[hsl(var(--foreground))]">
                Test Order Created
              </h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Redirecting to Test Orders...
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const StepCard: React.FC<{
  active: boolean;
  title: string;
  description: string;
  icon: React.ReactNode;
}> = ({ active, title, description, icon }) => (
  <div
    className={cn(
      "rounded-xl border px-3 py-3 transition-colors",
      active
        ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/8"
        : "border-[hsl(var(--border))] bg-transparent"
    )}
  >
    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[hsl(var(--foreground))]">
      {icon}
      {title}
    </div>
    <p className="text-xs text-[hsl(var(--muted-foreground))]">{description}</p>
  </div>
);

const FormField: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
  required?: boolean;
  mono?: boolean;
  placeholder?: string;
}> = ({ label, value, onChange, icon, required, mono, placeholder }) => (
  <div>
    <Label className="mb-1 flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))]">
      {icon}
      {label}
      {required && <span className="text-red-500">*</span>}
    </Label>
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || `Enter ${label.toLowerCase()}`}
      className={cn("h-9 text-sm", mono && "font-mono")}
    />
  </div>
);

const SelectField: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
}> = ({ label, value, onChange, options }) => (
  <div>
    <Label className="mb-1 flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))]">
      {label}
    </Label>
    <Select
      value={value || undefined}
      onChange={(selected) => onChange(selected || "")}
      placeholder={`Select ${label.toLowerCase()}`}
      allowClear
      className="w-full"
      options={options}
    />
  </div>
);

const DateField: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}> = ({ label, value, onChange, required }) => (
  <div>
    <Label className="mb-1 flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))]">
      <Calendar className="h-3.5 w-3.5" />
      {label}
      {required && <span className="text-red-500">*</span>}
    </Label>
    <DatePicker
      value={value ? dayjs(value, DATE_FORMATS) : null}
      onChange={(_date, dateString) => onChange(typeof dateString === "string" ? dateString : "")}
      format="YYYY-MM-DD"
      placeholder="Select date"
      className="w-full"
    />
  </div>
);

const ToggleField: React.FC<{
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}> = ({ label, checked, onChange }) => (
  <div className="rounded-xl border border-[hsl(var(--border))] px-4 py-3">
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-[hsl(var(--foreground))]">{label}</p>
      </div>
      <Switch checked={checked} onChange={onChange} />
    </div>
  </div>
);

const TextAreaField: React.FC<{
  value: string;
  onChange: (value: string) => void;
  rows: number;
  placeholder: string;
}> = ({ value, onChange, rows, placeholder }) => (
  <textarea
    value={value}
    onChange={(e) => onChange(e.target.value)}
    rows={rows}
    placeholder={placeholder}
    className="flex w-full rounded-[var(--radius)] border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2"
  />
);

export default ScanDocument;
