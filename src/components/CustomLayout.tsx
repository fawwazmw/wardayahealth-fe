import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLogout, useGetIdentity } from "@refinedev/core";
import {
  LayoutDashboard,
  HeartPulse,
  ClipboardList,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { key: "/", icon: LayoutDashboard, label: "Dashboard" },
  { key: "/test-orders", icon: ClipboardList, label: "Test Orders" },
  { key: "/results", icon: BarChart3, label: "Results" },
];

const pageLabels: Record<string, string> = {
  "/": "Dashboard",
  "/test-orders": "Test Orders",
  "/results": "Results",
  "/clinical-diagnostics": "Clinical Diagnostics",
  "/clinical-diagnostics/create": "New Test Order",
  "/clinical-diagnostics/batch-upload": "Batch Upload",
  "/clinical-diagnostics/scan-document": "Scan Document",
  "/profile": "Profile Settings",
};

function getPageLabel(pathname: string): string {
  if (pageLabels[pathname]) return pageLabels[pathname];
  if (pathname.includes("/results/show/")) return "Test Result";
  if (pathname.includes("/edit/")) return "Edit Lab Test";
  if (pathname.includes("/show/")) return "Lab Test Details";
  return "Wardayahealth";
}

export const CustomLayout: React.FC<CustomLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { mutate: logout } = useLogout();
  const { data: user } = useGetIdentity<{ fullName?: string; email?: string }>();

  const sidebarWidth = collapsed ? 64 : 256;

  return (
    <div
      className="flex min-h-screen"
      style={{
        backgroundColor: "hsl(var(--background))",
        backgroundImage:
          "radial-gradient(circle at 0% 0%, rgba(64, 194, 168, 0.12), transparent 26%), radial-gradient(circle at 100% 0%, rgba(215, 179, 91, 0.1), transparent 18%)",
      }}
    >
      {/* Sidebar */}
      <aside
        className="fixed left-0 top-0 bottom-0 z-40 flex flex-col transition-all duration-200 overflow-hidden"
        style={{
          width: sidebarWidth,
          backgroundColor: "hsl(var(--sidebar-bg))",
          borderRight: "1px solid hsl(var(--sidebar-border))",
          boxShadow: "24px 0 80px rgba(0, 0, 0, 0.18)",
          backdropFilter: "blur(16px)",
        }}
      >
        {/* Logo + toggle */}
        <div
          className="flex items-center justify-between px-4 flex-shrink-0"
          style={{
            height: 64,
            borderBottom: "1px solid hsl(var(--sidebar-border))",
          }}
        >
          {!collapsed && (
            <div className="flex items-center gap-2 overflow-hidden">
              <div
                className="flex items-center justify-center rounded-lg flex-shrink-0"
                style={{
                  width: 32,
                  height: 32,
                  background:
                    "linear-gradient(135deg, rgba(64,194,168,1) 0%, rgba(35,140,126,1) 100%)",
                  boxShadow: "0 8px 24px rgba(64, 194, 168, 0.28)",
                }}
              >
                <HeartPulse size={16} color="white" />
              </div>
              <div>
                <div className="text-sm font-bold leading-tight font-brand" style={{ color: "hsl(var(--sidebar-text))" }}>
                  Wardayahealth
                </div>
                <div className="text-[10px] font-medium tracking-[0.22em] uppercase" style={{ color: "hsl(var(--sidebar-muted))" }}>
                  Care Operations
                </div>
              </div>
            </div>
          )}
          {collapsed && (
            <div
              className="flex items-center justify-center rounded-lg mx-auto"
              style={{
                width: 32,
                height: 32,
                background:
                  "linear-gradient(135deg, rgba(64,194,168,1) 0%, rgba(35,140,126,1) 100%)",
              }}
            >
              <HeartPulse size={16} color="white" />
            </div>
          )}
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="flex items-center justify-center rounded-md transition-colors"
              style={{
                width: 28,
                height: 28,
                color: "hsl(var(--sidebar-muted))",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "hsl(var(--sidebar-text))")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "hsl(var(--sidebar-muted))")}
            >
              <ChevronLeft size={16} />
            </button>
          )}
        </div>

        {/* Expand button when collapsed */}
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="flex items-center justify-center mx-auto mt-3 rounded-md transition-colors"
            style={{
              width: 36,
              height: 28,
              color: "hsl(var(--sidebar-muted))",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "hsl(var(--sidebar-text))")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "hsl(var(--sidebar-muted))")}
          >
            <ChevronRight size={16} />
          </button>
        )}

        {/* Nav items */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ key, icon: Icon, label }) => {
            const isActive =
              key === "/" ? location.pathname === "/" : location.pathname.startsWith(key);
            return (
              <Link
                key={key}
                to={key}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  collapsed && "justify-center px-2"
                )}
                style={{
                  color: isActive ? "hsl(var(--sidebar-text))" : "hsl(var(--sidebar-muted))",
                  backgroundColor: isActive ? "hsl(var(--sidebar-active))" : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "hsl(var(--sidebar-hover))";
                    e.currentTarget.style.color = "hsl(var(--sidebar-text))";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "hsl(var(--sidebar-muted))";
                  }
                }}
                title={collapsed ? label : undefined}
              >
                <Icon size={18} className="flex-shrink-0" />
                {!collapsed && <span className="truncate">{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom user + logout */}
        <div
          className="flex-shrink-0 px-2 pb-4"
          style={{ borderTop: "1px solid hsl(var(--sidebar-border))", paddingTop: 12 }}
        >
          {!collapsed && user && (
            <Link
              to="/profile"
              className="flex items-center gap-2 px-3 py-2 mb-1 rounded-lg transition-colors cursor-pointer"
              style={{ backgroundColor: "hsl(var(--sidebar-active))" }}
              title="Profile Settings"
            >
              <div
                className="flex items-center justify-center rounded-full flex-shrink-0 text-xs font-semibold"
                style={{ width: 28, height: 28, backgroundColor: "hsl(var(--sidebar-accent))", color: "white" }}
              >
                {(user.fullName || user.email || "U").charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden flex-1">
                <div className="text-xs font-semibold truncate" style={{ color: "hsl(var(--sidebar-text))" }}>
                  {user.fullName || "User"}
                </div>
                <div className="text-[11px] truncate" style={{ color: "hsl(var(--sidebar-muted))" }}>
                  {user.email}
                </div>
              </div>
            </Link>
          )}
          <button
            onClick={() => logout()}
            className={cn(
              "flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm transition-colors",
              collapsed && "justify-center px-2"
            )}
            style={{ color: "hsl(var(--sidebar-muted))" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#f2bf66";
              e.currentTarget.style.backgroundColor = "rgba(242,191,102,0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "hsl(var(--sidebar-muted))";
              e.currentTarget.style.backgroundColor = "transparent";
            }}
            title={collapsed ? "Logout" : undefined}
          >
            <LogOut size={16} className="flex-shrink-0" />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div
        className="flex flex-col flex-1 min-w-0 transition-all duration-200"
        style={{ marginLeft: sidebarWidth }}
      >
        {/* Top bar */}
        <header
          className="sticky top-0 z-30 flex items-center justify-between px-6"
          style={{
            height: 64,
            backgroundColor: "rgba(10, 24, 21, 0.72)",
            borderBottom: "1px solid hsl(var(--border))",
            backdropFilter: "blur(16px)",
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[hsl(var(--foreground))]">
              {getPageLabel(location.pathname)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {!collapsed && (
              <div className="hidden md:inline-flex items-center rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-[hsl(var(--muted-foreground))]" style={{ borderColor: "hsl(var(--border))" }}>
                Clinical Intelligence
              </div>
            )}
            <div
              className="flex items-center justify-center rounded-full text-xs font-semibold cursor-default"
              style={{
                width: 32,
                height: 32,
                background:
                  "linear-gradient(135deg, rgba(64,194,168,1) 0%, rgba(35,140,126,1) 100%)",
                color: "white",
              }}
              title={user?.email}
            >
              {user ? (user.fullName || user.email || "U").charAt(0).toUpperCase() : <User size={14} />}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
