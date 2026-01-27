import * as React from 'react';
import { useState, useRef, useCallback, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Loader2, Stethoscope, Search, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { useDiagnosisSearch } from '@/hooks/use-diagnosis-search';
import type { Diagnosis } from '@/types/diagnosis';

interface DiagnosisAutocompleteProps {
    form: UseFormReturn<any>;
    onDiagnosisSelect: (diagnosis: Diagnosis) => void;
    selectedDiagnosis: Diagnosis | null;
}

/**
 * DiagnosisAutocomplete Component
 * 
 * Provides autocomplete for diagnosis selection:
 * - Searches diagnoses using GET /diagnoses/search?q=
 * - On selection, passes the diagnosis to parent for medicine fetching
 * - Keyboard navigation support
 */
export function DiagnosisAutocomplete({
    form,
    onDiagnosisSelect,
    selectedDiagnosis,
}: DiagnosisAutocompleteProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [debouncedQuery, setDebouncedQuery] = useState('');

    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Debounce the search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch diagnoses based on debounced query
    const { data: diagnoses = [], isLoading, isFetching } = useDiagnosisSearch(debouncedQuery);

    // Handle diagnosis selection
    const handleSelectDiagnosis = useCallback((diagnosis: Diagnosis) => {
        form.setValue('diagnosis', diagnosis.name, { shouldValidate: true });
        setSearchQuery(diagnosis.name);
        setShowSuggestions(false);
        setHighlightedIndex(-1);
        onDiagnosisSelect(diagnosis);
    }, [form, onDiagnosisSelect]);

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);
        form.setValue('diagnosis', value, { shouldValidate: true });

        if (value.trim().length >= 2) {
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    // Keyboard navigation
    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showSuggestions || diagnoses.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev =>
                    prev < diagnoses.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev =>
                    prev > 0 ? prev - 1 : diagnoses.length - 1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0 && highlightedIndex < diagnoses.length) {
                    handleSelectDiagnosis(diagnoses[highlightedIndex]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setShowSuggestions(false);
                setHighlightedIndex(-1);
                break;
            case 'Tab':
                setShowSuggestions(false);
                setHighlightedIndex(-1);
                break;
        }
    }, [showSuggestions, diagnoses, highlightedIndex, handleSelectDiagnosis]);

    // Scroll highlighted item into view
    useEffect(() => {
        if (highlightedIndex >= 0 && listRef.current) {
            const item = listRef.current.children[highlightedIndex] as HTMLElement;
            if (item) {
                item.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [highlightedIndex]);

    // Close suggestions on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
                setHighlightedIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Sync with form value on mount
    useEffect(() => {
        const diagnosisValue = form.getValues('diagnosis');
        if (diagnosisValue && diagnosisValue !== searchQuery) {
            setSearchQuery(diagnosisValue);
        }
    }, []);

    const isSearching = isLoading || isFetching;

    return (
        <div className="glass-card rounded-xl p-6 relative group">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-accent opacity-50 group-hover:opacity-100 transition-opacity rounded-l-xl" />

            <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Stethoscope className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold">Diagnosis</h3>
                    <p className="text-sm text-muted-foreground">Search and select diagnosis</p>
                </div>
            </div>

            <FormField
                control={form.control}
                name="diagnosis"
                render={() => (
                    <FormItem>
                        <FormControl>
                            <div className="relative" ref={containerRef}>
                                <div className="relative">
                                    <Input
                                        ref={inputRef}
                                        value={searchQuery}
                                        onChange={handleInputChange}
                                        onKeyDown={handleKeyDown}
                                        onFocus={() => {
                                            if (searchQuery.trim().length >= 2 && !selectedDiagnosis) {
                                                setShowSuggestions(true);
                                            }
                                        }}
                                        placeholder="Start typing diagnosis (e.g., Hypertension)..."
                                        className={cn(
                                            "h-12 text-lg bg-background/50 border-2 focus:ring-primary/20 transition-all font-medium placeholder:font-normal pr-12",
                                            selectedDiagnosis
                                                ? "border-emerald-500/50 focus:border-emerald-500"
                                                : "border-input/60 focus:border-primary"
                                        )}
                                        autoComplete="off"
                                        aria-autocomplete="list"
                                        aria-expanded={showSuggestions}
                                        aria-haspopup="listbox"
                                    />

                                    {/* Search/Loading/Selected indicator */}
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        {isSearching ? (
                                            <Loader2 className="h-5 w-5 text-primary animate-spin" />
                                        ) : selectedDiagnosis ? (
                                            <Check className="h-5 w-5 text-emerald-500" />
                                        ) : (
                                            <Search className="h-5 w-5 text-muted-foreground/50" />
                                        )}
                                    </div>
                                </div>

                                {/* Suggestions Dropdown - Using Portal-like positioning */}
                                {showSuggestions && (
                                    <div
                                        className="absolute left-0 right-0 mt-2 rounded-xl border-2 border-primary/20 bg-popover/95 backdrop-blur-xl shadow-2xl overflow-hidden"
                                        style={{ zIndex: 9999 }}
                                    >
                                        {isSearching && diagnoses.length === 0 ? (
                                            <div className="p-4 space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <Skeleton className="h-4 w-4 rounded-full" />
                                                    <Skeleton className="h-5 w-3/4" />
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Skeleton className="h-4 w-4 rounded-full" />
                                                    <Skeleton className="h-5 w-2/3" />
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Skeleton className="h-4 w-4 rounded-full" />
                                                    <Skeleton className="h-5 w-1/2" />
                                                </div>
                                            </div>
                                        ) : diagnoses.length > 0 ? (
                                            <ul ref={listRef} className="max-h-72 overflow-y-auto" role="listbox">
                                                {diagnoses.map((diagnosis, index) => (
                                                    <li
                                                        key={diagnosis.id}
                                                        role="option"
                                                        aria-selected={highlightedIndex === index}
                                                        className={cn(
                                                            "px-4 py-3 cursor-pointer transition-all duration-150",
                                                            "border-b border-border/30 last:border-0",
                                                            highlightedIndex === index
                                                                ? "bg-primary/10 text-primary"
                                                                : "hover:bg-muted/50"
                                                        )}
                                                        onClick={() => handleSelectDiagnosis(diagnosis)}
                                                        onMouseEnter={() => setHighlightedIndex(index)}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={cn(
                                                                "w-2 h-2 rounded-full flex-shrink-0",
                                                                highlightedIndex === index ? "bg-primary" : "bg-muted-foreground/30"
                                                            )} />
                                                            <div className="flex-1 min-w-0">
                                                                <div className="font-semibold truncate">{diagnosis.name}</div>
                                                                {diagnosis.description && (
                                                                    <div className="text-xs text-muted-foreground mt-0.5 truncate">
                                                                        {diagnosis.description}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {diagnosis.category && (
                                                                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary/80 flex-shrink-0">
                                                                    {diagnosis.category}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : debouncedQuery.trim().length >= 2 ? (
                                            <div className="p-6 text-center">
                                                <div className="text-muted-foreground mb-1">No diagnoses found</div>
                                                <div className="text-xs text-muted-foreground/70">
                                                    Try a different search term
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>
                                )}
                            </div>
                        </FormControl>
                        <FormMessage />

                        {/* Selected diagnosis indicator */}
                        {selectedDiagnosis && (
                            <div className="mt-3 flex items-center gap-2 text-sm bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-2 rounded-lg">
                                <Check className="h-4 w-4 flex-shrink-0" />
                                <span>
                                    <strong>{selectedDiagnosis.name}</strong> selected — medicines are ready for autofill
                                </span>
                            </div>
                        )}
                    </FormItem>
                )}
            />
        </div>
    );
}
