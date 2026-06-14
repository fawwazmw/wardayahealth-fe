import { useTable, EditButton, ShowButton } from "@refinedev/antd";
import { Table, Space, Modal, message, Empty } from "antd";
import dayjs from "dayjs";
import { API_URL } from "../../providers/authProvider";
import { useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import debounce from "lodash/debounce";
import {
  Search,
  Trash2,
  UploadCloud,
  PlusCircle,
  FileDown,
  Eye as EyeIcon,
  FlaskConical,
  AlertCircle,
  ScanLine,
  Download,
} from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ILabTest {
  id: number;
  patient_name: string;
  test_case_id: string;
  physician_name: string;
  disease: string;
  specimen_type: string;
  report_status: string;
  report_download_pdf: string;
  report_download_hl7: string;
  requester?: string;
  test_request_reference_number?: string;
  created_at: string;
  updated_at: string;
}

function getStatusVariant(
  status: string | undefined
): "success" | "default" | "warning" | "secondary" {
  if (!status) return "secondary";
  const normalized = status.toLowerCase().trim();
  if (normalized === "completed") return "success";
  if (normalized === "in progress") return "default";
  if (normalized === "pending") return "warning";
  if (normalized === "results available") return "secondary";
  return "secondary";
}

function formatStatus(status: string | undefined): string {
  if (!status) return "Unknown";
  return status
    .split(/[\s_-]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export const LabTestList = () => {
  const [searchValue, setSearchValue] = useState<string>("");
  const [activeSearch, setActiveSearch] = useState<string>("");
  const navigate = useNavigate();
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);

  const { tableProps } = useTable<ILabTest>({
    resource: "clinical-diagnostics",
    syncWithLocation: false,
  });

  // Client-side filter on the current page data
  const displayData = useMemo(() => {
    const source = Array.isArray(tableProps.dataSource)
      ? tableProps.dataSource
      : [];
    if (!activeSearch.trim()) return source;
    const term = activeSearch.toLowerCase();
    return source.filter(
      (item) =>
        item.patient_name?.toLowerCase().includes(term) ||
        item.test_case_id?.toLowerCase().includes(term) ||
        item.test_request_reference_number?.toLowerCase().includes(term) ||
        item.requester?.toLowerCase().includes(term)
    );
  }, [tableProps.dataSource, activeSearch]);

  const applySearch = useRef(
    debounce((value: string) => {
      setActiveSearch(value);
    }, 300)
  ).current;

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    applySearch(value);
  };

  const handleDelete = (record: ILabTest) => {
    Modal.confirm({
      title: "Delete this record?",
      content: `This will delete the lab test for ${record.patient_name}.`,
      okText: "Delete",
      okButtonProps: { danger: true },
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(
            `${API_URL}/clinical-diagnostics/${record.id}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (!response.ok) throw new Error("Failed to delete record");
          message.success("Record deleted");
          window.location.reload();
        } catch {
          message.error("Failed to delete record");
        }
      },
    });
  };

  const handleDeleteSelected = () => {
    Modal.confirm({
      title: `Delete ${selectedRowKeys.length} record(s)?`,
      content: "This action cannot be undone.",
      okText: "Delete",
      okButtonProps: { danger: true },
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const token = localStorage.getItem("token");
          await Promise.all(
            selectedRowKeys.map((id) =>
              fetch(`${API_URL}/clinical-diagnostics/${id}`, {
                method: "DELETE",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              })
            )
          );
          message.success("Records deleted");
          setSelectedRowKeys([]);
          window.location.reload();
        } catch {
          message.error("Failed to delete records");
        }
      },
    });
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

  const handleExportCsv = () => {
    const data = Array.isArray(tableProps.dataSource) ? tableProps.dataSource : [];
    if (data.length === 0) return;

    const headers = ["Patient Name", "Test Case ID", "Physician", "Specimen Type", "Status", "Requester", "Reference Number", "Created At"];
    const keys = ["patient_name", "test_case_id", "physician_name", "specimen_type", "report_status", "requester", "test_request_reference_number", "created_at"];

    const csvRows = [headers.join(",")];
    for (const row of data) {
      const values = keys.map(k => {
        const val = String((row as Record<string, unknown>)[k] ?? "");
        return val.includes(",") ? `"${val}"` : val;
      });
      csvRows.push(values.join(","));
    }

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "clinical_diagnostics_export.csv";
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    a.remove();
  };

  const modifiedTableProps = { ...tableProps, dataSource: displayData };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              "bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]"
            )}
          >
            <FlaskConical className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[hsl(var(--foreground))]">
              Clinical Diagnostics
            </h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Manage and review all laboratory test records
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleExportCsv}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/clinical-diagnostics/scan-document")}
            className="gap-2"
          >
            <ScanLine className="h-4 w-4" />
            Scan Document
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/clinical-diagnostics/batch-upload")}
            className="gap-2"
          >
            <UploadCloud className="h-4 w-4" />
            Batch Upload
          </Button>
          <Button onClick={() => navigate("/clinical-diagnostics/create")} className="gap-2">
            <PlusCircle className="h-4 w-4" />
            New Lab Test
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
            <Input
              type="text"
              placeholder="Search by patient name, case ID, or reference number..."
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 max-w-md"
            />
          </div>
        </CardContent>
      </Card>

      {/* Bulk Delete Bar */}
      {selectedRowKeys.length > 0 && (
        <Card
          className={cn(
            "border-[hsl(var(--destructive))]/30",
            "bg-[hsl(var(--destructive))]/5"
          )}
        >
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2 text-sm text-[hsl(var(--destructive))]">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">
                {selectedRowKeys.length} record
                {selectedRowKeys.length > 1 ? "s" : ""} selected
              </span>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteSelected}
            >
              <Trash2 className="h-4 w-4" />
              Delete Selected
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Data Table */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Lab Test Records</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!Array.isArray(tableProps.dataSource) && !tableProps.loading ? (
            <div className="flex items-center justify-center p-16">
              <Empty description="No data available. Please try again later." />
            </div>
          ) : (
            <div className="[&_.ant-table]:!border-none [&_.ant-table-thead>tr>th]:bg-[hsl(var(--muted))]/50 [&_.ant-table-thead>tr>th]:text-[hsl(var(--muted-foreground))] [&_.ant-table-thead>tr>th]:font-medium [&_.ant-table-thead>tr>th]:text-xs [&_.ant-table-thead>tr>th]:uppercase [&_.ant-table-thead>tr>th]:tracking-wider [&_.ant-table-tbody>tr:hover>td]:bg-[hsl(var(--muted))]/30 [&_.ant-table-wrapper]:overflow-hidden [&_.ant-table-container]:!rounded-none [&_.ant-table-cell]:border-[hsl(var(--border))]">
              <Table
                {...modifiedTableProps}
                rowKey="id"
                rowSelection={{
                  selectedRowKeys,
                  onChange: (keys) => setSelectedRowKeys(keys as number[]),
                }}
                size="middle"
                scroll={{ x: "max-content" }}
              >
                <Table.Column
                  dataIndex="patient_name"
                  title="Patient Name"
                  render={(v: string) => (
                    <span className="font-medium text-[hsl(var(--foreground))]">
                      {v || "\u2014"}
                    </span>
                  )}
                />
                <Table.Column
                  dataIndex="requester"
                  title="Requester"
                  render={(v: string) => (
                    <span className="text-sm text-[hsl(var(--muted-foreground))]">
                      {v || "\u2014"}
                    </span>
                  )}
                />
                <Table.Column
                  dataIndex="test_request_reference_number"
                  title="Reference Number"
                  render={(v: string) => (
                    <code className="rounded bg-[hsl(var(--muted))] px-1.5 py-0.5 font-mono text-xs text-[hsl(var(--muted-foreground))]">
                      {v || "\u2014"}
                    </code>
                  )}
                />
                <Table.Column
                  dataIndex="specimen_type"
                  title="Specimen Type"
                  render={(v: string) => (
                    <span className="text-sm">{v || "\u2014"}</span>
                  )}
                />
                <Table.Column
                  dataIndex="report_status"
                  title="Status"
                  render={(v: string) => (
                    <Badge variant={getStatusVariant(v)}>
                      {formatStatus(v)}
                    </Badge>
                  )}
                />
                <Table.Column
                  title="Reports"
                  render={(_: unknown, record: ILabTest) => (
                    <Space size={4}>
                      {record.report_download_pdf ? (
                        <Space size={2}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-[hsl(var(--destructive))] hover:text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/10"
                            onClick={() =>
                              handleFileDownload(
                                record.report_download_pdf,
                                `${record.test_case_id}_report.pdf`
                              )
                            }
                          >
                            <FileDown className="h-3.5 w-3.5" />
                            PDF
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={async () => {
                              try {
                                const token = localStorage.getItem("token");
                                const res = await fetch(record.report_download_pdf, {
                                  headers: { Authorization: `Bearer ${token}` },
                                });
                                if (!res.ok) throw new Error("Failed to load PDF");
                                const blob = await res.blob();
                                const blobUrl = URL.createObjectURL(blob);
                                window.open(blobUrl, "_blank");
                                setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
                              } catch {
                                message.error("Failed to open PDF");
                              }
                            }}
                          >
                            <EyeIcon className="h-3.5 w-3.5" />
                            View
                          </Button>
                        </Space>
                      ) : (
                        <span className="text-xs text-[hsl(var(--muted-foreground))]">
                          No PDF
                        </span>
                      )}
                      {record.report_download_hl7 ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() =>
                            handleFileDownload(
                              record.report_download_hl7,
                              `${record.test_case_id}_report.hl7`
                            )
                          }
                        >
                          <FileDown className="h-3.5 w-3.5" />
                          HL7
                        </Button>
                      ) : (
                        <span className="text-xs text-[hsl(var(--muted-foreground))]">
                          No HL7
                        </span>
                      )}
                    </Space>
                  )}
                />
                <Table.Column
                  dataIndex="created_at"
                  title="Date Created"
                  render={(v: string) => (
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">
                      {v ? dayjs(v).format("DD MMM YYYY, h:mm A") : "\u2014"}
                    </span>
                  )}
                />
                <Table.Column
                  title="Actions"
                  fixed="right"
                  render={(_: unknown, record: ILabTest) => (
                    <Space size={4}>
                      <EditButton
                        hideText
                        size="small"
                        recordItemId={record.id}
                      />
                      <ShowButton
                        hideText
                        size="small"
                        recordItemId={record.id}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/10"
                        onClick={() => handleDelete(record)}
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </Space>
                  )}
                />
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export { LabTestList as PostList };
export default LabTestList;
