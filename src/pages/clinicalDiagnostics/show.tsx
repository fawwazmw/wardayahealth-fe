import React, { useState } from "react";
import { Show } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import dayjs from "dayjs";
import { FileDown, Eye, User, FlaskConical, TestTube, Activity, HeartPulse, FileText, FileCode, Loader2, ShieldAlert, ClipboardList, Clock, Brain } from "lucide-react";
import { axiosInstance } from "../../providers/authProvider";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { generateMirlungReport, type MirlungReportData } from "@/utils/generateMirlungReport";
import { downloadMirlungHl7 } from "@/utils/generateMirlungHl7";
import { generateInterpretation } from "@/utils/clinicalInterpretation";

const Field: React.FC<{
  label: string;
  value?: string | number | boolean | null;
  mono?: boolean;
}> = ({ label, value, mono }) => (
  <div className="py-3 border-b border-[hsl(var(--border))] last:border-0">
    <div className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-0.5">
      {label}
    </div>
    <div
      className={cn(
        "text-sm text-[hsl(var(--foreground))]",
        mono && "font-mono"
      )}
    >
      {value !== null && value !== undefined && value !== ""
        ? String(value)
        : "\u2014"}
    </div>
  </div>
);

export const LabTestShow = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { query } = useShow<any>();
  const record = query?.data?.data;
  const [generating, setGenerating] = useState(false);

  const handlePdfDownload = async () => {
    if (!record?.report_download_pdf) return;

    try {
      const response = await axiosInstance.get(record.report_download_pdf, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");

      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
    } catch (error) {
      console.error("Error viewing PDF:", error);
    }
  };

  const handleGenerateReport = async () => {
    if (!record) return;
    setGenerating(true);

    try {
      const score = record.mirlung_score ?? 0;
      const reportData: MirlungReportData = {
        reportId: record.test_case_id || "N/A",
        patientName: record.patient_name || "Unknown",
        patientId: record.id_number || "N/A",
        sex: record.patient_sex || record.sex || "N/A",
        dateOfBirth: record.patient_dob
          ? dayjs(record.patient_dob).format("DD MMMM YYYY")
          : "N/A",
        nationality: record.patient_nationality || "N/A",
        orderingPhysician: record.physician_name || "N/A",
        facility: record.requester || "N/A",
        dateBloodCollected: record.sample_collection_date
          ? dayjs(record.sample_collection_date).format("DD-MMM-YY")
          : "N/A",
        dateOfReport: dayjs().format("DD-MMM-YY"),
        mirlungScore: Number(score),
        riskCategory: Number(score) >= 50 ? "HIGH RISK" : "LOW RISK",
      };

      const blob = await generateMirlungReport(reportData);

      // Upload the generated PDF to the server and update status
      try {
        const formData = new FormData();
        formData.append(
          "report_download_pdf",
          blob,
          `${record.test_case_id || "report"}_mirlung_report.pdf`
        );
        formData.append("reportStatus", "Completed");

        await axiosInstance.put(
          `/clinical-diagnostics/${record.id}`,
          { reportStatus: "Completed" }
        );
      } catch (updateErr) {
        console.warn("Could not update record status:", updateErr);
      }

      // Open the PDF in a new tab
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);

      // Refresh the record to show updated status
      query.refetch();
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Show breadcrumb={false}>
      <div className="p-1 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Patient Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <User className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Field label="Patient Name" value={record?.patient_name} />
              <Field
                label="Patient Last Name"
                value={record?.patient_last_name}
              />
              <Field
                label="Date of Birth"
                value={
                  record?.patient_dob || record?.date_of_birth
                    ? dayjs(record?.patient_dob || record?.date_of_birth).format("DD MMM YYYY")
                    : null
                }
              />
              <Field label="Sex" value={record?.patient_sex || record?.sex} />
              <Field label="MRN" value={record?.id_number} mono />
              <Field label="Ethnicity" value={record?.patient_ethnicity || record?.ethnicity} />
              <Field label="Age Group" value={record?.patient_age_group} />
              <Field
                label="Super Population"
                value={record?.patient_super_population}
              />
              <Field label="Population" value={record?.patient_population} />
              <Field
                label="Hispanic / Latino"
                value={
                  record?.is_patient_hispanic != null
                    ? record.is_patient_hispanic
                      ? "Yes"
                      : "No"
                    : null
                }
              />
              <Field
                label="Body Weight (kg)"
                value={record?.patient_body_weight}
              />
              <Field
                label="Treatment History (Carbamazepine)"
                value={record?.treatment_history_carbamazepine}
              />
              <Field
                label="Patient ID Type"
                value={record?.patient_id_type}
              />
              <Field label="ID Number" value={record?.id_number} mono />
              <Field
                label="Contact Number"
                value={record?.patient_contact_number}
              />
              <Field label="Address" value={record?.patient_address} />
            </CardContent>
          </Card>

          {/* Test & Request Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FlaskConical className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                Test & Request Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Field label="Test Case ID" value={record?.test_case_id} mono />
              <Field
                label="Reference Number"
                value={record?.test_request_reference_number}
                mono
              />
              <Field label="Requester" value={record?.requester} />
              <Field
                label="Requester Address"
                value={record?.requester_address}
              />
              <Field
                label="Physician Name"
                value={record?.physician_name}
              />
              <Field label="Disease" value={record?.disease} />
              <Field label="Test Comment" value={record?.test_comment} />
              <Field label="Panel ID" value={record?.panel_id} />
              <Field label="Drug Group ID" value={record?.drug_group_id} />
              <Field label="Clinical Notes" value={record?.clinical_notes} />
              <Field label="Reviewer Name" value={record?.reviewer_name} />
              <Field
                label="Test Information"
                value={record?.test_information}
              />
              <Field
                label="Lab Result Summary"
                value={record?.lab_result_summary}
              />
            </CardContent>
          </Card>

          {/* Sample & Specimen */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TestTube className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                Sample & Specimen Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Field
                label="Sample Reference Number"
                value={record?.sample_reference_number}
                mono
              />
              <Field
                label="Sample Collection Date"
                value={
                  record?.sample_collection_date
                    ? dayjs(record.sample_collection_date).format(
                        "DD MMM YYYY"
                      )
                    : null
                }
              />
              <Field
                label="Sample Received Date"
                value={
                  record?.sample_received_date
                    ? dayjs(record.sample_received_date).format("DD MMM YYYY")
                    : null
                }
              />
              <Field
                label="Sample Description"
                value={record?.sample_description}
              />
              <Field label="Platform" value={record?.platform} />
              <Field label="Data Type" value={record?.data_type} />
              <Field label="Sample File" value={record?.sample_file} />
              <Field
                label="Specimen Collected From"
                value={record?.requester}
              />
              <Field label="Specimen Type" value={record?.specimen_type} />
              <Field label="Specimen ID" value={record?.specimen_id} mono />
              <Field
                label="Specimen Received"
                value={
                  record?.sample_received_date
                    ? dayjs(record.sample_received_date).format("DD MMM YYYY")
                    : null
                }
              />
            </CardContent>
          </Card>
        </div>

        {/* Wardayahealth Results */}
        {(record?.mirlung_score !== null && record?.mirlung_score !== undefined) && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <HeartPulse className="h-4 w-4 text-[hsl(var(--primary))]" />
                Wardayahealth Results
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-6">
                  <div>
                    <div className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-1">
                      Integrated Risk Score
                    </div>
                    <div className={cn(
                      "text-3xl font-bold",
                      Number(record.mirlung_score) >= 50 ? "text-red-600" : "text-emerald-600"
                    )}>
                      {Number(record.mirlung_score).toFixed(2)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-1">
                      Risk Category
                    </div>
                    <Badge
                      variant={Number(record.mirlung_score) >= 50 ? "destructive" : "success"}
                      className="text-sm px-3 py-1"
                    >
                      {record.risk_category || (Number(record.mirlung_score) >= 50 ? "HIGH RISK" : "LOW RISK")}
                    </Badge>
                  </div>
                  {record?.platform && (
                    <div>
                      <div className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-1">
                        Platform
                      </div>
                      <div className="text-sm text-[hsl(var(--foreground))]">
                        {record.platform}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    onClick={handleGenerateReport}
                    disabled={generating}
                    className="gap-2"
                  >
                    {generating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                    {generating ? "Generating..." : "Generate Report"}
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => {
                      if (!record) return;
                      downloadMirlungHl7(
                        {
                          patientName: record.patient_name,
                          patientId: record.id_number,
                          dateOfBirth: record.patient_dob
                            ? dayjs(record.patient_dob).format("YYYYMMDD")
                            : "",
                          sex: record.patient_sex || record.sex || "",
                          orderingPhysician: record.physician_name || "",
                          facility: record.requester || "",
                          testCaseId: record.test_case_id || "",
                          mirlungScore: Number(record.mirlung_score),
                          riskCategory:
                            record.risk_category ||
                            (Number(record.mirlung_score) >= 50
                              ? "HIGH RISK"
                              : "LOW RISK"),
                          specimenType: record.specimen_type || "Blood",
                          collectionDate: record.sample_collection_date
                            ? dayjs(record.sample_collection_date).format("YYYYMMDD")
                            : "",
                          reportDate: dayjs().format("YYYYMMDD"),
                        },
                        `${record.test_case_id}_mirlung.hl7`
                      );
                    }}
                  >
                    <FileCode className="h-4 w-4" />
                    Export HL7
                  </Button>
                </div>
              </div>

              {/* Clinical Interpretation */}
              {(() => {
                const score = Number(record.mirlung_score);
                if (Number.isNaN(score)) return null;
                const interp = generateInterpretation({
                  mirlungScore: score,
                  riskCategory: score >= 50 ? "HIGH RISK" : "LOW RISK",
                  noduleSizeMm: record.nodule_size_mm ? Number(record.nodule_size_mm) : undefined,
                  smokingStatus: record.smoking_status || undefined,
                  familyHistory: record.family_history_lung_cancer || false,
                });
                return (
                  <>
                    <Separator className="my-4" />
                    <div className="space-y-4">
                      {/* Interpretation */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <ClipboardList className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                          <span className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                            Clinical Interpretation
                          </span>
                        </div>
                        <p className="text-sm text-[hsl(var(--foreground))] leading-relaxed">
                          {interp.interpretation}
                        </p>
                      </div>

                      {/* Recommendations */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <ShieldAlert className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                          <span className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                            Recommendations
                          </span>
                        </div>
                        <ul className="space-y-1.5">
                          {interp.recommendations.map((rec, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-[hsl(var(--foreground))]">
                              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[hsl(var(--primary))] flex-shrink-0" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Follow-up + Additional Tests */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="rounded-lg border border-[hsl(var(--border))] p-3">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Clock className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
                            <span className="text-xs font-medium text-[hsl(var(--muted-foreground))]">Follow-up</span>
                          </div>
                          <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
                            {interp.followUpInterval}
                          </p>
                        </div>
                        <div className="rounded-lg border border-[hsl(var(--border))] p-3">
                          <div className="flex items-center gap-1.5 mb-1">
                            <FlaskConical className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
                            <span className="text-xs font-medium text-[hsl(var(--muted-foreground))]">Additional Tests</span>
                          </div>
                          <ul className="space-y-0.5">
                            {interp.additionalTests.map((t, i) => (
                              <li key={i} className="text-xs text-[hsl(var(--foreground))]">{t}</li>
                            ))}
                          </ul>
                        </div>
                        {interp.riskFactors.length > 0 && (
                          <div className="rounded-lg border border-[hsl(var(--border))] p-3">
                            <div className="flex items-center gap-1.5 mb-1">
                              <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
                              <span className="text-xs font-medium text-[hsl(var(--muted-foreground))]">Risk Factors</span>
                            </div>
                            <ul className="space-y-0.5">
                              {interp.riskFactors.map((f, i) => (
                                <li key={i} className="text-xs text-[hsl(var(--foreground))]">{f}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                );
              })()}
            </CardContent>
          </Card>
        )}

        {/* SKH No-Nodule Prediction */}
        {(record?.skh_probability !== null && record?.skh_probability !== undefined) && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Brain className="h-4 w-4 text-[hsl(var(--primary))]" />
                SKH No-Nodule AI Prediction
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-6 py-4">
                <div>
                  <div className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-1">
                    Cancer Probability
                  </div>
                  <div className={cn(
                    "text-3xl font-bold",
                    Number(record.skh_probability) >= 0.5 ? "text-red-600" : "text-emerald-600"
                  )}>
                    {(Number(record.skh_probability) * 100).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-1">
                    Prediction
                  </div>
                  <Badge
                    variant={record.skh_label === "positive" ? "destructive" : "success"}
                    className="text-sm px-3 py-1"
                  >
                    {record.skh_label === "positive" ? "Positive (High Risk)" : "Negative (Low Risk)"}
                  </Badge>
                </div>
                {record?.bm5 !== null && record?.bm5 !== undefined && (
                  <div>
                    <div className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-1">
                      BM5 Value
                    </div>
                    <div className="text-sm font-mono text-[hsl(var(--foreground))]">
                      {Number(record.bm5).toFixed(2)}
                    </div>
                  </div>
                )}
              </div>
              <div className="text-xs text-[hsl(var(--muted-foreground))] mt-2">
                Auto-calculated using SKH No-Nodule RFLR formula when qPCR results were uploaded.
              </div>
            </CardContent>
          </Card>
        )}

        {/* System Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6">
              <div className="py-3">
                <div className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-1">
                  Report Status
                </div>
                <Badge
                  variant={
                    record?.report_status === "Completed" ? "success" :
                    record?.report_status === "Results Available" ? "success" :
                    record?.report_status === "In Progress" ? "default" :
                    record?.report_status === "Pending" ? "warning" :
                    "secondary"
                  }
                >
                  {record?.report_status || "Pending"}
                </Badge>
              </div>
              <div className="py-3">
                <div className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-0.5">
                  Created At
                </div>
                <div className="text-sm text-[hsl(var(--foreground))]">
                  {record?.created_at
                    ? dayjs(record.created_at).format("DD MMM YYYY, h:mm A")
                    : "\u2014"}
                </div>
              </div>
              <div className="py-3">
                <div className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-0.5">
                  Updated At
                </div>
                <div className="text-sm text-[hsl(var(--foreground))]">
                  {record?.updated_at
                    ? dayjs(record.updated_at).format("DD MMM YYYY, h:mm A")
                    : "\u2014"}
                </div>
              </div>
              <div className="py-3">
                <div className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-2">
                  Downloads
                </div>
                <div className="flex flex-col gap-1.5">
                  {record?.report_download_pdf && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs gap-1 border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => window.open(record.report_download_pdf, "_blank")}
                      >
                        <FileDown className="h-3.5 w-3.5" />
                        PDF
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs gap-1"
                        onClick={handlePdfDownload}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </Button>
                    </div>
                  )}
                  {record?.report_download_hl7 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs gap-1 border-blue-200 text-blue-700 hover:bg-blue-50 w-fit"
                      onClick={() => window.open(record.report_download_hl7, "_blank")}
                    >
                      <FileDown className="h-3.5 w-3.5" />
                      HL7
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Show>
  );
};

export { LabTestShow as PostShow };
