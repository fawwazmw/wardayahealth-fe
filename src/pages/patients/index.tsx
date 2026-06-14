import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Search, PlusCircle, Building2, MapPin } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { axiosInstance } from "@/providers/authProvider";

interface CountryData {
  id: number;
  code: string;
  name: string;
  hospitalCount: number;
  patientCount: number;
  hospitals: { id: number; name: string; patientCount: number }[];
}

export const PatientsPage: React.FC = () => {
  const navigate = useNavigate();
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await axiosInstance.get("/countries");
        setCountries(res.data);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchCountries();
  }, []);

  const totalPatients = countries.reduce((sum, c) => sum + c.patientCount, 0);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[hsl(var(--foreground))]">
              Patients
            </h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Register and manage records for {totalPatients} patients
            </p>
          </div>
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
      ) : (
        <div className="space-y-6">
          {countries.map((country) => (
            <Card key={country.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="text-xs font-mono">
                      {country.code}
                    </Badge>
                    <CardTitle className="text-lg">{country.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-[hsl(var(--muted-foreground))]">
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5" />
                      {country.hospitalCount} hospitals
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {country.patientCount} patients
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {country.hospitals.map((hospital) => (
                    <div
                      key={hospital.id}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border border-[hsl(var(--border))]",
                        "hover:bg-[hsl(var(--muted))]/50 transition-colors cursor-pointer"
                      )}
                      onClick={() => navigate(`/patients/hospital/${hospital.id}?name=${encodeURIComponent(hospital.name)}`)}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
                        <span className="text-sm font-medium">{hospital.name}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {hospital.patientCount}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientsPage;
