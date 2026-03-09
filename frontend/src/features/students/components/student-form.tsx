'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createStudent, updateStudent, fetchClasses } from '@/features/students/api/student-api';
import { Student, ClassItem } from '@/features/students/types';

interface StudentFormProps {
    mode: 'create' | 'edit';
    initialData?: Student;
}

const formSchema = z.object({
    student_id: z.string().min(1, 'Student ID is required').max(50),
    name: z.string().min(1, 'Full name is required').max(255),
    birth_year: z.number().min(1970, 'Must be after 1970').max(2010, 'Must be before 2010'),
    major: z.string().min(1, 'Major is required').max(255),
    gpa: z.number().min(0, 'Min 0.0').max(4.0, 'Max 4.0'),
    class_id: z.string().min(1, 'Class is required'),
});

type FormValues = z.infer<typeof formSchema>;

export function StudentForm({ mode, initialData }: StudentFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [classes, setClasses] = useState<ClassItem[]>([]);

    useEffect(() => {
        fetchClasses()
            .then(setClasses)
            .catch(() => toast.error('Failed to load classes'));
    }, []);

    const {
        register,
        handleSubmit,
        formState: { errors, isValid, isDirty },
        setError,
        control,
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            student_id: initialData?.student_id ?? '',
            name: initialData?.name ?? '',
            birth_year: initialData?.birth_year ?? ('' as unknown as number),
            major: initialData?.major ?? '',
            gpa: initialData?.gpa ?? ('' as unknown as number),
            class_id: initialData?.class_id ?? '',
        },
        mode: 'onChange',
    });

    const onSubmit = async (data: FormValues) => {
        setIsSubmitting(true);
        try {
            const formattedData = { ...data, gpa: Number(data.gpa.toFixed(2)) };

            if (mode === 'create') {
                await createStudent(formattedData);
                toast.success(`Student "${data.name}" added successfully`);
            } else {
                const { student_id, ...updatePayload } = formattedData;
                await updateStudent(initialData!.student_id, updatePayload);
                toast.success(`Student "${data.name}" updated successfully`);
            }
            router.refresh();
            router.push('/');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Something went wrong';
            toast.error(message);
            if (message.includes('already exists')) {
                setError('student_id', { message });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
                <CardHeader>
                    <CardTitle>{mode === 'create' ? 'Add Record' : 'Edit Record'}</CardTitle>
                    <CardDescription>
                        {mode === 'create'
                            ? 'Enter the details below to add a new student.'
                            : 'Ensure the updated information applies to the correct academic profile.'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="student_id">Student ID</Label>
                            <Input
                                id="student_id"
                                placeholder="SV001"
                                disabled={mode === 'edit'}
                                {...register('student_id')}
                            />
                            {errors.student_id && (
                                <p className="text-xs text-destructive">{errors.student_id.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" placeholder="Nguyen Van A" {...register('name')} />
                            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="class_id">Class</Label>
                            <Controller
                                name="class_id"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        value={field.value}
                                    >
                                        <SelectTrigger id="class_id" className="w-full h-10">
                                            <SelectValue placeholder="Select a class..." />
                                        </SelectTrigger>
                                        <SelectContent alignItemWithTrigger={false}>
                                            {classes.map((c) => (
                                                <SelectItem key={c.class_id} value={c.class_id}>
                                                    {c.class_name} ({c.class_id})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.class_id && <p className="text-xs text-destructive">{errors.class_id.message}</p>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="birth_year">Birth Year</Label>
                                <Input
                                    id="birth_year"
                                    type="number"
                                    placeholder="2003"
                                    {...register('birth_year', { valueAsNumber: true })}
                                />
                                {errors.birth_year && (
                                    <p className="text-xs text-destructive">{errors.birth_year.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="gpa">GPA</Label>
                                <Input
                                    id="gpa"
                                    type="number"
                                    step="0.1"
                                    placeholder="3.5"
                                    {...register('gpa', { valueAsNumber: true })}
                                />
                                {errors.gpa && <p className="text-xs text-destructive">{errors.gpa.message}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="major">Major</Label>
                            <Input id="major" placeholder="Computer Science" {...register('major')} />
                            {errors.major && <p className="text-xs text-destructive">{errors.major.message}</p>}
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-3 pt-6">
                            <Button
                                type="submit"
                                disabled={isSubmitting || !isValid || (mode === 'edit' && !isDirty)}
                                className="w-full sm:w-auto px-6 h-10 font-semibold"
                            >
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {mode === 'create' ? 'Add Record' : 'Save Changes'}
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => router.push('/')}
                                className="w-full sm:w-auto h-10"
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </motion.div>
    );
}
