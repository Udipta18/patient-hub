import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { prescriptionService } from '@/services/prescription.service';
import type { Prescription } from '@/types';
import { format } from 'date-fns';

function PrescriptionCard({ prescription }: { prescription: Prescription }) {
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-900/30">
                            <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="space-y-1">
                            <p className="font-medium">{prescription.diagnosis}</p>
                            <p className="text-sm text-muted-foreground">
                                {format(new Date(prescription.createdAt), 'MMM d, yyyy')} • {prescription.doctorName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Patient ID: {prescription.patientId}
                            </p>
                        </div>
                    </div>
                    <Badge variant="secondary">
                        {prescription.medications.length} medication{prescription.medications.length !== 1 ? 's' : ''}
                    </Badge>
                </div>

                <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Medications:</p>
                    <div className="flex flex-wrap gap-2">
                        {prescription.medications.map((med, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                                {med.name} - {med.dosage}
                            </Badge>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export function PrescriptionsListPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

    const { data: prescriptions, isLoading } = useQuery({
        queryKey: ['prescriptions', 'all'],
        queryFn: () => prescriptionService.getRecentPrescriptions(100),
    });

    // Filter and sort prescriptions
    const filteredPrescriptions = prescriptions
        ?.filter((rx) => {
            if (!searchQuery) return true;
            const query = searchQuery.toLowerCase();
            return (
                rx.diagnosis.toLowerCase().includes(query) ||
                rx.patientId.toLowerCase().includes(query) ||
                rx.doctorName.toLowerCase().includes(query) ||
                rx.medications.some((med) => med.name.toLowerCase().includes(query))
            );
        })
        .sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
        });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Prescriptions</h1>
                <p className="text-muted-foreground">View and manage all prescriptions</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search by diagnosis, patient, doctor, or medication..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select value={sortBy} onValueChange={(value: 'newest' | 'oldest') => setSortBy(value)}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">Newest first</SelectItem>
                            <SelectItem value="oldest">Oldest first</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Prescriptions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{prescriptions?.length || 0}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            This Month
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">
                            {prescriptions?.filter((rx) => {
                                const rxDate = new Date(rx.createdAt);
                                const now = new Date();
                                return (
                                    rxDate.getMonth() === now.getMonth() &&
                                    rxDate.getFullYear() === now.getFullYear()
                                );
                            }).length || 0}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Filtered Results
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{filteredPrescriptions?.length || 0}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Prescriptions List */}
            {isLoading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <CardContent className="h-32 p-4" />
                        </Card>
                    ))}
                </div>
            ) : filteredPrescriptions && filteredPrescriptions.length > 0 ? (
                <div className="space-y-4">
                    {filteredPrescriptions.map((rx) => (
                        <PrescriptionCard key={rx.id} prescription={rx} />
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <FileText className="h-12 w-12 text-muted-foreground/50" />
                        <p className="mt-4 text-lg font-medium">No prescriptions found</p>
                        <p className="text-sm text-muted-foreground">
                            {searchQuery
                                ? 'Try adjusting your search query'
                                : 'Prescriptions will appear here once created'}
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
