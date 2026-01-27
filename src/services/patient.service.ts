import { api } from './api';
import type { Patient, PaginatedResponse, TimelineEvent, MindMapData } from '@/types';

// ============================================
// Backend API Response Types (snake_case)
// ============================================

interface BackendPatient {
  id: string;
  patient_uid: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  blood_type?: string;
  allergies?: string[];
  doctor_id: string;
  created_at: string;
  updated_at: string;
}

interface BackendMedication {
  id?: string;
  name: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
}

interface BackendPrescription {
  id: string;
  patient_id: string;
  doctor_id: string;
  diagnosis?: string;
  medications?: BackendMedication[];
  notes?: string;
  prescribed_date?: string;
  created_at: string;
  updated_at?: string;
}

interface BackendAiInsight {
  id: string;
  type: string;
  content: string;
  created_at: string;
}

interface BackendPatientHistory {
  patient: BackendPatient;
  prescriptions: BackendPrescription[];
  aiInsights: BackendAiInsight[];
}

// Backend API response wrappers
interface ApiResponse<T> {
  success?: boolean;
  data: T;
  message?: string;
  timestamp?: string;
}

type PatientListResponse = BackendPatient[] | ApiResponse<BackendPatient[]>;
type PatientResponse = BackendPatient | ApiResponse<BackendPatient>;
type PatientHistoryResponse = BackendPatientHistory | ApiResponse<BackendPatientHistory>;

// Helper function to convert backend patient to frontend format
function mapBackendPatient(backendPatient: BackendPatient): Patient {
  return {
    id: backendPatient.id,
    uid: backendPatient.patient_uid,
    firstName: backendPatient.first_name,
    lastName: backendPatient.last_name,
    email: backendPatient.email,
    phone: backendPatient.phone,
    dateOfBirth: backendPatient.date_of_birth || '',
    gender: backendPatient.gender || 'other',
    address: backendPatient.address,
    bloodType: backendPatient.blood_type,
    allergies: backendPatient.allergies || [],
    createdAt: backendPatient.created_at,
    updatedAt: backendPatient.updated_at,
  };
}

// Helper function to convert frontend patient to backend format
function mapToBackendPatient(patient: Partial<Patient>) {
  return {
    firstName: patient.firstName,
    lastName: patient.lastName,
    email: patient.email,
    phone: patient.phone,
    dateOfBirth: patient.dateOfBirth,
    gender: patient.gender,
    address: patient.address,
    bloodType: patient.bloodType,
    allergies: patient.allergies,
  };
}

