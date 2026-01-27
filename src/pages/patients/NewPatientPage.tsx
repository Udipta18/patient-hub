import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Loader2, CalendarIcon, User, CheckCircle2 } from 'lucide-react';
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { patientService } from '@/services/patient.service';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date'),
    gender: z.enum(['male', 'female', 'other']),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    phone: z.string().optional(),
    address: z.string().optional(),
    bloodType: z.string().optional(),
    allergies: z.string().optional(),
});

export function NewPatientPage() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [calendarOpen, setCalendarOpen] = useState(false);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            dateOfBirth: '',
            gender: 'male',
            email: '',
            phone: '',
            address: '',
            bloodType: '',
            allergies: '',
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        try {
            const patientData = {
                firstName: values.firstName,
                lastName: values.lastName,
                dateOfBirth: values.dateOfBirth,
                gender: values.gender,
                email: values.email || undefined,
                phone: values.phone || undefined,
                address: values.address || undefined,
                bloodType: values.bloodType || undefined,
                allergies: values.allergies
                    ? values.allergies.split(',').map((a) => a.trim()).filter(Boolean)
                    : [],
            };

            const newPatient = await patientService.createPatient(patientData);
            toast({
                title: "Success",
                description: "Patient created successfully",
                variant: "success",
            });
            navigate(`/patients/${newPatient.id}`);
        } catch (error: unknown) {
            const err = error as { message?: string };
            console.error('Create patient error:', error);
            toast({
                title: "Error",
                description: err.message || "Failed to create patient",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/patients')} className="rounded-full hover:bg-primary/10 hover:text-primary">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight text-gradient">New Patient</h1>
                        <p className="text-muted-foreground">Register a new patient to the system</p>
                    </div>
                </div>
            </div>

            <div className="glass-card rounded-xl p-8 relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-cyan-400 opacity-50 group-hover:opacity-100 transition-opacity" />

                <div className="flex items-center gap-3 mb-8">
                    <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shadow-sm">
                        <User className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold">Patient Details</h3>
                        <p className="text-sm text-muted-foreground">Personal information</p>
                    </div>
                </div>

                <CardContent className="p-0">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <div className="grid gap-8 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="firstName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">First Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="John"
                                                    className="h-12 text-lg bg-background/50 border-2 border-input/60 focus:border-primary focus:ring-primary/20 transition-all font-medium"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="lastName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Last Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Doe"
                                                    className="h-12 text-lg bg-background/50 border-2 border-input/60 focus:border-primary focus:ring-primary/20 transition-all font-medium"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid gap-8 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="dateOfBirth"
                                    render={({ field }) => {
                                        // Safely parse the date string to a Date object
                                        const dateValue = field.value ? new Date(field.value) : undefined;
                                        const isValidDate = dateValue && !isNaN(dateValue.getTime());

                                        return (
                                            <FormItem className="flex flex-col">
                                                <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Date of Birth</FormLabel>
                                                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant={"outline"}
                                                                className={cn(
                                                                    "w-full pl-3 text-left h-12 text-lg rounded-xl border-2 border-input/60 hover:bg-background/50 hover:border-primary/50 transition-all bg-background/50 font-medium",
                                                                    !isValidDate && "text-muted-foreground"
                                                                )}
                                                            >
                                                                {isValidDate ? (
                                                                    format(dateValue!, "PPP")
                                                                ) : (
                                                                    <span>Pick a date</span>
                                                                )}
                                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0 rounded-xl shadow-xl border-border/50" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={isValidDate ? dateValue : undefined}
                                                            onSelect={(date) => {
                                                                field.onChange(date ? format(date, "yyyy-MM-dd") : "");
                                                                setCalendarOpen(false);
                                                            }}
                                                            disabled={(date) =>
                                                                date > new Date() || date < new Date("1900-01-01")
                                                            }
                                                            initialFocus
                                                            className="p-3"
                                                            captionLayout="dropdown"
                                                            fromYear={1900}
                                                            toYear={new Date().getFullYear()}
                                                            showOutsideDays={false}
                                                            classNames={{
                                                                head_row: "hidden",
                                                                head_cell: "hidden",
                                                                weekdays: "hidden",
                                                                weekday: "hidden",
                                                                day: "inline-flex items-center justify-center h-10 w-10 p-0 font-medium text-sm rounded-full transition-all duration-200 hover:bg-primary/10 hover:text-primary",
                                                                day_button: "inline-flex items-center justify-center h-10 w-10 p-0 font-medium text-sm rounded-full transition-all duration-200 hover:bg-primary/10 hover:text-primary",
                                                                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-full shadow-md",
                                                                selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground rounded-full shadow-md",
                                                                caption_dropdowns: "flex justify-center gap-2",
                                                                dropdown: "bg-background text-foreground border border-input rounded-md px-2 py-1 text-sm font-medium cursor-pointer hover:bg-accent hover:text-accent-foreground",
                                                                vhidden: "hidden",
                                                                caption_label: "hidden",
                                                            }}
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage />
                                            </FormItem>
                                        );
                                    }}
                                />
                                <FormField
                                    control={form.control}
                                    name="gender"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Gender</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-12 text-lg bg-background/50 border-2 border-input/60 focus:ring-primary/20 rounded-xl font-medium">
                                                        <SelectValue placeholder="Select gender" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="male">Male</SelectItem>
                                                    <SelectItem value="female">Female</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid gap-8 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Email</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="email"
                                                    placeholder="john.doe@example.com"
                                                    className="h-12 text-lg bg-background/50 border-2 border-input/60 focus:border-primary focus:ring-primary/20 transition-all font-medium"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Phone Number</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="+1 234 567 890"
                                                    className="h-12 text-lg bg-background/50 border-2 border-input/60 focus:border-primary focus:ring-primary/20 transition-all font-medium"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid gap-8 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="bloodType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Blood Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-12 text-lg bg-background/50 border-2 border-input/60 focus:ring-primary/20 rounded-xl font-medium">
                                                        <SelectValue placeholder="Select blood type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="A+">A+</SelectItem>
                                                    <SelectItem value="A-">A-</SelectItem>
                                                    <SelectItem value="B+">B+</SelectItem>
                                                    <SelectItem value="B-">B-</SelectItem>
                                                    <SelectItem value="AB+">AB+</SelectItem>
                                                    <SelectItem value="AB-">AB-</SelectItem>
                                                    <SelectItem value="O+">O+</SelectItem>
                                                    <SelectItem value="O-">O-</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="allergies"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Allergies</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Peanuts, Penicillin (comma separated)"
                                                    className="h-12 text-lg bg-background/50 border-2 border-input/60 focus:border-primary focus:ring-primary/20 transition-all font-medium"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Address</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="123 Main St, City, Country"
                                                className="h-12 text-lg bg-background/50 border-2 border-input/60 focus:border-primary focus:ring-primary/20 transition-all font-medium"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end gap-4 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate('/patients')}
                                    disabled={isSubmitting}
                                    className="h-11 px-6 rounded-lg border-2 border-input/30"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="btn-premium h-11 px-8 rounded-lg shadow-lg shadow-primary/20"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                    )}
                                    Create Patient
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </div>
        </div>
    );
}
