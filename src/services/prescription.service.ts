import { api } from './api';
import type { Prescription, Medication, PaginatedResponse } from '@/types';

// Mock data for development
const MOCK_PRESCRIPTIONS: Prescription[] = [
  {
    id: '1',
    patientId: '1',
    diagnosis: 'Hypertension Stage 1',
    medications: [
      {
        id: 'm1',
        name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        duration: '30 days',
        instructions: 'Take in the morning with water',
      },
    ],
    notes: 'Monitor blood pressure weekly. Follow up in 4 weeks.',
    createdAt: '2024-01-20T10:30:00Z',
    doctorId: 'doctor-001',
    doctorName: 'Dr. Sarah Johnson',
  },
  {
    id: '2',
    patientId: '1',
    diagnosis: 'Upper Respiratory Infection',
    medications: [
      {
        id: 'm2',
        name: 'Amoxicillin',
        dosage: '500mg',
        frequency: 'Three times daily',
        duration: '7 days',
        instructions: 'Take with food',
      },
      {
        id: 'm3',
        name: 'Guaifenesin',
        dosage: '400mg',
        frequency: 'Every 4 hours',
        duration: '5 days',
        instructions: 'Take with plenty of water',
      },
    ],
    notes: 'Rest and increase fluid intake.',
    createdAt: '2024-01-15T14:00:00Z',
    doctorId: 'doctor-001',
    doctorName: 'Dr. Sarah Johnson',
  },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const prescriptionService = {
  // Get prescriptions for a patient
  async getPatientPrescriptions(
    patientId: string,
    page = 1,
    pageSize = 10
  ): Promise<PaginatedResponse<Prescription>> {
    // TODO: Replace with real API call
    // return api.get<PaginatedResponse<Prescription>>(`/patients/${patientId}/prescriptions`, { params: { page, pageSize } });
    
    await delay(400);
    const filtered = MOCK_PRESCRIPTIONS.filter((p) => p.patientId === patientId);
    
    return {
      data: filtered.slice((page - 1) * pageSize, page * pageSize),
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.ceil(filtered.length / pageSize),
    };
  },

  // Get single prescription
  async getPrescription(id: string): Promise<Prescription> {
    // TODO: Replace with real API call
    // return api.get<Prescription>(`/prescriptions/${id}`);
    
    await delay(300);
    const prescription = MOCK_PRESCRIPTIONS.find((p) => p.id === id);
    if (!prescription) {
      throw new Error('Prescription not found');
    }
    return prescription;
  },

  // Create new prescription
  async createPrescription(data: {
    patientId: string;
    diagnosis: string;
    medications: Omit<Medication, 'id'>[];
    notes?: string;
  }): Promise<Prescription> {
    // TODO: Replace with real API call
    // return api.post<Prescription>('/prescriptions', data);
    
    await delay(800);
    const newPrescription: Prescription = {
      id: String(Date.now()),
      patientId: data.patientId,
      diagnosis: data.diagnosis,
      medications: data.medications.map((m, i) => ({ ...m, id: `med-${Date.now()}-${i}` })),
      notes: data.notes,
      createdAt: new Date().toISOString(),
      doctorId: 'doctor-001',
      doctorName: 'Dr. Sarah Johnson',
    };
    MOCK_PRESCRIPTIONS.push(newPrescription);
    return newPrescription;
  },

  // Get all recent prescriptions (for dashboard)
  async getRecentPrescriptions(limit = 5): Promise<Prescription[]> {
    // TODO: Replace with real API call
    // return api.get<Prescription[]>('/prescriptions/recent', { params: { limit } });
    
    await delay(300);
    return MOCK_PRESCRIPTIONS
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  },
};
