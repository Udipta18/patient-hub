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

// Backend API response wrapper
interface ApiResponse<T> {
  success?: boolean;
  data: T;
  message?: string;
}

type PrescriptionListResponse = BackendPrescription[] | ApiResponse<BackendPrescription[]>;
type PrescriptionResponse = BackendPrescription | ApiResponse<BackendPrescription>;

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
      const response = await api.get<PrescriptionListResponse>(
        `/prescriptions/patient/${patientId}`
      );
      const backendPrescriptions: BackendPrescription[] = Array.isArray(response)
        ? response
        : ((response as ApiResponse<BackendPrescription[]>).data || []);

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
      const response = await api.get<PrescriptionResponse>(`/prescriptions/${id}`);
      const backendPrescription = 'data' in response
        ? (response as ApiResponse<BackendPrescription>).data
        : response as BackendPrescription;
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

      const response = await api.post<ApiResponse<BackendPrescription>>(
        '/prescriptions',
        backendData
      );

      const backendPrescription = response.data;

      return mapBackendPrescription(backendPrescription);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string; error?: string } }; message?: string };

      const errorMessage = axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        axiosError.message ||
        'Failed to create prescription';

      throw new Error(errorMessage);
    }
  },

  // Get all recent prescriptions (for dashboard)
  async getRecentPrescriptions(limit = 5): Promise<Prescription[]> {
    try {
      // Fetch prescriptions (assuming endpoint exists, or fallback gracefully)
      const response = await api.get<PrescriptionListResponse>('/prescriptions');
      const backendPrescriptions: BackendPrescription[] = Array.isArray(response)
        ? response
        : ((response as ApiResponse<BackendPrescription[]>).data || []);

      const prescriptions = backendPrescriptions.map(mapBackendPrescription);

      // Sort by date descending and take top N
      return prescriptions
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit);
    } catch (error) {
      // Silent failure for dashboard widget
      return [];
    }
  },
};
