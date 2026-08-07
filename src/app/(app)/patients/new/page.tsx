import { requireRole } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { PatientForm } from "@/components/patients/patient-form";

export default async function NewPatientPage() {
  await requireRole(["RECORDS_OFFICER", "ADMIN"]);

  return (
    <div>
      <PageHeader
        eyebrow="Patient registration"
        title="Register a new patient"
        description="This creates a unique patient ID and opens their central record."
      />
      <Card className="max-w-3xl">
        <CardContent className="pt-5">
          <PatientForm />
        </CardContent>
      </Card>
    </div>
  );
}
