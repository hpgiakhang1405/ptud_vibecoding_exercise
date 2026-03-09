'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { createClass, updateClass } from '@/features/students/api/student-api';
import { ClassItem } from '@/features/students/types';

interface ClassFormProps {
    mode: 'create' | 'edit';
    initialData?: ClassItem;
}

const formSchema = z.object({
    class_id: z.string().min(1, 'Class ID is required').max(50),
    class_name: z.string().min(1, 'Class name is required').max(255),
    advisor: z.string().min(1, 'Advisor is required').max(255),
});

type FormValues = z.infer<typeof formSchema>;

export function ClassForm({ mode, initialData }: ClassFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isValid, isDirty },
        setError,
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            class_id: initialData?.class_id ?? '',
            class_name: initialData?.class_name ?? '',
            advisor: initialData?.advisor ?? '',
        },
        mode: 'onChange',
    });

    const onSubmit = async (data: FormValues) => {
        setIsSubmitting(true);
        try {
            if (mode === 'create') {
                await createClass(data);
                toast.success(`Class "${data.class_name}" created successfully`);
            } else {
                const { class_id, ...updatePayload } = data;
                await updateClass(initialData!.class_id, updatePayload);
                toast.success(`Class "${data.class_name}" updated successfully`);
            }
            router.refresh();
            router.push('/classes');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Something went wrong';
            toast.error(message);
            if (message.includes('already exists')) {
                setError('class_id', { message });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
                <CardHeader>
                    <CardTitle>{mode === 'create' ? 'Add Class' : 'Edit Class'}</CardTitle>
                    <CardDescription>
                        {mode === 'create'
                            ? 'Enter the details below to create a new class.'
                            : 'Update the class information below.'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="class_id">Class ID</Label>
                            <Input
                                id="class_id"
                                placeholder="C01"
                                disabled={mode === 'edit'}
                                {...register('class_id')}
                            />
                            {errors.class_id && <p className="text-xs text-destructive">{errors.class_id.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="class_name">Class Name</Label>
                            <Input id="class_name" placeholder="Computer Science 1" {...register('class_name')} />
                            {errors.class_name && (
                                <p className="text-xs text-destructive">{errors.class_name.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="advisor">Advisor</Label>
                            <Input id="advisor" placeholder="Nguyen Van A" {...register('advisor')} />
                            {errors.advisor && <p className="text-xs text-destructive">{errors.advisor.message}</p>}
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-3 pt-6">
                            <Button
                                type="submit"
                                disabled={isSubmitting || !isValid || (mode === 'edit' && !isDirty)}
                                className="w-full sm:w-auto px-6 h-10 font-semibold"
                            >
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {mode === 'create' ? 'Create Class' : 'Save Changes'}
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => router.push('/classes')}
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
