import { Head, Link, router } from '@inertiajs/react';
import { type SyntheticEvent, useState } from 'react';
import { Icon } from '@/components/snip/icon';
import { SnipLogo } from '@/components/snip-logo';
import { useAppearance } from '@/hooks/use-appearance';

const messages: Record<number, { title: string; lede: string }> = {
    403: {
        title: 'Akses ditolak.',
        lede: 'Kamu tidak punya izin untuk membuka halaman ini.',
    },
    404: {
        title: 'Tautan ini terputus.',
        lede: 'Kamu mungkin salah ketik, atau tautan ini sudah dihapus / kedaluwarsa.',
    },
    500: {
        title: 'Ada yang salah di server.',
        lede: 'Terjadi kesalahan internal. Coba lagi beberapa saat.',
    },
    503: {
        title: 'Layanan sedang tidak tersedia.',
        lede: 'Sedang dalam pemeliharaan. Coba lagi dalam beberapa menit.',
    },
};

export default function Error({ status }: { status: number }) {
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const [query, setQuery] = useState('');

    const msg = messages[status] ?? {
        title: 'Terjadi kesalahan.',
        lede: 'Sesuatu yang tidak diharapkan terjadi.',
    };

    const handleSearch = (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (query.trim()) {
            router.visit(`/links?q=${encodeURIComponent(query.trim())}`);
        }
    };

    const toggleTheme = () => updateAppearance(resolvedAppearance === 'dark' ? 'light' : 'dark');

    return (
        <>
            <Head title={`${status} – Loncatan`} />
            <div className="err-wrap">
                <nav className="err-nav">
                    <Link href="/">
                        <SnipLogo />
                    </Link>
                    <span className="spacer" />
                    <button className="theme-btn" onClick={toggleTheme} title="Toggle theme" type="button">
                        <Icon name={resolvedAppearance === 'dark' ? 'sun' : 'moon'} size={16} />
                    </button>
                </nav>

                <main className="err-main">
                    <div className="err-scene-box">
                        <div className="scene">
                            <div className="cut" />
                            <div className="scissors-anim">
                                <Icon name="scissors" size={26} />
                            </div>
                            <div className="snipcard">
                                <span className="codechip">{status}</span>
                                <span className="chip-bar" />
                            </div>
                        </div>

                        <p className="big404">{status}</p>
                        <h1 className="err-title">{msg.title}</h1>
                        <p className="err-lede">{msg.lede}</p>

                        <div className="err-finder">
                            <form className="err-bar" onSubmit={handleSearch}>
                                <Icon name="search" size={16} />
                                <input
                                    placeholder="Cari atau tempel link Loncatan…"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    autoComplete="off"
                                />
                            </form>
                        </div>

                        <div className="err-actions">
                            <Link href="/" className="btn btn-primary">
                                ← Kembali ke beranda
                            </Link>
                            <Link href="/links/create" className="btn btn-ghost">
                                Buat link baru
                            </Link>
                        </div>

                        <nav className="helpers">
                            <Link href="/links">
                                <Icon name="link" size={13} />
                                Semua link kamu
                            </Link>
                            <Link href="/settings">
                                <Icon name="settings" size={13} />
                                Pengaturan
                            </Link>
                            <a href="mailto:hi@loncatan.id">
                                <Icon name="external" size={13} />
                                Hubungi dukungan
                            </a>
                        </nav>
                    </div>
                </main>

                <footer className="err-foot">
                    <SnipLogo />
                    <div className="foot-links">
                        <a href="#">Kebijakan Privasi</a>
                        <a href="#">Syarat Penggunaan</a>
                        <a href="mailto:hi@loncatan.id">Kontak</a>
                    </div>
                </footer>
            </div>
        </>
    );
}
