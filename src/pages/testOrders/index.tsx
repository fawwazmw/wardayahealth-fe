import React, { useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTable } from "@refinedev/antd";
import { Table, Modal, message } from "antd";
import dayjs from "dayjs";
import debounce from "lodash/debounce";
import {
  ClipboardList,
  Search,
  PlusCircle,
  FileDown,
  UploadCloud,
  Download,
  Trash2,
  ScanLine,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { API_URL } from "../../providers/authProvider";
import { generateMirlungReport, type MirlungReportData } from "@/utils/generateMirlungReport";

interface ITestOrder {
  id: number;
  test_case_id: string;
  patient_name: string;
  physician_name: string;
  requester: string | null;
  specimen_type: string;
  priority: string;
  workflow_status: string;
  report_status: string;
  risk_category: string | null;
  skh_label: string | null;
  report_download_pdf: string | null;
  report_download_hl7: string | null;
  mirlung_score: number | null;
  id_number: string | null;
  patient_sex: string | null;
  patient_nationality: string | null;
  created_at: string;
}

function getStatusVariant(status: string): "success" | "default" | "warning" | "secondary" {
  if (!status) return "secondary";
  const normalized = status.toLowerCase().trim();
  if (normalized === "completed" || normalized === "results available") return "success";
  if (normalized === "in progress") return "default";
  if (normalized === "pending") return "warning";
  return "secondary";
}

function getRiskVariant(risk: string | null): "success" | "warning" | "destructive" | "secondary" {
  if (!risk) return "secondary";
  const lower = risk.toLowerCase();
  if (lower.includes("high")) return "destructive";
  if (lower.includes("moderate") || lower.includes("intermediate")) return "warning";
  if (lower.includes("low")) return "success";
  return "secondary";
}

export const TestOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  const { tableProps } = useTable<ITestOrder>({
    resource: "clinical-diagnostics",
    syncWithLocation: false,
  });

  const applySearch = useRef(
    debounce((value: string) => setActiveSearch(value), 300)
  ).current;

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    applySearch(value);
  };

  const displayData = useMemo(() => {
    const source = Array.isArray(tableProps.dataSource) ? tableProps.dataSource : [];
    if (!activeSearch.trim()) return source;
    const term = activeSearch.toLowerCase();
    return source.filter(
      (item) =>
        item.patient_name?.toLowerCase().includes(term) ||
        item.test_case_id?.toLowerCase().includes(term) ||
        item.requester?.toLowerCase().includes(term)
    );
  }, [tableProps.dataSource, activeSearch]);

  const handleDelete = (record: ITestOrder) => {
    Modal.confirm({
      title: "Delete this record?",
      content: `This will delete the test order for ${record.patient_name}.`,
      okText: "Delete",
      okButtonProps: { danger: true },
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(
            `${API_URL}/clinical-diagnostics/${record.id}`,
            { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
          );
          if (!response.ok) throw new Error("Failed to delete");
          message.success("Record deleted");
          window.location.reload();
        } catch {
          message.error("Failed to delete record");
        }
      },
    });
  };

  const handleExportCsv = () => {
    const data = displayData;
    if (data.length === 0) return;

    const headers = [
      "Patient Name", "Test Case ID", "Physician", "Specimen Type",
      "Status", "Requester", "mirLung Score", "Risk Category",
      "SKH Prediction", "Created At",
    ];
    const keys = [
      "patient_name", "test_case_id", "physician_name", "specimen_type",
      "report_status", "requester", "mirlung_score", "risk_category",
      "skh_label", "created_at",
    ];

    const csvRows = [headers.join(",")];
    for (const row of data) {
      const values = keys.map((k) => {
        const val = String((row as unknown as Record<string, unknown>)[k] ?? "");
        return val.includes(",") ? `"${val}"` : val;
      });
      csvRows.push(values.join(","));
    }

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "test_orders_export.csv";
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    a.remove();
    message.success(`Exported ${data.length} records`);
  };

  const handleFileDownload = (fileUrl: string, fileName: string) => {
    const token = localStorage.getItem("token");
    fetch(fileUrl, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => {
        if (!r.ok) throw new Error("Failed to download");
        return r.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      })
      .catch(() => message.error("Failed to download file"));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[hsl(var(--foreground))]">
              Test Orders
            </h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Manage diagnostic test orders and lab results
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" onClick={handleExportCsv} className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => navigate("/clinical-diagnostics/scan-document")} className="gap-2">
            <ScanLine className="h-4 w-4" />
            Scan Document
          </Button>
          <Button variant="outline" onClick={() => navigate("/clinical-diagnostics/batch-upload")} className="gap-2">
            <UploadCloud className="h-4 w-4" />
            Batch Upload
          </Button>
          <Button onClick={() => navigate("/clinical-diagnostics/create")} className="gap-2">
            <PlusCircle className="h-4 w-4" />
            New Test Order
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
            <Input
              type="text"
              placeholder="Search by patient, case ID, or requester..."
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Orders</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="[&_.ant-table]:!border-none [&_.ant-table-thead>tr>th]:bg-[hsl(var(--muted))]/50 [&_.ant-table-thead>tr>th]:text-[hsl(var(--muted-foreground))] [&_.ant-table-thead>tr>th]:font-medium [&_.ant-table-thead>tr>th]:text-xs [&_.ant-table-thead>tr>th]:uppercase [&_.ant-table-thead>tr>th]:tracking-wider">
            <Table
              {...tableProps}
              dataSource={displayData}
              rowKey="id"
              size="middle"
              scroll={{ x: "max-content" }}
              onRow={(record) => ({
                onClick: () => navigate(`/results/show/${record.id}`),
                className: "cursor-pointer",
              })}
            >
              <Table.Column
                dataIndex="test_case_id"
                title="Order ID"
                render={(v: string) => (
                  <code className="text-xs font-mono font-semibold">{v || "—"}</code>
                )}
              />
              <Table.Column
                dataIndex="patient_name"
                title="Patient"
                render={(v: string) => (
                  <span className="font-medium">{v || "—"}</span>
                )}
              />
              <Table.Column
                dataIndex="report_status"
                title="Status"
                render={(v: string) => (
                  <Badge variant={getStatusVariant(v)}>
                    {v || "Pending"}
                  </Badge>
                )}
              />
              <Table.Column
                dataIndex="risk_category"
                title="mirLung Risk"
                render={(v: string | null) => (
                  v ? <Badge variant={getRiskVariant(v)}>{v}</Badge> : <span className="text-xs text-[hsl(var(--muted-foreground))]">—</span>
                )}
              />
              <Table.Column
                dataIndex="skh_label"
                title="SKH Prediction"
                render={(v: string | null) => {
                  if (!v) return <span className="text-xs text-[hsl(var(--muted-foreground))]">—</span>;
                  return (
                    <Badge variant={v === "positive" ? "destructive" : "success"}>
                      {v === "positive" ? "Positive" : "Negative"}
                    </Badge>
                  );
                }}
              />
              <Table.Column
                dataIndex="created_at"
                title="Date"
                render={(v: string) => (
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">
                    {v ? dayjs(v).format("DD MMM YYYY") : "—"}
                  </span>
                )}
              />
              <Table.Column
                title="Actions"
                width={120}
                render={(_: unknown, record: ITestOrder) => (
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      title="Export GE002 Report"
                      onClick={async () => {
                        const mirlungScore = record.mirlung_score != null ? Number(record.mirlung_score) : 0;
                        const reportData: MirlungReportData = {
                          reportId: record.test_case_id || "N/A",
                          patientName: record.patient_name || "Unknown",
                          patientId: record.id_number || "N/A",
                          sex: record.patient_sex || "N/A",
                          dateOfBirth: "N/A",
                          nationality: record.patient_nationality || "N/A",
                          orderingPhysician: record.physician_name || "N/A",
                          facility: record.requester || "N/A",
                          dateBloodCollected: "N/A",
                          dateOfReport: dayjs().format("DD-MMM-YY"),
                          mirlungScore,
                          riskCategory: mirlungScore >= 50 ? "HIGH RISK" : "LOW RISK",
                        };
                        const blob = await generateMirlungReport(reportData);
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `${record.test_case_id}_Medical_Report_GE002.pdf`;
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        URL.revokeObjectURL(url);
                      }}
                    >
                      <FileDown className="h-3.5 w-3.5" />
                    </Button>
                    {record.report_download_pdf && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-400 hover:text-red-500"
                        title="Download PDF"
                        onClick={() => handleFileDownload(
                          record.report_download_pdf!,
                          `${record.test_case_id}_report.pdf`
                        )}
                      >
                        <FileDown className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/10"
                      title="Delete"
                      onClick={() => handleDelete(record)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              />
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestOrdersPage;
