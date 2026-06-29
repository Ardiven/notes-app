# Notes App — Design Snapshot

Snapshot per **2026-06-29**, setelah refactor path-alias + error-state +
theme-provider, **plus redesign visual "kartu katalog"** (§5–§7).
Dokumen ini **mencerminkan target desain terbaru**; struktur project,
arsitektur context, routing, dan API contract **tidak berubah** dari
snapshot sebelumnya. Kalau ada bagian yang lebih cocok di `README.md`,
lihat situ.

---

## 1. Visi Singkat

Aplikasi catatan pribadi single-user dengan tiga kategori tampilan:

- **Autentikasi** (login / register)
- **Daftar catatan** (aktif & arsip, dengan pencarian)
- **Detail catatan** (baca + arsip/hapus)

State lokal seluruhnya di browser (token + tema di `localStorage`); data
catatan di backend Dicoding Notes API. Tidak ada offline cache, tidak ada
sinkronisasi multi-device — semua state yang "persisten" sebenarnya adalah
state server, hanya token & tema yang persisten secara lokal.

---

## 2. Tech Stack & Konvensi

| Layer        | Pilihan                                      |
| ------------ | -------------------------------------------- |
| Framework    | React 19 (function components + hooks)       |
| Build        | Vite 7                                       |
| Routing      | react-router-dom v7                           |
| State        | React Context API + custom hooks             |
| HTTP         | Fetch API native (lihat `src/utils/api.js`)   |
| Icons        | react-icons (`fi`, `md`)                      |
| Styling      | Vanilla CSS, custom properties (tema + token spacing/warna) |
| Fonts        | Inter (body, existing) + Fraunces (display, baru via Google Fonts link) + monospace sistem (meta) |
| Bundler size | ~250 KB JS / ~4 KB CSS (gzip: ~80/1.2 KB) — Fraunces nambah 1 font request, bukan bundle JS |

**Path alias** (sinkron `vite.config.js` ↔ `jsconfig.json`):

```js
@                  → src/
@components        → src/components/
@pages             → src/pages/
@contexts          → src/contexts/
@hooks             → src/hooks/
@utils             → src/utils/
```

`jsconfig.json` butuh `baseUrl: "."` + `ignoreDeprecations: "6.0"` —
jangan hapus, lihat [[notes-app-architecture]] di memory untuk konteks.

**Penamaan**: file komponen PascalCase (`NoteItem.jsx`), hook camelCase
(`useAuth.jsx`), util lowercase (`api.js`). Folder konsisten. Penamaan
`NotesContext` (jamak) berbeda dengan komponen `NoteList`/`NoteItem`
(tunggal) — karena context adalah koleksi, komponen adalah unit.

---

## 3. Arsitektur Aplikasi

### 3.1 Layer

```
┌─────────────────────────────────────────────────────────────┐
│  App.jsx                                                   │
│  ├─ <ThemeProvider>       (theme state + persistence)      │
│  ├─ <LangProvider>        (id/en state)                    │
│  └─ <NotesProvider>       (notes state + CRUD)             │
│      mounted hanya setelah user ter-autentikasi            │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
   <NoteHeader>         <Routes>            (children)
   ├─ App title         ├─ ActivePage       Notes consumers
   ├─ <NoteNav>         ├─ ArchivePage      via useNote()
   ├─ theme toggle      ├─ DetailPage
   ├─ lang toggle       └─ AddPage
   └─ logout button
```

### 3.2 State management

Empat context, masing-masing dengan provider dan custom hook tipis:

| Context          | Dipasang di       | Ekspos                                                                |
| ---------------- | ----------------- | --------------------------------------------------------------------- |
| `ThemeContext`   | Root `App.jsx`    | `theme`, `toggleTheme` (key di `localStorage`, attr di `<html>`)     |
| `LangContext`    | Root `App.jsx`    | `lang` (`'id'` default), `toggleLang`                                 |
| `AuthContext`    | Root `App.jsx`*   | `user`, `loading`, `initializing`, `onlogin`, `onlogout`, `onregister`, `authError`, `authSuccess` |
| `NotesContext`   | Setelah auth OK   | `notes`, `loading`, `notesError`, CRUD actions                        |

\* `AuthContext` sebenarnya dipasang di level terbawah dalam hierarki
provider — lihat `App.jsx` saat ini: tiga branch render masing-masing
membungkus `<ThemeProvider>` & `<LangProvider>`. NotesProvider di-mount
hanya setelah `user` ada, supaya tidak ada fetch catatan dengan token
kosong.

