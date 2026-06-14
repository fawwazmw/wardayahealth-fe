import React, { useEffect, useState } from "react";
import { useGetIdentity } from "@refinedev/core";
import { axiosInstance } from "../../providers/authProvider";
import {
  HeartPulse,
  Clock,
  CheckCircle2,
  TrendingUp,
  Activity,
  Timer,
  Dna,
  AlertCircle,
  Loader2,
  Globe,
  Building2,
  Users,
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { WorldMap } from "@/components/WorldMap";

dayjs.extend(relativeTime);

interface DashboardStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  resultsAvailable: number;
  recentActivity: {
    id: string;
    patient: string;
    status: string;
    createdAt: string;
  }[];
}

interface CountryData {
  id: number;
  code: string;
  name: string;
  hospitalCount: number;
  patientCount: number;
  hospitals: { id: number; name: string; patientCount: number }[];
}

const StatCard: React.FC<{
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  trend?: string;
  loading?: boolean;
}> = ({ label, value, icon, iconBg, iconColor, trend, loading }) => (
  <div
    className="flex flex-col gap-4 rounded-[24px] border p-5"
    style={{
      backgroundColor: "rgba(15, 29, 26, 0.78)",
      borderColor: "hsl(var(--border))",
      boxShadow: "0 18px 48px rgba(0, 0, 0, 0.14)",
      backdropFilter: "blur(12px)",
    }}
  >
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-[hsl(var(--muted-foreground))]">{label}</span>
      <div
        className="flex items-center justify-center rounded-lg"
        style={{ width: 36, height: 36, backgroundColor: iconBg, color: iconColor }}
      >
        {icon}
      </div>
    </div>
    <div>
      {loading ? (
        <div className="h-8 w-16 rounded animate-pulse" style={{ backgroundColor: "hsl(225 15% 18%)" }} />
      ) : (
        <div className="text-2xl font-bold text-[hsl(var(--foreground))]">{value}</div>
      )}
      {trend && <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{trend}</div>}
    </div>
  </div>
);

const statusStyles: Record<string, { bg: string; text: string; dot: string }> = {
  Completed: { bg: "#f0fdf4", text: "#15803d", dot: "#22c55e" },
  "In Progress": { bg: "#eff6ff", text: "#1d4ed8", dot: "#3b82f6" },
  Pending: { bg: "#fffbeb", text: "#b45309", dot: "#f59e0b" },
  "Results Available": { bg: "#f0fdf4", text: "#15803d", dot: "#10b981" },
};

