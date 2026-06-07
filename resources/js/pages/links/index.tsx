import { Head, Link, router, usePage } from '@inertiajs/react';
import { ExternalLink, Link2, MoreHorizontal, Plus, Search, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import * as shortUrls from '@/routes/short-urls';
import { Paginator, ShortUrl } from '@/types';

type props = {
    links: Paginator<ShortUrl>;
}

export default function LinksIndex({ links }: props) {
    const { flash } = usePage().props;


    function deleteLink(link: ShortUrl) {
        if (!confirm(`Hapus loncatan.com/${link.short_code}?`)) return;

        router.delete(shortUrls.destroy.url(link.id));
    }

    function toggleActive(link: ShortUrl) {
        router.put(shortUrls.update.url(link.id), {
            is_active: !link.is_active,
        }, {
            preserveScroll: true,   // tidak scroll ke atas setelah update
        });
    }
    return (
        <>
            <Head title="Tautan" />

            {flash?.success && (
                <div className="copy-flash show">{flash.success}</div>
            )}


            <div className="page-head stagger">
                <div className="ph-text">
                    <h1 className="page-title">Tautan</h1>
                    <p className="page-sub">
                        {links.total} tautan tersimpan
                    </p>
                </div>
                <div className="page-actions">
                    <Link href={shortUrls.create.url()} className="btn btn-primary">
                        <Plus size={16} />
                        Link baru
                    </Link>
                </div>
            </div>

            {/* toolbar */}
            <div className="toolbar">
                <div className="segment">
                    <button className="active">Semua</button>
                    <button>Aktif</button>
                    <button>Kedaluwarsa</button>
                </div>
                <div className="spacer" />
                <div className="search-mini" style={{ width: 200 }}>
                    <Search size={15} />
                    <input placeholder="Cari…" />
                </div>
            </div>

            {links.data.length === 0 ? (
                <div className="empty">
                    <Link2 size={36} style={{ opacity: 0.2 }} />
                    <div>
                        <p style={{ fontWeight: 600 }}>Belum ada tautan</p>
                        <p className="dim" style={{ fontSize: 14, marginTop: 4 }}>
                            Mulai dengan membuat link pendek pertama Anda
                        </p>
                    </div>
                    <Link href={shortUrls.create.url()} className="btn btn-primary">
                        <Plus size={16} />
                        Buat link pertama
                    </Link>
                </div>
            ) : (
                <div className="link-list stagger">
                    {links.data.map((link) => (
                        <div key={link.id} className="link-row">
                            <div className="fav">
                                {link.short_code[0].toUpperCase()}
                            </div>
                            <div className="link-main">
                                <div className="link-short">
                                    <span className="dom">loncatan.com</span>
                                    <span>/</span>
                                    <span>{link.short_code}</span>
                                </div>
                                <div className="link-dest">
                                    <ExternalLink size={12} />
                                    {link.original_url}
                                </div>
                            </div>
                            <div className="link-meta">
                                <div className="metric">
                                    <div className="m-val">{link.clicks_count}</div>
                                    <div className="m-lab">Klik</div>
                                </div>
                                <div className="row-actions">
                                    <button className="btn btn-icon btn-quiet btn-sm">
                                        <MoreHorizontal size={16} />
                                    </button>
                                    <button
                                        className="btn btn-icon btn-quiet btn-sm"
                                        onClick={() => deleteLink(link)}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    <button
                                        className="btn btn-icon btn-quiet btn-sm"
                                        onClick={() => toggleActive(link)}
                                    >
                                        {!link.is_active ?
                                            <ToggleLeft size={16} /> :
                                            <ToggleRight size={16} />
                                        }
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}
