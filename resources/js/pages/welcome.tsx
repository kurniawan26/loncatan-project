import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';
import PublicLayout from '@/layouts/public-layout';

export default function Welcome() {
    return (
        <>
            <Head title="Loncatan — More than just shorter links" />
            {/* TODO: implement sections (Hero, ShortenForm, Features, CTA) */}
        </>
    );
}

Welcome.layout = (page: ReactNode) => <PublicLayout>{page}</PublicLayout>;
