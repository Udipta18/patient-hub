// Diagnosis type from search endpoint
export interface Diagnosis {
  id: string;
  name: string;
  description?: string;
  category?: string;
}

// Response type for diagnosis search
export interface DiagnosisSearchResponse {
  data: Diagnosis[];
  success?: boolean;
  message?: string;
}

// Diagnosis Medicine Types - fetched once per diagnosis selection
// Matches the actual API response structure
export interface DiagnosisMedicine {
  id: string;
  name: string;
  drugClass?: string;
  firstLine?: boolean;
  notes?: string;
  // These fields may not exist in API - we'll provide defaults
  defaultDosage?: string;
  defaultFrequency?: string;
  defaultDuration?: string;
  instructions?: string;
}

// Response type for the diagnosis medicines endpoint
// API returns: { diagnosis: string, medicines: [...] }
export interface DiagnosisMedicinesResponse {
  diagnosis?: string;
  medicines?: DiagnosisMedicine[];
  data?: DiagnosisMedicine[];
  success?: boolean;
  message?: string;
}
