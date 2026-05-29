export type * from './auth';
export type * from './navigation';
export type * from './ui';

export type ShortUrl = {
    id: number;
    user_id: number | null;
    original_url: string;
    short_code: string;
    short_url: string;
    is_custom_code: boolean;
    clicks_count: number;
    is_active: boolean;
    expires_at: string | null;
    created_at: string;
    updated_at: string;
};

export type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: { url: string | null; label: string; active: boolean }[];
};
