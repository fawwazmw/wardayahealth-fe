import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, Select, DatePicker } from "antd";
import MDEditor from "@uiw/react-md-editor";
import dayjs from "dayjs";
import { User, TestTube, FileText } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const LabTestEdit: React.FC = () => {
  const { formProps, saveButtonProps } = useForm({
    action: "edit",
  });

  return (
    <Edit saveButtonProps={saveButtonProps} breadcrumb={false}>
      <Form {...formProps} layout="vertical">
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
                  rules={[
                    { required: true, message: "Patient Name is required" },
                  ]}
                >
                  <Input placeholder="Example: John Doe" />
                </Form.Item>
                <Form.Item
                  label="Test Case ID"
                  name="test_case_id"
                  rules={[
                    { required: true, message: "Test Case ID is required" },
                  ]}
                >
                  <Input placeholder="Example: TC-001" />
                </Form.Item>
                <Form.Item
                  label="Date of Birth"
                  name="date_of_birth"
                  rules={[
                    { required: true, message: "Specimen Date is required" },
                  ]}
                  getValueProps={(value) => ({
                    value: value ? dayjs(value) : undefined,
                  })}
                  normalize={(value) =>
                    value ? dayjs(value).format("YYYY-MM-DD") : null
                  }
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
                    ]}
                  />
                </Form.Item>
                <Form.Item
                  label="Physician Name"
                  name="physician_name"
                  rules={[
                    { required: true, message: "Physician Name is required" },
                  ]}
                >
                  <Input placeholder="Example: Dr. Ong" />
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
                  rules={[
                    { required: true, message: "Ethnicity is required" },
                  ]}
                >
                  <Input placeholder="Example: Hispanic" />
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
                  label="Specimen Collected From"
                  name="specimen_collected_from"
                  rules={[
                    {
                      required: true,
                      message: "Specimen Collected From is required",
                    },
                  ]}
                >
                  <Input placeholder="Example: Name of hospital" />
                </Form.Item>
                <Form.Item
                  label="Specimen Type"
                  name="specimen_type"
                  rules={[
                    { required: true, message: "Specimen Type is required" },
                  ]}
                >
                  <Input placeholder="Example: Whole blood" />
                </Form.Item>
                <Form.Item
                  label="Specimen ID"
                  name="specimen_id"
                  rules={[
                    { required: true, message: "Specimen ID is required" },
                  ]}
                >
                  <Input placeholder="E.G 001 002" />
                </Form.Item>
                <Form.Item
                  label="Specimen Date"
                  name="specimen_received"
                  rules={[
                    { required: true, message: "Specimen Date is required" },
                  ]}
                  getValueProps={(value) => ({
                    value: value ? dayjs(value) : undefined,
                  })}
                  normalize={(value) =>
                    value ? dayjs(value).format("YYYY-MM-DD") : null
                  }
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
                  rules={[
                    {
                      required: true,
                      message: "Test Information is required",
                    },
                  ]}
                >
                  <MDEditor />
                </Form.Item>
                <Form.Item
                  label="Lab Result Summary"
                  name="lab_result_summary"
                  rules={[
                    {
                      required: true,
                      message: "Lab Result Summary is required",
                    },
                  ]}
                >
                  <MDEditor />
                </Form.Item>
              </CardContent>
            </Card>
          </div>
        </div>
      </Form>
    </Edit>
  );
};

export { LabTestEdit as PostEdit };
export default LabTestEdit;
