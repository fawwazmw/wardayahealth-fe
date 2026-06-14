import React from "react";
import { BarChart3, AlertTriangle, ShieldCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";

interface Props {
  record: Record<string, unknown>;
}

function computeFeatureContributions(record: Record<string, unknown>) {
  const noduleSize = record.nodule_size_mm != null ? Number(record.nodule_size_mm) : 0;
  const smokingStatus = record.smoking_status as string | null;
  const noduleType = record.nodule_type as string | null;

  const qpcrResults = record.qpcr_results as { target: string; cq: number | null }[] | null;
  const mir21Cq = qpcrResults?.find((r) => r.target.toLowerCase().includes("21"))?.cq;
  const mir486Cq = qpcrResults?.find((r) => r.target.toLowerCase().includes("486"))?.cq;

  const features = [
    {
      name: "Nodule Size",
      value: noduleSize > 15 ? 3.66 : noduleSize > 8 ? 2.1 : noduleSize > 6 ? 1.2 : 0.4,
    },
    {
      name: "Morphology",
      value: noduleType?.toLowerCase().includes("solid") ? 0.85 : noduleType?.toLowerCase().includes("ground") ? 0.45 : 0,
    },
    {
      name: "Smoking",
      value: smokingStatus?.toLowerCase().includes("current") ? 0.95 : smokingStatus?.toLowerCase().includes("former") ? 0.55 : 0,
    },
    {
      name: "miR-21",
      value: mir21Cq != null ? Math.max(0, (50 - mir21Cq) * 0.04) : 0,
    },
    {
      name: "miR-486",
      value: mir486Cq != null ? Math.max(0, (50 - mir486Cq) * 0.03) : 0,
    },
  ];

  return features.sort((a, b) => b.value - a.value);
}

export const IntegratedReportTab: React.FC<Props> = ({ record }) => {
  const score = record.mirlung_score != null ? Number(record.mirlung_score) : null;
  const riskCategory = record.risk_category as string | null;

  if (score === null) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-[hsl(var(--muted-foreground))]">
        <BarChart3 className="h-12 w-12 mb-4 opacity-30" />
        <p className="text-sm font-medium">No integrated report available</p>
        <p className="text-xs mt-1">Complete the analysis pipeline to generate the report</p>
      </div>
    );
  }

  const features = computeFeatureContributions(record);
  const isHighRisk = riskCategory?.toLowerCase().includes("high");

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-[hsl(var(--primary))]" />
            Logistic Regression Risk Model
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-8">
            <div className="flex flex-col items-center">
              <div className="relative">
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <circle
                    cx="60" cy="60" r="52"
                    fill="none"
                    stroke="hsl(var(--border))"
                    strokeWidth="8"
                  />
                  <circle
                    cx="60" cy="60" r="52"
                    fill="none"
                    stroke={isHighRisk ? "#ef4444" : score > 35 ? "#f59e0b" : "#22c55e"}
                    strokeWidth="8"
                    strokeDasharray={`${(score / 100) * 327} 327`}
                    strokeLinecap="round"
                    transform="rotate(-90 60 60)"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold">{Math.round(score)}%</span>
                  <span className="text-[10px] text-[hsl(var(--muted-foreground))]">malignancy</span>
                </div>
              </div>
              <Badge
                variant={isHighRisk ? "destructive" : riskCategory?.toLowerCase().includes("moderate") ? "warning" : "success"}
                className="mt-3"
              >
                {isHighRisk ? (
                  <span className="flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> {riskCategory}</span>
                ) : (
                  <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> {riskCategory}</span>
                )}
              </Badge>
            </div>

            <div className="flex-1">
              <div className="h-2 rounded-full overflow-hidden flex">
                <div className="bg-[#22c55e]" style={{ width: "35%" }} />
                <div className="bg-[#f59e0b]" style={{ width: "30%" }} />
                <div className="bg-[#ef4444]" style={{ width: "35%" }} />
              </div>
              <div className="flex justify-between mt-1 text-[10px] text-[hsl(var(--muted-foreground))]">
                <span>0% Low</span>
                <span>35%</span>
                <span>65%</span>
                <span>100% High</span>
              </div>
              <div
                className="relative mt-1"
                style={{ marginLeft: `${Math.min(95, Math.max(2, score))}%` }}
              >
                <div className="w-0 h-0 border-l-4 border-r-4 border-b-6 border-l-transparent border-r-transparent border-b-[hsl(var(--foreground))]" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Feature Contributions (Log-Odds)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={features} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
              <Tooltip formatter={(v: number) => [`+${v.toFixed(2)}`, "Log-Odds"]} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {features.map((f, i) => (
                  <Cell key={i} fill={f.value > 1.5 ? "#ef4444" : f.value > 0.5 ? "#f59e0b" : "#e91e8c"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
