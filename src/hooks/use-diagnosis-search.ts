import { useQuery } from '@tanstack/react-query';
import { diagnosisService } from '@/services/diagnosis.service';
import type { Diagnosis } from '@/types/diagnosis';

/**
 * Hook to search diagnoses for autocomplete
 * Uses React Query with debounced search
 */
export function useDiagnosisSearch(query: string) {
    return useQuery<Diagnosis[], Error>({
        queryKey: ['diagnosis-search', query],
        queryFn: () => diagnosisService.searchDiagnoses(query),
        enabled: query.trim().length >= 2, // Only search with 2+ characters
        staleTime: 5 * 60 * 1000, // 5 minutes - diagnoses don't change often
        gcTime: 10 * 60 * 1000, // 10 minutes cache time
        retry: 1,
        refetchOnWindowFocus: false,
    });
}