export const patientService = {
  // Get all patients
  async getPatients(
    page = 1,
    pageSize = 10,
    search?: string
  ): Promise<PaginatedResponse<Patient>> {
    try {
      const response = await api.get<PatientListResponse>('/patients');
      // Handle if backend returns { data: [...] } or just [...]
      const backendPatients: BackendPatient[] = Array.isArray(response)
        ? response
        : ((response as ApiResponse<BackendPatient[]>).data || []);

      // Apply search filter on frontend (backend doesn't support search yet)
      let filtered = backendPatients;
      if (search) {
        const searchLower = search.toLowerCase();
        filtered = backendPatients.filter(
          (p) =>
            p.first_name.toLowerCase().includes(searchLower) ||
            p.last_name.toLowerCase().includes(searchLower) ||
            p.patient_uid.toLowerCase().includes(searchLower) ||
            p.email?.toLowerCase().includes(searchLower)
        );
      }

      // Map to frontend format
      const patients = filtered.map(mapBackendPatient);

      // Apply pagination on frontend
      const paginatedData = patients.slice((page - 1) * pageSize, page * pageSize);

      return {
        data: paginatedData,
        total: patients.length,
        page,
        pageSize,
        totalPages: Math.ceil(patients.length / pageSize),
      };
    } catch (error) {
      console.error('Failed to fetch patients:', error);
      throw new Error('Failed to fetch patients');
    }
  },

  // Get single patient by ID
  async getPatient(id: string): Promise<Patient> {
    try {
      const response = await api.get<PatientResponse>(`/patients/${id}`);
      const backendPatient = 'data' in response
        ? (response as ApiResponse<BackendPatient>).data
        : response as BackendPatient;
      return mapBackendPatient(backendPatient);
    } catch (error) {
      console.error('Failed to fetch patient:', error);
      throw new Error('Patient not found');
    }
  },

  // Create new patient
  async createPatient(data: Omit<Patient, 'id' | 'uid' | 'createdAt' | 'updatedAt'>): Promise<Patient> {
    try {
      // Validate required fields
      if (!data.firstName || !data.lastName) {
        throw new Error('First name and last name are required');
      }

      const backendData = mapToBackendPatient(data);

      // The backend returns { success: true, data: { ...patient }, timestamp: ... }
      const response = await api.post<ApiResponse<BackendPatient>>('/patients', backendData);

      // Handle the nested data structure
      const backendPatient = response.data;

      return mapBackendPatient(backendPatient);
    } catch (error: unknown) {
      const axiosError = error as { response?: { status?: number; data?: { message?: string | string[]; error?: string } }; message?: string };

      // Show actual backend error message if available
      const errorMessage = axiosError.response?.data?.message && typeof axiosError.response.data.message === 'string'
        ? axiosError.response.data.message
        : axiosError.response?.data?.error ||
        axiosError.message ||
        'Failed to create patient';

      // If it's a validation error, show the details
      if (axiosError.response?.status === 400 && Array.isArray(axiosError.response?.data?.message)) {
        throw new Error(`Validation error: ${axiosError.response.data.message.join(', ')}`);
      }

      throw new Error(errorMessage);
    }
  },

  // Get patient history
  async getPatientHistory(patientId: string): Promise<BackendPatientHistory> {
    try {
      const response = await api.get<PatientHistoryResponse>(`/patients/${patientId}/history`);
      return 'data' in response
        ? (response as ApiResponse<BackendPatientHistory>).data
        : response as BackendPatientHistory;
    } catch (error) {
      console.error('Failed to fetch patient history:', error);
      throw new Error('Failed to fetch patient history');
    }
  },

  // Get patient timeline
  async getPatientTimeline(patientId: string): Promise<TimelineEvent[]> {
    try {
      // Get patient history and convert to timeline events
      const history = await this.getPatientHistory(patientId);

      const timelineEvents: TimelineEvent[] = [];

      // Add prescription events
      history.prescriptions.forEach((prescription) => {
        timelineEvents.push({
          id: prescription.id,
          type: 'prescription',
          title: 'Prescription Issued',
          description: prescription.diagnosis || 'Prescription created',
          date: prescription.created_at,
          metadata: prescription as Record<string, unknown>,
        });
      });

      // Sort by date (newest first)
      return timelineEvents.sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    } catch (error) {
      console.error('Failed to fetch patient timeline:', error);
      // Return empty timeline instead of throwing
      return [];
    }
  },

  // Get patient mind map data
  async getPatientMindMap(patientId: string): Promise<MindMapData> {
    try {
      const history = await this.getPatientHistory(patientId);
      const patient = mapBackendPatient(history.patient);

      // Extract conditions and medications from prescriptions
      const conditions: MindMapData['conditions'] = [];
      const encounters: MindMapData['encounters'] = [];
      const medications: MindMapData['medications'] = [];
      const alerts: MindMapData['alerts'] = [];

      // Process prescriptions with aggregation logic
      const diagnosisMap = new Map<string, string>(); // Name -> ConditionId

      history.prescriptions.forEach((prescription) => {
        const diagName = prescription.diagnosis || 'Unknown Condition';

        // 1. Get or Create Condition Node (Level 2)
        let conditionId = diagnosisMap.get(diagName);
        if (!conditionId) {
          conditionId = `c-${diagName.toLowerCase().replace(/\s+/g, '-')}`;
          diagnosisMap.set(diagName, conditionId);
          conditions.push({
            id: conditionId,
            name: diagName,
            severity: 'medium',
            diagnosedDate: prescription.prescribed_date,
          });
        }

        // 2. Create Encounter Node (Level 3 - Date)
        const encounterId = `e-${prescription.id}`;
        encounters.push({
          id: encounterId,
          conditionId: conditionId!,
          date: prescription.prescribed_date || prescription.created_at || 'Unknown Date',
        });

        // 3. Create Medication Nodes (Level 4)
        if (prescription.medications && Array.isArray(prescription.medications)) {
          prescription.medications.forEach((med, index) => {
            medications.push({
              id: `m-${prescription.id}-${index}`,
              encounterId: encounterId,
              name: med.name,
              dosage: med.dosage || '',
              active: true,
              prescribedDate: prescription.prescribed_date || prescription.created_at || 'Unknown Date',
            });
          });
        }
      });

      // Add patient allergies as alerts
      if (patient.allergies && patient.allergies.length > 0) {
        patient.allergies.forEach((allergy, index) => {
          alerts.push({
            id: `a-${index}`,
            type: 'allergy',
            message: `${allergy} Allergy`,
            severity: 'high',
          });
        });
      }

      return {
        patientId,
        patientName: `${patient.firstName} ${patient.lastName}`,
        conditions,
        encounters,
        medications,
        alerts,
      };
    } catch (error) {
      console.error('Failed to fetch patient mind map:', error);
      // Return minimal data instead of throwing
      return {
        patientId,
        patientName: 'Unknown Patient',
        conditions: [],
        encounters: [],
        medications: [],
        alerts: [],
      };
    }
  },
};
