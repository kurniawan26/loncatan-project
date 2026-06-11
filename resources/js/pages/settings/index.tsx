import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/snip/button';
import { Icon, type IconName } from '@/components/snip/icon';
import { IconButton } from '@/components/snip/icon-button';
import { Switch } from '@/components/snip/switch';
import { useClipboard } from '@/hooks/use-clipboard';

type Tab = 'domain' | 'profile' | 'defaults' | 'plan';

type Domain = {
    host: string;
    status: 'verified' | 'pending';
    primary: boolean;
    links: number;
};

type LinkDefaults = {
    qr: boolean;
    utm: boolean;
    expiry: boolean;
    cloak: boolean;
};

const DOMAINS: Domain[] = [
    { host: 'go.studioaurora.com', status: 'verified', primary: true, links: 142 },
    { host: 'aur.ro', status: 'verified', primary: false, links: 38 },
    { host: 'links.aurora.id', status: 'pending', primary: false, links: 0 },
];

const TABS: { id: Tab; label: string; icon: IconName }[] = [
    { id: 'domain', label: 'Domain', icon: 'globe' },
    { id: 'profile', label: 'Profil', icon: 'settings' },
    { id: 'defaults', label: 'Default link', icon: 'sliders' },
    { id: 'plan', label: 'Paket & tagihan', icon: 'zap' },
];

const DEFAULT_ROWS: [keyof LinkDefaults, IconName, string, string][] = [
    ['qr', 'qr', 'Buat QR otomatis', 'Setiap link baru langsung punya QR code.'],
    ['utm', 'sliders', 'Sarankan UTM', 'Tampilkan kolom UTM saat membuat link kampanye.'],
    ['expiry', 'clock', 'Wajib tanggal kedaluwarsa', 'Minta tanggal kedaluwarsa untuk tiap link baru.'],
    ['cloak', 'eye', 'Sembunyikan tujuan (cloaking)', 'Tutupi URL asli saat dibagikan.'],
];

