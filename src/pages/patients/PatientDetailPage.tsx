import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft, Calendar, Phone, Mail, Droplets, AlertTriangle,
  MapPin, Clock, FileText, Activity, Shield, Sparkles, Edit
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { patientService } from '@/services/patient.service';
import { prescriptionService } from '@/services/prescription.service';
import { PatientTimeline } from '@/components/timeline/PatientTimeline';
import { PatientMindMap } from '@/components/mindmap/PatientMindMap';
import { PrescriptionList } from '@/components/common/PrescriptionList';

export function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: patient, isLoading } = useQuery({
    queryKey: ['patient', id],
    queryFn: () => patientService.getPatient(id!),
    enabled: !!id,
  });

  const { data: prescriptions } = useQuery({
    queryKey: ['prescriptions', id],
    queryFn: () => prescriptionService.getPatientPrescriptions(id!),
    enabled: !!id,
  });

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getGenderColor = (gender: string) => {
    switch (gender.toLowerCase()) {
      case 'male': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
      case 'female': return 'text-pink-600 bg-pink-100 dark:bg-pink-900/30 dark:text-pink-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse p-6">
        <div className="h-48 w-full rounded-3xl bg-muted" />
        <div className="grid gap-6 md:grid-cols-3">
          <div className="h-64 w-full rounded-2xl bg-muted" />
          <div className="col-span-2 h-64 w-full rounded-2xl bg-muted" />
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center py-24 animate-scale-in">
        <div className="rounded-full bg-muted p-8 mb-4">
          <Shield className="h-12 w-12 text-muted-foreground/50" />
        </div>
        <h2 className="text-xl font-bold">Patient Not Found</h2>
        <p className="text-muted-foreground mt-2 mb-6">The patient you are looking for does not exist or has been removed.</p>
        <Button onClick={() => navigate('/patients')} className="bg-gradient-primary">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to patients
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-up pb-10">
      {/* Hero Header */}
      <div className="relative">
        {/* Banner Background */}
        <div className="h-48 w-full rounded-3xl bg-gradient-to-r from-blue-600 via-primary to-accent overflow-hidden shadow-lg">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
          <div className="absolute top-0 right-0 p-12 opacity-10">
            <Sparkles className="h-64 w-64 text-white" />
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="absolute top-6 left-6 text-white hover:bg-white/20 hover:text-white"
            onClick={() => navigate('/patients')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        {/* Profile Info Overlay */}
        <div className="px-8 relative -mt-20 flex flex-col md:flex-row items-end gap-6">
          <div className="relative">
            <div className="h-40 w-40 rounded-3xl border-4 border-background bg-white shadow-2xl flex items-center justify-center text-5xl font-bold text-primary">
              {patient.firstName[0]}{patient.lastName[0]}
            </div>
            <div className={`absolute bottom-3 right-3 h-6 w-6 rounded-full border-4 border-white ${patient.bloodType ? 'bg-green-500' : 'bg-gray-300'}`} />
          </div>

          <div className="flex-1 pb-4 space-y-2">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">{patient.firstName} {patient.lastName}</h1>
              <Badge variant="outline" className="w-fit bg-primary/5 border-primary/20 text-primary font-medium">
                {patient.uid}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-3 text-sm font-medium">
              <div className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-full border text-foreground/80">
                <Calendar className="h-4 w-4 text-primary" />
                <span>{new Date(patient.dateOfBirth).toLocaleDateString()} ({calculateAge(patient.dateOfBirth)} yrs)</span>
              </div>
              {patient.phone && (
                <div className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-full border text-foreground/80">
                  <Phone className="h-4 w-4 text-emerald-600" />
                  <span>{patient.phone}</span>
                </div>
              )}
              {patient.email && (
                <div className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-full border text-foreground/80">
                  <Mail className="h-4 w-4 text-orange-600" />
                  <span>{patient.email}</span>
                </div>
              )}
              {patient.address && (
                <div className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-full border text-foreground/80">
                  <MapPin className="h-4 w-4 text-purple-600" />
                  <span className="truncate max-w-[200px]">{patient.address}</span>
                </div>
              )}
            </div>
          </div>

          <div className="pb-4 flex gap-3">
            <Button variant="outline" className="rounded-xl border-primary/20 hover:bg-primary/5 hover:border-primary/50 text-primary transition-all">
              <Edit className="mr-2 h-4 w-4" />
              Edit Details
            </Button>
            <Button onClick={() => navigate(`/prescriptions/new?patientId=${patient.id}`)} className="rounded-xl bg-gradient-primary hover:opacity-90 transition-opacity shadow-lg">
              <FileText className="mr-2 h-4 w-4" />
              New Prescription
            </Button>
          </div>
        </div>
      </div>

      {/* Allergies Alert */}
      {patient.allergies && patient.allergies.length > 0 && (
        <div className="mx-2 md:mx-0 animate-scale-in delay-100">
          <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-900/50 p-4 flex items-start gap-4 shadow-sm">
            <div className="rounded-full bg-red-100 dark:bg-red-900/40 p-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 dark:text-red-300">Medical Alerts</h3>
              <p className="text-sm text-red-700 dark:text-red-400 mb-3">This patient has known allergies that require attention.</p>
              <div className="flex flex-wrap gap-2">
                {patient.allergies.map((allergy) => (
                  <Badge key={allergy} className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800">
                    {allergy}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Areas */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent space-x-6 px-4 md:px-0">
          <TabsTrigger
            value="overview"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 px-1 text-base"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="timeline"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 px-1 text-base"
          >
            History
          </TabsTrigger>
          <TabsTrigger
            value="prescriptions"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 px-1 text-base"
          >
            Prescriptions
          </TabsTrigger>
          <TabsTrigger
            value="mindmap"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 px-1 text-base flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4 text-purple-500" />
            AI Mind Map
          </TabsTrigger>
        </TabsList>

        <div className="mt-8 px-2 md:px-0">
          <TabsContent value="overview" className="space-y-6 animate-slide-up">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="glass-card border-0 hover:-translate-y-1 transition-transform duration-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Prescriptions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold">{prescriptions?.total || 0}</span>
                    <div className="rounded-full bg-blue-100 p-2 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                      <FileText className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-0 hover:-translate-y-1 transition-transform duration-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Gender</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold capitalize">{patient.gender}</span>
                    <Badge className={`capitalize ${getGenderColor(patient.gender)}`}>
                      {patient.gender}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-0 hover:-translate-y-1 transition-transform duration-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Blood Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold">{patient.bloodType || 'N/A'}</span>
                    <div className="rounded-full bg-red-100 p-2 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                      <Droplets className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-0 hover:-translate-y-1 transition-transform duration-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Last Updated</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xl font-bold block">{new Date(patient.updatedAt).toLocaleDateString()}</span>
                      <span className="text-xs text-muted-foreground">Patient since {new Date(patient.createdAt).getFullYear()}</span>
                    </div>
                    <div className="rounded-full bg-green-100 p-2 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                      <Clock className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <Card className="md:col-span-2 border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {(!prescriptions || prescriptions.data.length === 0) ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                      <Activity className="h-12 w-12 opacity-20 mb-4" />
                      <p>No recent activity recorded for this patient.</p>
                      <Button variant="link" onClick={() => navigate(`/prescriptions/new?patientId=${patient.id}`)} className="mt-2 text-primary">
                        Create a prescription to start tracking
                      </Button>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {prescriptions.data.slice(0, 5).map((rx) => (
                        <div key={rx.id} className="p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate(`/patients/${id}?tab=prescriptions`)}>
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{rx.diagnosis}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>Prescription issued</span>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(rx.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 to-accent/5">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    <li className="flex gap-3 text-sm">
                      <div className="h-2 w-2 mt-1.5 rounded-full bg-green-500" />
                      <span className="text-muted-foreground">Patient has consistently adhered to medication schedule.</span>
                    </li>
                    <li className="flex gap-3 text-sm">
                      <div className="h-2 w-2 mt-1.5 rounded-full bg-orange-500" />
                      <span className="text-muted-foreground">Required follow-up for blood pressure check next month.</span>
                    </li>
                    <li className="flex gap-3 text-sm">
                      <div className="h-2 w-2 mt-1.5 rounded-full bg-blue-500" />
                      <span className="text-muted-foreground">Preferred pharmacy updated on file.</span>
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full mt-6 bg-white/50">Add Note</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="animate-slide-up">
            <PatientTimeline patientId={id!} />
          </TabsContent>

          <TabsContent value="prescriptions" className="animate-slide-up">
            <PrescriptionList patientId={id!} />
          </TabsContent>

          <TabsContent value="mindmap" className="animate-slide-up">
            <div className="mb-4 rounded-lg bg-purple-50 dark:bg-purple-900/10 p-4 border border-purple-100 dark:border-purple-800 text-purple-900 dark:text-purple-300 flex items-start gap-3">
              <Sparkles className="h-5 w-5 mt-0.5 text-purple-600" />
              <div>
                <h4 className="font-semibold">AI Mind Map Visualization</h4>
                <p className="text-sm opacity-90">This interactive map visualizes the patient's condition history, medication connections, and potential interactions based on AI analysis.</p>
              </div>
            </div>
            <PatientMindMap patientId={id!} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
