# Fix: Halaman Blank Putih Saat `npm run preview`

## Ringkasan

Setelah `npm run build` lalu `npm run preview`, halaman hanya menampilkan
layar putih kosong — tidak ada UI, tidak ada error yang jelas di console
secara default. Setelah diselidiki, akar masalahnya ada di file
`src/utils/validation.js` yang dievaluasi saat import chain di production
bundle, bukan di kode aplikasi React-nya sendiri.

---

## Gejala

- `npm run dev` → aplikasi berjalan normal, login/register/notes semua OK.
- `npm run build` → selesai tanpa error.
- `npm run preview` → layar putih total.
- DevTools console:
  - Tidak ada error dari kode aplikasi di awal.
  - Setelah ditelusuri, ada error seperti:

    ```
    Uncaught TypeError: _t.string(...).min(...).required is not a function
        at index-XXXXX.js:11
    ```

- `document.getElementById('root').innerHTML` kosong (`""`).
- View page source: `<div id="root"></div>` kosong, script bundle termuat
  dengan status 200.

---

## Penyebab

Modul `src/utils/validation.js` awalnya berisi kira-kira:

```js
// pseudo-code
export const J = await createJoi();

export function validateProps(schema, props, componentName) {
  if (!import.meta.env.DEV) return props;
  // ... panggil schema.validate(props)
}
```

Lalu `createJoi()`-nya berisi:

```js
export async function createJoi() {
  if (import.meta.env.DEV) {
    // di dev: import real Joi
    const mod = await import('joi');
    return mod.default;
  }
  // di prod: return mock
  return createMockJoi();
}
```

File ini diimpor oleh banyak komponen, dan masing-masing komponen memanggil
`J.object({...})` atau `J.string().min(5).required()` **di level modul**
(bukan di dalam function body), contoh:

```js
// src/components/NoteItem.jsx
const NoteItemPropTypes = J.object({
  title: J.string().min(1).required(),
  body:  J.string().required(),
});
```

---

## Kenapa Bisa Error?

### 1. Top-level `await` di `validation.js`

`export const J = await createJoi();` membuat modul tersebut menjadi
**top-level-await module**. Browser harus menunda evaluasi sampai `J`
siap. Tidak masalah di dev — `import.meta.env.DEV` benar, dan mock selalu
return sesuatu.

### 2. Vite tree-shaking menghapus kode mock di production

Waktu build production, Vite melihat:

- `J` diekspor, tapi tidak ada satupun import yang menggunakan hasil dari
  `createMockJoi()` untuk efek apa pun — semua komponen cuma memanggil
  `J.object(...).validate(...)` (yang di production di-skip oleh
  `if (!import.meta.env.DEV) return props`).
- Akibatnya Vite tree-shake dan meng-inlinenya menjadi:

  ```js
  export const J = undefined;
  ```

  Jadi `J` menjadi `undefined` di production bundle.

### 3. Pemanggilan `J.object({...})` di module scope

Komponen-komponen ini memanggil `J.object({...})` **di level modul**,
bukan di dalam function body:

```js
// dievaluasi saat file di-import
const propTypesSchema = J.object({
  title: J.string().required(),  // <— TypeError di sini
});
```

Karena `J === undefined`, `J.object(...)` melempar:

```
TypeError: Cannot read properties of undefined (reading 'object')
```

Error ini terjadi **saat import dievaluasi** — bahkan sebelum `App`
pertama kali render. Karena import chain gagal di tengah, **tidak ada
komponen yang sempat render**, dan `<div id="root">` tetap kosong.

### 4. Tidak tertangkap error boundary

`<App>` belum sempat me-mount, jadi tidak ada React ErrorBoundary yang
bisa menangkap error ini. Error muncul sebagai uncaught script error,
tetapi `<script>` tag bundle-nya ada di akhir `<body>`, sehingga layout
sudah terbentuk dengan `<div id="root">` kosong sebelum script sempat
crash.

---

## Kenapa Dev dan Preview Berbeda?

