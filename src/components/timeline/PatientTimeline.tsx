import { useQuery } from '@tanstack/react-query';
import { Calendar, Stethoscope, FlaskConical, FileText, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { patientService } from '@/services/patient.service';
import type { TimelineEvent } from '@/types';
import { cn } from '@/lib/utils';

interface PatientTimelineProps {
  patientId: string;
}

const eventIcons: Record<TimelineEvent['type'], React.ElementType> = {
  visit: Stethoscope,
  prescription: FileText,
  lab: FlaskConical,
  note: FileText,
  alert: AlertTriangle,
};

const eventColors: Record<TimelineEvent['type'], string> = {
  visit: 'bg-primary/10 text-primary',
  prescription: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  lab: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400',
  note: 'bg-muted text-muted-foreground',
  alert: 'bg-destructive/10 text-destructive',
};

export function PatientTimeline({ patientId }: PatientTimelineProps) {
  const { data: events, isLoading } = useQuery({
    queryKey: ['patient', patientId, 'timeline'],
    queryFn: () => patientService.getPatientTimeline(patientId),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Patient History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
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
          <Calendar className="h-5 w-5" />
          Patient History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {events && events.length > 0 ? (
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-5 top-0 h-full w-0.5 bg-border" />

            <div className="space-y-6">
              {events.map((event, index) => {
                const Icon = eventIcons[event.type];
                const colorClass = eventColors[event.type];

                return (
                  <div key={event.id} className="relative flex gap-4">
                    {/* Icon */}
                    <div
                      className={cn(
                        'relative z-10 flex h-10 w-10 items-center justify-center rounded-full',
                        colorClass
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-6">
                      <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium">{event.title}</p>
                            <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                          </div>
                          <time className="text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(event.date).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </time>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-2 text-muted-foreground">No history available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
