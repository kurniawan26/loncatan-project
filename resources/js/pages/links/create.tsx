import { Head, Link, useForm } from '@inertiajs/react';
import { useMemo, useRef, useState } from 'react';
import type { SyntheticEvent } from 'react';
import { Button } from '@/components/snip/button';
import { Icon } from '@/components/snip/icon';
import { QR } from '@/components/snip/qr';
import { StatusBadge } from '@/components/snip/status-badge';
import { Switch } from '@/components/snip/switch';
import { useClipboard } from '@/hooks/use-clipboard';
import { dateID } from '@/lib/snip-data';
import * as shortUrls from '@/routes/short-urls';

type FormFields = {
    original_url: string;
    short_code: string;
    expires_at: string;
};

export default function LinksCreate() {
    const { data, setData, post, processing, errors } = useForm<FormFields>({
        original_url: '',
        short_code: '',
        expires_at: '',
    });
    const [useExpiry, setUseExpiry] = useState(false);
    const [, copy] = useClipboard();

    const autoSlug = useMemo(() => {
        if (data.short_code) {
            return data.short_code;
        }

        try {
            const url = data.original_url.match(/^https?:\/\//)
                ? data.original_url
                : 'https://' + data.original_url;
            const hostname = new URL(url).hostname.replace(/^www\./, '').split('.')[0];

            return (hostname || 'link').slice(0, 7) + '-x4k2';
        } catch {
            return 'link-x4k2';
        }
    }, [data.original_url, data.short_code]);

    const canSave = data.original_url.trim().length > 3;
    const qrRef = useRef<HTMLDivElement>(null);

    function submit(e: SyntheticEvent<HTMLFormElement>) {
        e.preventDefault();
        post(shortUrls.store.url());
    }

    function downloadQR() {
        const svg = qrRef.current?.querySelector('svg');

        if (!svg) {
            return;
        }

        const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.download = `qr-${autoSlug}.svg`;
        a.href = url;
        a.click();
        URL.revokeObjectURL(url);
    }

    function handleExpiryToggle(value: boolean) {
        setUseExpiry(value);

        if (!value) {
            setData('expires_at', '');
        }
    }

    return (
        <>
            <Head title="Buat link" />

            <form onSubmit={submit}>
                <div className="page-head">
                    <div className="ph-text">
                        <div className="row gap-8 center" style={{ marginBottom: 8 }}>
                            <Link href={shortUrls.index.url()} className="btn btn-quiet btn-sm btn-icon">
                                <Icon name="arrowLeft" size={16} />
                            </Link>
                            <span className="eyebrow">Tautan baru</span>
                        </div>
                        <h1 className="page-title">Buat link pendek</h1>
                    </div>
                </div>

                <div className="create-grid stagger">
                    {/* LEFT — form */}
                    <div className="stack gap-20">
                        <div className="snip-card snip-card-pad stack gap-20">
                            <div className="field">
                                <label className="label">Tautan tujuan</label>
                                <div className="input-group">
                                    <input
                                        className="mono"
                                        placeholder="tempel-url-panjang.com/halaman"
                                        value={data.original_url}
                                        onChange={(e) => setData('original_url', e.target.value)}
                                        autoFocus
                                    />
                                    {data.original_url && (
                                        <button
                                            type="button"
                                            className="btn btn-quiet btn-icon btn-sm"
                                            style={{ marginRight: 4 }}
                                            onClick={() => setData('original_url', '')}
                                        >
                                            <Icon name="x" size={14} />
                                        </button>
                                    )}
                                </div>
                                {errors.original_url && (
                                    <span className="hint" style={{ color: 'var(--ink)' }}>
                                        {errors.original_url}
                                    </span>
                                )}
                                <span className="hint">URL panjang yang ingin kamu pendekkan &amp; lacak.</span>
                            </div>

                            <div className="field">
                                <label className="label">
                                    Link pendek <span className="opt">slug bisa diubah</span>
                                </label>
                                <div className="input-group">
                                    <span className="prefix">loncatan.com/</span>
                                    <input
                                        className="mono"
                                        placeholder={autoSlug}
                                        value={data.short_code}
                                        onChange={(e) =>
                                            setData(
                                                'short_code',
                                                e.target.value.replace(/[^a-z0-9-]/gi, '').toLowerCase(),
                                            )
                                        }
                                    />
                                    {data.short_code && (
                                        <button
                                            type="button"
                                            className="btn btn-quiet btn-sm"
                                            style={{ marginRight: 4, borderRadius: 6 }}
                                            onClick={() => setData('short_code', '')}
                                        >
                                            Acak
                                        </button>
                                    )}
                                </div>
                                {errors.short_code ? (
                                    <span className="hint" style={{ color: 'var(--ink)' }}>
                                        {errors.short_code}
                                    </span>
                                ) : (
                                    <span className="hint">
                                        Kosongkan untuk slug acak. Huruf, angka, dan tanda hubung.
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="snip-card">
                            <div className="opt-row">
                                <div className="opt-info">
                                    <div className="opt-t">
                                        <Icon name="clock" size={16} />
                                        Tanggal kedaluwarsa
                                    </div>
                                    <div className="opt-d">Link mati otomatis setelah tanggal ini.</div>
                                </div>
                                <div className="row gap-12 center">
                                    {useExpiry && (
                                        <input
                                            type="date"
                                            className="input"
                                            style={{ width: 168 }}
                                            value={data.expires_at}
                                            onChange={(e) => setData('expires_at', e.target.value)}
                                        />
                                    )}
                                    <Switch on={useExpiry} onChange={handleExpiryToggle} />
                                </div>
                            </div>
                            {errors.expires_at && (
                                <div style={{ padding: '0 20px 12px' }}>
                                    <span className="hint" style={{ color: 'var(--ink)' }}>
                                        {errors.expires_at}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="row gap-10">
                            <Button
                                variant="primary"
                                size="lg"
                                icon="scissors"
                                type="submit"
                                disabled={!canSave || processing}
                                style={!canSave ? { opacity: 0.45 } : undefined}
                            >
                                {processing ? 'Menyimpan…' : 'Buat link'}
                            </Button>
                            <Link href={shortUrls.index.url()} className="btn btn-ghost btn-lg">
                                Batal
                            </Link>
                        </div>
                    </div>

                    {/* RIGHT — live preview */}
                    <div className="create-aside">
                        <div
                            className="snip-card snip-card-pad stack gap-16"
                            style={{ position: 'sticky', top: 0 }}
                        >
                            <span className="eyebrow">Pratinjau langsung</span>
                            <div className="prev-link">
                                <Icon name="link" size={15} className="dim" />
                                <span className="mono" style={{ fontSize: 15 }}>
                                    <span className="dim">loncatan.com/</span>
                                    <b style={{ fontWeight: 600 }}>{autoSlug}</b>
                                </span>
                            </div>
                            <div className="prev-dest mono">
                                {data.original_url || 'tujuan-belum-diisi.com'}
                            </div>

                            <div ref={qrRef} style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
                                <QR value={`${window.location.origin}/${autoSlug}`} size={172} />
                            </div>

                            <div className="row gap-8">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    icon="copy"
                                    type="button"
                                    style={{ flex: 1 }}
                                    onClick={() => copy(`${window.location.origin}/${autoSlug}`)}
                                >
                                    Salin link
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    icon="download"
                                    type="button"
                                    style={{ flex: 1 }}
                                    onClick={downloadQR}
                                >
                                    Unduh QR
                                </Button>
                            </div>

                            <hr className="divider" />

                            <div className="stack">
                                <div className="kv">
                                    <span className="k">Status</span>
                                    <span className="v">
                                        <StatusBadge status="active" />
                                    </span>
                                </div>
                                <div className="kv">
                                    <span className="k">Kedaluwarsa</span>
                                    <span className="v">
                                        {useExpiry && data.expires_at ? dateID(data.expires_at) : 'Tidak ada'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </>
    );
}
