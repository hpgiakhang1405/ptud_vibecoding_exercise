'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2, Users, Search, Download, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DeleteDialog } from '@/components/delete-dialog';
import { CsvImportDialog } from '@/features/students/components/csv-import-dialog';
import { deleteStudent, getExportCSVUrl, getTemplateCSVUrl } from '@/features/students/api/student-api';
import { Student } from '@/features/students/types';

interface StudentTableProps {
    students: Student[];
    onDeleted?: () => void;
}

const tableStagger = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
        },
    },
};

const rowFade = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

export function StudentTable({ students, onDeleted }: StudentTableProps) {
    const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showImport, setShowImport] = useState(false);
    const router = useRouter();

    const filteredStudents = useMemo(() => {
        if (!searchQuery.trim()) return students;
        const q = searchQuery.toLowerCase();
        return students.filter((s) => s.name.toLowerCase().includes(q));
    }, [students, searchQuery]);

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            await deleteStudent(deleteTarget.student_id);
            toast.success(`Student "${deleteTarget.name}" has been deleted`);
            onDeleted?.();
            router.refresh();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to delete student');
        } finally {
            setIsDeleting(false);
            setDeleteTarget(null);
        }
    };

    const isEmpty = students.length === 0;

    let content;
    if (isEmpty) {
        content = (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-center justify-center rounded-xl border border-border/50 bg-card/70 px-6 py-24 text-center backdrop-blur-2xl shadow-xl relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-50 pointer-events-none" />
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 shadow-[0_0_30px_rgba(var(--color-primary),0.2)]">
                    <Users className="h-10 w-10 text-primary" />
                </div>
                <h3 className="mb-2 text-2xl font-bold font-heading tracking-tight">No records found</h3>
                <p className="mb-8 text-base text-muted-foreground/80 max-w-sm">
                    The database is currently empty. Add the first student record to begin managing your cohort.
                </p>
                <div className="flex gap-3">
                    <Button asChild className="px-6 h-10">
                        <Link href="/students/new">Get Started</Link>
                    </Button>
                    <Button variant="outline" className="h-10" onClick={() => setShowImport(true)}>
                        <Upload className="mr-2 h-4 w-4" />
                        Import CSV
                    </Button>
                </div>
            </motion.div>
        );
    } else {
        content = (
            <>
                {/* Toolbar: Search + CSV buttons */}
                <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="relative flex-1 w-full sm:max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-10"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="h-10" asChild>
                            <a href={getExportCSVUrl()} download>
                                <Download className="mr-2 h-4 w-4" />
                                Export CSV
                            </a>
                        </Button>
                        <Button variant="outline" size="sm" className="h-10" onClick={() => setShowImport(true)}>
                            <Upload className="mr-2 h-4 w-4" />
                            Import CSV
                        </Button>
                        <Button variant="ghost" size="sm" className="h-10 text-muted-foreground" asChild>
                            <a href={getTemplateCSVUrl()} download>
                                Template
                            </a>
                        </Button>
                    </div>
                </div>

                {/* Search result count */}
                {searchQuery.trim() && (
                    <p className="mb-3 text-sm text-muted-foreground">
                        Showing {filteredStudents.length} of {students.length} student{students.length !== 1 ? 's' : ''}
                    </p>
                )}

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
                                    Student ID
                                </TableHead>
                                <TableHead className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 h-12">
                                    Full Name
                                </TableHead>
                                <TableHead className="hidden lg:table-cell text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 h-12">
                                    Class
                                </TableHead>
                                <TableHead className="hidden md:table-cell text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 h-12">
                                    Major
                                </TableHead>
                                <TableHead className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 h-12">
                                    GPA
                                </TableHead>
                                <TableHead className="text-right text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 h-12">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredStudents.map((student) => (
                                <motion.tr
                                    variants={rowFade}
                                    key={student.student_id}
                                    className="border-border/50 transition-colors hover:bg-slate-50 group"
                                >
                                    <TableCell className="h-14">
                                        <Badge
                                            variant="secondary"
                                            className="font-mono text-xs bg-primary/10 text-primary border-primary/20 group-hover:bg-primary/20 transition-colors"
                                        >
                                            {student.student_id}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-semibold tracking-wide h-14">{student.name}</TableCell>
                                    <TableCell className="hidden lg:table-cell text-muted-foreground h-14">
                                        <Badge variant="outline" className="font-normal">
                                            {student.class_name || student.class_id}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell text-muted-foreground h-14">
                                        {student.major}
                                    </TableCell>
                                    <TableCell className="h-14">
                                        <span
                                            className={`font-mono text-sm font-semibold tracking-wider ${
                                                student.gpa >= 3.5
                                                    ? 'text-primary drop-shadow-[0_0_8px_rgba(var(--color-primary),0.6)]'
                                                    : 'text-foreground/80'
                                            }`}
                                        >
                                            {student.gpa.toFixed(2)}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right h-14">
                                        <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                asChild
                                                className="h-9 px-3 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                                            >
                                                <Link href={`/students/${encodeURIComponent(student.student_id)}/edit`}>
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Edit
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-9 px-3 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                                                onClick={() => setDeleteTarget(student)}
                                                disabled={isDeleting}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </Button>
                                        </div>
                                    </TableCell>
                                </motion.tr>
                            ))}
                            {filteredStudents.length === 0 && searchQuery.trim() && (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                        No students match &quot;{searchQuery}&quot;
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </motion.div>
            </>
        );
    }

    return (
        <>
            {content}

            <DeleteDialog
                open={!!deleteTarget}
                studentName={deleteTarget?.name ?? ''}
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />
            <CsvImportDialog open={showImport} onClose={() => setShowImport(false)} />
        </>
    );
}
