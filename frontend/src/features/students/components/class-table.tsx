'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DeleteDialog } from '@/components/delete-dialog';
import { deleteClass } from '@/features/students/api/student-api';
import { ClassItem } from '@/features/students/types';

interface ClassTableProps {
    classes: ClassItem[];
}

const tableStagger = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const rowFade = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

export function ClassTable({ classes }: ClassTableProps) {
    const [deleteTarget, setDeleteTarget] = useState<ClassItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            await deleteClass(deleteTarget.class_id);
            toast.success(`Class "${deleteTarget.class_name}" has been deleted`);
            router.refresh();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to delete class');
        } finally {
            setIsDeleting(false);
            setDeleteTarget(null);
        }
    };

    if (classes.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center rounded-xl border border-border/50 bg-card/70 px-6 py-24 text-center backdrop-blur-2xl shadow-xl relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-50 pointer-events-none" />
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                    <BookOpen className="h-10 w-10 text-primary" />
                </div>
                <h3 className="mb-2 text-2xl font-bold font-heading tracking-tight">No classes yet</h3>
                <p className="mb-8 text-base text-muted-foreground/80 max-w-sm">
                    Create your first class to organize students into cohorts.
                </p>
                <Button asChild className="px-6 h-10">
                    <Link href="/classes/new">Create First Class</Link>
                </Button>
            </motion.div>
        );
    }

    return (
        <>
            <motion.div
                variants={tableStagger}
                initial="hidden"
                animate="show"
                className="overflow-hidden rounded-xl border border-border/50 bg-card/70 backdrop-blur-2xl shadow-xl relative"
            >
                <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-transparent pointer-events-none" />
                <Table>
                    <TableHeader>
                        <TableRow className="border-border/50 hover:bg-transparent">
                            <TableHead className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 h-12">
                                Class ID
                            </TableHead>
                            <TableHead className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 h-12">
                                Class Name
                            </TableHead>
                            <TableHead className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 h-12">
                                Advisor
                            </TableHead>
                            <TableHead className="text-right text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 h-12">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {classes.map((cls) => (
                            <motion.tr
                                variants={rowFade}
                                key={cls.class_id}
                                className="border-border/50 transition-colors hover:bg-slate-50 group"
                            >
                                <TableCell className="h-14">
                                    <Badge
                                        variant="secondary"
                                        className="font-mono text-xs bg-primary/10 text-primary border-primary/20 group-hover:bg-primary/20 transition-colors"
                                    >
                                        {cls.class_id}
                                    </Badge>
                                </TableCell>
                                <TableCell className="font-semibold tracking-wide h-14">{cls.class_name}</TableCell>
                                <TableCell className="text-muted-foreground h-14">{cls.advisor}</TableCell>
                                <TableCell className="text-right h-14">
                                    <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            asChild
                                            className="h-9 px-3 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                                        >
                                            <Link href={`/classes/${encodeURIComponent(cls.class_id)}/edit`}>
                                                <Pencil className="mr-2 h-4 w-4" />
                                                Edit
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-9 px-3 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                                            onClick={() => setDeleteTarget(cls)}
                                            disabled={isDeleting}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                        </Button>
                                    </div>
                                </TableCell>
                            </motion.tr>
                        ))}
                    </TableBody>
                </Table>
            </motion.div>

            <DeleteDialog
                open={!!deleteTarget}
                studentName={deleteTarget?.class_name ?? ''}
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </>
    );
}