### 3.3 Pola arsitektur yang sudah jadi konvensi

- **Path alias** — sudah 100% migrasi di semua file.
- **Error handling**: state-based (`authError`, `notesError`), bukan
  `throw`/`alert`. UI render `<p className="form-error">` atau
  `<p className="form-success">`.
- **Validation**: schema Joi sudah **dihapus** total. Guard inline
  (`?.()`, `Array.isArray`, `if (!note) return null`).
- **Provider pattern**: context berisi `<Provider>` dengan value
  `{...}` via `useMemo`. Konsumen pakai custom hook (`useAuth`,
  `useNote`, `useLang`) — bukan `useContext` langsung di komponen.
  Pengecualian: `NoteHeader` & `NoteList` masih
  pakai `React.useContext(...)` langsung (boleh, tapi hook lebih
  ergonomis).
- **Util murni** (`api.js`, `formatDate.js`) — tidak depend ke React.

---

## 4. Routing

| Path             | Halaman          | Kondisi                                  |
| ---------------- | ---------------- | ---------------------------------------- |
| `/*` (catch-all) | `LoginPage`      | `user === null`                          |
| `/register`      | `RegisterPage`   | `user === null`                          |
| `/`              | `ActivePage`     | `user` ada, render `<NotesProvider>`     |
| `/archives`      | `ArchivePage`    | user ada                                 |
| `/notes/:id`     | `DetailPage`     | user ada                                 |
| `/notes/new`     | `AddPage`        | user ada                                 |

Catch-all `/*` di branch "belum login" penting: URL apapun saat user
logout akan kembali ke login. Tidak ada redirect eksplisit di setiap
link karena `App.jsx` re-render ketika `user` berubah — React otomatis
swap tree.

---

## 5. Tema

Dua tema (`light` | `dark`), default `dark`. State + toggle di
`ThemeContext.jsx` provider. Effect di provider menulis ke:

1. `document.documentElement.setAttribute('data-theme', theme)` — CSS
   lihat ini via `[data-theme="light"] { ... }` selector.
2. `localStorage.setItem('theme', theme)` — persist antar reload.

Inisialisasi baca `localStorage` di lazy initializer `useState` —
tidak ada flash karena React apply sebelum paint berikutnya.

### 5.1 Arah desain: "kartu katalog"

Notes-app pada dasarnya adalah kartu catatan — jadi identitas visualnya
dipinjam dari **kartu katalog perpustakaan**: warna tinta di atas
kanvas/kertas, label tanggal dalam monospace (mirip stempel nomor
katalog), dan setiap note dirender sebagai kartu dengan **sudut
terlipat (folded corner)** + garis perforasi putus-putus — bukan
sekadar `border-top` solid. Ini jadi satu-satunya elemen "berani";
sisanya (form, button, spacing) dibuat tenang & disiplin supaya
folded-corner tidak tenggelam di antara dekorasi lain.

### 5.2 Color system (CSS custom properties di `:root`)

Palet diganti dari ungu/cyan Material generik menjadi **amber tinta +
teal arsip**, dengan background "kanvas" alih-alih hitam pekat (lebih
enak dipakai lama, kontras lebih lembut):

```css
:root {
  --ink-amber:      #E8A33D;  /* aksen utama — highlight, link, fokus */
  --ink-amber-dim:  #B8801F;  /* hover/active dari ink-amber */
  --archive-teal:   #4FB6A8;  /* aksen sekunder — state arsip/success */
  --background:     #14161B;  /* kanvas, bukan hitam pekat */
  --surface:         #1C1F26;  /* kartu/panel, sedikit lebih terang dari bg */
  --surface-raised:  #242830;  /* kartu ter-hover / modal */
  --error:           #E2554F;
  --warning:         #E8A33D;  /* reuse ink-amber, jangan tambah warna baru */
  --success:         #4FB6A8;  /* reuse archive-teal */
  --on-background:       #ECEAE4; /* putih hangat, bukan #FFF pekat */
  --on-background-grey:  #8D8980;  /* teks sekunder: tanggal, empty state */
  --on-surface:          #ECEAE4;
  --border-hairline:     #33373F;  /* garis kartu, perforasi, divider */
}

[data-theme="light"] {
  --background:     #EFEBE2;  /* kertas, bukan abu netral */
  --surface:         #FBFAF6;
  --surface-raised:  #FFFFFF;
  --on-background:       #2B2A28;
  --on-background-grey:  #6F6A61;
  --on-surface:           #2B2A28;
  --border-hairline:      #DAD4C6;
  --ink-amber-dim:        #C98B1E;
}
```

