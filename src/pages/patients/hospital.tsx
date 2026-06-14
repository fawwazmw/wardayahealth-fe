import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import { ArrowLeft, Users, User, Cigarette, PlusCircle, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { axiosInstance } from "@/providers/authProvider";

interface PatientCard {
  id: number;
  patient_id_code: string;
  name: string;
  sex: string | null;
  date_of_birth: string | null;
  smoking_status: string | null;
  pack_years: number | null;
}

export const HospitalPatients: React.FC = () => {
  const { hospitalId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hospitalName = searchParams.get("name") || "Hospital";

  const [patients, setPatients] = useState<PatientCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await axiosInstance.get("/patients", {
          params: { hospital_id: hospitalId, limit: 200 },
        });
        setPatients(res.data);
      } catch {
        setPatients([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, [hospitalId]);

  const filtered = searchValue.trim()
    ? patients.filter(
        (p) =>
          p.name.toLowerCase().includes(searchValue.toLowerCase()) ||
          p.patient_id_code.toLowerCase().includes(searchValue.toLowerCase())
      )
    : patients;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/patients")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-semibold">{hospitalName}</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {patients.length} patients
          </p>
        </div>
        <Button onClick={() => navigate("/clinical-diagnostics/scan-document")} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Add Patient
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
            <Input
              type="text"
              placeholder="Search patients..."
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
          <Users className="h-12 w-12 mb-4 opacity-30" />
          <p className="text-sm">No patients found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((patient) => {
            const age = patient.date_of_birth
              ? dayjs().diff(dayjs(patient.date_of_birth), "year")
              : null;
            return (
              <div
                key={patient.id}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-lg border border-[hsl(var(--border))]",
                  "hover:bg-[hsl(var(--muted))]/50 transition-colors cursor-pointer"
                )}
                onClick={() => navigate(`/patients/${patient.id}`)}
              >
                <div
                  className="flex items-center justify-center rounded-full flex-shrink-0"
                  style={{
                    width: 40,
                    height: 40,
                    backgroundColor: patient.sex === "Female" ? "#fce7f3" : "#eff6ff",
                    color: patient.sex === "Female" ? "#be185d" : "#1d4ed8",
                  }}
                >
                  <User className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold truncate">{patient.name}</span>
                    <code className="text-[10px] font-mono text-[hsl(var(--muted-foreground))]">
                      {patient.patient_id_code}
                    </code>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
                    <span>{patient.sex || "—"}</span>
                    {age !== null && <span>· {age} years</span>}
                    {patient.smoking_status && (
                      <span className="flex items-center gap-0.5">
                        · <Cigarette className="h-3 w-3" />
                        {patient.smoking_status}
                        {patient.pack_years != null && ` (${patient.pack_years}py)`}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HospitalPatients;
