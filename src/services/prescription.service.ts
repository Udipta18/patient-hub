import { api } from './api';
import type { Prescription, Medication, PaginatedResponse } from '@/types';

// Backend API response types (snake_case from backend)
interface BackendPrescription {
  id: string;
  patient_id: string;
  doctor_id: string;
  medications: {
    name: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
    instructions?: string;
  }[];
  diagnosis?: string;
  notes?: string;
  prescribed_date?: string;
  created_at: string;
  updated_at: string;
}

// Helper function to convert backend prescription to frontend format
function mapBackendPrescription(backendPrescription: BackendPrescription): Prescription {
  return {
    id: backendPrescription.id,
    patientId: backendPrescription.patient_id,
    doctorId: backendPrescription.doctor_id,
    doctorName: 'Dr. Sarah Johnson', // Backend doesn't include doctor name yet
    diagnosis: backendPrescription.diagnosis || '',
    medications: backendPrescription.medications.map((med, index) => ({
      id: `${backendPrescription.id}-med-${index}`,
      name: med.name,
      dosage: med.dosage || '',
      frequency: med.frequency || '',
      duration: med.duration || '',
      instructions: med.instructions,
    })),
    notes: backendPrescription.notes,
    createdAt: backendPrescription.created_at,
  };
}

export const prescriptionService = {
  // Get prescriptions for a patient
  async getPatientPrescriptions(
    patientId: string,
    page = 1,
    pageSize = 10
  ): Promise<PaginatedResponse<Prescription>> {
    try {
      const response: any = await api.get<any>(
        `/prescriptions/patient/${patientId}`
      );
      const backendPrescriptions: BackendPrescription[] = Array.isArray(response) ? response : (response.data || []);

      // Map to frontend format
      const prescriptions = backendPrescriptions.map(mapBackendPrescription);

      // Apply pagination on frontend
      const paginatedData = prescriptions.slice((page - 1) * pageSize, page * pageSize);

      return {
        data: paginatedData,
        total: prescriptions.length,
        page,
        pageSize,
        totalPages: Math.ceil(prescriptions.length / pageSize),
      };
    } catch (error) {
      console.error('Failed to fetch prescriptions:', error);
      // Return empty result instead of throwing
      return {
        data: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0,
      };
    }
  },

  // Get single prescription
  async getPrescription(id: string): Promise<Prescription> {
    try {
      const response: any = await api.get<any>(`/prescriptions/${id}`);
      const backendPrescription = response.data || response;
      return mapBackendPrescription(backendPrescription);
    } catch (error) {
      console.error('Failed to fetch prescription:', error);
      throw new Error('Prescription not found');
    }
  },

  // Create new prescription
  async createPrescription(data: {
    patientId: string;
    diagnosis: string;
    medications: Omit<Medication, 'id'>[];
    notes?: string;
  }): Promise<Prescription> {
    try {
      const backendData = {
        patientId: data.patientId,
        diagnosis: data.diagnosis,
        medications: data.medications.map(med => ({
          name: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          duration: med.duration,
          instructions: med.instructions,
        })),
        notes: data.notes,
        prescribedDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
      };

      const response: any = await api.post<any>(
        '/prescriptions',
        backendData
      );

      const backendPrescription = response.data || response;

      return mapBackendPrescription(backendPrescription);
    } catch (error: any) {
      console.error('Failed to create prescription:', error);

      const errorMessage = error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to create prescription';

      throw new Error(errorMessage);
    }
  },

  // Get all recent prescriptions (for dashboard)
  async getRecentPrescriptions(limit = 5): Promise<Prescription[]> {
    try {
      // Backend doesn't have a recent prescriptions endpoint yet
      // We'll get all prescriptions and sort/limit on frontend
      // In production, you might want to add a dedicated endpoint for this

      // For now, we'll return an empty array since we don't have a way to get all prescriptions
      // without a patient ID. You may need to add a new backend endpoint for this.
      console.warn('getRecentPrescriptions: Backend endpoint not available, returning empty array');
      return [];
    } catch (error) {
      console.error('Failed to fetch recent prescriptions:', error);
      return [];
    }
  },
};
