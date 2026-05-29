import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';
import AppLayout from '@/layouts/app-layout';
import type { Paginated, ShortUrl } from '@/types';

interface Props {
    links: Paginated<ShortUrl>;
}

export default function LinksIndex({ links }: Props) {
    return (
        <>
            <Head title="My Links" />
            {/* TODO: implement links table, edit modal, delete confirmation */}
        </>
    );
}

LinksIndex.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;
