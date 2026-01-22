import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Plus, Users, FileText, Activity, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/store/auth.store';
import { patientService } from '@/services/patient.service';
import { prescriptionService } from '@/services/prescription.service';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: patients, isLoading: patientsLoading } = useQuery({
    queryKey: ['patients', 'recent'],
    queryFn: () => patientService.getPatients(1, 5),
  });

  const { data: prescriptions, isLoading: prescriptionsLoading } = useQuery({
    queryKey: ['prescriptions', 'recent'],
    queryFn: () => prescriptionService.getRecentPrescriptions(5),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/patients?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const stats = [
    { name: 'Total Patients', value: patients?.total || 0, icon: Users, color: 'text-blue-500' },
    { name: 'Prescriptions Today', value: 12, icon: FileText, color: 'text-green-500' },
    { name: 'Active Cases', value: 8, icon: Activity, color: 'text-orange-500' },
    { name: 'This Week', value: '+15%', icon: TrendingUp, color: 'text-purple-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {user?.name?.split(' ')[0] || 'Doctor'}
          </h1>
          <p className="text-muted-foreground">Here's what's happening with your patients today.</p>
        </div>
        <Button onClick={() => navigate('/patients/new')}>
          <Plus className="mr-2 h-4 w-4" />
          New Patient
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search patients by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className={cn('rounded-lg bg-muted p-3', stat.color)}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Patients & Prescriptions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Patients */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Patients</CardTitle>
              <CardDescription>Your most recently viewed patients</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/patients')}>
              View all
            </Button>
          </CardHeader>
          <CardContent>
            {patientsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {patients?.data.map((patient) => (
                  <div
                    key={patient.id}
                    className="flex cursor-pointer items-center gap-4 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                    onClick={() => navigate(`/patients/${patient.id}`)}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      {patient.firstName[0]}
                      {patient.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {patient.firstName} {patient.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">{patient.uid}</p>
                    </div>
                  </div>
                ))}
                {patients?.data.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No patients yet</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Prescriptions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Prescriptions</CardTitle>
              <CardDescription>Latest prescriptions issued</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/prescriptions')}>
              View all
            </Button>
          </CardHeader>
          <CardContent>
            {prescriptionsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {prescriptions?.map((rx) => (
                  <div
                    key={rx.id}
                    className="flex cursor-pointer items-center gap-4 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                    onClick={() => navigate(`/patients/${rx.patientId}`)}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{rx.diagnosis}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(rx.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                {prescriptions?.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No prescriptions yet</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
