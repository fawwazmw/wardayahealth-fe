import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useShow } from "@refinedev/core";
import dayjs from "dayjs";
import { ArrowLeft, CheckCircle2, Circle, FileText, Scan, Dna, BarChart3, TrendingUp, ChevronDown, FileDown, Loader2, Brain } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { axiosInstance } from "@/providers/authProvider";
import { generateMirlungReport, type MirlungReportData } from "@/utils/generateMirlungReport";
import { ClinicalInfoTab } from "./tabs/ClinicalInfoTab";
import { LdctImagingTab } from "./tabs/LdctImagingTab";
import { MirnaPanelTab } from "./tabs/MirnaPanelTab";
import { IntegratedReportTab } from "./tabs/IntegratedReportTab";
import { PatientTrendTab } from "./tabs/PatientTrendTab";

type WorkflowStep = "order_placed" | "sample_collected" | "lab_processing" | "analysis_done" | "report_ready";

const WORKFLOW_STEPS: { key: WorkflowStep; label: string }[] = [
  { key: "order_placed", label: "Order Placed" },
  { key: "sample_collected", label: "Sample Collected" },
  { key: "lab_processing", label: "Lab Processing" },
  { key: "analysis_done", label: "Analysis Done" },
  { key: "report_ready", label: "Report Ready" },
];

