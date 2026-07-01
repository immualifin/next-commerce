# TODO

Daftar masalah dan perbaikan yang perlu dilakukan berdasarkan hasil analisis project.

## 🔴 Kritis

- [ ] **`.env` ter-commit ke git** — file `.env` berisi kredensial sensitif:
  - Supabase connection string beserta password
  - Better Auth secret key
  - Google OAuth client ID & secret
  - **Tindakan:** Hapus `.env` dari git history (`git rm --cached .env`), tambahkan ke `.gitignore`, dan rotasi semua kredensial yang sudah terekspos.

## 🟠 Tinggi

- [ ] **Tidak ada middleware autentikasi** — seluruh route `/dashboard/*` bisa diakses tanpa login. Tidak ada `middleware.ts` yang memeriksa session atau redirect ke halaman sign-in.
  - **Tindakan:** Buat `middleware.ts` di root project yang memproteksi route `/dashboard` menggunakan Better Auth session check.

## 🟡 Medium

- [x] **Halaman root (`/`) masih boilerplate Next.js default** — menampilkan halaman "Welcome to Next.js", bukan landing page atau redirect ke dashboard.
  - **Tindakan:** ~~Ganti dengan redirect ke `/dashboard` atau buat landing page yang sesuai.~~ ✅ Selesai Phase 14 — landing page dengan hero section + CTA "Get started" / "Sign in".

- [x] **Tidak ada halaman sign-up** — form login memiliki link ke `/dashboard/sign-up` tetapi route tersebut tidak ada (akan 404).
  - **Tindakan:** ~~Buat halaman sign-up di `app/(admin)/dashboard/(auth)/sign-up/page.tsx`, atau jika tidak diperlukan hapus link tersebut dari form login.~~ ✅ Selesai Phase 14 — customer sign-up page di `app/(auth)/sign-up/`.

- [ ] **Tidak ada error boundaries** — tidak ada file `error.tsx` maupun `not-found.tsx` di dalam app directory.
  - **Tindakan:** Tambahkan `error.tsx` dan `not-found.tsx` di `app/` dan `app/(admin)/dashboard/` untuk menangani error dan 404 secara graceful.

- [ ] **Tidak ada halaman detail individual** — semua entity (product, order, customer) hanya memiliki list view. Tidak ada halaman detail per item.
  - **Tindakan:** Buat halaman `[id]/page.tsx` untuk entity yang membutuhkan detail view (minimal products dan orders).

## 🔵 Rendah

- [ ] **Data dashboard overview hardcoded** — `SectionCards`, `ChartAreaInteractive`, dan `DataTable` menggunakan data demo statis (`data.json`) yang bukan data ecommerce sebenarnya.
  - **Tindakan:** Ganti dengan data nyata dari database (total revenue, total orders, total customers, dll).

- [ ] **Inkonsistensi tipe harga** — `Product.price` menggunakan `BigInt` sedangkan `Order.total` menggunakan `Int` biasa. Untuk harga dalam Rupiah (nominal besar), `Int` bisa overflow.
  - **Tindakan:** Ubah `Order.total` dan `OrderProduct.subtotal` menjadi `BigInt` agar konsisten dengan `Product.price`.

- [ ] **Tidak ada validasi role-based access** — semua user yang login bisa mengakses semua fitur admin, termasuk mengubah role user lain. Enum `RoleUser` (`superadmin` | `customer`) sudah ada di schema tapi tidak digunakan untuk gate akses.
  - **Tindakan:** Tambahkan pengecekan role di Server Actions untuk operasi sensitif.

- [ ] **Halaman Settings dan Help masih placeholder** — hanya menampilkan teks "Coming soon".
  - **Tindakan:** Implementasi fitur settings (profil, ganti password) dan help (dokumentasi/FAQ).
