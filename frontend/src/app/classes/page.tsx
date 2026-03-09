import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ClassTable } from '@/features/students/components/class-table';
import { fetchClasses } from '@/features/students/api/student-api';

export const dynamic = 'force-dynamic';

export default async function ClassesPage() {
    const classes = await fetchClasses();

    return (
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12">
            <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight font-heading">Class Management</h1>
                    <p className="mt-2 text-base text-muted-foreground max-w-xl leading-relaxed">
                        Manage class cohorts and their advisors.
                        {classes.length > 0 && (
                            <span className="ml-3 inline-flex items-center rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-semibold text-primary">
                                {classes.length} class{classes.length !== 1 ? 'es' : ''}
                            </span>
                        )}
                    </p>
                </div>
                <Button asChild className="px-5 h-10">
                    <Link href="/classes/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Class
                    </Link>
                </Button>
            </div>
            <ClassTable classes={classes} />
        </div>
    );
}
