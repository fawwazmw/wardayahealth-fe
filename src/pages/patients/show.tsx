import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import {
  ArrowLeft,
  User,
  Building2,
  Cigarette,
  HeartPulse,
  FlaskConical,
  PlusCircle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { axiosInstance } from "@/providers/authProvider";

interface PatientData {
  id: number;
  patient_id_code: string;
  name: string;
  sex: string | null;
  date_of_birth: string | null;
  nationality: string | null;
  ethnicity: string | null;
  id_number: string | null;
  contact_number: string | null;
  address: string | null;
  smoking_status: string | null;
  pack_years: number | null;
  family_history_lung_cancer: boolean | null;
  allergies: string | null;
  clinical_notes: string | null;
  hospital: {
    id: number;
    name: string;
    country: { code: string; name: string };
  } | null;
  lab_tests: {
    id: number;
    test_case_id: string;
    report_status: string;
    workflow_status: string;
    mirlung_score: number | null;
    risk_category: string | null;
    created_at: string;
  }[];
}

const Field: React.FC<{ label: string; value: unknown }> = ({ label, value }) => (
  <div className="py-2 border-b border-[hsl(var(--border))] last:border-0">
    <div className="text-[11px] font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-0.5">
      {label}
    </div>
    <div className="text-sm text-[hsl(var(--foreground))]">
      {value !== null && value !== undefined && value !== "" ? String(value) : "—"}
    </div>
  </div>
);

function getRiskColor(risk: string | null): string {
  if (!risk) return "#9ca3af";
  const lower = risk.toLowerCase();
  if (lower.includes("high")) return "#ef4444";
  if (lower.includes("moderate")) return "#f59e0b";
  return "#22c55e";
}

function getStatusVariant(status: string): "success" | "default" | "warning" | "secondary" {
  const s = status?.toLowerCase() || "";
  if (s === "completed" || s === "report_ready") return "success";
  if (s === "in progress" || s === "lab_processing" || s === "analysis_done") return "default";
  if (s === "pending" || s === "order_placed") return "warning";
  return "secondary";
}

export const PatientShow: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await axiosInstance.get(`/patients/${id}`);
        setPatient(res.data);
      } catch {
        navigate("/patients");
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [id, navigate]);

  if (loading || !patient) {
    return (
      <div className="flex items-center justify-center py-24 text-[hsl(var(--muted-foreground))]">
        Loading...
      </div>
    );
  }

  const age = patient.date_of_birth
    ? dayjs().diff(dayjs(patient.date_of_birth), "year")
    : null;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/patients")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <code className="text-sm font-mono text-[hsl(var(--muted-foreground))]">
              {patient.patient_id_code}
            </code>
            <Badge variant="secondary">
              {patient.sex || "—"}{age !== null ? ` · ${age} years` : ""}
            </Badge>
            {patient.hospital && (
              <Badge variant="secondary" className="gap-1">
                <Building2 className="h-3 w-3" />
                {patient.hospital.name}
              </Badge>
            )}
          </div>
          <h1 className="text-xl font-semibold mt-1">{patient.name}</h1>
        </div>
        <Button onClick={() => navigate("/clinical-diagnostics/create")} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          New Test Order
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <User className="h-4 w-4 text-[hsl(var(--primary))]" />
              Demographics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Field label="Full Name" value={patient.name} />
            <Field label="ID Number" value={patient.id_number} />
            <Field label="Sex" value={patient.sex} />
            <Field
              label="Date of Birth"
              value={patient.date_of_birth ? `${dayjs(patient.date_of_birth).format("DD MMM YYYY")}${age !== null ? ` (${age}y)` : ""}` : null}
            />
            <Field label="Nationality" value={patient.nationality} />
            <Field label="Ethnicity" value={patient.ethnicity} />
            <Field label="Contact" value={patient.contact_number} />
            <Field label="Address" value={patient.address} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <HeartPulse className="h-4 w-4 text-[hsl(var(--primary))]" />
              Risk Factors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="py-2 border-b border-[hsl(var(--border))]">
              <div className="text-[11px] font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-0.5">
                Smoking Status
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Cigarette className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
                {patient.smoking_status || "—"}
                {patient.pack_years != null && (
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">
                    ({patient.pack_years}py)
                  </span>
                )}
              </div>
            </div>
            <div className="py-2 border-b border-[hsl(var(--border))]">
              <div className="text-[11px] font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-0.5">
                Family History (Lung Cancer)
              </div>
              <div className="text-sm">
                {patient.family_history_lung_cancer === true ? (
                  <Badge variant="destructive">Yes</Badge>
                ) : patient.family_history_lung_cancer === false ? (
                  <Badge variant="success">No</Badge>
                ) : "—"}
              </div>
            </div>
            <Field label="Allergies" value={patient.allergies} />
            <Field label="Clinical Notes" value={patient.clinical_notes} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[hsl(var(--primary))]" />
              Hospital
            </CardTitle>
          </CardHeader>
          <CardContent>
            {patient.hospital ? (
              <>
                <Field label="Hospital" value={patient.hospital.name} />
                <Field label="Country" value={`${patient.hospital.country.name} (${patient.hospital.country.code})`} />
              </>
            ) : (
              <div className="text-sm text-[hsl(var(--muted-foreground))] py-4">
                No hospital assigned
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-[hsl(var(--primary))]" />
              Test Orders ({patient.lab_tests?.length ?? 0})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {(!patient.lab_tests || patient.lab_tests.length === 0) ? (
            <div className="flex flex-col items-center justify-center py-8 text-[hsl(var(--muted-foreground))]">
              <FlaskConical className="h-8 w-8 mb-2 opacity-30" />
              <p className="text-sm">No test orders yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {patient.lab_tests.map((test) => (
                <div
                  key={test.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border border-[hsl(var(--border))]",
                    "hover:bg-[hsl(var(--muted))]/50 transition-colors cursor-pointer"
                  )}
                  onClick={() => navigate(`/results/show/${test.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <code className="text-xs font-mono font-semibold text-[hsl(var(--muted-foreground))]">
                      {test.test_case_id}
                    </code>
                    <Badge variant={getStatusVariant(test.workflow_status || test.report_status)}>
                      {test.report_status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    {test.mirlung_score != null && (
                      <div
                        className="flex items-center justify-center rounded-full text-white text-[10px] font-bold"
                        style={{
                          width: 28,
                          height: 28,
                          backgroundColor: getRiskColor(test.risk_category),
                        }}
                      >
                        {Math.round(test.mirlung_score)}
                      </div>
                    )}
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">
                      {dayjs(test.created_at).format("DD MMM YYYY")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientShow;
