import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Search, Plus, Users, FileText, Activity, TrendingUp,
  Sparkles, ArrowRight, Calendar, Clock
} from 'lucide-react';
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
    {
      name: 'Total Patients',
      value: patients?.total || 0,
      icon: Users,
      gradient: 'from-blue-500 to-cyan-400',
      bgGradient: 'from-blue-500/10 to-cyan-400/10'
    },
    {
      name: 'Prescriptions Today',
      value: 12,
      icon: FileText,
      gradient: 'from-emerald-500 to-teal-400',
      bgGradient: 'from-emerald-500/10 to-teal-400/10'
    },
    {
      name: 'Active Cases',
      value: 8,
      icon: Activity,
      gradient: 'from-orange-500 to-amber-400',
      bgGradient: 'from-orange-500/10 to-amber-400/10'
    },
    {
      name: 'This Week',
      value: '+15%',
      icon: TrendingUp,
      gradient: 'from-purple-500 to-pink-400',
      bgGradient: 'from-purple-500/10 to-pink-400/10'
    },
  ];

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-accent p-8 text-white">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white/80">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">{greeting}</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Welcome back, {user?.name?.split(' ')[0] || 'Doctor'} 👋
            </h1>
            <p className="text-lg text-white/80">
              Here's what's happening with your patients today.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              onClick={() => navigate('/prescriptions/new')}
              variant="secondary"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
            >
              <FileText className="mr-2 h-4 w-4" />
              New Prescription
            </Button>
            <Button
              onClick={() => navigate('/patients/new')}
              className="bg-white text-primary hover:bg-white/90 shadow-lg"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Patient
            </Button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="glass-card border-0 shadow-xl">
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors" />
              <Input
                placeholder="Search patients by name, ID, or condition..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-base bg-muted/50 border-0 rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-background transition-all"
              />
            </div>
            <Button type="submit" size="lg" className="px-6 rounded-xl bg-gradient-primary hover:opacity-90 transition-opacity">
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card
            key={stat.name}
            className={`stat-card bg-gradient-to-br ${stat.bgGradient} border-0 animate-slide-up`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`rounded-xl bg-gradient-to-br ${stat.gradient} p-3 shadow-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Patients & Prescriptions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Patients */}
        <Card className="overflow-hidden border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-muted/50 to-transparent">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Recent Patients
              </CardTitle>
              <CardDescription>Your most recently viewed patients</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/patients')}
              className="border-primary/30 text-primary hover:bg-primary/10 hover:text-primary hover:border-primary/50"
            >
              View all
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-4">
            {patientsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {patients?.data.map((patient, index) => (
                  <div
                    key={patient.id}
                    className="flex cursor-pointer items-center gap-4 rounded-xl p-3 transition-all duration-200 hover:bg-primary/5 hover:shadow-md animate-slide-in-right"
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => navigate(`/patients/${patient.id}`)}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-white font-semibold shadow-lg">
                      {patient.firstName[0]}
                      {patient.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">
                        {patient.firstName} {patient.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">{patient.uid}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
                {patients?.data.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground/30" />
                    <p className="mt-2 text-muted-foreground">No patients yet</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => navigate('/patients/new')}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add your first patient
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Prescriptions */}
        <Card className="overflow-hidden border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-muted/50 to-transparent">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-500" />
                Recent Prescriptions
              </CardTitle>
              <CardDescription>Latest prescriptions issued</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/prescriptions')}
              className="border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/50"
            >
              View all
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-4">
            {prescriptionsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {prescriptions?.map((rx, index) => (
                  <div
                    key={rx.id}
                    className="flex cursor-pointer items-center gap-4 rounded-xl p-3 transition-all duration-200 hover:bg-emerald-500/5 hover:shadow-md animate-slide-in-right"
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => navigate(`/patients/${rx.patientId}`)}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 text-white shadow-lg">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{rx.diagnosis}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(rx.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
                {prescriptions?.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground/30" />
                    <p className="mt-2 text-muted-foreground">No prescriptions yet</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => navigate('/prescriptions/new')}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create your first prescription
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-muted/30 to-transparent">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks you might want to do</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-6 hover:bg-primary/10 hover:border-primary/40 hover:text-foreground transition-all group"
              onClick={() => navigate('/patients/new')}
            >
              <div className="rounded-full bg-primary/10 p-3 group-hover:bg-primary/20 transition-colors">
                <Plus className="h-5 w-5 text-primary" />
              </div>
              <span className="font-medium text-foreground">New Patient</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-6 hover:bg-emerald-100 dark:hover:bg-emerald-900/20 hover:border-emerald-400/50 transition-all group"
              onClick={() => navigate('/prescriptions/new')}
            >
              <div className="rounded-full bg-emerald-500/10 p-3 group-hover:bg-emerald-500/20 transition-colors">
                <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="font-medium text-foreground">New Prescription</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-6 hover:bg-orange-100 dark:hover:bg-orange-900/20 hover:border-orange-400/50 transition-all group"
              onClick={() => navigate('/patients')}
            >
              <div className="rounded-full bg-orange-500/10 p-3 group-hover:bg-orange-500/20 transition-colors">
                <Users className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="font-medium text-foreground">View Patients</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-6 hover:bg-purple-100 dark:hover:bg-purple-900/20 hover:border-purple-400/50 transition-all group"
              onClick={() => navigate('/prescriptions')}
            >
              <div className="rounded-full bg-purple-500/10 p-3 group-hover:bg-purple-500/20 transition-colors">
                <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="font-medium text-foreground">All Prescriptions</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