const TABS = [
  { key: "clinical", label: "Clinical Info", icon: FileText },
  { key: "ldct", label: "LDCT Imaging", icon: Scan },
  { key: "mirna", label: "miRNA Panel", icon: Dna },
  { key: "integrated", label: "Integrated Report", icon: BarChart3 },
  { key: "trend", label: "Patient Trend", icon: TrendingUp },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function getStepIndex(status: string | undefined): number {
  const idx = WORKFLOW_STEPS.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : 0;
}

function getRiskColor(risk: string | null | undefined): string {
  if (!risk) return "#9ca3af";
  const lower = risk.toLowerCase();
  if (lower.includes("high")) return "#ef4444";
  if (lower.includes("moderate") || lower.includes("intermediate")) return "#f59e0b";
  return "#22c55e";
}

export const ResultShow: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>("clinical");
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const { query } = useShow<Record<string, unknown>>({
    resource: "clinical-diagnostics",
    id,
  });

  const record = query?.data?.data as Record<string, unknown> | undefined;

  const [exporting, setExporting] = useState(false);

  const handleWorkflowUpdate = async (newStatus: WorkflowStep) => {
    try {
      await axiosInstance.put(`/clinical-diagnostics/${id}`, {
        workflowStatus: newStatus,
      });
      query.refetch();
      setShowStatusMenu(false);
    } catch {
      setShowStatusMenu(false);
    }
  };

  const handleExportReport = async () => {
    if (!record) return;
    setExporting(true);
    try {
      const mirlungScore = record.mirlung_score != null ? Number(record.mirlung_score) : 0;
      const reportData: MirlungReportData = {
        reportId: (record.test_case_id as string) || "N/A",
        patientName: (record.patient_name as string) || "Unknown",
        patientId: (record.id_number as string) || "N/A",
        sex: (record.patient_sex as string) || "N/A",
        dateOfBirth: record.patient_dob
          ? dayjs(record.patient_dob as string).format("DD MMMM YYYY")
          : "N/A",
        nationality: (record.patient_nationality as string) || "N/A",
        orderingPhysician: (record.physician_name as string) || "N/A",
        facility: (record.requester as string) || "N/A",
        dateBloodCollected: record.sample_collection_date
          ? dayjs(record.sample_collection_date as string).format("DD-MMM-YY")
          : "N/A",
        dateOfReport: dayjs().format("DD-MMM-YY"),
        mirlungScore,
        riskCategory: mirlungScore >= 50 ? "HIGH RISK" : "LOW RISK",
      };

      const blob = await generateMirlungReport(reportData);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${reportData.reportId}_Medical_Report_GE002.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export report:", err);
    } finally {
      setExporting(false);
    }
  };

  if (!record) {
    return (
      <div className="flex items-center justify-center py-24 text-[hsl(var(--muted-foreground))]">
        Loading...
      </div>
    );
  }

  const currentStep = getStepIndex(record.workflow_status as string);
  const score = record.mirlung_score != null ? Number(record.mirlung_score) : null;
  const riskCategory = record.risk_category as string | null;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/results")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <code className="text-sm font-mono text-[hsl(var(--muted-foreground))]">
              {record.test_case_id as string}
            </code>
            <Badge variant="secondary">
              {record.patient_sex as string || "—"} · b. {record.patient_dob ? dayjs(record.patient_dob as string).format("YYYY-MM-DD") : "—"}
            </Badge>
          </div>
          <h1 className="text-xl font-semibold mt-1">{record.patient_name as string}</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleExportReport}
            disabled={exporting}
          >
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
            Export Report
          </Button>
          {score !== null && (
            <div className="flex flex-col items-center">
              <div
                className="flex items-center justify-center rounded-full text-white text-lg font-bold"
                style={{
                  width: 64,
                  height: 64,
                  backgroundColor: getRiskColor(riskCategory),
                }}
              >
                {Math.round(score)}
              </div>
              <Badge
                variant={riskCategory?.toLowerCase().includes("high") ? "destructive" : riskCategory?.toLowerCase().includes("moderate") ? "warning" : "success"}
                className="mt-2"
              >
                {riskCategory || "Pending"}
              </Badge>
            </div>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="py-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
              Sample Workflow
            </span>
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="text-xs gap-1"
                onClick={() => setShowStatusMenu(!showStatusMenu)}
              >
                {WORKFLOW_STEPS[currentStep]?.label || "Update Status"}
                <ChevronDown className="h-3 w-3" />
              </Button>
              {showStatusMenu && (
                <div className="absolute right-0 top-full mt-1 z-50 bg-[hsl(225,15%,12%)] border border-[hsl(var(--border))] rounded-lg shadow-lg py-1 min-w-[180px]">
                  {WORKFLOW_STEPS.map((step, i) => (
                    <button
                      key={step.key}
                      onClick={() => handleWorkflowUpdate(step.key)}
                      className={cn(
                        "w-full text-left px-3 py-2 text-sm transition-colors",
                        i === currentStep
                          ? "font-semibold text-[#e91e8c] bg-[hsl(var(--muted))]/30"
                          : "text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]/50"
                      )}
                    >
                      <span className={i <= currentStep ? "text-[#e91e8c]" : "text-[hsl(var(--muted-foreground))]"}>
                        {i <= currentStep ? "✓ " : "○ "}
                      </span>{step.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            {WORKFLOW_STEPS.map((step, i) => (
              <div key={step.key} className="flex flex-col items-center flex-1">
                <div className="flex items-center w-full">
                  {i > 0 && (
                    <div
                      className="flex-1 h-0.5"
                      style={{ backgroundColor: i <= currentStep ? "#e91e8c" : "hsl(225, 15%, 20%)" }}
                    />
                  )}
                  <div className="flex items-center justify-center">
                    {i <= currentStep ? (
                      <CheckCircle2 className="h-6 w-6" style={{ color: "#e91e8c" }} />
                    ) : (
                      <Circle className="h-6 w-6 text-[hsl(var(--muted-foreground))]" />
                    )}
                  </div>
                  {i < WORKFLOW_STEPS.length - 1 && (
                    <div
                      className="flex-1 h-0.5"
                      style={{ backgroundColor: i < currentStep ? "#e91e8c" : "hsl(225, 15%, 20%)" }}
                    />
                  )}
                </div>
                <span
                  className={cn(
                    "text-[11px] mt-2 text-center",
                    i <= currentStep ? "font-medium text-[hsl(var(--foreground))]" : "text-[hsl(var(--muted-foreground))]"
                  )}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {record.skh_probability != null && (
        <Card>
          <CardContent className="py-5">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center rounded-full"
                  style={{
                    width: 48,
                    height: 48,
                    backgroundColor: (record.skh_label as string) === "positive" ? "#ef4444" : "#22c55e",
                  }}
                >
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
                    SKH No-Nodule AI Prediction
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span
                      className={cn(
                        "text-2xl font-bold",
                        Number(record.skh_probability) >= 0.5 ? "text-red-500" : "text-emerald-500"
                      )}
                    >
                      {(Number(record.skh_probability) * 100).toFixed(1)}%
                    </span>
                    <Badge
                      variant={(record.skh_label as string) === "positive" ? "destructive" : "success"}
                      className="text-xs"
                    >
                      {(record.skh_label as string) === "positive" ? "Positive (High Risk)" : "Negative (Low Risk)"}
                    </Badge>
                  </div>
                </div>
              </div>
              {record.bm5 != null && (
                <div className="ml-auto text-right">
                  <div className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
                    BM5 Value
                  </div>
                  <div className="text-lg font-mono font-semibold mt-0.5">
                    {Number(record.bm5).toFixed(2)}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-1 border-b border-[hsl(var(--border))]">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
              activeTab === key
                ? "border-[#e91e8c] text-[#e91e8c]"
                : "border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      <div>
        {activeTab === "clinical" && <ClinicalInfoTab record={record} />}
        {activeTab === "ldct" && <LdctImagingTab record={record} />}
        {activeTab === "mirna" && <MirnaPanelTab record={record} />}
        {activeTab === "integrated" && <IntegratedReportTab record={record} />}
        {activeTab === "trend" && <PatientTrendTab record={record} />}
      </div>
    </div>
  );
};

export default ResultShow;
