import React, { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { axiosInstance } from "@/providers/authProvider";
import dayjs from "dayjs";

interface Props {
  record: Record<string, unknown>;
}

interface TrendPoint {
  date: string;
  score: number;
  testId: string;
}

export const PatientTrendTab: React.FC<Props> = ({ record }) => {
  const [trendData, setTrendData] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const patientName = record.patient_name as string;
  const patientId = record.patient_id as number | null;

  useEffect(() => {
    const fetchTrend = async () => {
      try {
        if (!patientId && !patientName) {
          setLoading(false);
          return;
        }

        const params: Record<string, string> = {};
        if (patientName) params.search = patientName;

        const res = await axiosInstance.get("/clinical-diagnostics", { params });
        const allTests = res.data as Record<string, unknown>[];

        const points: TrendPoint[] = allTests
          .filter((t) => t.mirlung_score != null && t.created_at)
          .map((t) => ({
            date: dayjs(t.created_at as string).format("MMM YYYY"),
            score: Number(t.mirlung_score),
            testId: (t.test_case_id as string) || "",
          }))
          .reverse();

        setTrendData(points);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchTrend();
  }, [patientId, patientName]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-[hsl(var(--muted-foreground))]">
        Loading trend data...
      </div>
    );
  }

  if (trendData.length < 2) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[hsl(var(--primary))]" />
            Patient Trend Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-[hsl(var(--muted-foreground))]">
            <TrendingUp className="h-12 w-12 mb-4 opacity-30" />
            <p className="text-sm font-medium">No trend data yet</p>
            <p className="text-xs mt-2 text-center max-w-sm">
              Trend analysis will be available once this patient has at least two test orders on record.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const latestScore = trendData[trendData.length - 1].score;
  const previousScore = trendData[trendData.length - 2].score;
  const delta = latestScore - previousScore;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-[11px] text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-1">
              Latest Score
            </div>
            <div className="text-2xl font-bold">{Math.round(latestScore)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-[11px] text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-1">
              Change
            </div>
            <div className={`text-2xl font-bold ${delta > 0 ? "text-[#ef4444]" : delta < 0 ? "text-[#22c55e]" : ""}`}>
              {delta > 0 ? "+" : ""}{Math.round(delta)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-[11px] text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-1">
              Tests
            </div>
            <div className="text-2xl font-bold">{trendData.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[hsl(var(--primary))]" />
            Risk Score Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trendData} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value: number) => [`${Math.round(value)}%`, "Risk Score"]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <ReferenceLine y={65} stroke="#ef4444" strokeDasharray="3 3" label={{ value: "High Risk", fontSize: 10, fill: "#ef4444" }} />
              <ReferenceLine y={35} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: "Moderate", fontSize: 10, fill: "#f59e0b" }} />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#e91e8c"
                strokeWidth={2.5}
                dot={{ fill: "#e91e8c", r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
