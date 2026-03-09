import { notFound } from 'next/navigation';
import { BackButton } from '@/components/back-button';
import { ClassForm } from '@/features/students/components/class-form';
import { fetchClass } from '@/features/students/api/student-api';

interface Props {
    params: Promise<{ id: string }>;
}

export default async function EditClassPage({ params }: Props) {
    const p = await params;
    const classId = p.id;

    let classItem;
    try {
        classItem = await fetchClass(decodeURIComponent(classId));
    } catch {
        notFound();
    }

    return (
        <div className="mx-auto max-w-2xl px-4 sm:px-6 py-6 sm:py-8">
            <BackButton href="/classes" label="Back to Class List" />
            <ClassForm mode="edit" initialData={classItem} />
        </div>
    );
}
