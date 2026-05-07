# Panduan Membangun URL Shortener (like bit.ly)

Ikuti langkah-langkah di bawah ini secara berurutan. Setiap langkah memiliki perintah yang perlu kamu jalankan dan kode yang perlu kamu tulis.

---

## Fase 1 — Database & Models

### Langkah 1.1 — Buat Model & Migration untuk `ShortUrl`

Jalankan perintah ini di terminal:

```bash
php artisan make:model ShortUrl -mf --no-interaction
```

Flag yang dipakai:
- `-m` → sekaligus buat file migration
- `-f` → sekaligus buat file factory (untuk testing nanti)

Setelah itu, buka file migration yang baru dibuat di `database/migrations/..._create_short_urls_table.php` dan isi kolom-kolomnya:

```php
Schema::create('short_urls', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
    $table->text('original_url');
    $table->string('short_code', 16)->unique();
    $table->boolean('is_custom_code')->default(false);
    $table->unsignedBigInteger('clicks_count')->default(0);
    $table->boolean('is_active')->default(true);
    $table->timestamp('expires_at')->nullable();
    $table->timestamps();
});
```

Kemudian buka `app/Models/ShortUrl.php` dan lengkapi modelnya:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ShortUrl extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'original_url',
        'short_code',
        'is_custom_code',
        'clicks_count',
        'is_active',
        'expires_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_custom_code' => 'boolean',
        'expires_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function visits(): HasMany
    {
        return $this->hasMany(ShortUrlVisit::class);
    }

    public function scopeActive(Builder $query): void
    {
        $query->where('is_active', true)
              ->where(fn ($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()));
    }

    public function isExpired(): bool
    {
        return $this->expires_at !== null && $this->expires_at->isPast();
    }

    // Accessor: shortUrl lengkap dengan domain
    public function getShortUrlAttribute(): string
    {
        return url($this->short_code);
    }
}
```

---

### Langkah 1.2 — Buat Model & Migration untuk `ShortUrlVisit`

```bash
php artisan make:model ShortUrlVisit -m --no-interaction
```

Isi migration `..._create_short_url_visits_table.php`:

```php
Schema::create('short_url_visits', function (Blueprint $table) {
    $table->id();
    $table->foreignId('short_url_id')->constrained()->cascadeOnDelete();
    $table->string('ip_address', 45)->nullable();
    $table->text('user_agent')->nullable();
    $table->string('referer', 500)->nullable();
    $table->timestamp('created_at')->useCurrent(); // tidak butuh updated_at
});
```

Isi `app/Models/ShortUrlVisit.php`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShortUrlVisit extends Model
{
    const UPDATED_AT = null; // tabel ini tidak punya kolom updated_at

    protected $fillable = [
        'short_url_id',
        'ip_address',
        'user_agent',
        'referer',
    ];

    public function shortUrl(): BelongsTo
    {
        return $this->belongsTo(ShortUrl::class);
    }
}
```

---

### Langkah 1.3 — Update Model `User`

Buka `app/Models/User.php` dan tambahkan relationship ini:

```php
use Illuminate\Database\Eloquent\Relations\HasMany;

public function shortUrls(): HasMany
{
    return $this->hasMany(ShortUrl::class);
}
```

---

### Langkah 1.4 — Jalankan Migration

```bash
php artisan migrate
```

Cek apakah tabel sudah terbuat:

```bash
php artisan db:table short_urls
php artisan db:table short_url_visits
```

---

## Fase 2 — Backend Logic

### Langkah 2.1 — Short Code Generator

Buat helper class untuk generate kode acak:

```bash
php artisan make:class Support/ShortCodeGenerator --no-interaction
```

Isi `app/Support/ShortCodeGenerator.php`:

```php
<?php

namespace App\Support;

use App\Models\ShortUrl;
use Illuminate\Support\Str;

class ShortCodeGenerator
{
    public static function generate(int $length = 6): string
    {
        do {
            $code = Str::lower(Str::random($length));
        } while (ShortUrl::where('short_code', $code)->exists());

        return $code;
    }
}
```

---

### Langkah 2.2 — Form Requests

```bash
php artisan make:request StoreShortUrlRequest --no-interaction
php artisan make:request UpdateShortUrlRequest --no-interaction
```

