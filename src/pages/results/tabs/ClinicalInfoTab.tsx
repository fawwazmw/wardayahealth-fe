import React from "react";
import dayjs from "dayjs";
import { User, Stethoscope, HeartPulse } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Props {
  record: Record<string, unknown>;
}

const Field: React.FC<{ label: string; value: unknown }> = ({ label, value }) => (
  <div className="py-2.5 border-b border-[hsl(var(--border))] last:border-0">
    <div className="text-[11px] font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-0.5">
      {label}
    </div>
    <div className="text-sm text-[hsl(var(--foreground))]">
      {value !== null && value !== undefined && value !== "" ? String(value) : "—"}
    </div>
  </div>
);

export const ClinicalInfoTab: React.FC<Props> = ({ record }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <User className="h-4 w-4 text-[hsl(var(--primary))]" />
            Patient Demographics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Field label="Full Name" value={record.patient_name} />
          <Field label="ID Number" value={record.id_number} />
          <Field label="Sex" value={record.patient_sex} />
          <Field
            label="Date of Birth"
            value={record.patient_dob ? dayjs(record.patient_dob as string).format("DD MMM YYYY") : null}
          />
          <Field label="Nationality" value={record.patient_nationality} />
          <Field label="Ethnicity" value={record.patient_ethnicity} />
          <Field label="Contact" value={record.patient_contact_number} />
          <Field label="Address" value={record.patient_address} />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-[hsl(var(--primary))]" />
              Order Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Field label="Order ID" value={record.test_case_id} />
            <Field label="Physician" value={record.physician_name} />
            <Field label="Requester" value={record.requester} />
            <Field label="Disease" value={record.disease} />
            <Field label="Specimen Type" value={record.specimen_type} />
            <Field
              label="Sample Collection Date"
              value={record.sample_collection_date ? dayjs(record.sample_collection_date as string).format("DD MMM YYYY") : null}
            />
            <Field
              label="Sample Received Date"
              value={record.sample_received_date ? dayjs(record.sample_received_date as string).format("DD MMM YYYY") : null}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <HeartPulse className="h-4 w-4 text-[hsl(var(--primary))]" />
              Risk Factors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Field label="Smoking Status" value={record.smoking_status} />
            <Field label="Pack Years" value={record.pack_years} />
            <div className="py-2.5 border-b border-[hsl(var(--border))]">
              <div className="text-[11px] font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-0.5">
                Family History of Lung Cancer
              </div>
              <div className="text-sm">
                {record.family_history_lung_cancer === true ? (
                  <Badge variant="destructive">Yes</Badge>
                ) : record.family_history_lung_cancer === false ? (
                  <Badge variant="success">No</Badge>
                ) : (
                  "—"
                )}
              </div>
            </div>
            <Field label="Allergies" value={record.allergies} />
            <Field label="Clinical Notes" value={record.clinical_notes} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
