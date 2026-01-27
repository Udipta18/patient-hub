import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Search, Plus, ChevronLeft, ChevronRight, User,
  Filter, SortAsc, Grid, List, Phone, Mail, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { patientService } from '@/services/patient.service';

export function PatientListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const page = Number(searchParams.get('page')) || 1;
  const search = searchParams.get('search') || '';

  const { data, isLoading } = useQuery({
    queryKey: ['patients', page, search],
    queryFn: () => patientService.getPatients(page, 10, search),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ search: searchInput, page: '1' });
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams({ search, page: String(newPage) });
  };

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
      case 'male': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'female': return 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gradient">Patients</h1>
          <p className="text-muted-foreground mt-1">Manage and view all your patients</p>
        </div>
        <Button
          onClick={() => navigate('/patients/new')}
          className="bg-gradient-primary hover:opacity-90 transition-opacity shadow-lg"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Patient
        </Button>
      </div>

      {/* Search & Filters */}
      <Card className="border-0 shadow-lg glass-card">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <form onSubmit={handleSearch} className="flex gap-3 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, patient ID, or phone..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-12 h-12 bg-muted/50 border-0 rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-background transition-all"
                />
              </div>
              <Button type="submit" size="lg" className="px-6 rounded-xl">
                Search
              </Button>
            </form>

            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl">
                <SortAsc className="h-4 w-4" />
              </Button>
              <div className="flex rounded-xl border overflow-hidden">
                <Button
                  variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="rounded-none h-12 w-12"
                  onClick={() => setViewMode('table')}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="rounded-none h-12 w-12"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patient List */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Patient List
            </span>
            {data && (
              <Badge variant="secondary" className="text-sm font-normal">
                {data.total} patients found
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          ) : viewMode === 'table' ? (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="font-semibold">Patient</TableHead>
                      <TableHead className="font-semibold">ID</TableHead>
                      <TableHead className="font-semibold">Age</TableHead>
                      <TableHead className="font-semibold">Gender</TableHead>
                      <TableHead className="font-semibold">Blood Type</TableHead>
                      <TableHead className="font-semibold">Contact</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.data.map((patient, index) => (
                      <TableRow
                        key={patient.id}
                        className="cursor-pointer table-row-hover animate-slide-up"
                        style={{ animationDelay: `${index * 50}ms` }}
                        onClick={() => navigate(`/patients/${patient.id}`)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-4">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-white font-semibold shadow-md">
                              {patient.firstName[0]}
                              {patient.lastName[0]}
                            </div>
                            <div>
                              <p className="font-semibold">
                                {patient.firstName} {patient.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(patient.dateOfBirth).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono text-xs">
                            {patient.uid}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{calculateAge(patient.dateOfBirth)}</span>
                          <span className="text-muted-foreground text-sm"> yrs</span>
                        </TableCell>
                        <TableCell>
                          <Badge className={`capitalize ${getGenderColor(patient.gender)}`}>
                            {patient.gender}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {patient.bloodType ? (
                            <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                              {patient.bloodType}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {patient.phone ? (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              {patient.phone}
                            </div>
                          ) : patient.email ? (
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <span className="truncate max-w-[150px]">{patient.email}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {data?.data.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12">
                          <div className="flex flex-col items-center gap-4">
                            <div className="rounded-full bg-muted p-6">
                              <User className="h-12 w-12 text-muted-foreground/50" />
                            </div>
                            <div>
                              <p className="font-medium text-muted-foreground">No patients found</p>
                              <p className="text-sm text-muted-foreground/70">Try adjusting your search criteria</p>
                            </div>
                            <Button onClick={() => navigate('/patients/new')} variant="outline">
                              <Plus className="mr-2 h-4 w-4" />
                              Add new patient
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="p-4 space-y-3 md:hidden">
                {data?.data.map((patient, index) => (
                  <div
                    key={patient.id}
                    className="flex items-center gap-4 rounded-xl border p-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/30 animate-slide-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => navigate(`/patients/${patient.id}`)}
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-white text-lg font-semibold shadow-lg">
                      {patient.firstName[0]}
                      {patient.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-lg">
                        {patient.firstName} {patient.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">{patient.uid}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {calculateAge(patient.dateOfBirth)} yrs
                        </Badge>
                        <Badge className={`text-xs capitalize ${getGenderColor(patient.gender)}`}>
                          {patient.gender}
                        </Badge>
                        {patient.bloodType && (
                          <Badge variant="secondary" className="text-xs bg-red-100 text-red-700">
                            {patient.bloodType}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {data?.data.length === 0 && (
                  <div className="text-center py-12">
                    <div className="rounded-full bg-muted p-6 inline-block mb-4">
                      <User className="h-12 w-12 text-muted-foreground/50" />
                    </div>
                    <p className="text-muted-foreground">No patients found</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Grid View */
            <div className="p-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {data?.data.map((patient, index) => (
                <Card
                  key={patient.id}
                  className="cursor-pointer card-hover border-0 shadow-md animate-scale-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => navigate(`/patients/${patient.id}`)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-white text-xl font-bold shadow-lg mb-4">
                      {patient.firstName[0]}
                      {patient.lastName[0]}
                    </div>
                    <h3 className="font-semibold text-lg">
                      {patient.firstName} {patient.lastName}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">{patient.uid}</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {calculateAge(patient.dateOfBirth)} yrs
                      </Badge>
                      <Badge className={`text-xs capitalize ${getGenderColor(patient.gender)}`}>
                        {patient.gender}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between p-6 border-t bg-muted/20">
              <p className="text-sm text-muted-foreground">
                Page <span className="font-semibold">{data.page}</span> of <span className="font-semibold">{data.totalPages}</span>
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  className="rounded-lg"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= data.totalPages}
                  className="rounded-lg"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
