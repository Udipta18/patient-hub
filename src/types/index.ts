// Patient Types
export interface Patient {
  id: string;
  uid: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  email?: string;
  phone?: string;
  address?: string;
  bloodType?: string;
  allergies?: string[];
  createdAt: string;
  updatedAt: string;
}

// Prescription Types
export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  diagnosis: string;
  medications: Medication[];
  notes?: string;
  createdAt: string;
  doctorId: string;
  doctorName: string;
}

// Timeline Types
export interface TimelineEvent {
  id: string;
  type: 'visit' | 'prescription' | 'lab' | 'note' | 'alert';
  title: string;
  description: string;
  date: string;
  metadata?: Record<string, unknown>;
}

// Mind Map Types
export interface MindMapCondition {
  id: string;
  name: string;
  severity: 'low' | 'medium' | 'high';
  diagnosedDate?: string;
}

export interface MindMapMedication {
  id: string;
  name: string;
  dosage: string;
  active: boolean;
}

export interface MindMapAlert {
  id: string;
  type: 'allergy' | 'interaction' | 'warning';
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export interface MindMapData {
  patientId: string;
  patientName: string;
  conditions: MindMapCondition[];
  medications: MindMapMedication[];
  alerts: MindMapAlert[];
}

// Auth Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'doctor' | 'admin';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// API Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
