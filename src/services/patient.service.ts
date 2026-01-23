import { api } from './api';
import type { Patient, PaginatedResponse, TimelineEvent, MindMapData } from '@/types';

// Backend API response types (snake_case from backend)
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

interface BackendPatientHistory {
  patient: BackendPatient;
  prescriptions: any[];
  aiInsights: any[];
}

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
      const response: any = await api.get<any>('/patients');
      // Handle if backend returns { data: [...] } or just [...]
      const backendPatients: BackendPatient[] = Array.isArray(response) ? response : (response.data || []);

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
      const response: any = await api.get<any>(`/patients/${id}`);
      const backendPatient = response.data || response;
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

      console.log('Creating patient with data:', backendData); // Debug log

      // The backend returns { success: true, data: { ...patient }, timestamp: ... }
      const response: any = await api.post<any>('/patients', backendData);
      console.log('Backend response for createPatient:', response); // Debug log

      // Handle the nested data structure
      const backendPatient = response.data || response;

      return mapBackendPatient(backendPatient);
    } catch (error: any) {
      console.error('Failed to create patient:', error);

      // Show actual backend error message if available
      const errorMessage = error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to create patient';

      // If it's a validation error, show the details
      if (error.response?.status === 400 && Array.isArray(error.response?.data?.message)) {
        throw new Error(`Validation error: ${error.response.data.message.join(', ')}`);
      }

      throw new Error(errorMessage);
    }
  },

  // Get patient history
  async getPatientHistory(patientId: string): Promise<BackendPatientHistory> {
    try {
      const response: any = await api.get<any>(`/patients/${patientId}/history`);
      return response.data || response;
    } catch (error) {
      console.error('Failed to fetch patient history:', error);
      throw new Error('Failed to fetch patient history');
    }
  },

  // Get patient timeline
  async getPatientTimeline(patientId: string): Promise<TimelineEvent[]> {
    console.log('getPatientTimeline called for:', patientId);
    try {
      // Get patient history and convert to timeline events
      const history = await this.getPatientHistory(patientId);

      const timelineEvents: TimelineEvent[] = [];

      // Add prescription events
      history.prescriptions.forEach((prescription: any) => {
        timelineEvents.push({
          id: prescription.id,
          type: 'prescription',
          title: 'Prescription Issued',
          description: prescription.diagnosis || 'Prescription created',
          date: prescription.created_at,
          metadata: prescription,
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
    console.log('getPatientMindMap called for:', patientId); // Debug log
    try {
      const history = await this.getPatientHistory(patientId);
      console.log('History received for mind map:', history); // Debug log
      const patient = mapBackendPatient(history.patient);

      // Extract conditions and medications from prescriptions
      const conditions: MindMapData['conditions'] = [];
      const encounters: MindMapData['encounters'] = [];
      const medications: MindMapData['medications'] = [];
      const alerts: MindMapData['alerts'] = [];

      // Process prescriptions with aggregation logic
      const diagnosisMap = new Map<string, string>(); // Name -> ConditionId

      history.prescriptions.forEach((prescription: any) => {
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
            diagnosedDate: prescription.prescribed_date, // Uses first seen date
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
          prescription.medications.forEach((med: any, index: number) => {
            medications.push({
              id: `m-${prescription.id}-${index}`,
              encounterId: encounterId, // Link to Encounter (Date)
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