Isi `app/Http/Requests/StoreShortUrlRequest.php`:

```php
public function authorize(): bool
{
    return true; // boleh siapa saja (guest + auth)
}

public function rules(): array
{
    return [
        'original_url' => ['required', 'url', 'max:2048'],
        'short_code'   => ['nullable', 'alpha_dash', 'min:3', 'max:16', 'unique:short_urls,short_code'],
        'expires_at'   => ['nullable', 'date', 'after:now'],
    ];
}
```

Isi `app/Http/Requests/UpdateShortUrlRequest.php`:

```php
public function authorize(): bool
{
    return true;
}

public function rules(): array
{
    $shortUrl = $this->route('shortUrl');

    return [
        'original_url' => ['nullable', 'url', 'max:2048'],
        'short_code'   => ['nullable', 'alpha_dash', 'min:3', 'max:16', "unique:short_urls,short_code,{$shortUrl->id}"],
        'expires_at'   => ['nullable', 'date', 'after:now'],
        'is_active'    => ['nullable', 'boolean'],
    ];
}
```

---

### Langkah 2.3 — Policy

```bash
php artisan make:policy ShortUrlPolicy --model=ShortUrl --no-interaction
```

Buka `app/Policies/ShortUrlPolicy.php` dan pastikan method `update` dan `delete` seperti ini:

```php
public function update(User $user, ShortUrl $shortUrl): bool
{
    return $user->id === $shortUrl->user_id;
}

public function delete(User $user, ShortUrl $shortUrl): bool
{
    return $user->id === $shortUrl->user_id;
}
```

---

### Langkah 2.4 — Rate Limiter

Buka `app/Providers/AppServiceProvider.php`, tambahkan di method `boot()`:

```php
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

RateLimiter::for('create-link', function (Request $request) {
    return $request->user()
        ? Limit::perHour(50)->by($request->user()->id)
        : Limit::perHour(5)->by($request->ip());
});
```

---

### Langkah 2.5 — Controllers

```bash
php artisan make:controller RedirectController --invokable --no-interaction
php artisan make:controller ShortUrlController --no-interaction
```

Isi `app/Http/Controllers/RedirectController.php`:

```php
<?php

namespace App\Http\Controllers;

use App\Models\ShortUrl;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;

class RedirectController extends Controller
{
    public function __invoke(Request $request, string $code): RedirectResponse
    {
        $shortUrl = ShortUrl::active()->where('short_code', $code)->firstOrFail();

        // Catat kunjungan
        $shortUrl->visits()->create([
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'referer'    => $request->headers->get('referer'),
        ]);

        // Tambah counter (atomic untuk menghindari race condition)
        $shortUrl->increment('clicks_count');

        return redirect()->away($shortUrl->original_url, 301);
    }
}
```

Isi `app/Http/Controllers/ShortUrlController.php`:

```php
<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreShortUrlRequest;
use App\Http\Requests\UpdateShortUrlRequest;
use App\Models\ShortUrl;
use App\Support\ShortCodeGenerator;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ShortUrlController extends Controller
{
    public function index(): Response
    {
        $links = auth()->user()
            ->shortUrls()
            ->latest()
            ->paginate(20);

        return Inertia::render('links/index', [
            'links' => $links,
        ]);
    }

    public function store(StoreShortUrlRequest $request): RedirectResponse
    {
        $isGuest = ! auth()->check();

        $shortUrl = ShortUrl::create([
            'user_id'        => auth()->id(),
            'original_url'   => $request->original_url,
            'short_code'     => $request->short_code ?? ShortCodeGenerator::generate(),
            'is_custom_code' => $request->filled('short_code'),
            // Guest: otomatis expire 30 hari. Auth: pakai input user (boleh null)
            'expires_at'     => $isGuest ? now()->addDays(30) : $request->expires_at,
        ]);

        return $isGuest
            ? back()->with('flash', ['shortUrl' => $shortUrl->short_url])
            : redirect()->route('short-urls.index')->with('success', 'Link berhasil dibuat!');
    }

    public function update(UpdateShortUrlRequest $request, ShortUrl $shortUrl): RedirectResponse
    {
        $this->authorize('update', $shortUrl);

        $shortUrl->update($request->only(['original_url', 'short_code', 'expires_at', 'is_active']));

        return back()->with('success', 'Link berhasil diperbarui!');
    }

    public function destroy(ShortUrl $shortUrl): RedirectResponse
    {
        $this->authorize('delete', $shortUrl);

        $shortUrl->delete();

        return back()->with('success', 'Link berhasil dihapus!');
    }
}
```

