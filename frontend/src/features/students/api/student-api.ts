import {
    Student,
    StudentCreate,
    StudentUpdate,
    ClassItem,
    ClassCreate,
    ClassUpdate,
    Statistics,
    ImportResult,
} from '../types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

async function handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: 'An error occurred' }));
        throw new Error(error.detail || `HTTP ${res.status}`);
    }
    if (res.status === 204) return undefined as T;
    return res.json();
}

// ─── Students ───

export async function fetchStudents(): Promise<Student[]> {
    const res = await fetch(`${API_BASE}/students`, {
        next: { tags: ['students'] },
        cache: 'no-store',
    });
    return handleResponse<Student[]>(res);
}

export async function fetchStudent(id: string): Promise<Student> {
    const res = await fetch(`${API_BASE}/students/${encodeURIComponent(id)}`, {
        next: { tags: [`student-${id}`] },
        cache: 'no-store',
    });
    return handleResponse<Student>(res);
}

export async function createStudent(data: StudentCreate): Promise<Student> {
    const res = await fetch(`${API_BASE}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return handleResponse<Student>(res);
}

export async function updateStudent(id: string, data: StudentUpdate): Promise<Student> {
    const res = await fetch(`${API_BASE}/students/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return handleResponse<Student>(res);
}

export async function deleteStudent(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/students/${encodeURIComponent(id)}`, {
        method: 'DELETE',
    });
    return handleResponse<void>(res);
}

// ─── Statistics ───

export async function fetchStatistics(): Promise<Statistics> {
    const res = await fetch(`${API_BASE}/students/statistics`, {
        cache: 'no-store',
    });
    return handleResponse<Statistics>(res);
}

// ─── CSV Export ───

export function getExportCSVUrl(): string {
    return `${API_BASE}/students/export/csv`;
}

export function getTemplateCSVUrl(): string {
    return `${API_BASE}/students/template/csv`;
}

// ─── CSV Import ───

export async function importCSV(file: File): Promise<ImportResult> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/students/import/csv`, {
        method: 'POST',
        body: formData,
    });
    return handleResponse<ImportResult>(res);
}

// ─── Classes ───

export async function fetchClasses(): Promise<ClassItem[]> {
    const res = await fetch(`${API_BASE}/classes`, {
        cache: 'no-store',
    });
    return handleResponse<ClassItem[]>(res);
}

export async function fetchClass(id: string): Promise<ClassItem> {
    const res = await fetch(`${API_BASE}/classes/${encodeURIComponent(id)}`, {
        cache: 'no-store',
    });
    return handleResponse<ClassItem>(res);
}

export async function createClass(data: ClassCreate): Promise<ClassItem> {
    const res = await fetch(`${API_BASE}/classes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return handleResponse<ClassItem>(res);
}

export async function updateClass(id: string, data: ClassUpdate): Promise<ClassItem> {
    const res = await fetch(`${API_BASE}/classes/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return handleResponse<ClassItem>(res);
}

export async function deleteClass(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/classes/${encodeURIComponent(id)}`, {
        method: 'DELETE',
    });
    return handleResponse<void>(res);
}
