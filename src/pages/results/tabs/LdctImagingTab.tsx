import React, { Suspense } from "react";
import dayjs from "dayjs";
import { Scan, MapPin, Ruler, Calendar } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NoduleViewer3D } from "@/components/NoduleViewer3D";

interface Props {
  record: Record<string, unknown>;
}

function getLungRadsClass(noduleSizeMm: number | null): { label: string; color: string } {
  if (noduleSizeMm === null) return { label: "N/A", color: "#9ca3af" };
  if (noduleSizeMm < 6) return { label: "Lung-RADS 2", color: "#22c55e" };
  if (noduleSizeMm <= 8) return { label: "Lung-RADS 3", color: "#f59e0b" };
  if (noduleSizeMm <= 15) return { label: "Lung-RADS 4A", color: "#f97316" };
  return { label: "Lung-RADS 4B", color: "#ef4444" };
}

export const LdctImagingTab: React.FC<Props> = ({ record }) => {
  const noduleSize = record.nodule_size_mm != null ? Number(record.nodule_size_mm) : null;
  const lungRads = getLungRadsClass(noduleSize);
  const hasData = noduleSize !== null || record.nodule_type || record.nodule_lobe;

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-[hsl(var(--muted-foreground))]">
        <Scan className="h-12 w-12 mb-4 opacity-30" />
        <p className="text-sm font-medium">No LDCT imaging data available</p>
        <p className="text-xs mt-1">Upload CT scan data to see nodule details</p>
      </div>
    );
  }

  const volume = noduleSize ? ((4 / 3) * Math.PI * Math.pow(noduleSize / 2, 3)).toFixed(1) : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Scan className="h-4 w-4 text-[hsl(var(--primary))]" />
              LDCT Classification
            </CardTitle>
            <Badge
              className="text-xs font-semibold"
              style={{ backgroundColor: lungRads.color, color: "white" }}
            >
              {lungRads.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[hsl(var(--muted))]/50">
              <Ruler className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
              <div>
                <div className="text-[11px] text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Nodule Size</div>
                <div className="text-lg font-bold">{noduleSize ?? "—"} mm</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[hsl(var(--muted))]/50">
              <Calendar className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
              <div>
                <div className="text-[11px] text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Scan Date</div>
                <div className="text-sm font-semibold">
                  {record.ct_scan_date ? dayjs(record.ct_scan_date as string).format("DD MMM YYYY") : "—"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[hsl(var(--muted))]/50">
              <MapPin className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
              <div>
                <div className="text-[11px] text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Location</div>
                <div className="text-sm font-semibold">{(record.nodule_lobe as string) || "—"}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[hsl(var(--muted))]/50">
              <Scan className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
              <div>
                <div className="text-[11px] text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Morphology</div>
                <div className="text-sm font-semibold">{(record.nodule_type as string) || "—"}</div>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <div className="text-[11px] text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-1">Additional</div>
            <div className="flex gap-3 text-sm">
              <span>Nodules: <strong>{record.number_of_nodules ?? "—"}</strong></span>
              <span>Spiculation: <strong>{record.spiculation === true ? "Yes" : record.spiculation === false ? "No" : "—"}</strong></span>
              <span>Emphysema: <strong>{record.emphysema === true ? "Yes" : record.emphysema === false ? "No" : "—"}</strong></span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">3D Nodule Visualization</CardTitle>
            {volume && (
              <span className="text-xs text-[hsl(var(--muted-foreground))]">
                Vol: {volume} mm³
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="h-[280px] flex items-center justify-center text-sm text-[hsl(var(--muted-foreground))]">Loading 3D viewer...</div>}>
            <NoduleViewer3D
              sizeMm={noduleSize ?? 10}
              type={(record.nodule_type as string) || "Solid"}
              lobe={(record.nodule_lobe as string) || "Unknown"}
              riskColor={lungRads.color}
            />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
};
