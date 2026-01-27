import { useQuery } from '@tanstack/react-query';
import { diagnosisService } from '@/services/diagnosis.service';
import type { DiagnosisMedicine } from '@/types/diagnosis';

/**
 * Hook to fetch medicines for a diagnosis
 * Uses React Query for caching - medicines are fetched ONCE
 * and cached for subsequent use (no API calls during typing)
 */
export function useDiagnosisMedicines(diagnosisId: string | undefined) {
    return useQuery<DiagnosisMedicine[], Error>({
        queryKey: ['diagnosis-medicines', diagnosisId],
        queryFn: () => diagnosisService.getMedicinesForDiagnosis(diagnosisId!),
        enabled: !!diagnosisId && diagnosisId.trim().length > 0,
        staleTime: 10 * 60 * 1000, // 10 minutes - medicines don't change often
        gcTime: 30 * 60 * 1000, // 30 minutes cache time (formerly cacheTime)
        retry: 1,
        refetchOnWindowFocus: false,
    });
}
