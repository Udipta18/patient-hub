import * as React from 'react';
import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { Trash2, Check, ChevronDown, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import type { DiagnosisMedicine } from '@/types/diagnosis';

interface MedicineRowProps {
    form: any;
    field: any;
    index: number;
    medicines: DiagnosisMedicine[];
    isLoadingMedicines: boolean;
    canRemove: boolean;
    onRemove: () => void;
}

export function MedicineRow({
    form,
    index,
    medicines,
    isLoadingMedicines,
    canRemove,
    onRemove,
}: MedicineRowProps) {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const medicineName = form.watch(`medications.${index}.name`) || '';

    // Ensure medicines is always an array
    const medicinesList = Array.isArray(medicines) ? medicines : [];

    const filteredMedicines = useMemo(() => {
        if (!medicineName || medicineName.trim() === '') {
            return medicinesList;
        }
        const searchTerm = medicineName.toLowerCase().trim();
        return medicinesList.filter((med: DiagnosisMedicine) =>
            med.name.toLowerCase().includes(searchTerm)
        );
    }, [medicinesList, medicineName]);

    const handleSelectMedicine = useCallback((selectedMedicine: DiagnosisMedicine) => {
        form.setValue(`medications.${index}.name`, selectedMedicine.name, { shouldValidate: true });
        form.setValue(`medications.${index}.dosage`, selectedMedicine.defaultDosage, { shouldValidate: true });
        form.setValue(`medications.${index}.frequency`, selectedMedicine.defaultFrequency, { shouldValidate: true });
        form.setValue(`medications.${index}.duration`, selectedMedicine.defaultDuration, { shouldValidate: true });
        form.setValue(`medications.${index}.instructions`, selectedMedicine.instructions || '', { shouldValidate: true });
        setShowSuggestions(false);
        setHighlightedIndex(-1);
    }, [form, index]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowDown' && !showSuggestions && medicinesList.length > 0) {
            e.preventDefault();
            setShowSuggestions(true);
            setHighlightedIndex(0);
            return;
        }
        if (!showSuggestions || filteredMedicines.length === 0) return;
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev => prev < filteredMedicines.length - 1 ? prev + 1 : 0);
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev => prev > 0 ? prev - 1 : filteredMedicines.length - 1);
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0 && highlightedIndex < filteredMedicines.length) {
                    handleSelectMedicine(filteredMedicines[highlightedIndex]);
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
    }, [showSuggestions, filteredMedicines, highlightedIndex, handleSelectMedicine, medicinesList]);

    useEffect(() => {
        if (highlightedIndex >= 0 && listRef.current) {
            const item = listRef.current.children[highlightedIndex] as HTMLElement;
            if (item) item.scrollIntoView({ block: 'nearest' });
        }
    }, [highlightedIndex]);

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

    const hasMedicines = medicinesList.length > 0;
    const isSelectedFromList = medicinesList.some((med: DiagnosisMedicine) => med.name === medicineName);

    return (
        <div
            className={cn(
                "glass-card p-6 rounded-xl relative group animate-slide-up transition-all",
                showSuggestions ? "z-50 ring-1 ring-primary/50 shadow-2xl" : "z-0"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
        >
            {canRemove && (
                <Button type="button" variant="ghost" size="icon" className="absolute right-4 top-4 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" onClick={onRemove}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            )}

            <div className="grid gap-4 sm:grid-cols-12 items-start">
                <div className="sm:col-span-5 xl:col-span-4" ref={containerRef}>
                    <FormField
                        control={form.control}
                        name={`medications.${index}.name`}
                        render={({ field: formField }: { field: any }) => (
                            <FormItem className="relative">
                                <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex h-5 items-center gap-2">
                                    Medication Name
                                    {hasMedicines && <span className="text-primary/70 text-[10px] font-normal lowercase">({medicinesList.length} available)</span>}
                                </FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        {isLoadingMedicines ? (
                                            <Skeleton className="h-10 w-full rounded-lg" />
                                        ) : (
                                            <>
                                                <div className="relative">
                                                    <Input
                                                        {...formField}
                                                        ref={inputRef}
                                                        placeholder={hasMedicines ? "Click to select..." : "Enter medicine name..."}
                                                        className={cn("bg-background/50 border-2 focus:border-primary pr-10", hasMedicines ? "border-primary/30" : "border-input/60", isSelectedFromList && "border-emerald-500/50")}
                                                        onClick={() => { if (hasMedicines) { setShowSuggestions(true); setHighlightedIndex(-1); } }}
                                                        onFocus={() => { if (hasMedicines) setShowSuggestions(true); }}
                                                        onKeyDown={handleKeyDown}
                                                        autoComplete="off"
                                                    />
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                                        {isSelectedFromList ? <Check className="h-4 w-4 text-emerald-500" /> : hasMedicines ? <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", showSuggestions && "rotate-180")} /> : null}
                                                    </div>
                                                </div>
                                                {showSuggestions && hasMedicines && (
                                                    <ul ref={listRef} className="absolute left-0 right-0 mt-2 max-h-64 overflow-auto rounded-xl border-2 border-primary/30 bg-popover backdrop-blur-xl shadow-2xl" style={{ zIndex: 9999 }} role="listbox">
                                                        {filteredMedicines.length > 0 ? filteredMedicines.map((med: DiagnosisMedicine, medIndex: number) => (
                                                            <li key={med.id} role="option" className={cn("px-4 py-3 cursor-pointer transition-all", "border-b border-border/30 last:border-0", highlightedIndex === medIndex ? "bg-primary/15" : "hover:bg-muted/50", med.name === medicineName && "bg-emerald-500/10")} onClick={() => handleSelectMedicine(med)} onMouseEnter={() => setHighlightedIndex(medIndex)}>
                                                                <div className="flex items-center gap-3">
                                                                    <div className={cn("w-2 h-2 rounded-full", med.name === medicineName ? "bg-emerald-500" : highlightedIndex === medIndex ? "bg-primary" : "bg-muted-foreground/30")} />
                                                                    <div className="flex-1">
                                                                        <div className="font-semibold flex items-center gap-2">{med.name}{med.name === medicineName && <Check className="h-3.5 w-3.5 text-emerald-500" />}</div>
                                                                        <div className="text-xs text-muted-foreground mt-0.5">
                                                                            {[med.defaultDosage, med.defaultFrequency, med.defaultDuration].filter(Boolean).join(' • ')}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </li>
                                                        )) : <li className="px-4 py-4 text-center text-muted-foreground">No matching medicines</li>}
                                                    </ul>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="sm:col-span-3 xl:col-span-2">
                    <FormField control={form.control} name={`medications.${index}.dosage`} render={({ field: formField }: { field: any }) => (
                        <FormItem>
                            <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex h-5 items-center">Dosage</FormLabel>
                            <FormControl><Input {...formField} placeholder="e.g., 500mg" className="bg-background/50 border-2 border-input/60 focus:border-primary" /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>

                <div className="sm:col-span-4 xl:col-span-3">
                    <FormField control={form.control} name={`medications.${index}.frequency`} render={({ field: formField }: { field: any }) => (
                        <FormItem>
                            <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex h-5 items-center">Frequency</FormLabel>
                            <FormControl><Input {...formField} placeholder="e.g., TID (3x daily)" className="bg-background/50 border-2 border-input/60 focus:border-primary" /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>

                <div className="sm:col-span-4 xl:col-span-3">
                    <FormField control={form.control} name={`medications.${index}.duration`} render={({ field: formField }: { field: any }) => (
                        <FormItem>
                            <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex h-5 items-center">Duration</FormLabel>
                            <FormControl><Input {...formField} placeholder="e.g., 7 days" className="bg-background/50 border-2 border-input/60 focus:border-primary" /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>

                <div className="sm:col-span-8 xl:col-span-12">
                    <FormField control={form.control} name={`medications.${index}.instructions`} render={({ field: formField }: { field: any }) => (
                        <FormItem>
                            <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex h-5 items-center gap-1">Instructions <span className="text-muted-foreground/50 lowercase font-normal">(opt)</span></FormLabel>
                            <FormControl><Input {...formField} placeholder="e.g., Take with food" className="bg-background/50 border-2 border-input/60 focus:border-primary" /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
            </div>
        </div>
    );
}

export function AutofillHint({ isVisible }: { isVisible: boolean }) {
    if (!isVisible) return null;
    return (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-sm animate-fade-in">
            <Info className="h-4 w-4 text-emerald-500 flex-shrink-0" />
            <span className="text-emerald-700 dark:text-emerald-300"><span className="font-semibold">Smart Autofill:</span> Click medication name to see available options.</span>
        </div>
    );
}

export function MedicineRowSkeleton() {
    return (
        <div className="glass-card p-6 rounded-xl">
            <div className="grid gap-4 sm:grid-cols-12 items-start">
                <div className="sm:col-span-5 xl:col-span-4"><Skeleton className="h-4 w-24 mb-2" /><Skeleton className="h-10 w-full" /></div>
                <div className="sm:col-span-3 xl:col-span-2"><Skeleton className="h-4 w-16 mb-2" /><Skeleton className="h-10 w-full" /></div>
                <div className="sm:col-span-4 xl:col-span-3"><Skeleton className="h-4 w-20 mb-2" /><Skeleton className="h-10 w-full" /></div>
                <div className="sm:col-span-4 xl:col-span-3"><Skeleton className="h-4 w-18 mb-2" /><Skeleton className="h-10 w-full" /></div>
                <div className="sm:col-span-8 xl:col-span-12"><Skeleton className="h-4 w-28 mb-2" /><Skeleton className="h-10 w-full" /></div>
            </div>
        </div>
    );
}
