import { useQueries } from '@tanstack/react-query';
import { useMemo } from 'react';
import { diagnosisService } from '@/services/diagnosis.service';
import type { DiagnosisMedicine } from '@/types/diagnosis';

/**
 * Optimized Hook to fetch medicines for multiple diagnoses
 * 
 * Uses useQueries to leverage INDIVIDUAL CACHING per diagnosis:
 * - Each diagnosis has its own cache entry with key ['diagnosis-medicines', diagnosisId]
 * - When a new diagnosis is added, only that diagnosis's medicines are fetched
 * - Previously selected diagnoses use cached data (NO re-fetch!)
 * 
 * API Call Flow (for 3 diagnoses):
 * - Select Diagnosis 1 → 1 API call (fetch medicines for D1)
 * - Select Diagnosis 2 → 1 API call (fetch medicines for D2, D1 is cached)
 * - Select Diagnosis 3 → 1 API call (fetch medicines for D3, D1 & D2 are cached)
 * - Total: 3 API calls instead of 6!
 * 
 * The results are merged and deduplicated by medicine name.
 */
export function useMultipleDiagnosisMedicines(diagnosisIds: string[]) {
    // Create individual queries for each diagnosis - each with its own cache!
    const queries = useQueries({
        queries: diagnosisIds.map((diagnosisId) => ({
            queryKey: ['diagnosis-medicines', diagnosisId], // Individual cache key per diagnosis
            queryFn: () => diagnosisService.getMedicinesForDiagnosis(diagnosisId),
            staleTime: 10 * 60 * 1000, // 10 minutes - medicines don't change often
            gcTime: 30 * 60 * 1000, // 30 minutes cache time
            retry: 1,
            refetchOnWindowFocus: false,
        })),
    });

    // Merge and deduplicate medicines from all queries
    const data = useMemo(() => {
        const allMedicines: DiagnosisMedicine[] = [];

        for (const query of queries) {
            if (query.data) {
                allMedicines.push(...query.data);
            }
        }

        // Deduplicate by medicine name (case-insensitive)
        const uniqueMedicines: DiagnosisMedicine[] = [];
        const seenNames = new Set<string>();

        for (const medicine of allMedicines) {
            const normalizedName = medicine.name.toLowerCase().trim();
            if (!seenNames.has(normalizedName)) {
                seenNames.add(normalizedName);
                uniqueMedicines.push(medicine);
            }
        }

        return uniqueMedicines;
    }, [queries]);

    // Aggregate loading state - true if ANY query is loading
    const isLoading = queries.some((q) => q.isLoading);

    // Aggregate fetching state - true if ANY query is fetching
    const isFetching = queries.some((q) => q.isFetching);

    // Aggregate error - first error found
    const error = queries.find((q) => q.error)?.error || null;

    return {
        data,
        isLoading,
        isFetching,
        error,
    };
}
