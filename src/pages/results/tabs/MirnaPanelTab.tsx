import React from "react";
import { Dna } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ReferenceLine,
} from "recharts";

interface QpcrResult {
  target: string;
  cq: number | null;
  cqMean: number | null;
  cqSd: number | null;
  cqConfidence: number | null;
  ampStatus: string;
}

interface Props {
  record: Record<string, unknown>;
}

const BIOMARKER_THRESHOLDS: Record<string, number> = {
  "miR-21": 50,
  "miR-210": 50,
  "miR-486": 50,
  "miR-126": 65,
  "miR-205": 50,
  "miR-31": 50,
};

function normalizeTarget(target: string): string {
  const lower = target.toLowerCase().replace(/[_\s-]/g, "");
  if (lower.includes("mir21") || lower === "hsa-mir-21-5p") return "miR-21";
  if (lower.includes("mir210")) return "miR-210";
  if (lower.includes("mir486")) return "miR-486";
  if (lower.includes("mir126")) return "miR-126";
  if (lower.includes("mir205")) return "miR-205";
  if (lower.includes("mir31")) return "miR-31";
  return target;
}

function cqToExpression(cq: number | null): number {
  if (cq === null || cq <= 0) return 0;
  return Math.round(Math.max(0, Math.min(100, 100 - cq * 2)));
}

export const MirnaPanelTab: React.FC<Props> = ({ record }) => {
  const rawResults = record.qpcr_results as QpcrResult[] | null;

  if (!rawResults || rawResults.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-[hsl(var(--muted-foreground))]">
        <Dna className="h-12 w-12 mb-4 opacity-30" />
        <p className="text-sm font-medium">No miRNA panel data available</p>
        <p className="text-xs mt-1">Upload QuantStudio results or enter data manually</p>
      </div>
    );
  }

  const biomarkerMap = new Map<string, { expression: number; cq: number | null }>();
  for (const r of rawResults) {
    const name = normalizeTarget(r.target);
    if (!biomarkerMap.has(name)) {
      biomarkerMap.set(name, { expression: cqToExpression(r.cq), cq: r.cq });
    }
  }

  const radarData = Array.from(biomarkerMap.entries()).map(([name, data]) => ({
    biomarker: name,
    expression: data.expression,
    fullMark: 100,
  }));

  const barData = Array.from(biomarkerMap.entries()).map(([name, data]) => ({
    biomarker: name,
    expression: data.expression,
    threshold: BIOMARKER_THRESHOLDS[name] ?? 50,
    isAbnormal: data.expression > (BIOMARKER_THRESHOLDS[name] ?? 50),
    cq: data.cq,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
        <Dna className="h-4 w-4" />
        <span>6-biomarker assay — {Array.from(biomarkerMap.keys()).join(", ")}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Expression Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis
                  dataKey="biomarker"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={{ fontSize: 10 }}
                />
                <Radar
                  name="Expression"
                  dataKey="expression"
                  stroke="#e91e8c"
                  fill="#e91e8c"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Expression Levels</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="biomarker"
                  tick={{ fontSize: 11 }}
                  width={60}
                />
                <Tooltip
                  formatter={(value: number, _name: string, props: { payload: { cq: number | null; threshold: number } }) => [
                    `${value} (Cq: ${props.payload.cq ?? "N/A"})`,
                    "Expression",
                  ]}
                />
                <ReferenceLine x={50} stroke="#9ca3af" strokeDasharray="3 3" />
                <Bar dataKey="expression" radius={[0, 4, 4, 0]}>
                  {barData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.isAbnormal ? "#ef4444" : "#e91e8c"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-3 text-xs text-[hsl(var(--muted-foreground))]">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: "#e91e8c" }} />
                Normal
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: "#ef4444" }} />
                Abnormal
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Raw Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {barData.map((b) => (
              <div
                key={b.biomarker}
                className="p-3 rounded-lg border border-[hsl(var(--border))] text-center"
              >
                <div className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1">
                  {b.biomarker}
                </div>
                <div className="text-xl font-bold" style={{ color: b.isAbnormal ? "#ef4444" : "inherit" }}>
                  {b.expression}
                </div>
                <div className="text-[10px] text-[hsl(var(--muted-foreground))]">
                  Cq: {b.cq?.toFixed(1) ?? "N/A"}
                </div>
                {b.isAbnormal && (
                  <Badge variant="destructive" className="mt-1 text-[10px]">
                    Abnormal
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
