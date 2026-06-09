export interface SnipLink {
    id: number;
    fav: string;
    slug: string;
    title: string;
    daily: number[];
    clicks: number;
}

const daily14 = (seed: number) =>
    Array.from({ length: 14 }, (_, i) => Math.floor(((Math.sin(seed + i) + 1.2) * 180) % 400));

export const SNIP_LINKS: SnipLink[] = [
    { id: 1, fav: '🎬', slug: 'film-juni', title: 'Daftar film terbaik Juni 2026', daily: daily14(1), clicks: 2841 },
    { id: 2, fav: '🛍️', slug: 'promo-hari', title: 'Flash sale Tokopedia — hari ini', daily: daily14(3), clicks: 1204 },
    { id: 3, fav: '📰', slug: 'artikel-ai', title: 'Cara kerja model bahasa besar', daily: daily14(5), clicks: 976 },
    { id: 4, fav: '🎵', slug: 'playlist', title: 'Spotify — Playlist coding malam', daily: daily14(7), clicks: 543 },
];

export function fmt(n: number): string {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace('.', ',') + 'Jt';
    if (n >= 1_000) return (n / 1_000).toFixed(1).replace('.', ',') + 'K';
    return String(n);
}

export function dateID(s: string | null | undefined): string {
    if (!s) return '—';
    return new Date(s).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}