| Aspek                      | `npm run dev`                                    | `npm run preview` (build)                                 |
| -------------------------- | ------------------------------------------------ | --------------------------------------------------------- |
| Evaluasi `validation.js`   | `createJoi()` return mock sinkron                | Tree-shaking menghapus mock → `J = undefined`             |
| `import.meta.env.DEV`      | `true` — `validateProps` jalan, pakai Joi asli   | `false` — `validateProps` di-skip, tapi `J.object` sudah terpanggil duluan |
| Error muncul?              | Tidak, karena `J` selalu object valid            | Ya, silent di module-level → blank                        |
| Top-level await            | OK                                               | Mengubah modul jadi async module, race dengan import lain |

Intinya: **kode di level modul dievaluasi hanya sekali, saat import.
Dev dan build menghasilkan graph evaluasi yang berbeda**, dan kode
module-scope yang mengasumsikan library selalu tersedia akan crash
tanpa bisa di-recover oleh React.

---

## Penyelesaian

### Inti fix

Buat `J` selalu Proxy chainable yang valid di **semua environment**, dan
skip validasi di production:

```js
// src/utils/validation.js

// Schema Proxy yang bisa di-chain dan di-call, dengan validate() no-op.
const mockValidate = () => ({ value: undefined, error: null });

function chainable() {
  return new Proxy(function () {}, {
    get(_target, prop) {
      if (prop === 'validate') return mockValidate;
      // .min, .max, .required, dll → return chainable lagi
      return chainable();
    },
    apply() {
      // .min(5), .required() dipanggil sebagai function → return chainable lagi
      return chainable();
    },
  });
}

function createMockJoi() {
  return new Proxy({}, {
    get() {
      // .object, .string, .number, dll → return chainable
      return chainable;
    },
  });
}

// Selalu tersedia — tidak ada top-level await, tidak ada tree-shake risk.
export const J = createMockJoi();

export function validateProps(schema, props, componentName) {
  if (!import.meta.env.DEV) return props;
  const { error, value } = schema.validate(props, { abortEarly: false });
  if (error) {
    error.details.forEach((detail) => {
      console.warn(`[${componentName}] Prop validation error: ${detail.message}`);
    });
  }
  return value;
}
```

### Kenapa ini bekerja

1. **Sinkron, tidak ada top-level await** — Vite tidak lagi menjadikan
   modul ini async, dan import chain-nya deterministik.
2. **Selalu return value valid** — `J.object(...)` return Proxy chainable,
   `.string()` return chainable, `.min(5)` (call) return chainable,
   `.required()` (call) return chainable, `.validate(...)` return
   `{ value: undefined, error: null }`.
3. **Tree-shaking aman** — bahkan kalau Vite tetap optimasi modul ini,
   hasil akhirnya tetap Proxy yang valid untuk semua penggunaan.
4. **No-op di production** — `validateProps` short-circuit di production,
   sehingga tidak ada overhead runtime.

### Langkah verifikasi

```bash
npm run build
npm run preview
# buka http://localhost:4173 di Incognito
```

Akar layar putih di-debug dengan teknik reduksi: dari `<App />` yang
sangat minimal, tambah per layer (AuthProvider, BrowserRouter, routes,
halaman penuh) sampai reproduksi blank, lalu menelusuri import graph
dengan error stack.

---

## Pelajaran

1. **Module-scope code yang mengasumsikan library selalu ada** rawan
   crash di production bundle. Cek: apakah pemanggilan library ada di
   luar function/component body? Kalau iya, pastikan library itu selalu
   terdefinisi.
2. **Top-level `await` + tree-shaking** bisa saling menghapus kode
   yang sebenarnya dibutuhkan saat module evaluation. Hindari top-level
   await untuk nilai-nilai yang dipakai secara synchronous di module
   lain.
3. **Dev mode ≠ production mode**. Selalu jalankan `npm run build` +
   `npm run preview` untuk smoke test sebelum release.
4. **Kode validasi prop sebaiknya tidak menghalangi render.** Validasi
   prop adalah development aid — production harus bisa skip tanpa
  副作用.
