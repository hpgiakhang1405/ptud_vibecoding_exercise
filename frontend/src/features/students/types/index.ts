// ─── Student ───

export interface Student {
    student_id: string;
    name: string;
    birth_year: number;
    major: string;
    gpa: number;
    class_id: string;
    class_name: string;
}

export interface StudentCreate {
    student_id: string;
    name: string;
    birth_year: number;
    major: string;
    gpa: number;
    class_id: string;
}

export interface StudentUpdate {
    name: string;
    birth_year: number;
    major: string;
    gpa: number;
    class_id: string;
}

// ─── Class ───

export interface ClassItem {
    class_id: string;
    class_name: string;
    advisor: string;
}

export interface ClassCreate {
    class_id: string;
    class_name: string;
    advisor: string;
}

export interface ClassUpdate {
    class_name: string;
    advisor: string;
}

// ─── Statistics ───

export interface MajorCount {
    major: string;
    count: number;
}

export interface Statistics {
    total_students: number;
    average_gpa: number;
    students_by_major: MajorCount[];
}

// ─── Import ───

export interface ImportError {
    row: number;
    student_id: string;
    reason: string;
}

export interface ImportResult {
    imported: number;
    failed: number;
    errors: ImportError[];
}
