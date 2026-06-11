import type { Auth, FlashMessages } from '@/types';

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            [key: string]: unknown;
        };
    }

    interface PageProps {
        auth: Auth;
        name: string;
        flash: FlashMessages;
        linkCount: number;
        sidebarOpen: boolean;
    }
}
