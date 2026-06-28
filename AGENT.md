# AGENT.md — Notes App

Dokumen ini ditujukan untuk AI coding agent agar cepat paham struktur dan konvensi project ini sebelum melakukan perubahan kode.

## 1. Ringkasan Project

Aplikasi catatan (notes) berbasis **React 19 + Vite 7**, dengan autentikasi dan CRUD notes yang terhubung ke **Dicoding Notes API** (`https://notes-api.dicoding.dev/v1`). Mendukung dua bahasa (ID/EN) dan tema light/dark.

Fitur utama:
- Register & Login (token disimpan di `localStorage`)
- Lihat notes aktif & notes yang diarsipkan
- Tambah, lihat detail, arsip/unarsip, dan hapus note
- Pencarian note (lewat query string `?keyword=`)
- Toggle tema (light/dark) dan toggle bahasa (id/en)

## 2. Tech Stack

| Tools | Keterangan |
|---|---|
| React 19 | UI library |
| Vite 7 | Build tool & dev server |
| react-router-dom v7 | Routing |
| react-icons | Icon set |
| joi | Validasi props (hanya aktif di mode DEV, lihat `src/utils/validation.js`) |
| ESLint 9 (flat config) | Linting |

Tidak ada library state management eksternal — semua state global memakai **React Context API**.

## 3. Cara Menjalankan

```bash
npm install
npm run dev       # dev server (Vite)
npm run build     # build production
npm run preview   # preview build
npm run lint      # ESLint
```

Tidak ada file `.env` — base URL API di-hardcode di `src/utils/api.js`.

## 4. Struktur Folder

```
src/
├── App.jsx                # Root component, routing & guard berdasarkan auth state
├── main.jsx                # Entry point, bungkus App dengan BrowserRouter + AuthProvider
├── components/              # Komponen UI re-usable (presentational)
├── pages/                    # Komponen per-halaman (route-level)
├── contexts/                 # React Context (Auth, Notes, Lang, Theme)
├── hooks/                     # Custom hooks (wrapper useContext + 1 hook input)
├── utils/
│   ├── api.js                  # Semua fungsi fetch ke Dicoding Notes API
│   └── validation.js           # Helper validasi prop pakai Joi (dev only)
└── styles/style.css           # Global CSS (pakai data-attribute `data-theme` utk tema)
```

## 5. Routing (`src/App.jsx`)

Routing bercabang berdasarkan status auth dari `useAuth()`:

- **`initializing === true`** → tampilkan placeholder `<p>fetch...</p>` (cek token awal).
- **`!user`** (belum login) → hanya route `/* → LoginPage` dan `/register → RegisterPage`.
- **`user` ada** (sudah login) → route penuh:
  - `/` → `ActivePage` (notes aktif)
  - `/archives` → `ArchivePage` (notes terarsip)
  - `/notes/:id` → `DetailPage`
  - `/notes/new` → `AddPage`

`NotesProvider` hanya dipasang ketika user sudah login (dibungkus di dalam blok `user` ada).

## 6. State Management (Context Pattern)

Semua context mengikuti pola yang sama: `Context.Provider` di `contexts/`, lalu custom hook di `hooks/` yang memanggil `useContext`. **Selalu gunakan hook, jangan import context langsung di komponen.**

| Context | Hook | File | Isi |
|---|---|---|---|
| `AuthContext` | `useAuth()` | `contexts/AuthContext.jsx` | `user` (cuma `name`, bukan object lengkap), `onlogin`, `onlogout`, `onregister`, `loading`, `initializing` |
| `NotesContext` | `useNote()` | `contexts/NotesContext.jsx` | `notes`, `loading`, `fetchActiveNotes`, `fetchArchiveNotes`, `getSingleNote`, `addNote`, `archiveNote`, `unArchiveNote`, `deleteNote` |
| `LangContext` | `useLang()` | `contexts/LangContext.jsx` | `lang` (`'id'`/`'en'`), `toggleLang` |
| `ThemeContext` | — (dipakai langsung lewat `React.useContext(ThemeContext)`, tidak ada hook khusus) | `contexts/ThemeContext.js` | `theme`, `toggleTheme`. Provider-nya didefinisikan langsung di `App.jsx`, bukan file context sendiri |

Catatan penting:
- `AuthProvider` dipasang di `main.jsx` (tertinggi, membungkus seluruh app).
- `ThemeContext` providernya **ada di `App.jsx`** (bukan file terpisah seperti context lain) — sedikit tidak konsisten dengan pola lainnya.
- `NotesContext.getSingleNote` menyimpan hasil single note ke dalam array `notes` (`setNotes([data])`) — bukan state terpisah `currentNote`. Perhatikan ini saat mengubah/membaca state notes di `DetailPage`.