Peran warna (semantik, bukan visual):
`background` = canvas halaman, `surface` = kartu/panel, `surface-raised`
= kartu yang di-hover atau elemen mengambang (floating action),
`on-background`/`on-surface` = teks utama, `on-background-grey` = teks
sekunder, `border-hairline` = semua garis tipis (kartu, divider,
perforasi). `ink-amber` dipakai konsisten untuk semua hal yang
"aktif/fokus" (link, input focus ring, tombol primer); `archive-teal`
khusus untuk state arsip & success, supaya dua aksi besar (tulis vs
arsipkan) punya warna yang langsung dikenali tanpa baca label.

> Catatan implementasi: ini ganti nama variabel (`--primary` →
> `--ink-amber`, dst.) — saat menerapkan, cari semua referensi
> `--primary`/`--secondary` di `style.css` dan komponen, ganti ke nama
> baru. Tidak mengubah struktur file CSS atau cara tema di-toggle.

---

## 6. Typography & Spacing

Tiga peran font, bukan satu font generik untuk semua:

| Peran | Font | Dipakai untuk |
|---|---|---|
| Display | `'Fraunces', serif` (variable font, opsional `font-variation-settings: 'opsz' 72, 'SOFT' 30` untuk karakter sedikit organik) | Judul note di detail page, judul input di add page, `h1` app |
| Body | `'Inter', sans-serif` (tetap, sudah dipakai) | Body note, label form, teks UI umum |
| Utility | `ui-monospace, 'SFMono-Regular', Menlo, monospace` (font sistem, **tidak perlu load font baru**) | Tanggal, nomor/ID note, `form-error`/`form-success`, placeholder kosong |

`Fraunces` perlu ditambahkan via `<link>` Google Fonts di `index.html`
(satu font, weight 400 & 600 saja — jangan load semua variant supaya
bundle tetap kecil). Ini satu-satunya penambahan aset; tidak mengubah
struktur folder.

Skala tipografi (sekarang sistem `rem`, base `16px`, rasio ~1.25):

| Token | Ukuran | Font | Dipakai di |
|---|---|---|---|
| `--text-display-lg` | 3.5rem (mobile 2.25rem) | Fraunces 600 | `detail-page__title`, `add-new-page__input__title` |
| `--text-display-md` | 1.75rem | Fraunces 600 | `h1` app header |
| `--text-body-lg` | 1.25rem | Inter 400 | `add-new-page__input__body`, label form |
| `--text-body` | 1.125rem | Inter 400, line-height 1.6 | Body catatan |
| `--text-ui` | 1rem | Inter 600 | Tombol |
| `--text-meta` | 0.8125rem | monospace, letter-spacing 0.02em | Tanggal, empty state, error/success |

Spacing tetap kelipatan 8px tapi sekarang dideklarasikan sebagai token
eksplisit di `:root`, bukan angka ad-hoc di tiap file CSS:

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 16px;
  --space-4: 24px;
  --space-5: 32px;
  --space-6: 52px;
}
```

`--space-6` (52px) baru, dipakai khusus untuk jarak antar kartu note
ke tepi grid di breakpoint terlebar — sebelumnya gap selalu 16px di
semua ukuran, terasa sempit di layar besar.

---

## 7. Layout & Komponen Visual

### 7.1 App shell (`App.jsx`)

```
┌────────────────────────────────────────────┐
│  NoteHeader — kanvas, border-bottom hairline│
│  [Fraunces title]   [Nav] [Lang][Theme][Out]│
├────────────────────────────────────────────┤
│                                            │
│           <main> 90% / max 1200px          │
│                                            │
└────────────────────────────────────────────┘

   floating actions fixed bottom-right:
        [Action — surface-raised, ring amber on focus]