---

## Fase 3 — Routes

Buka `routes/web.php` dan tambahkan di bawah route yang sudah ada:

```php
use App\Http\Controllers\RedirectController;
use App\Http\Controllers\ShortUrlController;

// Public: buat short link (dengan rate limiter)
Route::post('/links', [ShortUrlController::class, 'store'])
    ->middleware('throttle:create-link')
    ->name('short-urls.store');

// Auth: kelola short link
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/links', [ShortUrlController::class, 'index'])->name('short-urls.index');
    Route::patch('/links/{shortUrl}', [ShortUrlController::class, 'update'])->name('short-urls.update');
    Route::delete('/links/{shortUrl}', [ShortUrlController::class, 'destroy'])->name('short-urls.destroy');
});

// ⚠️ HARUS PALING BAWAH agar tidak bentrok dengan route lain
Route::get('/{code}', RedirectController::class)
    ->where('code', '[a-zA-Z0-9_-]+')
    ->name('short-url.redirect');
```

Verifikasi routes sudah terdaftar:

```bash
php artisan route:list --except-vendor
```

---

## Fase 4 — Frontend

### Langkah 4.1 — TypeScript Types

Buka `resources/js/types/index.ts` dan tambahkan interface `ShortUrl`:

```ts
export interface ShortUrl {
    id: number;
    original_url: string;
    short_code: string;
    short_url: string;
    is_custom_code: boolean;
    clicks_count: number;
    is_active: boolean;
    expires_at: string | null;
    created_at: string;
}
```

---

### Langkah 4.2 — Halaman Manajemen Link

Buat file baru: `resources/js/pages/links/index.tsx`

Referensi struktur dari halaman lain seperti `resources/js/pages/settings/profile.tsx` untuk pola layout dan form.

Komponen yang bisa kamu pakai (sudah tersedia):
- `Card, CardContent, CardHeader` dari `@/components/ui/card`
- `Button` dari `@/components/ui/button`
- `Input` dari `@/components/ui/input`
- `Badge` dari `@/components/ui/badge`
- `Dialog, DialogContent, DialogHeader` dari `@/components/ui/dialog`
- `useClipboard` dari `@/hooks/use-clipboard`
- `useForm` dari `@inertiajs/react`

Struktur halaman yang perlu dibangun:

```
/links
├── Form buat link baru
│   ├── Input: URL asli (wajib)
│   ├── Input: custom code (opsional)
│   ├── Input: tanggal expire (opsional, type="date")
│   └── Button: "Persingkat URL"
│
└── Daftar link user
    └── Per baris:
        ├── Short URL + tombol Copy
        ├── URL asli (dipotong jika panjang)
        ├── Badge: jumlah klik
        ├── Badge: status (Aktif / Kadaluarsa / Nonaktif)
        ├── Tanggal expire (atau "Tidak ada")
        └── Tombol: Edit (buka Dialog), Hapus (konfirmasi)
```

Contoh pola form dengan Inertia (lihat `resources/js/pages/auth/login.tsx` sebagai referensi):

```tsx
import { useForm } from '@inertiajs/react';

const form = useForm({
    original_url: '',
    short_code: '',
    expires_at: '',
});

const submit = (e: React.FormEvent) => {
    e.preventDefault();
    form.post(route('short-urls.store'));
};
```

---

### Langkah 4.3 — Quick Form di Welcome Page

Buka `resources/js/pages/welcome.tsx` dan tambahkan form singkat di bagian atas halaman:

```tsx
const form = useForm({ original_url: '' });

// Tampilkan form di atas hero section
<form onSubmit={(e) => { e.preventDefault(); form.post(route('short-urls.store')); }}>
    <Input type="url" name="original_url" placeholder="https://contoh.com/url-panjang" />
    <Button type="submit" disabled={form.processing}>Persingkat</Button>
</form>
```

