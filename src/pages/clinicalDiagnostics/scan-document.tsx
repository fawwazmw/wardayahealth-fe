import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { App, Select, DatePicker } from "antd";
import dayjs from "dayjs";
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
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { extractText, type OcrProgress } from "@/utils/ocr";
import { parsePatientForm, type ParsedPatientData } from "@/utils/smartFormParser";
import { API_URL } from "@/providers/authProvider";

type ScanStatus = "idle" | "scanning" | "parsed" | "submitting" | "done" | "error";

export const ScanDocument: React.FC = () => {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [status, setStatus] = useState<ScanStatus>("idle");
  const [progress, setProgress] = useState<OcrProgress>({ status: "", progress: 0 });
  const [parsed, setParsed] = useState<ParsedPatientData | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Editable form state (user can correct OCR results)
  const [form, setForm] = useState({
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
    clinicalNotes: "",
  });

  const updateField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileSelect = async (file: File) => {
    const validTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      message.error("Please upload a JPEG, PNG, or PDF file.");
      return;
    }

    // Show preview for images
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    } else {
      setPreview(null);
    }

    setStatus("scanning");
    setErrorMsg("");

    try {
      // Step 1: OCR
      const ocrResult = await extractText(file, (p) => setProgress(p));

      if (!ocrResult.text || ocrResult.text.trim().length < 10) {
        throw new Error("Could not extract readable text from the document. Please ensure the image is clear and well-lit.");
      }

      // Step 2: Smart parse
      const parsedData = parsePatientForm(ocrResult.text);
      setParsed(parsedData);

      // Pre-fill form with parsed data
      setForm({
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
        specimenType: parsedData.specimenType || "",
        clinicalNotes: parsedData.clinicalNotes || "",
      });

      setStatus("parsed");
      message.success(`Document scanned. Extracted ${parsedData.fieldsFound} of ${parsedData.fieldsTotal} fields (${parsedData.confidence}% confidence).`);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "OCR failed");
    }
  };

  const handleSubmit = async () => {
    if (!form.patientName) {
      message.error("Patient name is required.");
      return;
    }

    setStatus("submitting");

    try {
      const token = localStorage.getItem("token");
      // Normalize sex to match validator enum
      const normSex = (() => {
        const s = (form.sex || "").trim().toLowerCase();
        if (s === "male" || s === "m") return "Male";
        if (s === "female" || s === "f") return "Female";
        if (s) return "Other";
        return undefined;
      })();

      // Build body with only fields the validator accepts
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const body: Record<string, any> = {
        patient_name: form.patientName,
        physician_name: form.physicianName || "Unknown Physician",
        disease: "Lung Nodule Risk Stratification",
        specimen_type: form.specimenType || "Blood",
        report_status: "Pending",
        ethnicity: form.ethnicity || undefined,
        requester: form.facility || undefined,
        clinical_notes: form.clinicalNotes || undefined,
        id_number: form.patientId || undefined,
      };

      // Only add sex if valid
      if (normSex) body.sex = normSex;

      // Only add dates if they look like valid ISO/YYYY-MM-DD format
      // OCR dates like "13 January 1949" won't pass the validator
      // so we skip them unless they're in the right format
      const isoDateRegex = /^\d{4}-\d{2}-\d{2}/;
      if (form.dateOfBirth && isoDateRegex.test(form.dateOfBirth)) {
        body.date_of_birth = form.dateOfBirth;
      }
      if (form.dateBloodCollected && isoDateRegex.test(form.dateBloodCollected)) {
        body.sample_collection_date = form.dateBloodCollected;
      }

      const patientBody: Record<string, unknown> = {
        patientIdCode: form.patientId || `P-${Date.now()}`,
        name: form.patientName,
        sex: normSex,
        nationality: form.nationality || undefined,
        ethnicity: form.ethnicity || undefined,
        idNumber: form.patientId || undefined,
        contactNumber: form.contactNumber || undefined,
        clinicalNotes: form.clinicalNotes || undefined,
      };

      if (form.dateOfBirth && isoDateRegex.test(form.dateOfBirth)) {
        patientBody.dateOfBirth = form.dateOfBirth;
      }

      const patientRes = await fetch(`${API_URL}/patients`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(patientBody),
      });

      let patientId: number | undefined;
      if (patientRes.ok) {
        const patientData = await patientRes.json();
        patientId = patientData.id;
      }

      const response = await fetch(`${API_URL}/clinical-diagnostics`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...body, patient_id: patientId }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Failed to create record");
      }

      setStatus("done");
      message.success("Patient record created successfully from scanned document.");
      setTimeout(() => navigate("/patients"), 1500);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Submission failed");
    }
  };

  const handleReset = () => {
    setStatus("idle");
    setParsed(null);
    setPreview(null);
    setErrorMsg("");
    setProgress({ status: "", progress: 0 });
    setForm({
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
      clinicalNotes: "",
    });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/clinical-diagnostics")}
          className="inline-flex items-center gap-1 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] mb-2 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Clinical Diagnostics
        </button>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-[hsl(var(--primary))] text-white">
            <ScanLine className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[hsl(var(--foreground))]">
              Scan Patient Document
            </h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Upload a scanned patient request form. AI will extract patient data automatically.
            </p>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      {status === "idle" && (
        <Card className="border-dashed border-2">
          <CardContent className="p-0">
            <div className="flex flex-col items-center justify-center py-16">
              <div className="flex items-center justify-center rounded-2xl mb-6 h-[72px] w-[72px] bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]">
                <FileImage className="h-8 w-8" />
              </div>
              <h2 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-1">
                Upload Patient Request Form
              </h2>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6 text-center max-w-md">
                Upload a scanned form (JPEG, PNG) or PDF. The system will use OCR to extract
                patient demographics and pre-fill the record form.
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
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-4">
                Supported: JPEG, PNG, PDF
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scanning Progress */}
      {status === "scanning" && (
        <Card>
          <CardContent className="py-16">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-[hsl(var(--primary))] mb-4" />
              <h3 className="text-base font-semibold text-[hsl(var(--foreground))] mb-2">
                Scanning Document...
              </h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">
                {progress.status || "Initializing OCR engine..."}
              </p>
              <div className="w-64 h-2 bg-[hsl(var(--muted))] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[hsl(var(--primary))] rounded-full transition-all duration-300"
                  style={{ width: `${progress.progress}%` }}
                />
              </div>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2">
                {progress.progress}%
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {status === "error" && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center">
              <div className="flex items-center justify-center rounded-2xl mb-4 h-14 w-14 bg-red-50 text-red-600">
                <AlertCircle className="h-7 w-7" />
              </div>
              <h3 className="text-base font-semibold text-[hsl(var(--foreground))] mb-2">
                Error
              </h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6 text-center max-w-md">
                {errorMsg}
              </p>
              <Button variant="outline" onClick={handleReset}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Parsed Results + Editable Form */}
      {(status === "parsed" || status === "submitting") && parsed && (
        <div className="space-y-4">
          {/* Confidence Banner */}
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className={cn(
                    "h-5 w-5",
                    parsed.confidence >= 60 ? "text-emerald-600" : "text-amber-500"
                  )} />
                  <div>
                    <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                      Extracted {parsed.fieldsFound} of {parsed.fieldsTotal} fields
                    </p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      Review and correct any fields below before submitting.
                    </p>
                  </div>
                </div>
                <Badge variant={parsed.confidence >= 60 ? "success" : "warning"}>
                  {parsed.confidence}% confidence
                </Badge>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Document Preview */}
            {preview && (
              <Card className="lg:row-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <FileImage className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                    Scanned Document
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <img
                    src={preview}
                    alt="Scanned document"
                    className="w-full rounded-lg border border-[hsl(var(--border))] object-contain max-h-[500px]"
                  />
                </CardContent>
              </Card>
            )}

            {/* Patient Information */}
            <Card className={preview ? "" : "lg:col-span-2"}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <User className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <FormField
                  icon={<User className="h-3.5 w-3.5" />}
                  label="Patient Name"
                  value={form.patientName}
                  onChange={(v) => updateField("patientName", v)}
                  required
                />
                <FormField
                  icon={<CreditCard className="h-3.5 w-3.5" />}
                  label="Patient ID (NRIC)"
                  value={form.patientId}
                  onChange={(v) => updateField("patientId", v)}
                  mono
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" />
                      Sex
                    </Label>
                    <Select
                      value={form.sex || undefined}
                      onChange={(v) => updateField("sex", v)}
                      placeholder="Select sex"
                      allowClear
                      className="w-full"
                      size="small"
                      options={[
                        { label: "Male", value: "Male" },
                        { label: "Female", value: "Female" },
                        { label: "Other", value: "Other" },
                      ]}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      Date of Birth
                    </Label>
                    <DatePicker
                      value={form.dateOfBirth ? dayjs(form.dateOfBirth, ["YYYY-MM-DD", "DD-MMM-YY", "DD MMMM YYYY", "DD/MM/YYYY"]) : null}
                      onChange={(_date, dateString) => updateField("dateOfBirth", typeof dateString === "string" ? dateString : "")}
                      format="YYYY-MM-DD"
                      placeholder="Select date"
                      className="w-full"
                      size="small"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
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
              </CardContent>
            </Card>

            {/* Clinical Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Stethoscope className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
                  Clinical Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <FormField
                  icon={<Stethoscope className="h-3.5 w-3.5" />}
                  label="Ordering Physician"
                  value={form.physicianName}
                  onChange={(v) => updateField("physicianName", v)}
                />
                <FormField
                  icon={<MapPin className="h-3.5 w-3.5" />}
                  label="Facility"
                  value={form.facility}
                  onChange={(v) => updateField("facility", v)}
                />
                <div>
                  <Label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Date of Blood Collected
                  </Label>
                  <DatePicker
                    value={form.dateBloodCollected ? dayjs(form.dateBloodCollected, ["YYYY-MM-DD", "DD-MMM-YY", "DD MMMM YYYY", "DD/MM/YYYY"]) : null}
                    onChange={(_date, dateString) => updateField("dateBloodCollected", typeof dateString === "string" ? dateString : "")}
                    format="YYYY-MM-DD"
                    placeholder="Select date"
                    className="w-full"
                    size="small"
                  />
                </div>
                <FormField
                  label="Specimen Type"
                  value={form.specimenType}
                  onChange={(v) => updateField("specimenType", v)}
                  placeholder="e.g., Whole Blood"
                />
                <FormField
                  label="Clinical Notes"
                  value={form.clinicalNotes}
                  onChange={(v) => updateField("clinicalNotes", v)}
                  placeholder="Optional"
                />
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <Button variant="outline" onClick={handleReset}>
              Scan Another
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={status === "submitting" || !form.patientName}
              className="gap-2"
            >
              {status === "submitting" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {status === "submitting" ? "Creating Record..." : "Create Patient Record"}
            </Button>
          </div>
        </div>
      )}

      {/* Success State */}
      {status === "done" && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center">
              <div className="flex items-center justify-center rounded-2xl mb-4 h-14 w-14 bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h3 className="text-base font-semibold text-[hsl(var(--foreground))] mb-2">
                Record Created
              </h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Redirecting to Clinical Diagnostics...
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// --- Reusable form field component ---
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
    <Label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 flex items-center gap-1.5">
      {icon}
      {label}
      {required && <span className="text-red-500">*</span>}
    </Label>
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || `Enter ${label.toLowerCase()}`}
      className={cn("h-8 text-sm", mono && "font-mono")}
    />
  </div>
);

export default ScanDocument;
