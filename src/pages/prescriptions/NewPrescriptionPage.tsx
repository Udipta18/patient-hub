import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { prescriptionService } from '@/services/prescription.service';
import { patientService } from '@/services/patient.service';

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

  const onSubmit = (data: PrescriptionForm) => {
    if (!patientId) {
      toast({ title: 'Error', description: 'Patient ID is required', variant: 'destructive' });
      return;
    }
    createMutation.mutate(data);
  };

  // State for new patient mode
  const [isCreatingPatient, setIsCreatingPatient] = useState(!patientId);
  const [newPatientData, setNewPatientData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'male' as 'male' | 'female' | 'other',
    phone: '',
    email: '',
  });

  // Create patient and then prescription mutation
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

  const onSubmitNewPatient = (data: PrescriptionForm) => {
    // Validate patient data
    if (!newPatientData.firstName || !newPatientData.lastName || !newPatientData.dateOfBirth) {
      toast({ title: 'Error', description: 'Please fill in all required patient fields', variant: 'destructive' });
      return;
    }
    createPatientAndPrescriptionMutation.mutate(data);
  };

  if (!patientId) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/patients')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">New Patient & Prescription</h1>
            <p className="text-muted-foreground">Create a new patient and their prescription</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmitNewPatient)} className="space-y-6">
            {/* Patient Details */}
            <Card>
              <CardHeader>
                <CardTitle>Patient Details</CardTitle>
                <CardDescription>Enter the patient's personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">First Name *</label>
                    <Input
                      placeholder="John"
                      value={newPatientData.firstName}
                      onChange={(e) => setNewPatientData(prev => ({ ...prev, firstName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Last Name *</label>
                    <Input
                      placeholder="Doe"
                      value={newPatientData.lastName}
                      onChange={(e) => setNewPatientData(prev => ({ ...prev, lastName: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date of Birth *</label>
                    <Input
                      type="date"
                      value={newPatientData.dateOfBirth}
                      onChange={(e) => setNewPatientData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Gender</label>
                    <select
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                      value={newPatientData.gender}
                      onChange={(e) => setNewPatientData(prev => ({ ...prev, gender: e.target.value as 'male' | 'female' | 'other' }))}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone</label>
                    <Input
                      placeholder="+1 555-0123"
                      value={newPatientData.phone}
                      onChange={(e) => setNewPatientData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      value={newPatientData.email}
                      onChange={(e) => setNewPatientData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Diagnosis */}
            <Card>
              <CardHeader>
                <CardTitle>Diagnosis</CardTitle>
                <CardDescription>Enter the primary diagnosis for this prescription</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="diagnosis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Diagnosis</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Upper Respiratory Infection" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Medications */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Medications</CardTitle>
                  <CardDescription>Add one or more medications to this prescription</CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({ name: '', dosage: '', frequency: '', duration: '', instructions: '' })
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Medication
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {fields.map((field, index) => (
                  <div key={field.id} className="relative rounded-lg border p-4">
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name={`medications.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Medication Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Amoxicillin" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`medications.${index}.dosage`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dosage</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 500mg" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`medications.${index}.frequency`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Frequency</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Three times daily" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`medications.${index}.duration`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duration</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 7 days" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`medications.${index}.instructions`}
                        render={({ field }) => (
                          <FormItem className="sm:col-span-2">
                            <FormLabel>Special Instructions (optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Take with food" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
                <CardDescription>Any additional instructions or notes for the patient</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., Rest and increase fluid intake. Follow up in one week if symptoms persist."
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => navigate('/patients')}>
                Cancel
              </Button>
              <Button type="submit" disabled={createPatientAndPrescriptionMutation.isPending}>
                {createPatientAndPrescriptionMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Patient & Prescription
              </Button>
            </div>
          </form>
        </Form>
      </div>
    );
  }



  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Prescription</h1>
          {patient && (
            <p className="text-muted-foreground">
              For {patient.firstName} {patient.lastName} ({patient.uid})
            </p>
          )}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Diagnosis */}
          <Card>
            <CardHeader>
              <CardTitle>Diagnosis</CardTitle>
              <CardDescription>Enter the primary diagnosis for this prescription</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="diagnosis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Diagnosis</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Upper Respiratory Infection" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Medications */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Medications</CardTitle>
                <CardDescription>Add one or more medications to this prescription</CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({ name: '', dosage: '', frequency: '', duration: '', instructions: '' })
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Medication
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {fields.map((field, index) => (
                <div key={field.id} className="relative rounded-lg border p-4">
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name={`medications.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Medication Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Amoxicillin" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`medications.${index}.dosage`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dosage</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 500mg" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`medications.${index}.frequency`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Frequency</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Three times daily" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`medications.${index}.duration`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 7 days" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`medications.${index}.instructions`}
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel>Special Instructions (optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Take with food" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
              <CardDescription>Any additional instructions or notes for the patient</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Rest and increase fluid intake. Follow up in one week if symptoms persist."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Prescription
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