```

Sama seperti sebelumnya secara struktur (`header` flex, `h1 { flex: 1
}`, `main` centered max-width 1200px). Yang berubah: `h1` sekarang
pakai `--text-display-md` (Fraunces), border-bottom header pakai
`--border-hairline` bukan `on-background` solid (lebih halus, tidak
flicker keras saat ganti tema karena hairline-nya tipis).

### 7.2 Note list (`ActivePage` / `ArchivePage`) — signature element

Grid responsif tetap sama (1fr → 2fr → 3fr → 4fr di breakpoint yang
sama), tapi tiap `note-item` sekarang **kartu katalog dengan sudut
terlipat**:

```
┌─────────────────────────────────┐╲
│  TITLE (Fraunces, link→detail)  │ ╲  ← folded corner, clip-path
│  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄  │    triangle 18px, warna
│  04.27.26   (monospace, grey)   │    surface-raised
│  Body (line-clamp 6 baris)      │
└─────────────────────────────────┘
```

Implementasi folded corner pakai `clip-path: polygon(...)` di pseudo
`::after` 18×18px pojok kanan-atas, warna `--surface-raised`, plus
`box-shadow` tipis di bawah segitiga agar terlihat "terlipat" bukan
cuma dekorasi flat. Garis perforasi (`┄┄┄`) antara title dan meta
dibuat dengan `border-top: 1px dashed var(--border-hairline)`, bukan
solid — ini elemen yang menggantikan `border-top: 5px solid` lama
(yang sebelumnya warna primary fixed, "catatan belum punya kategori
visual"). Tanggal sekarang monospace (`--text-meta`) supaya kesan
"nomor katalog" konsisten dengan arah desain di §5.1.

Body tetap di-clamp `-webkit-line-clamp: 6`.

### 7.3 Note detail (`DetailPage`)

```
< NoteDetail />
┌──────────────────────────────┐
│  Title (Fraunces, display-lg)│
│  04.27.26 (monospace, grey)  │
│  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄  │
│  Body (Inter, line-height 1.6)│
└──────────────────────────────┘
   [Archive/Unarchive] [Delete]
       floating bottom-right
```

Struktur sama seperti sebelumnya, hanya menambahkan garis perforasi
yang sama dengan note card (konsistensi motif), dan title pindah ke
Fraunces. Tombol aksi (`NoteActionButton`) tetap bulat 50×50px ikon
32px, tapi warna invert sekarang pakai `surface-raised` +
`on-background` (bukan warna solid background/teks polos) supaya
konsisten dengan token baru, dengan `outline: 2px solid var(--ink-amber)`
saat `:focus-visible` (sebelumnya tidak ada indikator fokus eksplisit
— lihat juga §12 soal aksesibilitas).

### 7.4 Add page (`AddPage`)

```
┌──────────────────────────────────┐
│  [ Title input — Fraunces 600 ]  │
│  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄  │
│  [ Body textarea — Inter ]       │
│  ( min-height 500px )            │
└──────────────────────────────────┘
                              ✓ (fixed)
```

Editor tetap minimalis (input/textarea transparan tanpa border,
full-width), tapi title sekarang Fraunces 600 (bukan Inter bold) dan
ada garis perforasi tipis sebagai pemisah visual title↔body —
menggantikan whitespace polos, supaya konsisten dengan motif kartu
katalog di seluruh app. Tombol simpan tetap `NoteActionButton` pojok
kanan bawah.

### 7.5 Auth form (`LoginInput` / `RegisterInput`)

Struktur sama (single-column, label di atas input), tapi:

- Border input: `1px solid var(--border-hairline)` default,
  `2px solid var(--ink-amber)` saat `:focus` — sebelumnya border 3px
  warna `on-background` di semua state, jadi tidak ada beda visual
  fokus vs idle.
- Tombol submit: `background: var(--ink-amber)`, teks
  `var(--background)` (gelap di atas amber, kontras tetap aman di
  kedua tema) — sebelumnya invert `on-background`/`background` polos,
  tidak ada hierarki warna primer.
- Error message pakai `--error`, success pakai `--archive-teal`
  (bukan `--success` cyan generik lama), font `--text-meta`
  (monospace) — konsisten dengan §6.

Field kosong masih pakai `required` HTML attribute saja; validasi
inline per field belum ada (tetap di backlog §12).

---

## 8. State Flow: Login

```
LoginInput.handleSubmit
       │
       ▼
useAuth().onlogin(email, password)          ◄── async, return {error, message}
       │
       ├─ setLoading(true)
       ├─ setAuthError(null)
       ├─ setAuthSuccess(null)
       │
       ▼
utils/api.js login({email, password})
       │
       ├─ POST /login
       ├─ if !success → toErrorResult → {error: true, message}
       └─ if success   → {error: false, data: {accessToken}}
       │
       ▼
