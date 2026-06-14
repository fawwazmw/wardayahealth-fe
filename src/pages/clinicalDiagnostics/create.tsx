import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Create } from "@refinedev/antd";
import {
  Form,
  Input,
  Select,
  DatePicker,
  Upload,
  Button as AntButton,
  notification,
  Switch,
  Spin,
} from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import MDEditor from "@uiw/react-md-editor";
import { UploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import debounce from "lodash/debounce";
import { generateReportBlob } from "../../utils/generateReport";
import { API_URL, axiosInstance } from "../../providers/authProvider";
import { useNavigate } from "react-router-dom";
import { buildHL7Message } from "../../utils/generateHl7";
import Papa from "papaparse";
import { User, TestTube, FileText } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type ExistingPatient = {
  id: number;
  name: string;
  patient_id_code?: string | null;
  id_number?: string | null;
  sex?: "Male" | "Female" | "Other" | null;
  date_of_birth?: string | null;
  ethnicity?: string | null;
  nationality?: string | null;
  smoking_status?: string | null;
  family_history_lung_cancer?: boolean | null;
  clinical_notes?: string | null;
};

type LabTestFormValues = {
  selected_patient_id?: number;
  patient_name: string;
  test_case_id: string;
  date_of_birth?: dayjs.Dayjs;
  sex?: "Male" | "Female" | "Other";
  physician_name: string;
  disease: string;
  ethnicity: string;
  bm5?: number;
  smoking_status?: string;
  family_history_lung_cancer?: boolean;
  emphysema?: boolean;
  mrn: string;
  sample_reference_number?: string;
  specimen_collected_from: string;
  specimen_type: string;
  specimen_id: string;
  specimen_received?: dayjs.Dayjs;
  reviewer_name?: string;
  test_information: string;
  lab_result_summary: string;
  upload_csv_file?: UploadFile[];
};

const normalizeText = (value?: string | null) => value?.trim().toLowerCase() ?? "";

const getPatientLabel = (patient: ExistingPatient) =>
  `${patient.name} • ${patient.patient_id_code || patient.id_number || `Patient #${patient.id}`}`;

const buildPatientPayload = (values: LabTestFormValues) => ({
  patientIdCode: values.mrn || `P-${Date.now()}`,
  name: values.patient_name,
  sex: values.sex,
  dateOfBirth: values.date_of_birth ? values.date_of_birth.format("YYYY-MM-DD") : undefined,
  ethnicity: values.ethnicity || undefined,
  idNumber: values.mrn || undefined,
  smokingStatus: values.smoking_status || undefined,
  familyHistoryLungCancer: values.family_history_lung_cancer,
  clinicalNotes: values.lab_result_summary || undefined,
});

const matchesExistingPatient = (
  patient: ExistingPatient,
  payload: ReturnType<typeof buildPatientPayload>
) => {
  const patientCode = normalizeText(patient.patient_id_code);
  const patientIdNumber = normalizeText(patient.id_number);
  const payloadCode = normalizeText(payload.patientIdCode);
  const payloadIdNumber = normalizeText(payload.idNumber);

  if (payloadCode && (patientCode === payloadCode || patientIdNumber === payloadCode)) {
    return true;
  }

  if (payloadIdNumber && (patientIdNumber === payloadIdNumber || patientCode === payloadIdNumber)) {
    return true;
  }

  return (
    normalizeText(patient.name) === normalizeText(payload.name) &&
    (!!payload.dateOfBirth && patient.date_of_birth === payload.dateOfBirth)
  );
};

export const LabTestCreate: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm<LabTestFormValues>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patientOptions, setPatientOptions] = useState<ExistingPatient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<ExistingPatient | null>(null);
  const [searchingPatients, setSearchingPatients] = useState(false);

  const fetchPatientOptions = useCallback(async (query: string) => {
    const term = query.trim();
    if (term.length < 2) {
      setSearchingPatients(false);
      setPatientOptions((current) => (selectedPatient ? [selectedPatient, ...current.filter((item) => item.id !== selectedPatient.id)] : []));
      return;
    }

    setSearchingPatients(true);
    try {
      const response = await axiosInstance.get("/patients", {
        params: { search: term, limit: 8 },
      });
      const items = Array.isArray(response.data) ? response.data : [];
      const merged = selectedPatient
        ? [selectedPatient, ...items.filter((item: ExistingPatient) => item.id !== selectedPatient.id)]
        : items;
      setPatientOptions(merged);
    } catch {
      notification.warning({
        message: "Patient Search Failed",
        description: "Could not load existing patients. You can still create a new patient from this form.",
      });
    } finally {
      setSearchingPatients(false);
    }
  }, [selectedPatient]);

  const debouncedPatientSearch = useMemo(
    () => debounce((value: string) => void fetchPatientOptions(value), 300),
    [fetchPatientOptions]
  );

  useEffect(() => {
    return () => {
      debouncedPatientSearch.cancel();
    };
  }, [debouncedPatientSearch]);

  const applyPatientToForm = (patient: ExistingPatient | null) => {
    if (!patient) {
      return;
    }

    form.setFieldsValue({
      selected_patient_id: patient.id,
      patient_name: patient.name,
      date_of_birth: patient.date_of_birth ? dayjs(patient.date_of_birth) : undefined,
      sex: patient.sex ?? undefined,
      ethnicity: patient.ethnicity ?? undefined,
      mrn: patient.id_number || patient.patient_id_code || "",
      smoking_status: patient.smoking_status ?? undefined,
      family_history_lung_cancer: patient.family_history_lung_cancer ?? undefined,
      lab_result_summary:
        form.getFieldValue("lab_result_summary") || patient.clinical_notes || undefined,
    });
  };

  const resolvePatientId = async (values: LabTestFormValues) => {
    if (values.selected_patient_id) {
      return values.selected_patient_id;
    }

    const payload = buildPatientPayload(values);
    const lookupTerm = values.mrn || values.patient_name;

    if (lookupTerm) {
      const response = await axiosInstance.get("/patients", {
        params: { search: lookupTerm, limit: 10 },
      });
      const candidates = Array.isArray(response.data) ? response.data : [];
      const existingMatch = candidates.find((patient: ExistingPatient) =>
        matchesExistingPatient(patient, payload)
      );

      if (existingMatch) {
        return existingMatch.id;
      }
    }

    const createdPatient = await axiosInstance.post("/patients", payload);
    return createdPatient.data.id as number;
  };

  const saveBasicTestOrder = async (values: LabTestFormValues, patientId: number) => {
    const response = await axiosInstance.post("/clinical-diagnostics", {
      patient_id: patientId,
      patient_name: values.patient_name,
      test_case_id: values.test_case_id,
      physician_name: values.physician_name,
      disease: values.disease,
      specimen_type: values.specimen_type,
      specimen_id: values.specimen_id,
      report_status: "Pending",
      date_of_birth: values.date_of_birth?.format("YYYY-MM-DD"),
      sex: values.sex,
      ethnicity: values.ethnicity,
      mrn: values.mrn,
      reviewer_name: values.reviewer_name,
      test_information: values.test_information,
      lab_result_summary: values.lab_result_summary,
      bm5: values.bm5 ? Number(values.bm5) : undefined,
      smoking_status: values.smoking_status,
      family_history_lung_cancer: values.family_history_lung_cancer ? "true" : "false",
      emphysema: values.emphysema ? "true" : "false",
      sample_reference_number: values.sample_reference_number || undefined,
      sample_received_date: values.specimen_received?.format("YYYY-MM-DD"),
      requester: values.specimen_collected_from || "Wardayahealth Clinic",
    });

    if (response.status >= 400) {
      throw new Error("Failed to create test order");
    }
  };

  const saveCsvBackedTestOrder = async (
    values: LabTestFormValues,
    csvFile: File,
    patientId: number
  ) => {
    const csvData: Record<string, string>[] = await new Promise((resolve, reject) => {
      Papa.parse(csvFile, {
        header: true,
        complete: (result) => resolve(result.data as Record<string, string>[]),
        error: (error) => reject(error),
      });
    });

    const testResults = csvData.map((row) => ({
      clinicalannotation: row.Clinical_Annotation || "",
      drug: row.Drug_Name || "",
      gene: row.Gene_Name ? row.Gene_Name.split(",") : [],
      genotype: row.GenoType ? row.GenoType.split(",") : [],
      phenotype: row.PhenoType ? row.PhenoType.split(",") : [],
      toxicity: row.Drug_Response_Toxicity ? row.Drug_Response_Toxicity.split(",") : [],
      dosage: row.Drug_Response_Dosage ? row.Drug_Response_Dosage.split(",") : [],
      efficacy: row.Drug_Response_Efficacy ? row.Drug_Response_Efficacy.split(",") : [],
      evidence: row.Evidence ? row.Evidence.split(",") : [],
    }));

    const uniqueTestResults = testResults.filter((row, index, self) => {
      return (
        index ===
        self.findIndex(
          (item) =>
            item.drug === row.drug &&
            JSON.stringify(item.gene) === JSON.stringify(row.gene) &&
            JSON.stringify(item.genotype) === JSON.stringify(row.genotype) &&
            JSON.stringify(item.phenotype) === JSON.stringify(row.phenotype) &&
            JSON.stringify(item.toxicity) === JSON.stringify(row.toxicity) &&
            JSON.stringify(item.dosage) === JSON.stringify(row.dosage) &&
            JSON.stringify(item.efficacy) === JSON.stringify(row.efficacy) &&
            JSON.stringify(item.evidence) === JSON.stringify(row.evidence)
        )
      );
    });

    const reportData = {
      patient: {
        "Patient Name": values.patient_name,
        "Date of Birth": values.date_of_birth ? values.date_of_birth.format("YYYY-MM-DD") : null,
        Sex: values.sex,
        MRN: values.mrn,
        Ethnicity: values.ethnicity || "N/A",
      },
      specimen: {
        "Specimen Type": values.specimen_type,
        "Specimen ID": values.specimen_id,
        "Specimen Collected": values.specimen_collected_from || "N/A",
        "Specimen Received": values.specimen_received
          ? values.specimen_received.format("YYYY-MM-DD")
          : null,
      },
      orderedBy: {
        Requester: values.specimen_collected_from || "Wardayahealth Clinic",
        Physician: values.physician_name,
      },
      caseInfo: {
        "Test Case ID": values.test_case_id,
        "Review Status": "Final",
        "Date Accessioned": dayjs().format("YYYY-MM-DD"),
        "Date Reported": dayjs().format("YYYY-MM-DD"),
      },
      test_information: values.test_information,
      lab_result_summary: values.lab_result_summary,
      testResults,
    };

    const pdfBlob = await generateReportBlob(reportData);

    const hl7Message = buildHL7Message({
      patient_name: values.patient_name,
      date_of_birth: values.date_of_birth ? values.date_of_birth.format("YYYY-MM-DD") : null,
      sex: values.sex,
      mrn: values.mrn,
      test_case_id: values.test_case_id,
      specimen_type: values.specimen_type,
      specimen_id: values.specimen_id,
      specimen_collected_from: values.specimen_collected_from,
      specimen_received: values.specimen_received
        ? values.specimen_received.format("YYYY-MM-DD")
        : null,
      test_information: values.test_information,
      lab_result_summary: values.lab_result_summary,
      testResults: uniqueTestResults,
    });

    const hl7Blob = new Blob([hl7Message], { type: "text/plain" });
    const patientName = values.patient_name.replace(/\s+/g, "_");
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("patient_id", String(patientId));
    formData.append("patient_name", values.patient_name);
    formData.append("date_of_birth", values.date_of_birth?.format("YYYY-MM-DD") || "");
    formData.append("sex", values.sex || "");
    formData.append("mrn", values.mrn);
    formData.append("ethnicity", values.ethnicity || "");
    formData.append("specimen_type", values.specimen_type || "");
    formData.append("specimen_id", values.specimen_id || "");
    formData.append("physician_name", values.physician_name);
    formData.append("reviewer_name", values.reviewer_name || "");
    formData.append("test_case_id", values.test_case_id);
    formData.append("disease", values.disease || "");
    formData.append("smoking_status", values.smoking_status || "");
    formData.append(
      "family_history_lung_cancer",
      values.family_history_lung_cancer ? "true" : "false"
    );
    formData.append("emphysema", values.emphysema ? "true" : "false");
    formData.append("sample_reference_number", values.sample_reference_number || "");
    formData.append(
      "sample_received_date",
      values.specimen_received?.format("YYYY-MM-DD") || ""
    );
    formData.append(
      "requester",
      values.specimen_collected_from || "Wardayahealth Clinic"
    );
    formData.append("test_information", values.test_information);
    formData.append("lab_result_summary", values.lab_result_summary);
    formData.append("report_download_pdf", pdfBlob, `${patientName}_Report.pdf`);
    formData.append("report_download_hl7", hl7Blob, `${patientName}_Report.hl7`);

    const response = await fetch(`${API_URL}/clinical-diagnostics`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload files");
    }
  };

  const handleFinish = async (values: LabTestFormValues) => {
    setIsSubmitting(true);

    try {
      const patientId = await resolvePatientId(values);
      const csvFile = values.upload_csv_file?.[0]?.originFileObj as File | undefined;

      if (csvFile) {
        await saveCsvBackedTestOrder(values, csvFile, patientId);
        notification.success({
          message: "Success",
          description: "Test order created and linked to the patient record.",
        });
      } else {
        await saveBasicTestOrder(values, patientId);
        notification.success({
          message: "Success",
          description: "Test order created and patient data saved for reuse.",
        });
      }

      navigate("/test-orders");
    } catch (error: unknown) {
      notification.error({
        message: "Error",
        description: (error instanceof Error ? error.message : null) || "Failed to create test order",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Create
      breadcrumb={false}
      saveButtonProps={{
        onClick: () => form.submit(),
        loading: isSubmitting,
      }}
    >
      <Form form={form} onFinish={handleFinish} layout="vertical">
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
                <Form.Item label="Reuse Existing Patient" name="selected_patient_id">
                  <Select
                    showSearch
                    allowClear
                    placeholder="Search by patient name or MRN"
                    filterOption={false}
                    onSearch={(value) => debouncedPatientSearch(value)}
                    onChange={(value) => {
                      if (!value) {
                        setSelectedPatient(null);
                        return;
                      }

                      const patient =
                        patientOptions.find((option) => option.id === value) || null;
                      setSelectedPatient(patient);
                      applyPatientToForm(patient);
                    }}
                    notFoundContent={
                      searchingPatients ? (
                        <div className="py-2 text-center">
                          <Spin size="small" />
                        </div>
                      ) : (
                        "No patient found. Continue below to create a new patient."
                      )
                    }
                    options={patientOptions.map((patient) => ({
                      label: getPatientLabel(patient),
                      value: patient.id,
                    }))}
                  />
                </Form.Item>

                <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 px-4 py-3 text-sm text-[hsl(var(--muted-foreground))]">
                  Select an existing patient to reuse demographics, or leave this blank and the
                  form will create the patient automatically when you save the test order.
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <User className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                  Patient & Test Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 pt-0">
                <Form.Item
                  label="Patient Name"
                  name="patient_name"
                  rules={[{ required: true, message: "Patient Name is required" }]}
                >
                  <Input placeholder="Example: John Doe" />
                </Form.Item>
                <Form.Item
                  label="Test Case ID"
                  name="test_case_id"
                  rules={[{ required: true, message: "Test Case ID is required" }]}
                >
                  <Input placeholder="Example: TC-001" />
                </Form.Item>
                <Form.Item
                  label="Date of Birth"
                  name="date_of_birth"
                  rules={[{ required: true, message: "Date of Birth is required" }]}
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    format="YYYY-MM-DD"
                    placeholder="Choose date"
                  />
                </Form.Item>
                <Form.Item
                  label="Sex"
                  name="sex"
                  rules={[{ required: true, message: "Sex is required" }]}
                >
                  <Select
                    placeholder="Choose gender"
                    options={[
                      { label: "Male", value: "Male" },
                      { label: "Female", value: "Female" },
                      { label: "Other", value: "Other" },
                    ]}
                  />
                </Form.Item>
                <Form.Item
                  label="Physician Name"
                  name="physician_name"
                  rules={[{ required: true, message: "Physician Name is required" }]}
                >
                  <Input placeholder="Example: Dr Ong" />
                </Form.Item>
                <Form.Item
                  label="Disease"
                  name="disease"
                  rules={[{ required: true, message: "Disease is required" }]}
                >
                  <Input placeholder="Example: Lung Nodule Risk Stratification" />
                </Form.Item>
                <Form.Item
                  label="Ethnicity"
                  name="ethnicity"
                  rules={[{ required: true, message: "Ethnicity is required" }]}
                >
                  <Input placeholder="Example: Asian" />
                </Form.Item>
                <Form.Item
                  label="BM5 (Biomarker Value)"
                  name="bm5"
                  tooltip="Blood biomarker measurement used for risk prediction"
                >
                  <Input type="number" step="0.1" placeholder="Example: 32.1" />
                </Form.Item>
                <Form.Item label="Smoking Status" name="smoking_status">
                  <Select
                    placeholder="Select smoking status"
                    allowClear
                    options={[
                      { label: "Never", value: "Never" },
                      { label: "Former", value: "Former" },
                      { label: "Current", value: "Current" },
                    ]}
                  />
                </Form.Item>
                <Form.Item
                  label="Family History of Lung Cancer"
                  name="family_history_lung_cancer"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
                <Form.Item label="Emphysema" name="emphysema" valuePropName="checked">
                  <Switch />
                </Form.Item>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <TestTube className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                  Specimen Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 pt-0">
                <Form.Item
                  label="MRN / Patient Identifier"
                  name="mrn"
                  rules={[{ required: true, message: "MRN is required" }]}
                >
                  <Input placeholder="MRN or national ID" />
                </Form.Item>
                <Form.Item
                  label="Sample Reference Number"
                  name="sample_reference_number"
                  tooltip="Must match the sample name in the QuantStudio Excel for auto-matching"
                >
                  <Input placeholder="Example: SKH-161" />
                </Form.Item>
                <Form.Item
                  label="Collection Site / Requester"
                  name="specimen_collected_from"
                  rules={[{ required: true, message: "Collection site is required" }]}
                >
                  <Input placeholder="Example: Wardayahealth Clinic" />
                </Form.Item>
                <Form.Item
                  label="Specimen Type"
                  name="specimen_type"
                  rules={[{ required: true, message: "Specimen Type is required" }]}
                >
                  <Input placeholder="Example: Whole blood" />
                </Form.Item>
                <Form.Item
                  label="Specimen ID"
                  name="specimen_id"
                  rules={[{ required: true, message: "Specimen ID is required" }]}
                >
                  <Input placeholder="Example: SPC-001" />
                </Form.Item>
                <Form.Item
                  label="Specimen Date"
                  name="specimen_received"
                  rules={[{ required: true, message: "Specimen Date is required" }]}
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    format="YYYY-MM-DD"
                    placeholder="Choose date"
                  />
                </Form.Item>
                <Form.Item label="Reviewed By" name="reviewer_name">
                  <Input placeholder="Example: Dr. Ong Kiat Hoe" />
                </Form.Item>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <FileText className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                  Clinical Documentation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 pt-0">
                <Form.Item
                  label="Test Information"
                  name="test_information"
                  rules={[{ required: true, message: "Test Information is required" }]}
                >
                  <MDEditor />
                </Form.Item>
                <Form.Item
                  label="Lab Result Summary"
                  name="lab_result_summary"
                  rules={[{ required: true, message: "Lab Result Summary is required" }]}
                >
                  <MDEditor />
                </Form.Item>
                <Form.Item
                  label="Upload CSV File"
                  name="upload_csv_file"
                  valuePropName="fileList"
                  getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
                >
                  <Upload name="file" action="/upload.do" listType="text">
                    <AntButton icon={<UploadOutlined />}>Upload CSV</AntButton>
                  </Upload>
                </Form.Item>
              </CardContent>
            </Card>
          </div>
        </div>
      </Form>
    </Create>
  );
};

export { LabTestCreate as PostCreate };
export default LabTestCreate;