export const Dashboard: React.FC = () => {
  const { data: user } = useGetIdentity<{ fullName?: string; email?: string }>();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [statsRes, countriesRes] = await Promise.all([
          axiosInstance.get("/clinical-diagnostics/stats"),
          axiosInstance.get("/countries").catch(() => ({ data: [] })),
        ]);
        if (!cancelled) {
          setStats(statsRes.data);
          setCountries(countriesRes.data);
        }
      } catch {
        if (!cancelled) {
          setError("Unable to load Wardayahealth dashboard data.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, []);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();

  const total = stats?.total ?? 0;
  const completed = stats?.completed ?? 0;
  const successRate = total > 0 ? ((completed / total) * 100).toFixed(1) : "0.0";
  const pendingReview = (stats?.pending ?? 0) + (stats?.inProgress ?? 0);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
          {greeting}{user?.fullName ? `, ${user.fullName.split(" ")[0]}` : ""}
        </h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
          Here&apos;s what&apos;s happening across your care operations today.
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 mb-6 px-4 py-3 rounded-lg bg-[#dc2626]/10 border border-[#dc2626]/30 text-sm text-[#fca5a5]">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Test Orders"
          value={total.toLocaleString()}
          icon={<HeartPulse size={18} />}
          iconBg="rgba(64,194,168,0.16)"
          iconColor="#40c2a8"
          loading={loading}
        />
        <StatCard
          label="In Progress"
          value={stats?.inProgress ?? 0}
          icon={<Clock size={18} />}
          iconBg="rgba(104, 169, 255, 0.12)"
          iconColor="#7cb4ff"
          trend={`${stats?.pending ?? 0} pending`}
          loading={loading}
        />
        <StatCard
          label="Completed"
          value={completed.toLocaleString()}
          icon={<CheckCircle2 size={18} />}
          iconBg="rgba(47,177,120,0.12)"
          iconColor="#2fb178"
          trend={`${successRate}% completion rate`}
          loading={loading}
        />
        <StatCard
          label="Results Available"
          value={stats?.resultsAvailable ?? 0}
          icon={<Dna size={18} />}
          iconBg="rgba(215,179,91,0.12)"
          iconColor="#d7b35b"
          loading={loading}
        />
      </div>

      {/* Global Presence */}
      {countries.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Globe size={18} className="text-[hsl(var(--muted-foreground))]" />
            <span className="text-sm font-semibold text-[hsl(var(--foreground))]">Global Presence</span>
          </div>
          <div className="mb-4">
            <WorldMap
              points={countries.map((c) => ({
                code: c.code,
                name: c.name,
                count: c.patientCount,
                hospitals: c.hospitals,
              }))}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {countries.map((country) => {
              const totalPatients = country.patientCount;
              const completionPct = totalPatients > 0 ? Math.min(100, Math.round((totalPatients / 50) * 100)) : 0;
              return (
                <div
                  key={country.id}
                  className="rounded-[24px] border p-5"
                  style={{
                    backgroundColor: "rgba(15, 29, 26, 0.78)",
                    borderColor: "hsl(var(--border))",
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: "rgba(255,255,255,0.04)", color: "hsl(var(--muted-foreground))" }}>
                        {country.code}
                      </span>
                      <span className="text-sm font-semibold text-[hsl(var(--foreground))]">{country.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-[hsl(var(--muted-foreground))] mb-3">
                    <span className="flex items-center gap-1">
                      <Building2 size={12} />
                      {country.hospitalCount} hospitals
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={12} />
                      {totalPatients} patients
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${completionPct}%`,
                        backgroundColor: "#40c2a8",
                      }}
                    />
                  </div>
                  <div className="text-[11px] text-[hsl(var(--muted-foreground))] mt-1">{completionPct}%</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent activity */}
        <div className="lg:col-span-2 rounded-[24px] border" style={{ backgroundColor: "rgba(15, 29, 26, 0.78)", borderColor: "hsl(var(--border))" }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-[hsl(var(--muted-foreground))]" />
              <span className="text-sm font-semibold text-[hsl(var(--foreground))]">Recent Activity</span>
            </div>
          </div>
          <div>
            {loading ? (
              <div className="flex items-center justify-center py-12 text-[hsl(var(--muted-foreground))]">
                <Loader2 size={20} className="animate-spin mr-2" />
                Loading...
              </div>
            ) : stats?.recentActivity && stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((item, i) => {
                const s = statusStyles[item.status] ?? statusStyles["In Progress"];
                return (
                  <div
                    key={`${item.id}-${i}`}
                    className="flex items-center justify-between px-5 py-3.5"
                    style={{ borderBottom: i < stats.recentActivity.length - 1 ? "1px solid hsl(var(--border))" : undefined }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex items-center justify-center rounded-md text-xs font-mono font-semibold"
                        style={{
                          width: 36,
                          height: 36,
                          backgroundColor: "rgba(255,255,255,0.04)",
                          color: "hsl(var(--muted-foreground))",
                          border: "1px solid hsl(var(--border))",
                        }}
                      >
                        {item.id.replace("TC-", "").replace("TC", "").slice(0, 4)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-[hsl(var(--foreground))]">{item.patient}</div>
                        <div className="text-xs text-[hsl(var(--muted-foreground))]">
                          {dayjs(item.createdAt).fromNow()}
                        </div>
                      </div>
                    </div>
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{ backgroundColor: s.bg, color: s.text }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: s.dot }}
                      />
                      {item.status}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="flex items-center justify-center py-12 text-sm text-[hsl(var(--muted-foreground))]">
                No recent activity
              </div>
            )}
          </div>
        </div>

        {/* Quick stats */}
        <div className="rounded-[24px] border" style={{ backgroundColor: "rgba(15, 29, 26, 0.78)", borderColor: "hsl(var(--border))" }}>
          <div className="flex items-center gap-2 px-5 py-4" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
            <TrendingUp size={16} className="text-[hsl(var(--muted-foreground))]" />
            <span className="text-sm font-semibold text-[hsl(var(--foreground))]">Quick Stats</span>
          </div>
          <div className="p-5 space-y-5">
            <div className="flex items-center justify-between py-3" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
              <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                <Timer size={15} />
                Completion Rate
              </div>
              <span className="text-sm font-bold" style={{ color: "#15803d" }}>
                {loading ? "..." : `${successRate}%`}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-[hsl(var(--border))]">
              <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                <CheckCircle2 size={15} />
                Results Available
              </div>
              <span className="text-sm font-bold" style={{ color: "#7c3aed" }}>
                {loading ? "..." : stats?.resultsAvailable ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-[hsl(var(--border))]">
              <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                <Dna size={15} />
                Total Tests
              </div>
              <span className="text-sm font-bold text-[hsl(var(--foreground))]">
                {loading ? "..." : total.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                <HeartPulse size={15} />
                Pending Review
              </div>
              <span className="text-sm font-bold" style={{ color: "#1d4ed8" }}>
                {loading ? "..." : pendingReview}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
