import { BackButton } from '@/components/back-button';
import { ClassForm } from '@/features/students/components/class-form';

export default function NewClassPage() {
    return (
        <div className="mx-auto max-w-2xl px-4 sm:px-6 py-6 sm:py-8">
            <BackButton href="/classes" label="Back to Class List" />
            <ClassForm mode="create" />
        </div>
    );
}
