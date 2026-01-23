import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Printer, Download, Edit, Check, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface PrescriptionData {
    diagnosis: string;
    medications: {
        name: string;
        dosage: string;
        frequency: string;
        duration: string;
        instructions?: string;
    }[];
    notes?: string;
}

interface PatientData {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    uid?: string;
    address?: string;
}

interface PrescriptionPreviewProps {
    patient: PatientData;
    data: PrescriptionData;
    onEdit: () => void;
    onConfirm: () => void;
    isSaving: boolean;
}

export function PrescriptionPreview({ patient, data, onEdit, onConfirm, isSaving }: PrescriptionPreviewProps) {
    const contentRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        window.print();
    };

    const calculateAge = (dob: string) => {
        if (!dob) return '';
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Action Bar - Hidden during print */}
            <div className="flex items-center justify-between no-print bg-muted/30 p-4 rounded-lg border">
                <div>
                    <h2 className="text-lg font-semibold">Prescription Preview</h2>
                    <p className="text-sm text-muted-foreground">Review the prescription before finalizing</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={onEdit} disabled={isSaving}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </Button>
                    <Button variant="outline" onClick={handlePrint} disabled={isSaving}>
                        <Printer className="mr-2 h-4 w-4" />
                        Print / Download PDF
                    </Button>
                    <Button onClick={onConfirm} disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                        Confirm & Save
                    </Button>
                </div>
            </div>

            {/* Prescription Document */}
            <Card className="p-8 bg-white text-black shadow-lg print:shadow-none print:border-none" ref={contentRef}>
                <style dangerouslySetInnerHTML={{
                    __html: `
          @media print {
            body * {
              visibility: hidden;
            }
            .no-print {
              display: none !important;
            }
            #root {
              display: none;
            }
            .prescription-content, .prescription-content * {
              visibility: visible;
            }
            .prescription-content {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              margin: 0;
              padding: 20px;
              background: white;
            }
            @page {
              size: auto;
              margin: 0mm;
            }
          }
        `}} />

                <div className="prescription-content space-y-8">
                    {/* Header */}
                    <div className="flex justify-between items-start border-b-2 border-black pb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-blue-900">Patient Hub</h1>
                            <p className="text-sm font-medium mt-1">Medical Practice Management</p>
                            <p className="text-sm text-gray-600">123 Medical Center Dr, Suite 100</p>
                            <p className="text-sm text-gray-600">New York, NY 10001</p>
                            <p className="text-sm text-gray-600">Phone: (555) 123-4567</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-xl font-bold">Dr. Sarah Johnson</h2>
                            <p className="text-sm text-gray-600">MD, General Practitioner</p>
                            <p className="text-sm text-gray-600">License #12345678</p>
                        </div>
                    </div>

                    {/* Patient Info */}
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm bg-gray-50 p-4 rounded-md print:bg-transparent print:p-0">
                        <div>
                            <span className="font-bold text-gray-500 uppercase text-xs">Patient Name</span>
                            <p className="text-lg font-medium">{patient.firstName} {patient.lastName}</p>
                        </div>
                        <div>
                            <span className="font-bold text-gray-500 uppercase text-xs">Date</span>
                            <p className="text-lg font-medium">{format(new Date(), 'MMMM d, yyyy')}</p>
                        </div>
                        <div>
                            <span className="font-bold text-gray-500 uppercase text-xs">Age / Gender</span>
                            <p>{calculateAge(patient.dateOfBirth)} years / {patient.gender}</p>
                        </div>
                        <div>
                            <span className="font-bold text-gray-500 uppercase text-xs">Patient ID</span>
                            <p>{patient.uid || 'New Patient'}</p>
                        </div>
                        <div className="col-span-2">
                            <span className="font-bold text-gray-500 uppercase text-xs">Diagnosis</span>
                            <p className="font-medium">{data.diagnosis}</p>
                        </div>
                    </div>

                    {/* Rx Lists */}
                    <div className="mt-8 space-y-6">
                        <div className="text-4xl font-serif italic font-bold">Rx</div>

                        <div className="space-y-6 pl-4">
                            {data.medications.map((med, index) => (
                                <div key={index} className="border-b border-gray-100 pb-4 last:border-0">
                                    <div className="flex items-baseline gap-2">
                                        <span className="font-bold text-lg">{index + 1}. {med.name}</span>
                                        <span className="text-lg text-gray-700">{med.dosage}</span>
                                    </div>
                                    <div className="mt-1 text-gray-600 pl-5">
                                        <p>Frequency: {med.frequency}</p>
                                        <p>Duration: {med.duration}</p>
                                        {med.instructions && <p className="italic">Note: {med.instructions}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Notes */}
                    {data.notes && (
                        <div className="mt-8 pt-4 border-t border-dashed">
                            <h3 className="font-bold text-sm uppercase text-gray-500 mb-2">Additional Notes</h3>
                            <p className="text-gray-700 whitespace-pre-wrap">{data.notes}</p>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="mt-20 pt-8 flex justify-between items-end">
                        <div className="text-xs text-gray-400">
                            <p>Generated by Patient Hub</p>
                            <p>{new Date().toLocaleString()}</p>
                        </div>
                        <div className="text-center w-64 border-t border-black pt-2">
                            <p className="font-serif italic text-lg">Dr. Sarah Johnson</p>
                            <p className="text-xs text-gray-500 uppercase mt-1">Doctor's Signature</p>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