onlogin (lanjutan)
       │
       ├─ if error:
       │     setLoading(false)
       │     setAuthError(message)            ◄── UI re-render <p className="form-error">
       │     return {error: true, message}
       │
       └─ if success:
             putAccessToken(data.accessToken) ◄── localStorage.setItem
             setUser(data.name)                ◄── App re-render → swap ke branch "logged in"
             setLoading(false)
             return {error: false}
```

`onlogin` return value disiapkan untuk caller-side handling; UI cukup
reaktif ke state, jadi caller (`LoginInput`) tidak `await`.

---

## 9. State Flow: Theme toggle

```
NoteHeader.toggle button
       │
       ▼
useTheme().toggleTheme()
       │
       ▼
ThemeContext useState updater
       │
       ├─ setTheme(prev => prev === 'light' ? 'dark' : 'light')
       │
       ▼
React re-render + effect di ThemeProvider:
       │
       ├─ document.documentElement.setAttribute('data-theme', theme)
       │       ◄── CSS [data-theme="light"] selector aktif
       └─ localStorage.setItem('theme', theme)
```

Transisi tema 0.5s ease-in-out di `app-container` — karena semua warna
pakai CSS variable, transisi terjadi secara otomatis pada seluruh DOM.
`header` punya `border-bottom` warna `on-background` (solid), bukan
transisi — flikker minor saat switch.

---

## 10. API Contract

Backend: `https://notes-api.dicoding.dev/v1`. Wrapper di
`src/utils/api.js` mengembalikan shape统一:

```js
{ error: boolean, message?: string, data: <response.data> | null }
```

Daftar fungsi (semuanya `async`, semua balikin shape di atas):
`login`, `register`, `getUserLogged`, `getActiveNotes`,
`getArchivedNotes`, `getNote`, `addNote`, `archiveNote`,
`unarchiveNote`, `deleteNote`. Token dari `login`/`register` dibaca di
caller (`AuthContext.onlogin`) lalu disimpan; endpoint lain pakai
`fetchWithToken` helper yang inject header `Authorization: Bearer
<token>` dari `localStorage`.

---

## 11. Internasionalisasi

Pattern manual (tidak pakai library). Tiap text di komponen UI
memiliki ternary inline:

```jsx
{lang === 'id' ? 'Aplikasi Catatan' : 'Note App'}
```

Konsumen hanya komponen UI (LoginInput, RegisterInput, NoteHeader,
NoteNav, NoteList, SearchBar, ActivePage, ArchivePage). API tidak
dilokalisasi (error message langsung dari backend bahasa Inggris).

Konvensi: cek `useLang()` di setiap komponen yang mengandung string
tampak; taruh `'id'` sebagai default di ternary agar variabel source
konsisten. Jika dua variabel diperlukan (mis. `authSuccess`), pakai
key string (mis. `'register-success'`) dan translate di komponen.

---

## 12. Yang Belum / Terbuka

Snapshot jujur — hal-hal yang **belum** jadi dari design saat ini:

- **Empty state visual** — `<p>` saja di tengah, belum ilustrasi atau
  CTA.
- **Note belum punya kategori/tag** — folded-corner di kartu sekarang
  sekadar motif visual seragam (lihat §7.2), bukan indikator
  kategori; kalau kategori ditambahkan nanti, warna corner bisa jadi
  pembeda per-kategori.
- **Loading state detail page** — teks "fetch..." literal, bukan
  spinner.
- **Loading skeleton list** — tidak ada; `notes` langsung render
  setelah fetch selesai (kalau `loading` true, halaman tampil
  `fetch...`).
- **Pagination / infinite scroll** — tidak ada; asumsi dataset kecil.
- **Field-level validation** — pakai `required` HTML saja; tidak ada
  format check (email/password strength) di client.
- **No keyboard shortcut** — tidak ada binding untuk `Esc` /
  `/`/search.
- **No test file** — `package.json` tidak punya script test; tidak ada
  `__tests__/`.
- **Aksesibilitas** — beberapa tombol只用 ikon tanpa `aria-label`
  (`toggle-theme`, `toggle-lang`, `button-logout`). Title attribute
  di `NoteActionButton` saja.
- **Bundle optimization** — tidak ada `React.lazy` atau code split per
  route.
- **Hardcoded title & placeholder text** di `NoteInput.jsx` &
  `AddPage` — tidak mengikuti i18n.
- **API base URL hardcoded** di `api.js` — tidak ada env override
  untuk staging/dev.

Ini adalah scope untuk iterasi selanjutnya, bukan defects wajib di
refactor saat ini.
