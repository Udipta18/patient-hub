import { api } from './api';
import type {
    Diagnosis,
    DiagnosisSearchResponse,
    DiagnosisMedicine,
    DiagnosisMedicinesResponse
} from '@/types/diagnosis';

export const diagnosisService = {
    /**
     * Search for diagnoses by query string
     * Used for diagnosis autocomplete
     * @param query - Search term (e.g., "hyper")
     * @returns Array of matching diagnoses
     */
    async searchDiagnoses(query: string): Promise<Diagnosis[]> {
        try {
            if (!query || query.trim().length < 2) {
                return [];
            }

            const response = await api.get<DiagnosisSearchResponse | Diagnosis[]>(
                `/diagnoses/search?q=${encodeURIComponent(query.trim())}`
            );

            // Handle both response formats
            if (Array.isArray(response)) {
                return response;
            }

            return response.data || [];
        } catch (error) {
            console.error('Failed to search diagnoses:', error);
            return [];
        }
    },

    /**
     * Fetch medicines for a specific diagnosis
     * Called ONCE when a diagnosis is SELECTED (not during typing)
     * @param diagnosisId - The UUID of the selected diagnosis
     * @returns Array of medicines with default values for autofill
     */
    async getMedicinesForDiagnosis(diagnosisId: string): Promise<DiagnosisMedicine[]> {
        try {
            // Use any to flexibly handle diverse API response structures
            const response = await api.get<any>(
                `/diagnoses/${encodeURIComponent(diagnosisId)}/medicines`
            );

            console.log('Fetched medicines response:', response);

            // 1. Handle { data: { medicines: [...] } } (Nested wrapper) <--- Matches screenshot
            if (response.data && response.data.medicines && Array.isArray(response.data.medicines)) {
                return normalizeMedicines(response.data.medicines);
            }

            // 2. Handle { data: [...] } (Standard wrapper)
            if (response.data && Array.isArray(response.data)) {
                return normalizeMedicines(response.data);
            }

            // 3. Handle { medicines: [...] } (Direct object)
            if (response.medicines && Array.isArray(response.medicines)) {
                return normalizeMedicines(response.medicines);
            }

            // 4. Handle [...] (Direct array)
            if (Array.isArray(response)) {
                return normalizeMedicines(response);
            }

            console.warn('Unexpected response format for medicines:', response);
            return [];
        } catch (error) {
            console.error('Failed to fetch medicines for diagnosis:', error);
            return [];
        }
    },
};

/**
 * Normalize medicine data to ensure all required fields exist
 * API may not include dosage/frequency/duration - we'll provide sensible defaults
 */
function normalizeMedicines(medicines: DiagnosisMedicine[]): DiagnosisMedicine[] {
    return medicines.map(med => ({
        ...med,
        // Only use provided values, otherwise leave empty to show placeholders
        defaultDosage: med.defaultDosage || '',
        defaultFrequency: med.defaultFrequency || '',
        defaultDuration: med.defaultDuration || '',
        instructions: med.instructions || med.notes || '',
    }));
}

// Helper functions removed as defaults are no longer requested