Setelah selesai menulis frontend, jalankan:

```bash
npm run build
# atau jika dev server sedang berjalan, cukup simpan file
```

---

## Fase 5 — Tests

### Langkah 5.1 — Buat File Test

```bash
php artisan make:test --pest ShortUrlTest --no-interaction
```

Buka `tests/Feature/ShortUrlTest.php` dan tulis test cases:

```php
<?php

use App\Models\ShortUrl;
use App\Models\User;

it('guest dapat membuat short link', function () {
    $response = $this->post(route('short-urls.store'), [
        'original_url' => 'https://example.com/very-long-url',
    ]);

    $response->assertRedirect();
    expect(ShortUrl::count())->toBe(1);
    expect(ShortUrl::first()->user_id)->toBeNull();
});

it('short link guest otomatis expire 30 hari', function () {
    $this->post(route('short-urls.store'), [
        'original_url' => 'https://example.com',
    ]);

    $link = ShortUrl::first();
    expect($link->expires_at)->not->toBeNull();
    expect($link->expires_at->diffInDays(now()))->toBeLessThanOrEqual(30);
});

it('user login dapat membuat short link dengan custom code', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->post(route('short-urls.store'), [
        'original_url' => 'https://example.com',
        'short_code'   => 'mycustom',
    ]);

    expect(ShortUrl::where('short_code', 'mycustom')->exists())->toBeTrue();
});

it('redirect ke URL asli dan catat kunjungan', function () {
    $link = ShortUrl::factory()->create([
        'original_url' => 'https://example.com',
        'short_code'   => 'abc123',
    ]);

    $response = $this->get("/{$link->short_code}");

    $response->assertRedirect('https://example.com');
    expect($link->refresh()->clicks_count)->toBe(1);
    expect($link->visits()->count())->toBe(1);
});

it('short link yang tidak ada mengembalikan 404', function () {
    $this->get('/tidakada')->assertNotFound();
});

it('short link expired mengembalikan 404', function () {
    $link = ShortUrl::factory()->create([
        'short_code' => 'expired',
        'expires_at' => now()->subDay(),
    ]);

    $this->get("/{$link->short_code}")->assertNotFound();
});

it('user tidak bisa hapus link milik orang lain', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $link = ShortUrl::factory()->for($owner)->create();

    $this->actingAs($other)
         ->delete(route('short-urls.destroy', $link))
         ->assertForbidden();
});
```

---

### Langkah 5.2 — Setup Factory (opsional tapi dianjurkan)

Buka `database/factories/ShortUrlFactory.php` dan isi:

```php
public function definition(): array
{
    return [
        'user_id'        => null,
        'original_url'   => fake()->url(),
        'short_code'     => fake()->unique()->lexify('??????'),
        'is_custom_code' => false,
        'clicks_count'   => 0,
        'is_active'      => true,
        'expires_at'     => null,
    ];
}
```

---

### Langkah 5.3 — Jalankan Tests

```bash
php artisan test --compact --filter=ShortUrl
```

Semua test harus hijau ✓ sebelum lanjut.

---

## Checklist Akhir

- [ ] `php artisan migrate` berhasil tanpa error
- [ ] `php artisan route:list` menampilkan semua route shortener
- [ ] `php artisan test --compact --filter=ShortUrl` semua hijau
- [ ] Kunjungi `/links` → halaman muncul (butuh login)
- [ ] Buat short link → muncul di daftar
- [ ] Copy short link → kunjungi di browser → redirect ke URL asli
- [ ] Kunjungi short link yang expired → halaman 404
- [ ] Coba buat 6 link berturut-turut sebagai guest → rate limit error

---

## Tips Belajar

- Setiap langkah, baca kode yang kamu tulis dan pastikan kamu paham **kenapa** setiap baris ada di sana
- Jika ada error, baca pesan errornya dengan seksama — Laravel biasanya memberi pesan yang sangat jelas
- Gunakan `php artisan tinker` untuk coba-coba kode PHP secara interaktif
- Gunakan `php artisan pail` untuk melihat log aplikasi secara real-time
- Tanya jika ada bagian yang kurang dimengerti!
