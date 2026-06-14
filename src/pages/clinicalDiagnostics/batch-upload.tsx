import React, { useState, useRef } from "react";
import { Table, Progress, Alert, Modal, App } from "antd";
import * as XLSX from "xlsx";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
import { API_URL } from "../../providers/authProvider";
import { generateMirlungReport } from "@/utils/generateMirlungReport";
import { useNavigate } from "react-router-dom";
import {
  Upload as UploadIcon,
  FlaskConical,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  CloudUpload,
  Archive,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// --- Types ---

interface QpcrResult {
  target: string;
  cq: number | null;
  cqMean: number | null;
  cqConfidence: number | null;
  ampStatus: string;
}

interface SampleSummary {
  sampleName: string;
  targetCount: number;
  avgCq: number | null;
  mirlungScore: number | null;
  riskCategory: string;
  results: QpcrResult[];
}

interface UploadState {
  status: "idle" | "parsing" | "preview" | "uploading" | "success" | "error";
  file: File | null;
  metadata: Record<string, string>;
  samples: SampleSummary[];
  progress: number;
  errorMessage: string;
  serverResponse: {
    message: string;
    updated: number;
    created: number;
    samples: string[];
  } | null;
}

// --- Helpers ---

function calcMirlungScore(cqs: (number | null)[]): {
  score: number | null;
  risk: string;
} {
  const valid = cqs.filter((c): c is number => c !== null);
  if (valid.length === 0) return { score: null, risk: "Insufficient Data" };
  const avg = valid.reduce((a, b) => a + b, 0) / valid.length;
  const score =
    Math.round(Math.min(100, Math.max(0, 100 - avg * 2)) * 100) / 100;
  const risk =
    score > 65 ? "High Risk" : score > 35 ? "Moderate Risk" : "Low Risk";
  return { score, risk };
}

function getRiskVariant(
  risk: string
): "destructive" | "warning" | "success" | "secondary" {
  if (risk.includes("High")) return "destructive";
  if (risk.includes("Moderate")) return "warning";
  if (risk.includes("Low")) return "success";
  return "secondary";
}

function getRiskColor(risk: string): string {
  if (risk.includes("High")) return "#dc2626";
  if (risk.includes("Moderate")) return "#d97706";
  if (risk.includes("Low")) return "#15803d";
  return "#6b7280";
}

// --- Component ---

export const BatchUpload: React.FC = () => {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [state, setState] = useState<UploadState>({
    status: "idle",
    file: null,
    metadata: {},
    samples: [],
    progress: 0,
    errorMessage: "",
    serverResponse: null,
  });
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [zipping, setZipping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse QuantStudio XLSX client-side for preview
  const handleFileSelect = async (file: File) => {
    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      message.error("Please upload an XLSX file from QuantStudio.");
      return;
    }

    setState((prev) => ({
      ...prev,
      status: "parsing",
      file,
      errorMessage: "",
    }));

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });

      // Find the Results sheet
      const sheetName =
        workbook.SheetNames.find((n) => n.toLowerCase() === "results") ||
        workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 });

      // Extract metadata
      const metadata: Record<string, string> = {};
      let headerIdx = -1;
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;

        const first = String(row[0] || "").trim();
        const second = String(row[1] || "").trim();

        // Check if this is the data header row
        if (first === "Well" && rows[i].some((c) => String(c) === "Sample")) {
          headerIdx = i;
          break;
        }

        // Otherwise it's metadata
        if (first && second) {
          metadata[first] = second;
        }
      }

      if (headerIdx === -1) {
        throw new Error(
          "Could not find results table. Make sure this is a QuantStudio export with a 'Results' sheet."
        );
      }

      // Validate it's a QuantStudio file
      const instrumentType = metadata["Instrument Type"] || "";
      if (
        !instrumentType.includes("QuantStudio") &&
        !metadata["File Name"]?.endsWith(".eds")
      ) {
        throw new Error(
          "This doesn't appear to be a QuantStudio export file. Please upload the XLSX exported from QuantStudio."
        );
      }

      // Parse header columns
      const headers = rows[headerIdx].map((c) => String(c || "").trim());
      const sampleIdx = headers.indexOf("Sample");
      const targetIdx = headers.indexOf("Target");
      const cqIdx = headers.indexOf("Cq");
      const cqMeanIdx = headers.indexOf("Cq Mean");
      const cqConfIdx = headers.indexOf("Cq Confidence");
      const ampStatusIdx = headers.indexOf("Amp Status");

      if (sampleIdx === -1 || targetIdx === -1 || cqIdx === -1) {
        throw new Error(
          "Missing required columns (Sample, Target, Cq) in the Results sheet."
        );
      }

      // Group by sample
      const sampleMap: Record<string, QpcrResult[]> = {};

      for (let i = headerIdx + 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length <= Math.max(sampleIdx, targetIdx, cqIdx))
          continue;

        const sample = String(row[sampleIdx] || "").trim();
        const target = String(row[targetIdx] || "").trim();
        if (!sample || !target) continue;

        let cq: number | null = null;
        const rawCq = row[cqIdx];
        if (
          rawCq !== undefined &&
          rawCq !== null &&
          String(rawCq) !== "Undetermined"
        ) {
          const parsed = Number(rawCq);
          if (!Number.isNaN(parsed)) cq = parsed;
        }

        const parseSafe = (idx: number): number | null => {
          if (idx === -1 || !row[idx]) return null;
          const v = Number(row[idx]);
          return Number.isNaN(v) ? null : v;
        };

        if (!sampleMap[sample]) sampleMap[sample] = [];
        sampleMap[sample].push({
          target,
          cq,
          cqMean: parseSafe(cqMeanIdx),
          cqConfidence: parseSafe(cqConfIdx),
          ampStatus:
            ampStatusIdx !== -1 ? String(row[ampStatusIdx] || "") : "",
        });
      }

      // Build sample summaries
      const samples: SampleSummary[] = Object.entries(sampleMap).map(
        ([name, results]) => {
          const cqs = results.map((r) => r.cq);
          const { score, risk } = calcMirlungScore(cqs);
          const validCqs = cqs.filter((c): c is number => c !== null);
          return {
            sampleName: name,
            targetCount: results.length,
            avgCq:
              validCqs.length > 0
                ? Math.round(
                    (validCqs.reduce((a, b) => a + b, 0) / validCqs.length) *
                      100
                  ) / 100
                : null,
            mirlungScore: score,
            riskCategory: risk,
            results,
          };
        }
      );

      if (samples.length === 0) {
        throw new Error("No sample data found in the Results sheet.");
      }

      setState((prev) => ({
        ...prev,
        status: "preview",
        metadata,
        samples,
      }));

      message.success(
        `Parsed ${samples.length} samples with ${Object.values(sampleMap).flat().length} total wells.`
      );
    } catch (error) {
      setState((prev) => ({
        ...prev,
        status: "error",
        errorMessage:
          error instanceof Error ? error.message : "Failed to parse file",
      }));
    }
  };

  // Upload to backend
  const handleUpload = async () => {
    if (!state.file) return;
    setConfirmVisible(false);

    setState((prev) => ({ ...prev, status: "uploading", progress: 30 }));

    try {
      const formData = new FormData();
      formData.append("file", state.file);

      const token = localStorage.getItem("token");
      setState((prev) => ({ ...prev, progress: 60 }));

      const response = await fetch(
        `${API_URL}/clinical-diagnostics/batch-upload`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Server rejected the file");
      }

      setState((prev) => ({
        ...prev,
        status: "success",
        progress: 100,
        serverResponse: {
          message: result.message,
          updated: result.updated || 0,
          created: result.created || 0,
          samples: result.samples || [],
        },
      }));

      message.success(result.message);
    } catch (error) {
      setState((prev) => ({
        ...prev,
        status: "error",
        errorMessage:
          error instanceof Error ? error.message : "Upload failed",
      }));
      message.error("Upload failed");
    }
  };

  // Reset
  const handleReset = () => {
    setState({
      status: "idle",
      file: null,
      metadata: {},
      samples: [],
      progress: 0,
      errorMessage: "",
      serverResponse: null,
    });
  };

  // Download all reports as ZIP
  const handleDownloadAllReports = async () => {
    setZipping(true);
    try {
      const zip = new JSZip();

      for (const sample of state.samples) {
        const pdfBlob = await generateMirlungReport({
          reportId: sample.sampleName,
          patientName: sample.sampleName,
          patientId: "N/A",
          sex: "N/A",
          dateOfBirth: "N/A",
          nationality: "N/A",
          orderingPhysician: "N/A",
          facility: "N/A",
          dateBloodCollected: "N/A",
          dateOfReport: dayjs().format("DD-MMM-YY"),
          mirlungScore: sample.mirlungScore ?? 0,
          riskCategory: (sample.mirlungScore ?? 0) >= 50 ? "HIGH RISK" : "LOW RISK",
        });
        zip.file(`${sample.sampleName}_mirlung_report.pdf`, pdfBlob);
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, `mirlung_reports_${dayjs().format("YYYYMMDD")}.zip`);
      message.success("Reports ZIP downloaded successfully.");
    } catch {
      message.error("Failed to generate reports ZIP.");
    } finally {
      setZipping(false);
    }
  };

  // --- Render ---

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={() => navigate("/clinical-diagnostics")}
            className="inline-flex items-center gap-1 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] mb-2 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Clinical Diagnostics
          </button>
          <h1 className="text-xl font-bold text-[hsl(var(--foreground))]">
            Batch Upload -- mirLung Dx
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">
            Upload a QuantStudio XLSX export to process qPCR results and
            calculate mirLung Dx risk scores.
          </p>
        </div>
      </div>

      {/* Step 1: Upload */}
      {state.status === "idle" && (
        <Card className="border-dashed border-2">
          <CardContent className="p-0">
            <div className="flex flex-col items-center justify-center py-16">
              <div className="flex items-center justify-center rounded-2xl mb-6 h-[72px] w-[72px] bg-emerald-50 text-emerald-700">
                <FileSpreadsheet className="h-8 w-8" />
              </div>
              <h2 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-1">
                Upload QuantStudio Export
              </h2>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6 text-center max-w-md">
                Select the XLSX file exported from QuantStudio 5. The system
                will read the Results sheet and extract Cq values for each
                sample.
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                  e.target.value = "";
                }}
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
              >
                <UploadIcon className="h-4 w-4" />
                Select XLSX File
              </Button>

              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-4">
                Supported: QuantStudio 5 System exports (.xlsx)
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Parsing state */}
      {state.status === "parsing" && (
        <Card>
          <CardContent className="p-0">
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-4" />
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Parsing {state.file?.name}...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error state */}
      {state.status === "error" && (
        <Card>
          <CardContent className="p-0">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="flex items-center justify-center rounded-2xl mb-4 h-14 w-14 bg-red-50 text-red-600">
                <AlertCircle className="h-7 w-7" />
              </div>
              <h3 className="text-base font-semibold text-[hsl(var(--foreground))] mb-2">
                Error
              </h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6 text-center max-w-md">
                {state.errorMessage}
              </p>
              <Button variant="outline" onClick={handleReset}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Preview */}
      {state.status === "preview" && (
        <>
          {/* Run metadata */}
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FlaskConical className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                Run Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
                    File
                  </div>
                  <div className="font-medium text-[hsl(var(--foreground))] truncate">
                    {state.file?.name}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
                    Instrument
                  </div>
                  <div className="font-medium text-[hsl(var(--foreground))]">
                    {state.metadata["Instrument Type"] || "Unknown"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
                    Run Date
                  </div>
                  <div className="font-medium text-[hsl(var(--foreground))]">
                    {state.metadata["Run Start Date/Time"] || "Unknown"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
                    Samples
                  </div>
                  <div className="font-medium text-[hsl(var(--foreground))]">
                    {state.samples.length}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sample results table */}
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Sample Results Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Table
                dataSource={state.samples}
                rowKey="sampleName"
                pagination={false}
                size="middle"
              >
                <Table.Column
                  title="Sample"
                  dataIndex="sampleName"
                  render={(v: string) => (
                    <span className="font-mono font-semibold text-[hsl(var(--foreground))]">
                      {v}
                    </span>
                  )}
                />
                <Table.Column
                  title="Targets"
                  dataIndex="targetCount"
                  render={(v: number) => <span>{v} targets</span>}
                />
                <Table.Column
                  title="Avg Cq"
                  dataIndex="avgCq"
                  render={(v: number | null) => (
                    <span className="font-mono text-sm">
                      {v !== null ? v.toFixed(2) : "\u2014"}
                    </span>
                  )}
                />
                <Table.Column
                  title="mirLung Dx Score"
                  dataIndex="mirlungScore"
                  render={(v: number | null) => (
                    <span className="font-bold text-sm">
                      {v !== null ? `${v.toFixed(2)}%` : "\u2014"}
                    </span>
                  )}
                />
                <Table.Column
                  title="Risk Category"
                  dataIndex="riskCategory"
                  render={(v: string) => (
                    <Badge variant={getRiskVariant(v)}>{v}</Badge>
                  )}
                />
              </Table>
            </CardContent>
          </Card>

          {/* Expanded Cq detail per sample */}
          {state.samples.map((sample) => (
            <Card key={sample.sampleName} className="mb-4">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-sm font-semibold font-mono">
                      {sample.sampleName}
                    </CardTitle>
                    <Badge variant={getRiskVariant(sample.riskCategory)}>
                      {sample.riskCategory}
                    </Badge>
                  </div>
                  <span
                    className="text-lg font-bold"
                    style={{ color: getRiskColor(sample.riskCategory) }}
                  >
                    {sample.mirlungScore !== null
                      ? `${sample.mirlungScore.toFixed(2)}%`
                      : "\u2014"}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-[hsl(var(--border))]">
                        <th className="px-4 py-2 text-left text-[hsl(var(--muted-foreground))] font-medium">
                          Target
                        </th>
                        <th className="px-4 py-2 text-right text-[hsl(var(--muted-foreground))] font-medium">
                          Cq
                        </th>
                        <th className="px-4 py-2 text-right text-[hsl(var(--muted-foreground))] font-medium">
                          Cq Mean
                        </th>
                        <th className="px-4 py-2 text-right text-[hsl(var(--muted-foreground))] font-medium">
                          Confidence
                        </th>
                        <th className="px-4 py-2 text-center text-[hsl(var(--muted-foreground))] font-medium">
                          Amp Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sample.results.map((r, i) => (
                        <tr
                          key={`${r.target}-${i}`}
                          className={cn(
                            "border-b border-[hsl(var(--border))]/50 hover:bg-[hsl(var(--accent))]/50 transition-colors"
                          )}
                        >
                          <td className="px-4 py-2 font-mono font-medium text-[hsl(var(--foreground))]">
                            {r.target}
                          </td>
                          <td className="px-4 py-2 text-right font-mono">
                            {r.cq !== null ? r.cq.toFixed(2) : "Undetermined"}
                          </td>
                          <td className="px-4 py-2 text-right font-mono text-[hsl(var(--muted-foreground))]">
                            {r.cqMean !== null ? r.cqMean.toFixed(2) : "\u2014"}
                          </td>
                          <td className="px-4 py-2 text-right font-mono text-[hsl(var(--muted-foreground))]">
                            {r.cqConfidence !== null
                              ? (r.cqConfidence * 100).toFixed(1) + "%"
                              : "\u2014"}
                          </td>
                          <td className="px-4 py-2 text-center">
                            {r.ampStatus === "AMP" ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700">
                                <CheckCircle2 className="h-3 w-3" /> AMP
                              </span>
                            ) : (
                              <span className="text-[hsl(var(--muted-foreground))]">
                                {r.ampStatus || "\u2014"}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Action buttons */}
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={handleReset}>
              Cancel
            </Button>
            <Button size="lg" onClick={() => setConfirmVisible(true)}>
              <CloudUpload className="h-4 w-4" />
              Process & Save {state.samples.length} Samples
            </Button>
          </div>
        </>
      )}

      {/* Uploading state */}
      {state.status === "uploading" && (
        <Card>
          <CardContent className="p-0">
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-4" />
              <h3 className="text-base font-semibold text-[hsl(var(--foreground))] mb-2">
                Processing...
              </h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">
                Uploading and processing QuantStudio data on the server.
              </p>
              <Progress
                percent={state.progress}
                status="active"
                style={{ width: 300 }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success state */}
      {state.status === "success" && (
        <Card>
          <CardContent className="p-0">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="flex items-center justify-center rounded-2xl mb-4 h-14 w-14 bg-emerald-50 text-emerald-700">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h3 className="text-base font-semibold text-[hsl(var(--foreground))] mb-2">
                Upload Successful
              </h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4 text-center">
                {state.serverResponse?.message}
              </p>
              <Progress
                percent={100}
                status="success"
                style={{ width: 300 }}
              />
              <div className="flex items-center gap-3 mt-6">
                <Button variant="outline" onClick={handleReset}>
                  Upload Another
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDownloadAllReports}
                  disabled={zipping}
                  className="gap-2"
                >
                  {zipping ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Archive className="h-4 w-4" />
                  )}
                  {zipping ? "Creating ZIP..." : "Download All Reports"}
                </Button>
                <Button onClick={() => navigate("/clinical-diagnostics")}>
                  Go to Clinical Diagnostics
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirm Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <CloudUpload className="h-4 w-4 text-emerald-600" />
            Confirm Upload
          </div>
        }
        open={confirmVisible}
        onOk={handleUpload}
        onCancel={() => setConfirmVisible(false)}
        okText="Process & Save"
        okButtonProps={{
          style: { backgroundColor: "hsl(var(--primary))" },
        }}
      >
        <Alert
          message={`Process ${state.samples.length} samples?`}
          description={
            <div>
              <p className="mb-2">
                The server will process the QuantStudio data and:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>
                  Extract Cq values for{" "}
                  {state.samples.reduce((a, s) => a + s.targetCount, 0)} wells
                </li>
                <li>Calculate mirLung Dx scores for each sample</li>
                <li>
                  Match samples to existing patient records (by sample
                  reference, test case ID, or patient ID)
                </li>
                <li>Create new records for unmatched samples</li>
              </ul>
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <div className="text-sm text-[hsl(var(--muted-foreground))]">
          Samples:{" "}
          <span className="inline-flex flex-wrap gap-1">
            {state.samples.map((s) => (
              <Badge key={s.sampleName} variant="outline" className="font-mono">
                {s.sampleName}
              </Badge>
            ))}
          </span>
        </div>
      </Modal>
    </div>
  );
};

export default BatchUpload;
