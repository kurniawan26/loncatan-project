export type * from './auth';
export type * from './navigation';
export type * from './ui';

export type ShortUrl = {
    id: number;
    user_id: number | null;
    original_url: string;
    short_code: string;
    short_url: string;        // accessor dari model: url(short_code)
    is_custom_code: boolean;
    clicks_count: number;
    is_active: boolean;
    expires_at: string | null;
    created_at: string;
    updated_at: string;
    daily?: number[];         // 30-day click counts, injected by controller
    clicks7?: number;         // clicks in last 7 days, injected by controller
};

export type DashboardStats = {
    totalClicks: number;
    activeCount: number;
    totalCount: number;
    clicks7Total: number;
    trend30: number[];
};
export type Paginator<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: { url: string | null; label: string; active: boolean }[];
};

export type FlashMessages = {
    success?: string;
    shortUrl?: string;   // dipakai oleh guest store
};