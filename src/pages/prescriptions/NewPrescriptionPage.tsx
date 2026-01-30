import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, Loader2, Stethoscope, Pill, FileText, CheckCircle2, User, ChevronDown, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { prescriptionService } from '@/services/prescription.service';
import { patientService } from '@/services/patient.service';
import { PrescriptionPreview } from '@/components/prescriptions/PrescriptionPreview';
import { MedicineRow, AutofillHint, MedicineRowSkeleton } from '@/components/prescriptions/MedicineRow';
import { MultiDiagnosisAutocomplete } from '@/components/prescriptions/MultiDiagnosisAutocomplete';
import { useMultipleDiagnosisMedicines } from '@/hooks/use-multiple-diagnosis-medicines';
import type { Diagnosis } from '@/types/diagnosis';

const medicationSchema = z.object({
  name: z.string().min(1, 'Medication name is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  frequency: z.string().min(1, 'Frequency is required'),
  duration: z.string().min(1, 'Duration is required'),
  instructions: z.string().optional(),
});

const prescriptionSchema = z.object({
  diagnosis: z.string().min(1, 'Diagnosis is required'),
  medications: z.array(medicationSchema).min(1, 'At least one medication is required'),
  notes: z.string().optional(),
});

type PrescriptionForm = z.infer<typeof prescriptionSchema>;

export function NewPrescriptionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const patientId = searchParams.get('patientId');

  // Preview State
  const [showPreview, setShowPreview] = useState(false);
  const [pendingData, setPendingData] = useState<PrescriptionForm | null>(null);

  // New Patient State
  const [newPatientData, setNewPatientData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'male' as 'male' | 'female' | 'other',
    phone: '',
    email: '',
  });
  const [calendarOpen, setCalendarOpen] = useState(false);

  const { data: patient } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => patientService.getPatient(patientId!),
    enabled: !!patientId,
  });

  const form = useForm<PrescriptionForm>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      diagnosis: '',
      medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
      notes: '',
    },
  });

  // Selected diagnoses state - stores array of full diagnosis objects with IDs
  const [selectedDiagnoses, setSelectedDiagnoses] = useState<Diagnosis[]>([]);

  // Handle diagnoses change from autocomplete
  const handleDiagnosesChange = useCallback((diagnoses: Diagnosis[]) => {
    setSelectedDiagnoses(diagnoses);
  }, []);

  // Fetch medicines for all selected diagnoses (using UUIDs)
  const diagnosisIds = selectedDiagnoses.map(d => d.id);
  const {
    data: diagnosisMedicines = [],
    isLoading: isLoadingMedicines
  } = useMultipleDiagnosisMedicines(diagnosisIds);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'medications',
  });

  const createMutation = useMutation({
    mutationFn: (data: PrescriptionForm) =>
      prescriptionService.createPrescription({
        patientId: patientId!,
        diagnosis: data.diagnosis,
        medications: data.medications as { name: string; dosage: string; frequency: string; duration: string; instructions?: string }[],
        notes: data.notes,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      toast({ title: 'Success', description: 'Prescription created successfully', variant: 'success' });
      navigate(`/patients/${patientId}`);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create prescription',
        variant: 'destructive',
      });
    },
  });

  const createPatientAndPrescriptionMutation = useMutation({
    mutationFn: async (prescriptionData: PrescriptionForm) => {
      // First create the patient
      const newPatient = await patientService.createPatient({
        firstName: newPatientData.firstName,
        lastName: newPatientData.lastName,
        dateOfBirth: newPatientData.dateOfBirth,
        gender: newPatientData.gender,
        phone: newPatientData.phone || undefined,
        email: newPatientData.email || undefined,
      });

      // Then create the prescription for that patient
      await prescriptionService.createPrescription({
        patientId: newPatient.id,
        diagnosis: prescriptionData.diagnosis,
        medications: prescriptionData.medications as { name: string; dosage: string; frequency: string; duration: string; instructions?: string }[],
        notes: prescriptionData.notes,
      });

      return newPatient;
    },
    onSuccess: (newPatient) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      toast({ title: 'Success', description: 'Patient and prescription created successfully', variant: 'success' });
      navigate(`/patients/${newPatient.id}`);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create patient and prescription',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: PrescriptionForm) => {
    if (patientId) {
      setPendingData(data);
      setShowPreview(true);
    } else {
      // New Patient Validation
      if (!newPatientData.firstName || !newPatientData.lastName || !newPatientData.dateOfBirth) {
        toast({ title: 'Error', description: 'Please fill in all required patient fields', variant: 'destructive' });
        return;
      }
      setPendingData(data);
      setShowPreview(true);
    }
  };

  const handleConfirm = () => {
    if (!pendingData) return;

    if (patientId) {
      createMutation.mutate(pendingData);
    } else {
      createPatientAndPrescriptionMutation.mutate(pendingData);
    }
  };

  // Render Preview
  if (showPreview && pendingData) {
    const previewPatient = patientId && patient ? {
      firstName: patient.firstName,
      lastName: patient.lastName,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      uid: patient.uid,
      address: patient.address
    } : {
      firstName: newPatientData.firstName,
      lastName: newPatientData.lastName,
      dateOfBirth: newPatientData.dateOfBirth,
      gender: newPatientData.gender,
      uid: 'NEW PATIENT',
      address: ''
    };

    return (
      <PrescriptionPreview
        patient={previewPatient}
        data={pendingData}
        onEdit={() => setShowPreview(false)}
        onConfirm={handleConfirm}
        isSaving={createMutation.isPending || createPatientAndPrescriptionMutation.isPending}
      />
    );
  }

  // Render New Patient Form
  if (!patientId) {
    return (
      <div className="space-y-8 max-w-4xl mx-auto pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/patients')} className="rounded-full hover:bg-primary/10 hover:text-primary">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight text-gradient">New Patient & Prescription</h1>
              <p className="text-muted-foreground">Register a new patient and create their first prescription</p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Patient Details */}
            <div className="glass-card rounded-xl p-6 relative overflow-hidden group">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-cyan-400 opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Patient Details</h3>
                  <p className="text-sm text-muted-foreground">Personal information</p>
                </div>
              </div>

              <div className="grid gap-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">First Name *</label>
                    <Input
                      placeholder="John"
                      value={newPatientData.firstName}
                      onChange={(e) => setNewPatientData(prev => ({ ...prev, firstName: e.target.value }))}
                      className="h-12 text-lg bg-background/50 border-2 border-input/60 focus:border-primary focus:ring-primary/20 transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Last Name *</label>
                    <Input
                      placeholder="Doe"
                      value={newPatientData.lastName}
                      onChange={(e) => setNewPatientData(prev => ({ ...prev, lastName: e.target.value }))}
                      className="h-12 text-lg bg-background/50 border-2 border-input/60 focus:border-primary focus:ring-primary/20 transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Date of Birth *</label>
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-4 text-left h-12 text-lg rounded-xl border-2 border-input/60 bg-background/50 hover:bg-background/80 hover:border-primary/50 transition-all font-medium",
                            !newPatientData.dateOfBirth && "text-muted-foreground"
                          )}
                        >
                          {newPatientData.dateOfBirth ? (
                            format(new Date(newPatientData.dateOfBirth), "PPP")
                          ) : (
                            <span>Select date of birth</span>
                          )}
                          <CalendarIcon className="ml-auto h-5 w-5 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 rounded-xl shadow-xl border-border/50" align="start">
                        <Calendar
                          mode="single"
                          selected={newPatientData.dateOfBirth ? new Date(newPatientData.dateOfBirth) : undefined}
                          onSelect={(date) => {
                            setNewPatientData(prev => ({ ...prev, dateOfBirth: date ? format(date, "yyyy-MM-dd") : '' }));
                            setCalendarOpen(false);
                          }}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                          className="p-3"
                          captionLayout="dropdown"
                          fromYear={1900}
                          toYear={new Date().getFullYear()}
                          showOutsideDays={false}
                          classNames={{
                            head_row: "hidden",
                            head_cell: "hidden",
                            weekdays: "hidden",
                            weekday: "hidden",
                            day: "inline-flex items-center justify-center h-10 w-10 p-0 font-medium text-sm rounded-full transition-all duration-200 hover:bg-primary/10 hover:text-primary",
                            day_button: "inline-flex items-center justify-center h-10 w-10 p-0 font-medium text-sm rounded-full transition-all duration-200 hover:bg-primary/10 hover:text-primary",
                            day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-full shadow-md",
                            selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground rounded-full shadow-md",
                            caption_dropdowns: "flex justify-center gap-2",
                            dropdown: "bg-background text-foreground border border-input rounded-md px-2 py-1 text-sm font-medium cursor-pointer hover:bg-accent hover:text-accent-foreground",
                            vhidden: "hidden",
                            caption_label: "hidden",
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Gender</label>
                    <div className="relative">
                      <select
                        className="w-full h-12 px-3 rounded-xl border-2 border-input/60 bg-background/50 text-lg focus:border-primary focus:ring-primary/20 transition-all appearance-none font-medium"
                        value={newPatientData.gender}
                        onChange={(e) => setNewPatientData(prev => ({ ...prev, gender: e.target.value as 'male' | 'female' | 'other' }))}
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Phone</label>
                    <Input
                      placeholder="+1 555-0123"
                      value={newPatientData.phone}
                      onChange={(e) => setNewPatientData(prev => ({ ...prev, phone: e.target.value }))}
                      className="h-12 text-lg bg-background/50 border-2 border-input/60 focus:border-primary focus:ring-primary/20 transition-all font-medium placeholder:font-normal"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Email</label>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      value={newPatientData.email}
                      onChange={(e) => setNewPatientData(prev => ({ ...prev, email: e.target.value }))}
                      className="h-12 text-lg bg-background/50 border-2 border-input/60 focus:border-primary focus:ring-primary/20 transition-all font-medium placeholder:font-normal"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Diagnosis */}
            <MultiDiagnosisAutocomplete
              form={form}
              onDiagnosesChange={handleDiagnosesChange}
              selectedDiagnoses={selectedDiagnoses}
            />

            {/* Medications */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                    <Pill className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Medications</h3>
                    <p className="text-sm text-muted-foreground">Prescribed drugs and dosage</p>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={() =>
                    append({ name: '', dosage: '', frequency: '', duration: '', instructions: '' })
                  }
                  className="bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border-primary/20 border transition-all"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Medication
                </Button>
              </div>

              {/* Autofill Hint - shown when medicines are available */}
              <AutofillHint isVisible={diagnosisMedicines.length > 0} />

              <div className="space-y-4">
                {isLoadingMedicines && fields.length === 1 ? (
                  <MedicineRowSkeleton />
                ) : (
                  fields.map((field, index) => (
                    <MedicineRow
                      key={field.id}
                      form={form}
                      field={field}
                      index={index}
                      medicines={diagnosisMedicines}
                      isLoadingMedicines={isLoadingMedicines}
                      canRemove={fields.length > 1}
                      onRemove={() => remove(index)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="glass-card rounded-xl p-6 relative overflow-hidden">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Clinical Notes</h3>
                  <p className="text-sm text-muted-foreground">Additional context or advice</p>
                </div>
              </div>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Add any relevant clinical notes, patient advice, or follow-up instructions..."
                        rows={3}
                        className="resize-none bg-background/50 border-2 border-input/60 focus:border-primary min-h-[100px] text-base"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => navigate('/patients')} className="h-11 px-6">
                Cancel
              </Button>
              <Button type="submit" className="btn-premium h-11 px-8 rounded-lg shadow-lg shadow-primary/20">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Preview Prescription
              </Button>
            </div>
          </form>
        </Form>
      </div>
    );
  }

  // Render Existing Patient Form
  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full hover:bg-primary/10 hover:text-primary">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-gradient">New Prescription</h1>
            {patient ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Patient:</span>
                <span className="font-medium text-foreground">{patient.firstName} {patient.lastName}</span>
                <Badge variant="secondary" className="font-mono text-xs">{patient.uid}</Badge>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

          {/* Diagnosis Section */}
          <MultiDiagnosisAutocomplete
            form={form}
            onDiagnosesChange={handleDiagnosesChange}
            selectedDiagnoses={selectedDiagnoses}
          />

          {/* Medications Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                  <Pill className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Medications</h3>
                  <p className="text-sm text-muted-foreground">Prescribed drugs and dosage</p>
                </div>
              </div>
              <Button
                type="button"
                onClick={() =>
                  append({ name: '', dosage: '', frequency: '', duration: '', instructions: '' })
                }
                className="bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border-primary/20 border transition-all"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Medication
              </Button>
            </div>

            {/* Autofill Hint - shown when medicines are available */}
            <AutofillHint isVisible={diagnosisMedicines.length > 0} />

            <div className="space-y-4">
              {isLoadingMedicines && fields.length === 1 ? (
                <MedicineRowSkeleton />
              ) : (
                fields.map((field, index) => (
                  <MedicineRow
                    key={field.id}
                    form={form}
                    field={field}
                    index={index}
                    medicines={diagnosisMedicines}
                    isLoadingMedicines={isLoadingMedicines}
                    canRemove={fields.length > 1}
                    onRemove={() => remove(index)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Notes Section */}
          <div className="glass-card rounded-xl p-6 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Clinical Notes</h3>
                <p className="text-sm text-muted-foreground">Additional context or advice</p>
              </div>
            </div>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Add any relevant clinical notes, patient advice, or follow-up instructions..."
                      rows={3}
                      className="resize-none bg-background/50 border-2 border-input/60 focus:border-primary min-h-[100px] text-base"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => navigate(-1)} className="h-11 px-6">
              Cancel
            </Button>
            <Button type="submit" className="btn-premium h-11 px-8 rounded-lg shadow-lg shadow-primary/20">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Preview Prescription
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
