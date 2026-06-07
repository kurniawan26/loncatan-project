import { Head, Link, useForm } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';
import * as shortUrls from '@/routes/short-urls';

type FormFields = {
    original_url: string;
    short_code: string;
    expires_at: string;
}

export default function LinksCreate() {
    const { data, setData, post, processing, errors } = useForm<FormFields>({
        original_url: '',
        short_code: '',
        expires_at: '',
    })

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(shortUrls.store.url())
    }
    return (
        <>
            <Head title="Buat link" />


            <form onSubmit={submit}>
                <div className="page-head">
                    <div className="ph-text">
                        <Link href={shortUrls.index.url()} className="btn btn-quiet btn-sm" style={{ marginBottom: 12 }}>
                            <ChevronLeft size={14} />
                            Kembali
                        </Link>
                        <h1 className="page-title">Buat link baru</h1>
                        <p className="page-sub">Buat tautan pendek yang mudah dibagikan</p>
                    </div>
                </div>

                <div className="create-grid stagger">
                    {/* main form */}
                    <div className="snip-card snip-card-pad">
                        <div className="section-title" style={{ marginBottom: 20 }}>
                            Informasi tautan
                        </div>

                        <div className="stack gap-16">
                            <div className="field">
                                <label className="label">URL tujuan</label>
                                <input
                                    className="input"
                                    value={data.original_url}
                                    onChange={(e) => setData('original_url', e.target.value)}
                                    placeholder="https://contoh.com/halaman-panjang"
                                />
                                {errors.original_url && (
                                    <span className="hint" style={{ color: 'red' }}>
                                        {errors.original_url}
                                    </span>
                                )}
                            </div>

                            <div className="field">
                                <label className="label">
                                    Kode pendek <span className="opt">Opsional</span>
                                </label>
                                <div className="input-group">
                                    <span className="prefix">loncatan.com/</span>
                                    <input
                                        className="mono"
                                        value={data.short_code}
                                        onChange={(e) => setData('short_code', e.target.value)}
                                        placeholder="kode-saya"
                                    />
                                    {errors.short_code && (
                                        <span className="hint" style={{ color: 'red' }}>
                                            {errors.short_code}
                                        </span>
                                    )}
                                </div>
                                <span className="hint">Biarkan kosong untuk generate otomatis</span>
                            </div>
                        </div>

                        <div className="divider" style={{ margin: '24px 0' }} />

                        <div className="row gap-10">
                            <Link href={shortUrls.index.url()} className="btn btn-ghost">
                                Batal
                            </Link>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={processing}
                            >
                                {processing ? 'Menyimpan…' : 'Buat tautan'}
                            </button>
                        </div>
                    </div>

                    {/* aside options */}
                    <div className="create-aside snip-card">
                        <div className="snip-card-pad" style={{ borderBottom: '1px solid var(--line)' }}>
                            <div className="section-title">Opsi lanjutan</div>
                        </div>

                        <div className="opt-row">
                            <div className="opt-info">
                                <div className="opt-t">Tanggal kedaluwarsa</div>
                                <div className="opt-d">Link nonaktif otomatis setelah tanggal ini</div>
                            </div>
                            <input
                                className="input"
                                type="datetime-local"
                                value={data.expires_at}
                                onChange={(e) => setData('expires_at', e.target.value)}
                            />
                            {errors.expires_at && (
                                <span className="hint" style={{ color: 'red' }}>
                                    {errors.expires_at}
                                </span>
                            )}
                        </div>


                        <div className="opt-extra">
                            <div className="eyebrow" style={{ marginBottom: 10 }}>
                                Pratinjau
                            </div>
                            <div className="prev-link">
                                <span className="chip-link">
                                    <span className="dom">loncatan.com</span>
                                    <span className="slash">/</span>
                                    <span className="mono">—</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </>
    );
}
