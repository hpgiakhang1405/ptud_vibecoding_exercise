'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Upload, FileWarning, CheckCircle2, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

import { Button } from '@/components/ui/button';
import { importCSV } from '@/features/students/api/student-api';
import { ImportResult } from '@/features/students/types';

interface CsvImportDialogProps {
    open: boolean;
    onClose: () => void;
}

export function CsvImportDialog({ open, onClose }: CsvImportDialogProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [result, setResult] = useState<ImportResult | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleFile = async (file: File) => {
        setIsUploading(true);
        setResult(null);
        try {
            const res = await importCSV(file);
            setResult(res);
            if (res.imported > 0) {
                toast.success(`Successfully imported ${res.imported} student(s)`);
                router.refresh();
            }
            if (res.failed > 0) {
                toast.warning(`${res.failed} row(s) had errors`);
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Import failed');
        } finally {
            setIsUploading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    const handleClose = () => {
        setResult(null);
        onClose();
    };

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={handleClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative z-10 w-full max-w-lg mx-4 bg-card rounded-xl border border-border/50 shadow-2xl overflow-hidden"
                    >
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
                            <h3 className="text-lg font-semibold font-heading">Import Students from CSV</h3>
                            <Button variant="ghost" size="sm" onClick={handleClose} className="h-8 w-8 p-0">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="p-6 space-y-4">
                            {!result ? (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                                        <Upload className="h-8 w-8 text-primary" />
                                    </div>
                                    <p className="text-sm text-muted-foreground text-center">
                                        Select a CSV file with columns: <br />
                                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                                            student_id, name, birth_year, major, gpa, class_id
                                        </code>
                                    </p>
                                    <input
                                        ref={fileRef}
                                        type="file"
                                        accept=".csv"
                                        onChange={handleChange}
                                        className="hidden"
                                    />
                                    <Button
                                        onClick={() => fileRef.current?.click()}
                                        disabled={isUploading}
                                        className="px-6"
                                    >
                                        {isUploading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Importing...
                                            </>
                                        ) : (
                                            'Choose File'
                                        )}
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Summary */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3">
                                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                                            <div>
                                                <p className="text-2xl font-bold text-green-700">{result.imported}</p>
                                                <p className="text-xs text-green-600">Imported</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
                                            <FileWarning className="h-5 w-5 text-red-600" />
                                            <div>
                                                <p className="text-2xl font-bold text-red-700">{result.failed}</p>
                                                <p className="text-xs text-red-600">Failed</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Error list */}
                                    {result.errors.length > 0 && (
                                        <div className="max-h-48 overflow-y-auto rounded-lg border border-border/50 bg-muted/30">
                                            <table className="w-full text-xs">
                                                <thead>
                                                    <tr className="border-b border-border/50">
                                                        <th className="px-3 py-2 text-left font-medium">Row</th>
                                                        <th className="px-3 py-2 text-left font-medium">ID</th>
                                                        <th className="px-3 py-2 text-left font-medium">Reason</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {result.errors.map((err, i) => (
                                                        <tr key={i} className="border-b border-border/30">
                                                            <td className="px-3 py-1.5 font-mono">{err.row}</td>
                                                            <td className="px-3 py-1.5 font-mono">
                                                                {err.student_id || '—'}
                                                            </td>
                                                            <td className="px-3 py-1.5 text-destructive">
                                                                {err.reason}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setResult(null);
                                            }}
                                        >
                                            Import Another
                                        </Button>
                                        <Button onClick={handleClose}>Done</Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body,
    );
}
