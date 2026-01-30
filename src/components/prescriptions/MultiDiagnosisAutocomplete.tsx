import * as React from 'react';
import { useState, useRef, useCallback, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Loader2, Stethoscope, Search, X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useDiagnosisSearch } from '@/hooks/use-diagnosis-search';
import type { Diagnosis } from '@/types/diagnosis';

interface MultiDiagnosisAutocompleteProps {
    form: UseFormReturn<any>;
    onDiagnosesChange: (diagnoses: Diagnosis[]) => void;
    selectedDiagnoses: Diagnosis[];
}

/**
 * MultiDiagnosisAutocomplete Component
 * 
 * Provides autocomplete for multiple diagnosis selection:
 * - Searches diagnoses using GET /diagnoses/search?q=
 * - Allows selecting multiple diagnoses as chips/tags
 * - On selection, passes all diagnoses to parent for medicine fetching
 * - Keyboard navigation support
 */
export function MultiDiagnosisAutocomplete({
    form,
    onDiagnosesChange,
    selectedDiagnoses,
}: MultiDiagnosisAutocompleteProps) {
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

    // Filter out already selected diagnoses
    const availableDiagnoses = diagnoses.filter(
        (d) => !selectedDiagnoses.some((selected) => selected.id === d.id)
    );

    // Handle diagnosis selection
    const handleSelectDiagnosis = useCallback((diagnosis: Diagnosis) => {
        const newDiagnoses = [...selectedDiagnoses, diagnosis];
        onDiagnosesChange(newDiagnoses);

        // Update form value with comma-separated names
        const diagnosisNames = newDiagnoses.map(d => d.name).join(', ');
        form.setValue('diagnosis', diagnosisNames, { shouldValidate: true });

        setSearchQuery('');
        setShowSuggestions(false);
        setHighlightedIndex(-1);
        inputRef.current?.focus();
    }, [form, onDiagnosesChange, selectedDiagnoses]);

    // Handle diagnosis removal
    const handleRemoveDiagnosis = useCallback((diagnosisId: string) => {
        const newDiagnoses = selectedDiagnoses.filter(d => d.id !== diagnosisId);
        onDiagnosesChange(newDiagnoses);

        // Update form value
        const diagnosisNames = newDiagnoses.map(d => d.name).join(', ');
        form.setValue('diagnosis', diagnosisNames || '', { shouldValidate: true });
    }, [form, onDiagnosesChange, selectedDiagnoses]);

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);

        if (value.trim().length >= 2) {
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    // Keyboard navigation
    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && searchQuery === '' && selectedDiagnoses.length > 0) {
            // Remove last diagnosis on backspace when input is empty
            const lastDiagnosis = selectedDiagnoses[selectedDiagnoses.length - 1];
            handleRemoveDiagnosis(lastDiagnosis.id);
            return;
        }

        if (!showSuggestions || availableDiagnoses.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev =>
                    prev < availableDiagnoses.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev =>
                    prev > 0 ? prev - 1 : availableDiagnoses.length - 1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0 && highlightedIndex < availableDiagnoses.length) {
                    handleSelectDiagnosis(availableDiagnoses[highlightedIndex]);
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
    }, [showSuggestions, availableDiagnoses, highlightedIndex, handleSelectDiagnosis, searchQuery, selectedDiagnoses, handleRemoveDiagnosis]);

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
                    <p className="text-sm text-muted-foreground">Search and select one or more diagnoses</p>
                </div>
            </div>

            <FormField
                control={form.control}
                name="diagnosis"
                render={() => (
                    <FormItem>
                        <FormControl>
                            <div className="relative" ref={containerRef}>
                                {/* Selected diagnoses as chips + input */}
                                <div
                                    className={cn(
                                        "flex flex-wrap items-center gap-2 min-h-12 p-2 bg-background/50 border-2 rounded-lg transition-all cursor-text",
                                        selectedDiagnoses.length > 0
                                            ? "border-emerald-500/50 focus-within:border-emerald-500"
                                            : "border-input/60 focus-within:border-primary"
                                    )}
                                    onClick={() => inputRef.current?.focus()}
                                >
                                    {/* Selected diagnosis chips */}
                                    {selectedDiagnoses.map((diagnosis) => (
                                        <Badge
                                            key={diagnosis.id}
                                            variant="secondary"
                                            className="bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 text-sm font-medium flex items-center gap-1.5 animate-in fade-in-0 zoom-in-95"
                                        >
                                            {diagnosis.name}
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemoveDiagnosis(diagnosis.id);
                                                }}
                                                className="ml-1 rounded-full hover:bg-primary/30 p-0.5 transition-colors"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}

                                    {/* Search input */}
                                    <div className="flex-1 min-w-[200px] relative">
                                        <Input
                                            ref={inputRef}
                                            value={searchQuery}
                                            onChange={handleInputChange}
                                            onKeyDown={handleKeyDown}
                                            onFocus={() => {
                                                if (searchQuery.trim().length >= 2) {
                                                    setShowSuggestions(true);
                                                }
                                            }}
                                            placeholder={selectedDiagnoses.length === 0 ? "Start typing diagnosis (e.g., Hypertension)..." : "Add another diagnosis..."}
                                            className="border-0 shadow-none focus-visible:ring-0 h-8 text-base bg-transparent placeholder:text-muted-foreground/50"
                                            autoComplete="off"
                                            aria-autocomplete="list"
                                            aria-expanded={showSuggestions}
                                            aria-haspopup="listbox"
                                        />
                                    </div>

                                    {/* Search/Loading indicator */}
                                    <div className="pr-2">
                                        {isSearching ? (
                                            <Loader2 className="h-5 w-5 text-primary animate-spin" />
                                        ) : (
                                            <Search className="h-5 w-5 text-muted-foreground/50" />
                                        )}
                                    </div>
                                </div>

                                {/* Suggestions Dropdown */}
                                {showSuggestions && (
                                    <div
                                        className="absolute left-0 right-0 mt-2 rounded-xl border-2 border-primary/20 bg-popover/95 backdrop-blur-xl shadow-2xl overflow-hidden"
                                        style={{ zIndex: 9999 }}
                                    >
                                        {isSearching && availableDiagnoses.length === 0 ? (
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
                                        ) : availableDiagnoses.length > 0 ? (
                                            <ul ref={listRef} className="max-h-72 overflow-y-auto" role="listbox">
                                                {availableDiagnoses.map((diagnosis, index) => (
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
                                                                "w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center",
                                                                highlightedIndex === index ? "bg-primary text-white" : "bg-muted"
                                                            )}>
                                                                <Plus className="h-3 w-3" />
                                                            </div>
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

                        {/* Selected diagnoses summary */}
                        {selectedDiagnoses.length > 0 && (
                            <div className="mt-3 flex items-center gap-2 text-sm bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-2 rounded-lg">
                                <Stethoscope className="h-4 w-4 flex-shrink-0" />
                                <span>
                                    <strong>{selectedDiagnoses.length}</strong> diagnosis{selectedDiagnoses.length > 1 ? 'es' : ''} selected — medicines are ready for autofill
                                </span>
                            </div>
                        )}
                    </FormItem>
                )}
            />
        </div>
    );
}