## 7. Lapisan API (`src/utils/api.js`)

Semua request HTTP terpusat di sini, tidak ada fetch langsung dari komponen/halaman. Pola return konsisten: `{ error: boolean, data: any }`.

Fungsi yang tersedia:
`login`, `register`, `getUserLogged`, `addNote`, `getActiveNotes`, `getArchivedNotes`, `getNote`, `archiveNote`, `unarchiveNote`, `deleteNote`, plus helper `getAccessToken`/`putAccessToken` (localStorage) dan `fetchWithToken` (auto attach Bearer token).

Saat menambah endpoint baru, **ikuti pola yang sama**: fetch → `response.json()` → cek `responseJson.status !== 'success'` → return `{ error, data }`.

## 8. Komponen & Halaman

**Pages** (`src/pages/`): `LoginPage`, `RegisterPage`, `ActivePage`, `ArchivePage`, `DetailPage`, `AddPage` — masing-masing terhubung ke `useAuth`/`useNote` dan merender komponen dari `components/`.

**Components** (`src/components/`): `NoteHeader`, `NoteNav`, `NoteList`, `NoteItem`, `NoteDetail`, `NoteInput`, `NoteActionButton`, `SearchBar`, `LoginInput`, `RegisterInput`.

**Hooks** (`src/hooks/`): `useAuth`, `useNote`, `useLang` (wrapper context), dan `UseInput.jsx` (huruf besar "U" tidak konsisten dengan konvensi nama file hook lain — perhatikan saat import) untuk controlled input sederhana (`[value, onChange, setValue]`).

## 9. Validasi Props (`src/utils/validation.js`)

Project punya helper `validateProps(schema, props, componentName)` berbasis Joi, **hanya aktif saat `import.meta.env.DEV`**. Di production, Joi di-mock pakai Proxy supaya tidak menambah bundle size. Jika menambah komponen baru dengan validasi prop, ikuti pola ini, jangan import `joi` langsung di komponen.

## 10. Hal-hal yang Perlu Diperhatikan (Gotchas)

- `AuthContext.onlogin` memanggil `window.location.reload()` setelah login sukses — bukan navigasi React Router biasa. Jangan kaget kalau state Notes ter-reset setelah login.
- `user` di `AuthContext` hanya berupa **string nama** (`response.data.name`), bukan object user lengkap. Kalau butuh `id`/`email` user, perlu ubah `setUser` untuk simpan object penuh.
- Tidak ada refresh-token handling — kalau access token expired, request akan gagal diam-diam (return `error: true`) tanpa auto-redirect ke login.
- `console.log` debug (`'App Render'`, `theme`, `notes:`) masih tersisa di beberapa tempat (`App.jsx`, `NotesContext.jsx`) — bisa dibersihkan.
- Tema disimpan lewat atribut `data-theme` di `document.documentElement`, dikontrol CSS di `src/styles/style.css`, **tidak** dipersist ke localStorage (reset ke `'dark'` setiap reload).
- Bahasa (`LangContext`) juga tidak dipersist ke localStorage.
- File `src/contexts/ThemeContext.js` hanya berisi `createContext()` — provider & logic toggle ada di `App.jsx`, beda pola dari context lainnya.

## 11. Konvensi Kode

- Komponen fungsi dengan `function ComponentName() {}` atau arrow function, export default.
- Import context selalu lewat custom hook (`useAuth()`, `useNote()`, `useLang()`), kecuali `ThemeContext` yang dipanggil langsung via `React.useContext`.
- Bahasa komentar/teks UI: campuran Indonesia & Inggris (dukung i18n via `LangContext`).
- Linting: ESLint flat config (`eslint.config.js`) dengan plugin `react-hooks` dan `react-refresh`.

## 12. Saran untuk Agent Sebelum Mengubah Kode

1. Cek apakah perubahan menyentuh Context — jika ya, pastikan tetap pakai pola hook (`hooks/use*.jsx`), jangan import context langsung.
2. Saat menambah endpoint API baru, tambahkan di `src/utils/api.js` dengan pola return `{ error, data }` yang konsisten, lalu panggil dari `NotesContext`/`AuthContext`, bukan langsung dari komponen.
3. Jika mengubah struktur `user` di `AuthContext`, cek semua tempat yang membaca `user` (saat ini dianggap string nama).
4. Hormati pola validasi dev-only di `validation.js` jika menambahkan validasi prop baru.
