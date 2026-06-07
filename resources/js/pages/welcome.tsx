import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/snip/button';
import { Icon } from '@/components/snip/icon';
import { IconButton } from '@/components/snip/icon-button';
import { QR } from '@/components/snip/qr';
import { Sparkline } from '@/components/snip/sparkline';
import { SnipLogo } from '@/components/snip-logo';
import { useClipboard } from '@/hooks/use-clipboard';
import { fmt, SNIP_LINKS } from '@/lib/snip-data';
import shortUrls from '@/routes/short-urls';

const features = [
    { icon: 'edit' as const, t: 'Custom slug', d: 'Ganti kode acak jadi kata yang kamu mau — loncatan.com/spring-drop.' },
    { icon: 'qr' as const, t: 'QR code instan', d: 'Setiap link punya QR siap-cetak untuk kemasan, poster, atau layar.' },
    { icon: 'chart' as const, t: 'Analitik klik', d: 'Lihat klik per hari, negara, perangkat, dan sumber trafik.' },
    { icon: 'clock' as const, t: 'Tanggal kedaluwarsa', d: 'Set link mati otomatis setelah kampanye selesai.' },
];

export default function Welcome() {
    const { props } = usePage();
    const [, copy] = useClipboard();
    const { data, setData, post, processing, errors } = useForm({ original_url: '' });

    const goToDashboard = () => router.visit('/login');

    const shorten = () => {
        if (!data.original_url.trim()) {
            return;
        }

        post(shortUrls.store.url(), { preserveScroll: true, preserveState: true });
    };

    const shortUrl = props.flash.shortUrl;
    const result = shortUrl
        ? { slug: shortUrl.split('/').pop() ?? '', dest: data.original_url }
        : null;

    return (
        <>
            <Head title="Loncatan — Pendek, rapi, terlacak." />
            <div className="landing">

                {/* NAV */}
                <header className="lp-nav">
                    <SnipLogo size="md" />
                    <nav className="lp-links hide-sm">
                        <a href="#fitur">Fitur</a>
                        <a href="#cara">Cara kerja</a>
                        <a href="#harga">Harga</a>
                    </nav>
                    <div className="row gap-8">
                        <Button variant="quiet" size="sm" onClick={goToDashboard} className="hide-sm">
                            Masuk
                        </Button>
                        <Button variant="primary" size="sm" icon="arrowRight" onClick={goToDashboard}>
                            Buka dashboard
                        </Button>
                    </div>
                </header>

                {/* HERO */}
                <section className="lp-hero">
                    <div className="lp-hero-inner stagger">
                        <span className="badge">
                            <span className="dot" />
                            Pemendek URL untuk kreator
                        </span>
                        <h1 className="lp-title">
                            Satu link untuk<br />semua yang kamu bagikan.
                        </h1>
                        <p className="lp-lede">
                            Pendekkan tautan apa pun, percantik dengan nama sendiri, tempel QR-nya,
                            lalu lacak setiap klik — dalam satu tempat yang rapi.
                        </p>

                        <div className="lp-shorten">
                            <div className="shorten-bar">
                                <Icon name="link" className="lead" />
                                <input
                                    placeholder="Tempel tautan panjang di sini…"
                                    value={data.original_url}
                                    onChange={(e) => setData('original_url', e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && shorten()}
                                    disabled={processing}
                                />
                                {errors.original_url && (
                                    <span style={{ color: 'var(--color-red-500)', fontSize: 12 }}>
                                        {errors.original_url}
                                    </span>
                                )}
                                <Button variant="primary" icon="scissors" onClick={shorten} disabled={processing}>
                                    {processing ? 'Memproses…' : 'Pendekkan'}
                                </Button>
                            </div>
                            <p className="hint" style={{ textAlign: 'center', marginTop: 10 }}>
                                Gratis untuk 50 link pertama · tanpa kartu kredit
                            </p>
                        </div>

                        {result && (
                            <div className="lp-result rise">
                                <div className="lp-result-main">
                                    <div className="eyebrow">Link pendekmu siap</div>
                                    <div className="chip-link" style={{ fontSize: 18, marginTop: 8 }}>
                                        <span className="dom">loncatan.com/</span>
                                        <b style={{ fontWeight: 600 }}>{result.slug}</b>
                                    </div>
                                    <div className="link-dest" style={{ marginTop: 8, maxWidth: 360 }}>
                                        <Icon name="arrowRight" size={12} />
                                        {result.dest}
                                    </div>
                                </div>
                                <div className="row gap-8">
                                    <IconButton
                                        icon="copy"
                                        size="md"
                                        variant="ghost"
                                        title="Salin"
                                        onClick={() => copy('loncatan.com/' + result.slug)}
                                    />
                                    <QR seed={result.slug.length * 7} size={64} cells={17} />
                                    <Button variant="ghost" size="sm" iconRight="chevRight" onClick={goToDashboard}>
                                        Dashboard
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* product peek */}
                    <div className="lp-peek fade">
                        <div className="peek-card">
                            <div className="peek-bar">
                                <span className="peek-dot" />
                                <span className="peek-dot" />
                                <span className="peek-dot" />
                                <div className="peek-url mono">app.loncatan.com/dashboard</div>
                            </div>
                            <div className="peek-body">
                                {SNIP_LINKS.slice(0, 4).map((l) => (
                                    <div className="peek-row" key={l.id}>
                                        <span className="fav" style={{ width: 30, height: 30, fontSize: 13 }}>
                                            {l.fav}
                                        </span>
                                        <div className="flex-1" style={{ minWidth: 0 }}>
                                            <div className="mono" style={{ fontSize: 13 }}>
                                                <span className="dim">loncatan.com/</span>
                                                {l.slug}
                                            </div>
                                            <div
                                                className="dim"
                                                style={{
                                                    fontSize: 11.5,
                                                    marginTop: 2,
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                }}
                                            >
                                                {l.title}
                                            </div>
                                        </div>
                                        <Sparkline data={l.daily.slice(-14)} height={28} />
                                        <div
                                            className="font-display"
                                            style={{ fontWeight: 600, fontSize: 15, minWidth: 52, textAlign: 'right' }}
                                        >
                                            {fmt(l.clicks)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* STAT STRIP */}
                <section className="lp-strip">
                    {[
                        ['2,4Jt+', 'link dipendekkan'],
                        ['180+', 'negara terlacak'],
                        ['99,98%', 'uptime redirect'],
                        ['48ms', 'rata-rata redirect'],
                    ].map(([n, l]) => (
                        <div className="lp-stat" key={l}>
                            <div className="font-display lp-stat-n">{n}</div>
                            <div className="dim" style={{ fontSize: 12.5 }}>
                                {l}
                            </div>
                        </div>
                    ))}
                </section>

                {/* FEATURES */}
                <section className="lp-section" id="fitur">
                    <div className="lp-section-head">
                        <span className="eyebrow">Semua yang kamu butuh</span>
                        <h2 className="lp-h2">
                            Kecil di tautan,<br />besar di kontrol.
                        </h2>
                    </div>
                    <div className="lp-feature-grid">
                        {features.map((f) => (
                            <div className="lp-feature" key={f.t}>
                                <span className="lp-feat-ic">
                                    <Icon name={f.icon} size={20} />
                                </span>
                                <h3>{f.t}</h3>
                                <p className="muted">{f.d}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <section className="lp-cta" id="harga">
                    <h2 className="lp-h2">
                        Mulai pendekkan hari ini.
                    </h2>
                    <p style={{ opacity: 0.6, maxWidth: 420, margin: '12px auto 0', fontSize: 15 }}>
                        Gratis selamanya untuk 50 link. Upgrade kapan saja untuk domain & analitik penuh.
                    </p>
                    <div className="row gap-10" style={{ justifyContent: 'center', marginTop: 26 }}>
                        <Button variant="primary" size="lg" onClick={goToDashboard}>
                            Buat akun gratis
                        </Button>
                        <Button variant="ghost" size="lg" onClick={goToDashboard}>
                            Lihat demo
                        </Button>
                    </div>
                </section>

                <footer className="lp-foot">
                    <SnipLogo size="md" />
                    <span className="dim" style={{ fontSize: 12.5 }}>
                        © 2026 Loncatan — prototipe desain
                    </span>
                </footer>
            </div>
        </>
    );
}
