import { Head, Link, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/snip/button';
import { Icon } from '@/components/snip/icon';
import { IconButton } from '@/components/snip/icon-button';
import { QR } from '@/components/snip/qr';
import { Segment } from '@/components/snip/segment';
import { Sparkline } from '@/components/snip/sparkline';
import { StatusBadge } from '@/components/snip/status-badge';
import type { LinkStatus } from '@/components/snip/status-badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useClipboard } from '@/hooks/use-clipboard';
import { fmt } from '@/lib/snip-data';
import * as shortUrls from '@/routes/short-urls';
import type { DashboardStats, Paginator, ShortUrl } from '@/types';

type Props = {
    links: Paginator<ShortUrl>;
    stats: DashboardStats;
};

function getStatus(link: ShortUrl): LinkStatus {
    if (link.expires_at && new Date(link.expires_at) < new Date()) {
        return 'expired';
    }

    if (!link.is_active) {
        return 'paused';
    }

    return 'active';
}

function daysLeft(expiresAt: string): number {
    return Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86_400_000);
}

export default function LinksIndex({ links, stats }: Props) {
    const { flash } = usePage().props;
    const [, copy] = useClipboard();
    const [q, setQ] = useState('');
    const [filter, setFilter] = useState('all');
    const [sort, setSort] = useState('recent');
    const [qrLink, setQrLink] = useState<ShortUrl | null>(null);

    const rows = useMemo(
        () =>
            links.data
                .filter((l) => {
                    const status = getStatus(l);

                    if (filter !== 'all' && status !== filter) {
                        return false;
                    }

                    if (q) {
                        const needle = q.toLowerCase();

                        if (!(l.short_code + l.original_url).toLowerCase().includes(needle)) {
                            return false;
                        }
                    }

                    return true;
                })
                .sort((a, b) =>
                    sort === 'clicks'
                        ? b.clicks_count - a.clicks_count
                        : new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
                ),
        [links.data, q, filter, sort],
    );

    function deleteLink(link: ShortUrl) {
        if (!confirm(`Hapus loncatan.com/${link.short_code}?`)) {
            return;
        }

        router.delete(shortUrls.destroy.url(link.id));
    }

    function toggleActive(link: ShortUrl) {
        router.put(shortUrls.update.url(link.id), { is_active: !link.is_active }, { preserveScroll: true });
    }

    return (
        <>
            <Head title="Tautan" />

            {flash?.success && <div className="copy-flash show">{flash.success}</div>}

            {/* Page header */}
            <div className="page-head stagger">
                <div className="ph-text">
                    <h1 className="page-title">Tautan</h1>
                    <p className="page-sub">Kelola, lacak, dan optimalkan semua link pendekmu.</p>
                </div>
                <div className="page-actions">
                    <Link href={shortUrls.create.url()} className="btn btn-primary">
                        <Icon name="plus" size={16} />
                        Link baru
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid-4 mb-24 stagger">
                <div className="snip-card stat-card">
                    <div className="row between center">
                        <span className="stat-label">Total klik</span>
                        <Icon name="chart" size={15} className="dim" />
                    </div>
                    <div className="stat-value">{fmt(stats.totalClicks)}</div>
                    <div className="stat-delta">
                        <b>+{fmt(stats.clicks7Total)}</b> dalam 7 hari
                    </div>
                </div>

                <div className="snip-card stat-card">
                    <div className="row between center">
                        <span className="stat-label">Link aktif</span>
                        <Icon name="link" size={15} className="dim" />
                    </div>
                    <div className="stat-value">{stats.activeCount}</div>
                    <div className="stat-delta">dari {stats.totalCount} total link</div>
                </div>

                <div className="snip-card stat-card">
                    <div className="row between center">
                        <span className="stat-label">Klik 7 hari</span>
                        <Icon name="clock" size={15} className="dim" />
                    </div>
                    <div className="stat-value">{fmt(stats.clicks7Total)}</div>
                    <div className="stat-delta">semua link</div>
                </div>

                <div className="snip-card stat-card" style={{ paddingBottom: 12 }}>
                    <span className="stat-label">Tren klik (30 hari)</span>
                    <div style={{ marginTop: 14 }}>
                        <Sparkline data={stats.trend30} height={56} />
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="toolbar">
                <div className="search-mini" style={{ width: 280 }}>
                    <Icon name="search" size={15} />
                    <input
                        placeholder="Cari slug atau URL…"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                    />
                </div>
                <Segment
                    value={filter}
                    onChange={setFilter}
                    options={[
                        { value: 'all', label: 'Semua' },
                        { value: 'active', label: 'Aktif' },
                        { value: 'paused', label: 'Dijeda' },
                        { value: 'expired', label: 'Kedaluwarsa' },
                    ]}
                />
                <div className="spacer" />
                <Segment
                    value={sort}
                    onChange={setSort}
                    options={[
                        { value: 'recent', label: 'Terbaru' },
                        { value: 'clicks', label: 'Terpopuler' },
                    ]}
                />
            </div>

            {/* Empty state */}
            {rows.length === 0 ? (
                <div className="snip-card empty">
                    <Icon name="link" size={28} />
                    {q || filter !== 'all' ? (
                        <div>
                            <p className="section-title" style={{ marginBottom: 4 }}>
                                Tidak ada link cocok
                            </p>
                            <p className="dim">Coba kata kunci lain atau ubah filter.</p>
                        </div>
                    ) : (
                        <>
                            <div>
                                <p className="section-title" style={{ marginBottom: 4 }}>
                                    Belum ada tautan
                                </p>
                                <p className="dim" style={{ fontSize: 14, marginTop: 4 }}>
                                    Mulai dengan membuat link pendek pertama kamu.
                                </p>
                            </div>
                            <Link href={shortUrls.create.url()} className="btn btn-primary">
                                Buat link pertama
                            </Link>
                        </>
                    )}
                </div>
            ) : (
                <div className="link-list stagger">
                    {rows.map((link) => {
                        const status    = getStatus(link);
                        const expiresAt = link.expires_at;
                        const expiring  = expiresAt !== null && status !== 'expired' && daysLeft(expiresAt) <= 30;

                        return (
                            <div key={link.id} className="link-row">
                                <div className="fav">{link.short_code[0].toUpperCase()}</div>

                                <div className="link-main">
                                    <div className="link-short">
                                        <span className="dom">loncatan.com/</span>
                                        {link.short_code}
                                        <StatusBadge status={status} />
                                        {expiring && (
                                            <span className="snip-badge warn">
                                                <Icon name="clock" size={11} />
                                                {daysLeft(expiresAt)}h lagi
                                            </span>
                                        )}
                                    </div>
                                    <div className="link-dest">
                                        <Icon name="arrowRight" size={12} />
                                        {link.original_url}
                                    </div>
                                </div>

                                <div className="link-meta">
                                    {link.daily && (
                                        <div className="hide-sm">
                                            <Sparkline data={link.daily.slice(-14)} height={34} />
                                        </div>
                                    )}
                                    <div className="metric">
                                        <div className="m-val">{fmt(link.clicks_count)}</div>
                                        <div className="m-lab">klik</div>
                                    </div>
                                    <div className="row-actions">
                                        <IconButton
                                            icon="copy"
                                            size="sm"
                                            title="Salin link"
                                            onClick={() => copy(link.short_url).then((ok) => ok && toast.success('Link disalin!'))}
                                        />
                                        <IconButton
                                            icon="qr"
                                            size="sm"
                                            title="QR code"
                                            onClick={() => setQrLink(link)}
                                        />
                                        <IconButton
                                            icon="edit"
                                            size="sm"
                                            title={link.is_active ? 'Jeda link' : 'Aktifkan link'}
                                            onClick={() => toggleActive(link)}
                                        />
                                        <Button
                                            variant="quiet"
                                            size="sm"
                                            onClick={() => deleteLink(link)}
                                            style={{ color: 'var(--ink-3)' }}
                                        >
                                            Hapus
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            <Dialog open={qrLink !== null} onOpenChange={(open) => !open && setQrLink(null)}>
                <DialogContent className="max-w-xs text-center">
                    <DialogHeader>
                        <DialogTitle>QR Code</DialogTitle>
                    </DialogHeader>
                    {qrLink && (
                        <div className="flex flex-col items-center gap-4 py-2">
                            <QR value={qrLink.short_url} size={200} />
                            <p className="text-sm text-muted-foreground font-mono">{qrLink.short_url}</p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
