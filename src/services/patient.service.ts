import { api } from './api';
import type { Patient, PaginatedResponse, TimelineEvent, MindMapData } from '@/types';

// Mock data for development - remove when backend is ready
const MOCK_PATIENTS: Patient[] = [
  {
    id: '1',
    uid: 'PAT-001',
    firstName: 'John',
    lastName: 'Smith',
    dateOfBirth: '1985-03-15',
    gender: 'male',
    email: 'john.smith@email.com',
    phone: '+1 555-0123',
    bloodType: 'A+',
    allergies: ['Penicillin'],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
  },
  {
    id: '2',
    uid: 'PAT-002',
    firstName: 'Emily',
    lastName: 'Davis',
    dateOfBirth: '1990-07-22',
    gender: 'female',
    email: 'emily.davis@email.com',
    phone: '+1 555-0456',
    bloodType: 'O-',
    allergies: [],
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-18T11:00:00Z',
  },
  {
    id: '3',
    uid: 'PAT-003',
    firstName: 'Michael',
    lastName: 'Johnson',
    dateOfBirth: '1978-11-08',
    gender: 'male',
    email: 'michael.j@email.com',
    phone: '+1 555-0789',
    bloodType: 'B+',
    allergies: ['Aspirin', 'Sulfa'],
    createdAt: '2024-01-05T08:00:00Z',
    updatedAt: '2024-01-22T16:00:00Z',
  },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const patientService = {
  // Get paginated patients
  async getPatients(
    page = 1,
    pageSize = 10,
    search?: string
  ): Promise<PaginatedResponse<Patient>> {
    // TODO: Replace with real API call when backend is ready
    // return api.get<PaginatedResponse<Patient>>('/patients', { params: { page, pageSize, search } });
    
    await delay(500);
    
    let filtered = MOCK_PATIENTS;
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = MOCK_PATIENTS.filter(
        (p) =>
          p.firstName.toLowerCase().includes(searchLower) ||
          p.lastName.toLowerCase().includes(searchLower) ||
          p.uid.toLowerCase().includes(searchLower)
      );
    }

    return {
      data: filtered.slice((page - 1) * pageSize, page * pageSize),
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.ceil(filtered.length / pageSize),
    };
  },

  // Get single patient by ID
  async getPatient(id: string): Promise<Patient> {
    // TODO: Replace with real API call
    // return api.get<Patient>(`/patients/${id}`);
    
    await delay(300);
    const patient = MOCK_PATIENTS.find((p) => p.id === id);
    if (!patient) {
      throw new Error('Patient not found');
    }
    return patient;
  },

  // Create new patient
  async createPatient(data: Omit<Patient, 'id' | 'uid' | 'createdAt' | 'updatedAt'>): Promise<Patient> {
    // TODO: Replace with real API call
    // return api.post<Patient>('/patients', data);
    
    await delay(800);
    const newPatient: Patient = {
      ...data,
      id: String(Date.now()),
      uid: `PAT-${String(MOCK_PATIENTS.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    MOCK_PATIENTS.push(newPatient);
    return newPatient;
  },

  // Get patient timeline
  async getPatientTimeline(patientId: string): Promise<TimelineEvent[]> {
    // TODO: Replace with real API call
    // return api.get<TimelineEvent[]>(`/patients/${patientId}/timeline`);
    
    await delay(400);
    return [
      {
        id: '1',
        type: 'visit',
        title: 'Regular Checkup',
        description: 'Annual physical examination',
        date: '2024-01-20T10:00:00Z',
      },
      {
        id: '2',
        type: 'prescription',
        title: 'Prescription Issued',
        description: 'Lisinopril 10mg for hypertension',
        date: '2024-01-20T10:30:00Z',
      },
      {
        id: '3',
        type: 'lab',
        title: 'Lab Results',
        description: 'Blood work completed - all values normal',
        date: '2024-01-15T14:00:00Z',
      },
      {
        id: '4',
        type: 'alert',
        title: 'Allergy Alert Added',
        description: 'Patient reported penicillin allergy',
        date: '2024-01-10T09:00:00Z',
      },
    ];
  },

  // Get patient mind map data
  async getPatientMindMap(patientId: string): Promise<MindMapData> {
    // TODO: Replace with real API call
    // return api.get<MindMapData>(`/patients/${patientId}/mindmap`);
    
    await delay(500);
    const patient = MOCK_PATIENTS.find((p) => p.id === patientId);
    
    return {
      patientId,
      patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient',
      conditions: [
        { id: 'c1', name: 'Hypertension', severity: 'medium', diagnosedDate: '2023-06-15' },
        { id: 'c2', name: 'Type 2 Diabetes', severity: 'high', diagnosedDate: '2022-01-10' },
        { id: 'c3', name: 'Mild Asthma', severity: 'low', diagnosedDate: '2020-03-20' },
      ],
      medications: [
        { id: 'm1', name: 'Lisinopril 10mg', dosage: 'Once daily', active: true },
        { id: 'm2', name: 'Metformin 500mg', dosage: 'Twice daily', active: true },
        { id: 'm3', name: 'Albuterol Inhaler', dosage: 'As needed', active: true },
      ],
      alerts: [
        { id: 'a1', type: 'allergy', message: 'Penicillin Allergy', severity: 'high' },
        { id: 'a2', type: 'interaction', message: 'Monitor blood sugar with current medications', severity: 'medium' },
      ],
    };
  },
};
