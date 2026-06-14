import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, Search, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { axiosInstance } from "@/providers/authProvider";

interface ResultItem {
  id: number;
  test_case_id: string;
  patient_name: string;
  mirlung_score: number | null;
  risk_category: string | null;
  report_status: string;
}

function getRiskColor(risk: string | null): string {
  if (!risk) return "#9ca3af";
  const lower = risk.toLowerCase();
  if (lower.includes("high")) return "#ef4444";
  if (lower.includes("moderate") || lower.includes("intermediate")) return "#f59e0b";
  return "#22c55e";
}

export const ResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await axiosInstance.get("/clinical-diagnostics");
        const all = res.data as ResultItem[];
        setResults(all.filter((r) => r.mirlung_score != null));
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  const filtered = searchValue.trim()
    ? results.filter(
        (r) =>
          r.patient_name?.toLowerCase().includes(searchValue.toLowerCase()) ||
          r.test_case_id?.toLowerCase().includes(searchValue.toLowerCase())
      )
    : results;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]">
          <BarChart3 className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[hsl(var(--foreground))]">
            Results
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            View completed analyses and reports
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
            <Input
              type="text"
              placeholder="Search results..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-[hsl(var(--muted-foreground))]">
          Loading...
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-[hsl(var(--muted-foreground))]">
          <BarChart3 className="h-12 w-12 mb-4 opacity-30" />
          <p className="text-sm">No results available yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((result) => (
            <Card
              key={result.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/results/show/${result.id}`)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <code className="text-xs font-mono text-[hsl(var(--muted-foreground))]">
                      {result.test_case_id}
                    </code>
                    <div className="text-sm font-semibold mt-1">{result.patient_name}</div>
                  </div>
                  <div
                    className="flex items-center justify-center rounded-full text-white text-xs font-bold"
                    style={{
                      width: 44,
                      height: 44,
                      backgroundColor: getRiskColor(result.risk_category),
                    }}
                  >
                    {result.mirlung_score != null ? Math.round(result.mirlung_score) : "—"}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Badge
                    variant={
                      result.risk_category?.toLowerCase().includes("high")
                        ? "destructive"
                        : result.risk_category?.toLowerCase().includes("moderate")
                          ? "warning"
                          : "success"
                    }
                  >
                    {result.risk_category || "Pending"}
                  </Badge>
                  <Button variant="ghost" size="sm" className="text-xs gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResultsPage;
