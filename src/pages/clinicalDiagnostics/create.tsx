import { Create, useForm } from "@refinedev/antd";
import { Form, Input, Select, DatePicker, Upload, Button as AntButton, notification, Switch } from "antd";
import MDEditor from "@uiw/react-md-editor";
import { UploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { generateReportBlob } from "../../utils/generateReport";
import { API_URL, axiosInstance } from "../../providers/authProvider";
import { useNavigate } from "react-router-dom";
import { buildHL7Message } from "../../utils/generateHl7";
import Papa from "papaparse";
import { User, TestTube, FileText } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const LabTestCreate: React.FC = () => {
    // Misalnya untuk redirect setelah sukses
    const navigate = useNavigate();

    const { formProps, saveButtonProps } = useForm();

    // Fungsi ketika form submit (akan dijalankan secara penuh, tidak hanya save record)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleFinish = async (values: any) => {
        const { date_of_birth, specimen_received, upload_csv_file } = values;

        const csvFile = upload_csv_file?.[0]?.originFileObj;

        // Build the base fields sent to the backend
        const baseFields: Record<string, string> = {
            patient_name: values.patient_name,
            date_of_birth: date_of_birth ? dayjs(date_of_birth).format("YYYY-MM-DD") : "",
            sex: values.sex,
            mrn: values.mrn,
            ethnicity: values.ethnicity || "",
            specimen_type: values.specimen_type || "",
            specimen_id: values.specimen_id || "",
            specimen_collected_from: values.specimen_collected_from || "",
            specimen_received: specimen_received ? dayjs(specimen_received).format("YYYY-MM-DD") : "",
            physician_name: values.physician_name,
            reviewer_name: values.reviewer_name || "",
            test_case_id: values.test_case_id,
            disease: values.disease || "",
            bm5: values.bm5 ? String(values.bm5) : "",
            smoking_status: values.smoking_status || "",
            family_history_lung_cancer: values.family_history_lung_cancer ? "true" : "false",
            emphysema: values.emphysema ? "true" : "false",
            sample_reference_number: values.sample_reference_number || "",
        };

        // If no CSV uploaded, create test order via simple JSON POST
        if (!csvFile) {
            try {
                const response = await axiosInstance.post("/clinical-diagnostics", {
                    patient_name: baseFields.patient_name,
                    test_case_id: baseFields.test_case_id,
                    physician_name: baseFields.physician_name,
                    disease: baseFields.disease,
                    specimen_type: baseFields.specimen_type,
                    report_status: "Pending",
                    sex: baseFields.sex,
                    ethnicity: baseFields.ethnicity,
                    mrn: baseFields.mrn,
                    bm5: values.bm5 ? Number(values.bm5) : undefined,
                    smoking_status: baseFields.smoking_status,
                    family_history_lung_cancer: baseFields.family_history_lung_cancer,
                    emphysema: baseFields.emphysema,
                    sample_reference_number: baseFields.sample_reference_number,
                    requester: "TTSH Hospital",
                });

                if (response.status >= 400) {
                    throw new Error("Failed to create test order");
                }

                notification.success({
                    message: "Success",
                    description: "Test order created! Upload a QuantStudio Excel to get SKH prediction.",
                });
                navigate("/test-orders");
                return values;
            } catch (error: unknown) {
                console.error("Error creating record:", error);
                notification.error({
                    message: "Error",
                    description: (error instanceof Error ? error.message : null) || "Failed to create test order",
                });
                throw error;
            }
        }

    const csvData: Record<string, string>[] = await new Promise((resolve, reject) => {
        Papa.parse(csvFile, {
            header: true,
            complete: (result) => resolve(result.data as Record<string, string>[]),
            error: (error) => reject(error),
        });
    });


    // Map the CSV data to the required format
    const testResults = csvData.map((row) => ({
        // clinicalAction:  "Up dose",
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

    // Hilangkan duplikasi dalam testResults berdasarkan kombinasi kolom
const uniqueTestResults = testResults.filter((row, index, self) => {
    return (
      index ===
      self.findIndex(
        (r) =>
        //   r.clinicalAction === row.clinicalAction &&
          r.drug === row.drug &&
          JSON.stringify(r.gene) === JSON.stringify(row.gene) &&
          JSON.stringify(r.genotype) === JSON.stringify(row.genotype) &&
          JSON.stringify(r.phenotype) === JSON.stringify(row.phenotype) &&
          JSON.stringify(r.toxicity) === JSON.stringify(row.toxicity) &&
          JSON.stringify(r.dosage) === JSON.stringify(row.dosage) &&
          JSON.stringify(r.efficacy) === JSON.stringify(row.efficacy) &&
          JSON.stringify(r.evidence) === JSON.stringify(row.evidence)
      )
    );
  });

        // Format data untuk report
        const reportData = {
            patient: {
                "Patient Name": values.patient_name,
                "Date of Birth": date_of_birth ? dayjs(date_of_birth).format("YYYY-MM-DD") : null,
                Sex: values.sex,
                MRN: values.mrn,
                Ethnicity: values.ethnicity || "N/A",
            },
            specimen: {
                "Specimen Type": values.specimen_type,
                "Specimen ID": values.specimen_id,
                "Specimen Collected": values.specimen_collected_from || "N/A",
                "Specimen Received": specimen_received ? dayjs(specimen_received).format("YYYY-MM-DD") : null,
            },
            orderedBy: {
                Requester: "TTSH Hospital",
                Physician: values.physician_name,
            },
            caseInfo: {
                "Test Case ID": values.test_case_id,
                "Review Status": "Final",
                "Date Accessioned": dayjs().format("YYYY-MM-DD"),
                "Date Reported": dayjs().format("YYYY-MM-DD"),
            },
            test_information: values.test_information, // Pastikan ini ada
            lab_result_summary: values.lab_result_summary,
            testResults,
        };

        try {
            // Generate PDF blob berdasarkan reportData
            const pdfBlob = await generateReportBlob(reportData);
            console.log("Generated PDF Blob:", pdfBlob);

             // Generate HL7 message using the buildHL7Message function
            // Panggil fungsi buildHL7Message dengan data lengkap
        const hl7Message = buildHL7Message({
            patient_name: values.patient_name,
            date_of_birth: date_of_birth ? dayjs(date_of_birth).format("YYYY-MM-DD") : null,
            sex: values.sex,
            mrn: values.mrn,
            test_case_id: values.test_case_id,
            specimen_type: values.specimen_type,
            specimen_id: values.specimen_id,
            specimen_collected_from: values.specimen_collected_from,
            specimen_received: specimen_received ? dayjs(specimen_received).format("YYYY-MM-DD") : null,
            test_information: values.test_information,
            lab_result_summary: values.lab_result_summary,
            testResults: uniqueTestResults, // Pastikan testResults diteruskan
        });

                    // Create HL7 blob
            const hl7Blob = new Blob([hl7Message], { type: "text/plain" });
            console.log("Generated HL7 Blob:", hl7Blob);

            // Tentukan nama file berdasarkan patient_name
            const patientName = values.patient_name.replace(/\s+/g, "_"); // Ganti spasi dengan underscore
            const pdfFileName = `${patientName}_Report.pdf`;
            const hl7FileName = `${patientName}_Report.hl7`;


            // Create FormData object and append files and individual fields
            const formData = new FormData();
            formData.append("report_download_pdf", pdfBlob, pdfFileName);
            formData.append("report_download_hl7", hl7Blob, hl7FileName);

            // Append base fields
            Object.entries(baseFields).forEach(([key, value]) => {
                if (value) formData.append(key, value);
            });
            formData.append("test_information", values.test_information);
            formData.append("lab_result_summary", values.lab_result_summary);
            formData.append("reviewer_name", values.reviewer_name || "");

            // Kirim data ke endpoint yang sesuai (misalnya /clinical-diagnostics)
            const response = await fetch(`${API_URL}/clinical-diagnostics`, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Failed to upload files");
            }

            console.log("Record created successfully");

            // Setelah record tersimpan, misalnya tampilkan notifikasi sukses
            notification.success({
                message: "Sukses",
                description: "Lab test Created!",
            });

            // Dan melakukan redirect ke halaman list atau detail sesuai alur aplikasi
            navigate("/test-orders");

            return values;
        } catch (error: unknown) {
            console.error("Error creating record:", error);
            notification.error({
                message: "Error",
                description: (error instanceof Error ? error.message : null) || "Terjadi kesalahan ketika menyimpan data",
            });
            throw error;
        }
    };

    return (
        <Create saveButtonProps={saveButtonProps} breadcrumb={false}>
            <Form {...formProps} onFinish={handleFinish} layout="vertical">
                <div className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Patient & Test Details */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <User className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                                    Patient & Test Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0 space-y-1">
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
                                    getValueProps={(value) => ({
                                        value: value ? dayjs(value) : undefined,
                                    })}
                                >
                                    <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" placeholder="Choose date" />
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
                                    <Input placeholder="Example: Diabetes" />
                                </Form.Item>
                                <Form.Item
                                    label="Ethnicity"
                                    name="ethnicity"
                                    rules={[{ required: true, message: "Ethnicity is required" }]}
                                >
                                    <Input placeholder="Example: Hispanic" />
                                </Form.Item>
                                <Form.Item
                                    label="BM5 (Biomarker Value)"
                                    name="bm5"
                                    tooltip="Blood biomarker measurement used for SKH risk prediction"
                                >
                                    <Input type="number" step="0.1" placeholder="Example: 32.1" />
                                </Form.Item>
                                <Form.Item
                                    label="Smoking Status"
                                    name="smoking_status"
                                >
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
                                <Form.Item
                                    label="Emphysema"
                                    name="emphysema"
                                    valuePropName="checked"
                                >
                                    <Switch />
                                </Form.Item>
                            </CardContent>
                        </Card>

                        {/* Specimen Information */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <TestTube className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                                    Specimen Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0 space-y-1">
                                <Form.Item
                                    label="MRN"
                                    name="mrn"
                                    rules={[{ required: true, message: "MRN is required" }]}
                                >
                                    <Input placeholder="MRN" />
                                </Form.Item>
                                <Form.Item
                                    label="Sample Reference Number"
                                    name="sample_reference_number"
                                    tooltip="Must match the sample name in the QuantStudio Excel for auto-matching"
                                >
                                    <Input placeholder="Example: SKH-161" />
                                </Form.Item>
                                <Form.Item
                                    label="Specimen Collected From"
                                    name="specimen_collected_from"
                                    rules={[{ required: true, message: "Specimen Collected From is required" }]}
                                >
                                    <Input placeholder="Example: Name of hospital" />
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
                                    <Input placeholder="E.G 001 002" />
                                </Form.Item>
                                <Form.Item
                                    label="Specimen Date"
                                    name="specimen_received"
                                    rules={[{ required: true, message: "Specimen Date is required" }]}
                                    getValueProps={(value) => ({
                                        value: value ? dayjs(value) : undefined,
                                    })}
                                >
                                    <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" placeholder="Choose date" />
                                </Form.Item>
                                <Form.Item label="Reviewed By" name="reviewer_name">
                                    <Input placeholder="Example: Dr. Ong Kiat Hoe" />
                                </Form.Item>
                            </CardContent>
                        </Card>

                        {/* Clinical Documentation */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                                    Clinical Documentation
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0 space-y-1">
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
                                    getValueFromEvent={(e) =>
                                        Array.isArray(e) ? e : e?.fileList
                                    }
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
