import { useQuery } from '@tanstack/react-query';
import { FileText, ChevronDown, ChevronUp, Pill } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { prescriptionService } from '@/services/prescription.service';
import type { Prescription } from '@/types';

interface PrescriptionListProps {
  patientId: string;
}

function PrescriptionCard({ prescription }: { prescription: Prescription }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-lg border">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between p-4 h-auto hover:bg-muted/50"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">{prescription.diagnosis}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(prescription.createdAt).toLocaleDateString()} • {prescription.doctorName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{prescription.medications.length} medications</Badge>
              {isOpen ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t p-4 space-y-4">
            {/* Medications */}
            <div>
              <h4 className="text-sm font-medium mb-3">Medications</h4>
              <div className="space-y-3">
                {prescription.medications.map((med) => (
                  <div key={med.id} className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                    <Pill className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium">
                        {med.name} <span className="text-muted-foreground">{med.dosage}</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {med.frequency} for {med.duration}
                      </p>
                      {med.instructions && (
                        <p className="text-sm text-muted-foreground italic mt-1">
                          "{med.instructions}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            {prescription.notes && (
              <div>
                <h4 className="text-sm font-medium mb-2">Notes</h4>
                <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                  {prescription.notes}
                </p>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export function PrescriptionList({ patientId }: PrescriptionListProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['prescriptions', patientId],
    queryFn: () => prescriptionService.getPatientPrescriptions(patientId),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Prescriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Prescriptions
          {data && <Badge variant="secondary">{data.total} total</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data && data.data.length > 0 ? (
          <div className="space-y-3">
            {data.data.map((prescription) => (
              <PrescriptionCard key={prescription.id} prescription={prescription} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-2 text-muted-foreground">No prescriptions yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