export default function SettingsIndex() {
    const { auth } = usePage().props;
    const [tab, setTab] = useState<Tab>('domain');
    const [, copy] = useClipboard();
    const [defaults, setDefaults] = useState<LinkDefaults>({
        qr: true,
        utm: false,
        expiry: false,
        cloak: false,
    });

    const initials = auth.user.name
        .split(' ')
        .map((w: string) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <>
            <Head title="Pengaturan" />

            <div className="page-head">
                <div className="ph-text">
                    <h1 className="page-title">Pengaturan</h1>
                    <p className="page-sub">Atur domain, profil, dan preferensi default akunmu.</p>
                </div>
            </div>

            <div className="settings-grid">
                <nav className="settings-tabs">
                    {TABS.map((t) => (
                        <button
                            key={t.id}
                            type="button"
                            className={`set-tab${tab === t.id ? ' active' : ''}`}
                            onClick={() => setTab(t.id)}
                        >
                            <Icon name={t.icon} size={16} />
                            {t.label}
                        </button>
                    ))}
                </nav>

                <div className="stack gap-20">
                    {tab === 'domain' && (
                        <>
                            <div className="row between center">
                                <div>
                                    <h2 className="section-title">Domain ber-brand</h2>
                                    <p className="page-sub" style={{ marginTop: 4 }}>
                                        Pakai domainmu sendiri agar link terlihat profesional.
                                    </p>
                                </div>
                                <Button variant="primary" icon="plus">Tambah domain</Button>
                            </div>

                            <div className="link-list">
                                {DOMAINS.map((d) => (
                                    <div
                                        key={d.host}
                                        className="link-row"
                                        style={{ cursor: 'default', gridTemplateColumns: '38px 1fr auto' }}
                                    >
                                        <span className="fav">
                                            <Icon name="globe" size={17} />
                                        </span>
                                        <div className="link-main">
                                            <div className="link-short">
                                                {d.host}
                                                {d.primary && (
                                                    <span className="snip-badge solid">
                                                        <span className="dot" />
                                                        Utama
                                                    </span>
                                                )}
                                                {d.status === 'verified' ? (
                                                    <span className="snip-badge active">
                                                        <Icon name="check" size={11} />
                                                        Terverifikasi
                                                    </span>
                                                ) : (
                                                    <span className="snip-badge warn">
                                                        <Icon name="clock" size={11} />
                                                        Menunggu DNS
                                                    </span>
                                                )}
                                            </div>
                                            <div className="link-dest" style={{ fontSize: 13 }}>
                                                {d.links} link aktif memakai domain ini
                                            </div>
                                        </div>
                                        <div className="row-actions" style={{ opacity: 1 }}>
                                            {!d.primary && d.status === 'verified' && (
                                                <Button variant="ghost" size="sm">Jadikan utama</Button>
                                            )}
                                            <IconButton icon="dots" title="Opsi" />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="snip-card snip-card-pad stack gap-14">
                                <div className="row gap-8 center">
                                    <Icon name="settings" size={16} />
                                    <h3 className="section-title" style={{ fontSize: 15 }}>
                                        Verifikasi{' '}
                                        <span className="mono" style={{ fontWeight: 500 }}>links.aurora.id</span>
                                    </h3>
                                </div>
                                <p className="hint">
                                    Tambahkan record berikut di penyedia DNS-mu, lalu klik verifikasi.
                                </p>
                                <div className="dns-table">
                                    <div className="dns-row dns-head">
                                        <span>Tipe</span>
                                        <span>Host</span>
                                        <span>Nilai</span>
                                        <span />
                                    </div>
                                    <div className="dns-row">
                                        <span className="mono">CNAME</span>
                                        <span className="mono">links</span>
                                        <span className="mono dim">cname.loncatan.com</span>
                                        <IconButton
                                            icon="copy"
                                            title="Salin"
                                            onClick={() => copy('cname.loncatan.com')}
                                        />
                                    </div>
                                    <div className="dns-row">
                                        <span className="mono">TXT</span>
                                        <span className="mono">_loncatan</span>
                                        <span className="mono dim">loncatan-verify=8x2k…a91</span>
                                        <IconButton
                                            icon="copy"
                                            title="Salin"
                                            onClick={() => copy('loncatan-verify=8x2ka91')}
                                        />
                                    </div>
                                </div>
                                <div className="row gap-10">
                                    <Button variant="primary" size="sm" icon="check">
                                        Verifikasi sekarang
                                    </Button>
                                    <Button variant="ghost" size="sm">Lewati</Button>
                                </div>
                            </div>
                        </>
                    )}

                    {tab === 'profile' && (
                        <div className="snip-card snip-card-pad stack gap-20">
                            <h2 className="section-title">Profil</h2>
                            <div className="row gap-16 center">
                                <span
                                    className="avatar"
                                    style={{ width: 56, height: 56, fontSize: 20, borderRadius: 16 }}
                                >
                                    {initials}
                                </span>
                                <Button variant="ghost" size="sm" icon="edit">Ganti foto</Button>
                            </div>
                            <div className="grid-2">
                                <div className="field">
                                    <label className="label">Nama tampilan</label>
                                    <input className="input" defaultValue={auth.user.name} />
                                </div>
                                <div className="field">
                                    <label className="label">Email</label>
                                    <input
                                        className="input"
                                        type="email"
                                        defaultValue={auth.user.email}
                                    />
                                </div>
                            </div>
                            <div className="row gap-10">
                                <Button variant="primary" size="sm">Simpan perubahan</Button>
                            </div>
                        </div>
                    )}

                    {tab === 'defaults' && (
                        <div className="snip-card">
                            {DEFAULT_ROWS.map(([key, icon, title, desc], i) => (
                                <div key={key}>
                                    {i > 0 && <hr className="divider" />}
                                    <div className="opt-row">
                                        <div className="opt-info">
                                            <div className="opt-t">
                                                <Icon name={icon} size={16} />
                                                {title}
                                            </div>
                                            <div className="opt-d">{desc}</div>
                                        </div>
                                        <Switch
                                            on={defaults[key]}
                                            onChange={(v) => setDefaults({ ...defaults, [key]: v })}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {tab === 'plan' && (
                        <>
                            <div className="snip-card snip-card-pad plan-hero">
                                <div>
                                    <span className="snip-badge solid">
                                        <Icon name="zap" size={11} />
                                        Paket Pro
                                    </span>
                                    <div
                                        style={{
                                            fontSize: 26,
                                            fontWeight: 600,
                                            letterSpacing: '-.03em',
                                            marginTop: 12,
                                        }}
                                    >
                                        Rp149.000
                                        <span className="dim" style={{ fontSize: 15, fontWeight: 400 }}>
                                            {' '}/ bulan
                                        </span>
                                    </div>
                                    <p className="page-sub" style={{ marginTop: 6 }}>
                                        Tagihan berikutnya 1 Juli 2026 · diperbarui otomatis.
                                    </p>
                                </div>
                                <div className="row gap-10">
                                    <Button variant="ghost" size="sm">Kelola tagihan</Button>
                                    <Button variant="ghost" size="sm">Ganti paket</Button>
                                </div>
                            </div>

                            <div className="grid-3">
                                {(
                                    [
                                        ['Link', 'Tak terbatas'],
                                        ['Domain ber-brand', '5 domain'],
                                        ['Riwayat analitik', '2 tahun'],
                                    ] as [string, string][]
                                ).map(([k, v]) => (
                                    <div className="snip-card stat-card" key={k}>
                                        <span className="stat-label">{k}</span>
                                        <div style={{ fontSize: 18, fontWeight: 600, marginTop: 8 }}>{v}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="snip-card snip-card-pad stack gap-12">
                                <h3 className="section-title" style={{ fontSize: 15 }}>Kunci API</h3>
                                <p className="hint">
                                    Gunakan untuk membuat link lewat API. Jaga kerahasiaannya.
                                </p>
                                <div className="input-group">
                                    <span className="prefix">
                                        <Icon name="lock" size={14} />
                                    </span>
                                    <input className="mono" readOnly value="sk_live_a91f…7c2e" />
                                    <button
                                        type="button"
                                        className="btn btn-quiet btn-sm"
                                        style={{ marginRight: 4, borderRadius: 6 }}
                                        onClick={() => copy('sk_live_a91f7c2e')}
                                    >
                                        Salin
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
