# Notes App — Design Snapshot

Snapshot per **2026-06-29**, setelah refactor path-alias + error-state +
theme-provider. Dokumen ini **mencerminkan kode yang ada sekarang**, bukan
rencana. Kalau ada bagian yang lebih cocok di `README.md`, lihat situ.

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
| Styling      | Vanilla CSS dengan custom properties (tema)  |
| Bundler size | ~250 KB JS / ~4 KB CSS (gzip: ~80/1.2 KB)    |

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

### Color system (CSS custom properties di `:root`)

```css
:root {
  --primary:        #BB86FC;  /* ungu aksen */
  --primary-variant:#3700B3;
  --secondary:      #03DAC6;  /* cyan aksen */
  --background:     #121212;  /* dark default */
  --surface:        #121212;
  --error:          #CF6679;
  --warning:        #F39C12;
  --success:        #03DAC6;
  --on-background:      #FFFFFF;
  --on-background-grey: #c7c7c7;
  --on-surface:         #FFFFFF;
}

[data-theme="light"] {
  --background:     #DDDDDD;
  --surface:        #FFFFFF;
  --on-background:      #333333;
  --on-background-grey: #6d6d6d;
  --on-surface:         #333333;
}
```

Peran warna (semantik, bukan visual):
`background` = canvas halaman, `surface` = kartu/panel, `on-background`
= teks utama di atas background, `on-surface` = teks di atas surface,
`on-background-grey` = teks sekunder (tanggal, empty state).
`primary`/`secondary` belum banyak dipakai — `action` button pakai
`on-background` sebagai warna kontras.

---

## 6. Typography & Spacing

- Font: `'Inter', sans-serif` — di-set global di `body`. Di-load dari
  sistem/browser; tidak ada `@font-face` di repo (lihat `index.html`).
- Skala tipografi (secara ad-hoc, bukan sistem token):
  - Halaman judul (`h1` app): default browser, di header
  - `detail-page__title`: 48px mobile, 64px ≥ 650px
  - `add-new-page__input__title`: 64px
  - `add-new-page__input__body`: 24px
  - Label form (`input-login label`): 24px
  - Tombol form: 24px bold
  - Body catatan: 18px line-height 1.5
  - Tanggal & empty state: 14px (`on-background-grey`)
  - Error/success message: 0.875rem (~14px)
- Spacing: pakai multiple 8px (`4px`, `8px`, `16px`, `32px`) — tidak
  ada design token formal, ini konvensi yang dipakai konsisten.

---

## 7. Layout & Komponen Visual

### 7.1 App shell (`App.jsx`)

```
┌────────────────────────────────────────────┐
│              NoteHeader (centered)         │
│  [App Title]  [Nav]  [Lang] [Theme] [Out] │
├────────────────────────────────────────────┤
│                                            │
│           <main> 90% / max 1200px          │
│                                            │
└────────────────────────────────────────────┘

   floating actions fixed bottom-right:
                  [Action] [Action]
```

`header` pakai flex dengan `h1 { flex: 1 }` — judul ambil ruang
tersisa, kontrol di kanan. `main` centered dengan margin auto + max
width 1200px.

### 7.2 Note list (`ActivePage` / `ArchivePage`)

Grid responsif:

```css
.notes-list {
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr;                    /* < 650px  */
}
@media (min-width: 650px)  { … 2fr; }            /* ≥ 650px  */
@media (min-width: 850px)  { … 3fr; }            /* ≥ 850px  */
@media (min-width: 1200px) { … 4fr; }            /* ≥ 1200px */
```

Tiap `note-item` adalah kartu dengan:

```
┌─────────────────────────────────┐
│  Title (link → detail)          │
│  Tanggal (grey, 14px)           │
│  Body (line-clamp 6 baris)      │
└─────────────────────────────────┘
   border-top: 5px solid  ← warna primary, fixed (catatan belum punya kategori visual)
```

Body di-clamp dengan `-webkit-line-clamp: 6` agar kartu tidak terlalu
panjang di grid lebar.

### 7.3 Note detail (`DetailPage`)

```
< NoteDetail />
┌──────────────────────────────┐
│  Title (48-64px)             │
│  Tanggal                     │
│                              │
│  Body (line-height 1.5)      │
└──────────────────────────────┘
   [Archive/Unarchive] [Delete]
       floating bottom-right
```

Tombol aksi (`NoteActionButton`) bulat 50×50px dengan ikon 32px,
warna inverted (`background-color: on-background`, `color: background`).

### 7.4 Add page (`AddPage`)

Editor minimalis — title dan body adalah `input` dan `textarea`
transparan tanpa border, full-width. Title 64px bold, body 24px.

```
┌──────────────────────────────────┐
│  [ Title input — placeholder ]   │
│                                  │
│  [ Body textarea — full width ]  │
│  ( min-height 500px )            │
└──────────────────────────────────┘
                              ✓ (fixed)
```

Tombol simpan pakai `NoteActionButton` di pojok kanan bawah.

### 7.5 Auth form (`LoginInput` / `RegisterInput`)

Single-column form, label di atas input. Input transparan dengan
border 3px (warna `on-background`). Tombol submit full-width,
background `on-background`, teks `background`.

Error/success message di bawah tombol, 0.875rem, warna `--error` /
`--success`. Field kosong tetap dipakai `required` HTML attribute —
**belum ada validasi inline per field**.

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
