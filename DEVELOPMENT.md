# Development Guide

Next Commerce — Ecommerce app with Next.js 16, Prisma, and Better Auth.

## Prerequisites

- Node.js 20+
- PostgreSQL (Supabase)
- Google Cloud Console project (for OAuth)

## Environment Variables

```bash
# Supabase / Database
DATABASE_URL="postgresql://postgres.<id>:<pass>@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.<id>:<pass>@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres"

# Better Auth
BETTER_AUTH_SECRET="..."    # openssl rand -hex 32
BETTER_AUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PgBouncer pooler (transaction mode) — for queries |
| `DIRECT_URL` | Direct PostgreSQL (session mode) — for migrations |
| `BETTER_AUTH_SECRET` | Session encryption key |

## Setup

```bash
npm install
npx prisma migrate dev
npm run dev
```

## Verification

```bash
# Lint — 0 errors, 2 warnings (known: next/img + TanStack table)
npm run lint

# Build — all 16 pages compiled successfully
npm run build
```

| Check | Status |
|-------|--------|
| ESLint | ✅ 0 errors (2 warnings — known benign) |
| TypeScript | ✅ Pass — no type errors |
| Build | ✅ 16/16 pages generated |
| App Router | `/`, `/sign-in`, `/sign-up`, `/dashboard`, `/dashboard/*` |

## Project Timeline

Urutan pengerjaan project dari awal sampai sekarang.

### Phase 1 — Bootstrap

```
npx create-next-app next-commerce
```

- Next.js 16.2.9 + React 19 + Tailwind CSS 4 + Turbopack
- Git init, commit pertama

### Phase 2 — Database

```
npm install prisma @prisma/client
npx prisma init
```

| Step | Detail |
|------|--------|
| Setup Supabase | PostgreSQL di `ap-northeast-2` (Seoul) |
| Prisma config | `prisma.config.ts` dengan `engine: "classic"`, dual URL (pooler + direct) |
| Schema awal | 7 model ecommerce: User, Brand, Category, Location, Product, Order, OrderDetail, OrderProduct |
| ID strategy | Awalnya `Int @autoincrement` → kemudian migrasi ke `String @cuid()` |
| Migration | `npx prisma migrate dev --name init` |

**Masalah & Solusi:**
| Masalah | Penyebab | Solusi |
|---------|----------|--------|
| Migration hang | `DATABASE_URL` pakai PgBouncer (port 6543) — tidak support DDL | Tambah `directUrl` di `prisma.config.ts` mengarah ke port 5432 |
| `allowScripts` mismatch | Versi di `package.json` salah (`prisma@7.8.0` padahal `6.19.3`) | Sesuaikan allowScripts ke versi aktual |
| `npm audit fix --force` | Downgrade Next.js ke `9.3.3` | Kembalikan manual ke `^16.2.9`, jangan pakai `--force` |

### Phase 3 — Auth

```
npm install better-auth
```

| Step | Detail |
|------|--------|
| Library | Better Auth 1.6.17 (Lucia deprecated, diganti) |
| Plugin | `emailAndPassword` + `socialProviders.google` |
| Schema update | Tambah model `Session`, `Account`, `Verification` (Better Auth) |
| User model | Merge — tambah `emailVerified`, `image`, hapus `password` (pindah ke Account) |
| API handler | `app/api/auth/[...all]/route.ts` via `toNextJsHandler(auth)` |
| Server config | `lib/auth.ts` — prismaAdapter + plugins |
| Client config | `lib/auth-client.ts` — createAuthClient |

### Phase 4 — Sign-In Page

| Step | Detail |
|------|--------|
| Route groups | `(admin)/dashboard/(auth)/sign-in` |
| Layout | `(auth)/layout.tsx` — wrapper centered + logo Acme Inc. |
| Page | `page.tsx` — server component, render `<LoginForm />` |
| Component | `components/login-form.tsx` — client component, controlled form |
| shadcn UI | `button`, `card`, `input`, `label` via `npx shadcn add` |

### Phase 5 — Validation

```
npm install zod   # (sudah terinstall)
```

| Step | Detail |
|------|--------|
| Schema | `lib/validations.ts` — `signInSchema`, `signUpSchema` |
| Server Action | `actions.ts` — Zod parse → Better Auth API → set cookie → redirect |
| Pattern | `useActionState(signInAction)` — ganti dari controlled state + onSubmit |
| Error handling | Field-level errors (`state.errors.email`) + general message (`state.message`) |
| Google OAuth | Tetap client-side (`authClient.signIn.social()`) karena perlu browser redirect |

### Phase 6 — Documentation

| File | Isi |
|------|-----|
| `README.md` | Overview project, tech stack, struktur, quick start |
| `DEVELOPMENT.md` | Panduan development lengkap + alur + timeline |

### Phase 7 — Dashboard Installation

```
npx shadcn add "@shadcn/dashboard-01"
```

| Step | Detail |
|------|--------|
| Block | Dashboard-01 dari shadcn registry (new-york-v4 style) |
| Dependencies | `recharts`, `@tanstack/react-table`, `@dnd-kit/*` (4), `sonner`, `next-themes`, `vaul`, `zod` |
| UI components | 21 komponen baru: sidebar, table, chart, dropdown-menu, badge, select, tabs, sheet, dll |
| Custom components | 8 komponen: app-sidebar, chart-area-interactive, data-table, nav-*, section-cards, site-header |
| Layout | Dashboard shell (SidebarProvider + AppSidebar + SiteHeader + SidebarInset) |
| TooltipProvider | Ditambahkan di root `app/layout.tsx` (diperlukan oleh sidebar) |

### Phase 8 — Sidebar Customization

| Step | Detail |
|------|--------|
| Menu items | Ganti placeholder SaaS → ecommerce: Dashboard, Products, Orders, Customers, Brands, Categories, Locations |
| Secondary nav | Settings, Help (simplified) |
| Documents section | Dihapus (tidak relevan untuk ecommerce) |
| Branding | "Acme Inc." → "NextCommerce" |
| User info | "shadcn" → "Admin" / "admin@example.com" |
| Header title | "Documents" → "Dashboard" |

### Phase 9 — Routing

| Step | Detail |
|------|--------|
| Dashboard layout | `app/(admin)/dashboard/layout.tsx` — shared shell untuk semua dashboard pages |
| Index page | Di-simplify — hanya konten (section cards + chart + data table) tanpa shell |
| 8 route pages | products, orders, customers, brands, categories, locations, settings, help — masing-masing placeholder |

### Phase 10 — Authentication Flows

| Step | Detail |
|------|--------|
| Logout | `nav-user.tsx` — `authClient.signOut()` + `router.push("/dashboard/sign-in")` |
| Active state | `nav-main.tsx` + `nav-secondary.tsx` — `usePathname()` + `isActive` prop |
| Navigation fix | `SidebarMenuButton` + `render={<Link href={url} />}` untuk client-side navigation |
| Active logic | `/dashboard` = strict match, sub-routes = `startsWith` prefix match |

### Phase 11 — Full CRUD

| Step | Detail |
|------|--------|
| Validation schemas | 6 schema baru di `lib/validations.ts`: brand, category, location, product, customer, order |
| Server actions | `createXAction`, `updateXAction`, `deleteXAction` per entity — Zod parse → Prisma → revalidatePath |
| Form components | `<entity>-form.tsx` — client component, Sheet modal, `useActionState`, field errors + toast |
| List components | `<entity>-list.tsx` — client component, Table + edit/delete actions, `useTransition` for async delete |
| Pages | Server component → fetch via Prisma → pass ke client list component |
| Pattern | `serialize(data)` untuk serialisasi server→client (handle BigInt) |

**Entity details:**

| Entity | Complexity | Special handling |
|--------|-----------|------------------|
| Brand | Simple | name + logo URL |
| Category | Simple | name only |
| Location | Simple | name only |
| Product | Medium | FK (brand, category, location), BigInt price, enum stock, image array (comma-split), `<textarea>` |
| Customer | Medium | Edit only (no create — users come from Better Auth), role enum |
| Order | Complex | Order + OrderDetail via `$transaction`, upsert detail on edit, detail viewer Sheet |

### Phase 12 — Soft Delete / Trash

| Step | Detail |
|------|--------|
| Schema update | Tambah `deletedAt DateTime?` ke 6 model ecommerce (Brand, Category, Location, Product, Order) + User |
| Soft delete | `deleteXAction` tidak lagi hard-delete — set `deletedAt` ke `new Date()` |
| Restore | `restoreXAction` baru — set `deletedAt` ke `null` |
| Permanent delete | `permanentDeleteXAction` baru — hard-delete + cascade (e.g. brand → products → orderProducts) |
| Trash UI | Tabs Active/Trash di setiap list component (`?tab=trash`) — `useRouter().push()` untuk switch |
| Page filter | `searchParams.tab` → `prisma.findMany({ where: { deletedAt: isTrash ? { not: null } : null } })` |
| Trash columns | Tampilkan `deletedAt` date di trash view |
| Restore button | Tombol restore dengan icon `RotateCcwIcon` di trash tab |
| Permanent delete button | Tombol delete permanen (merah) di trash tab |
| Cascade handling | Permanent delete entity dengan FK constraints via `prisma.$transaction()` (e.g. brand → cascade delete semua products dan order references) |

**Entity soft-delete details:**

| Entity | Cascade on permanent delete |
|--------|---------------------------|
| Brand | Delete all products under brand + their OrderProduct references |
| Category | Direct delete (no FK cascade needed) |
| Location | Direct delete (no FK cascade needed) |
| Product | Delete all OrderProduct references, then delete product |
| Customer | Direct delete (user may have sessions/accounts — handled separately) |
| Order | Delete OrderDetail + OrderProduct references, then delete order |

### Phase 13 — Google OAuth & Fixes

| Step | Detail |
|------|--------|
| Google Cloud Console | Buat project → OAuth consent screen → OAuth 2.0 Client ID (Web application) |
| Redirect URI | `http://localhost:3000/api/auth/callback/google` — pakai path dari better-auth |
| Credentials | `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` di `.env` — sudah dikonfigurasi di `lib/auth.ts` |
| Reload loop fix | Turbopack `ChunkLoadError` pada HMR client di Windows → ganti ke `--webpack` di `package.json` dev script |
| Dynamic sidebar user | `app-sidebar.tsx` sekarang pakai `authClient.useSession()` — nama, email, dan avatar dari akun Google, bukan hardcoded `admin@example.com` |
| NavUser | Tetap menerima prop `user` — komponen reusable, data di-fetch di parent (`app-sidebar.tsx`) |

### Phase 14 — Customer Auth Pages

| Step | Detail |
|------|--------|
| Route group | `(auth)` di root level — URL bersih `/sign-in` dan `/sign-up` |
| Layout | `app/(auth)/layout.tsx` — centered card layout dengan branding "Next Commerce" |
| Sign-in page | `app/(auth)/sign-in/page.tsx` — Server Component, render `<SignInForm />` |
| Sign-up page | `app/(auth)/sign-up/page.tsx` — Server Component, render `<SignUpForm />` |
| Sign-in form | `components/sign-in-form.tsx` — Client Component, email/password + Google OAuth, redirect ke `/` |
| Sign-up form | `components/sign-up-form.tsx` — Client Component, name/email/password + Google OAuth, redirect ke `/` |
| Server actions | `customerSignInAction` + `signUpAction` — Zod validation → Better Auth API → forward cookies → redirect `/` |
| Landing page | `app/page.tsx` — Full bwa-belanja style landing page (navbar, hero, testimonials, categories, products, brands) |
| Dummy data | Inline static data menggunakan assets dari bwa-belanja (icons, thumbnails, logos, photos) |
| Role | User baru otomatis `rule: customer` dari database default `@default(customer)` |
| Separation | Admin auth (`/dashboard/sign-in`) dan customer auth (`/sign-in`) terpisah penuh — redirect, form, actions, dan layout masing-masing |

**Perbedaan admin vs customer auth:**

| Aspek | Admin (`/dashboard/sign-in`) | Customer (`/sign-in`) |
|-------|------------------------------|------------------------|
| Redirect setelah login | `/dashboard` | `/` |
| Google OAuth callback | `/dashboard` | `/` |
| Branding | "Acme Inc." | "Next Commerce" |
| Sign-up link | `/dashboard/sign-up` (broken) | `/sign-up` |
| Forgot password link | Ada (placeholder) | Ada (placeholder) |
| Component | `login-form.tsx` | `sign-in-form.tsx` |

### Phase 15 — Landing Page Redesign

| Step | Detail |
|------|--------|
| Reference | Landing page dari project bwa-belanja (`qkp93pbb-bwa-belanja`) |
| Assets | Copy semua assets dari bwa-belanja: icons (31), logos (7 brand + logo.svg), photos (4), banners (1), thumbnails (6) |
| Navbar | `components/landing/landing-navbar.tsx` — Server Component, bg-[#0D5CD7] rounded-3xl, nav links + cart icon + Sign In/Sign Up |
| Hero | Badge crown + heading "Working Faster 10x" + CTA buttons + product banner dengan floating badges (Bonus + Warranty) |
| Testimonials | 4 testimonial cards dengan foto dari `/assets/photos/` |
| Categories | 8 kategori dummy dengan icon unik per kategori (4-column grid) |
| Products | 10 produk dummy menggunakan 6 thumbnails dari bwa-belanja (5-column grid, 2 section: Most Picked + New Releases) |
| Brands | 5 brand logo dari `/assets/logos/` (5-column grid) |
| Price format | `lib/rupiah-format.ts` — `Intl.NumberFormat("id-ID")` untuk format Rupiah |
| Data approach | Semua data inline static di `app/page.tsx` — tanpa Prisma, tanpa async/Suspense |
| Route type | `○ /` (Static) — halaman fully static, no dynamic rendering |
| Reload loop fix | Root cause: `auth.api.getSession()` dengan Next.js `ReadonlyHeaders` incompatibility + client-side `useSession()` hydration mismatch. Fix: halaman static murni tanpa auth check. Navbar selalu tampil Sign In/Sign Up. |
| Auth-aware nav | Dihapus dari landing page untuk mencegah reload loop. Customer yang sudah login bisa langsung akses `/dashboard`. |

**Komponen baru:**
```
components/
├── landing/
│   ├── landing-navbar.tsx         # Server component — navbar bwa-belanja style
│   ├── list-category.tsx          # Async server component — grid kategori (4-col)
│   ├── list-products.tsx          # Async server component — grid produk (5-col, title prop)
│   ├── card-product.tsx           # Server component — card produk individual
│   └── list-brands.tsx            # Async server component — grid brand logo (5-col)
└── user-dropdown.tsx              # Client component — user dropdown (tidak digunakan di landing)
```

**Data layer:**
```
app/_data/
└── landing.ts                     # Static dummy data + type exports (CategoryItem, ProductItem, BrandItem)
lib/
└── rupiah-format.ts               # Currency formatter (IDR)
```

**Assets dari bwa-belanja:**
```
public/assets/
├── banners/                       # 1 hero product image
├── icons/                         # 31 SVG icons
├── logos/                         # 7 brand + app logo SVGs
├── photos/                        # 4 testimonial photos
└── thumbnails/                    # 6 product thumbnails
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma 6 (`engine: "classic"`) |
| Auth | Better Auth (email/password + Google OAuth) |
| Password Hashing | scrypt (`node:crypto` native / `@noble/hashes` fallback) |
| Validation | Zod 4 (server actions) |
| UI | Tailwind CSS 4 |
| Components | shadcn v4 (base-vega style, `@base-ui/react`) |
| Charts | Recharts 3 |
| Table | @tanstack/react-table + @dnd-kit |
| Toast | Sonner |
| Theme | next-themes |
| Drawer | Vaul |
| Icons | Lucide React |

## Project Structure

```
app/
├── (auth)/                         # Customer auth route group
│   ├── layout.tsx                  # Centered card layout "Next Commerce"
│   ├── sign-in/
│   │   ├── page.tsx                # <SignInForm />
│   │   └── actions.ts              # customerSignInAction → redirect /
│   └── sign-up/
│       ├── page.tsx                # <SignUpForm />
│       └── actions.ts              # signUpAction → redirect /
├── (admin)/
│   └── dashboard/
│       ├── layout.tsx              # Shared shell: SidebarProvider + AppSidebar + SiteHeader
│       ├── (index)/
│       │   ├── page.tsx            # Dashboard overview (charts + data table)
│       │   └── data.json           # Sample data for table
│       ├── (auth)/                 # Admin auth layout wrapper
│       │   ├── layout.tsx          # centered + logo "Acme Inc."
│       │   └── sign-in/
│       │       ├── page.tsx        # <LoginForm />
│       │       └── actions.ts      # signInAction → redirect /dashboard
│       ├── products/
│       │   ├── page.tsx            # Server fetch → ProductList
│       │   └── actions.ts          # CRUD server actions
│       ├── orders/
│       │   ├── page.tsx
│       │   └── actions.ts
│       ├── customers/
│       │   ├── page.tsx
│       │   └── actions.ts
│       ├── brands/
│       │   ├── page.tsx
│       │   └── actions.ts
│       ├── categories/
│       │   ├── page.tsx
│       │   └── actions.ts
│       ├── locations/
│       │   ├── page.tsx
│       │   └── actions.ts
│       ├── settings/
│       │   └── page.tsx
│       └── help/
│           └── page.tsx
├── api/
│   └── auth/
│       └── [...all]/
│           └── route.ts            # Better Auth API handler
├── layout.tsx                      # Root layout + TooltipProvider
├── page.tsx                        # Landing page — full bwa-belanja style (navbar, hero, testimonials, categories, products, brands)
├── _data/
│   └── landing.ts                  # Static dummy data + types (categories, products, brands)
components/
├── landing/                        # Landing page components
│   ├── landing-navbar.tsx          # Navbar bwa-belanja style
│   ├── list-category.tsx           # Category grid (4-col)
│   ├── list-products.tsx           # Product grid (5-col, title prop)
│   ├── card-product.tsx            # Individual product card
│   └── list-brands.tsx             # Brand logo grid (5-col)
├── user-dropdown.tsx               # Public user dropdown (unused on landing — kept for future use)
├── app-sidebar.tsx                 # Sidebar shell + menu data (7 main items)
├── nav-main.tsx                    # Main nav (Link + usePathname active state)
├── nav-secondary.tsx               # Secondary nav (Settings, Help)
├── nav-user.tsx                    # User dropdown (avatar + logout)
├── site-header.tsx                 # Top header bar
├── section-cards.tsx               # Dashboard 4 metric cards
├── chart-area-interactive.tsx      # Dashboard interactive chart
├── data-table.tsx                  # Dashboard sortable data table
├── login-form.tsx                  # Admin sign-in form (useActionState)
├── sign-in-form.tsx                # Customer sign-in form (useActionState)
├── sign-up-form.tsx                # Customer sign-up form (useActionState)
├── brand-form.tsx / brand-list.tsx
├── category-form.tsx / category-list.tsx
├── location-form.tsx / location-list.tsx
├── product-form.tsx / product-list.tsx
├── customer-form.tsx / customer-list.tsx
├── order-form.tsx / order-list.tsx
└── ui/                             # 22 shadcn v4 components (@base-ui/react)
hooks/
└── use-mobile.ts                   # Mobile breakpoint detection
lib/
├── auth.ts                         # Better Auth server config
├── auth-client.ts                  # Better Auth client (for OAuth + signOut)
├── prisma.ts                       # Prisma singleton
├── utils.ts                        # cn(), serialize() helpers
├── validations.ts                  # Zod schemas (auth + 6 entity schemas)
└── rupiah-format.ts                # IDR currency formatter
prisma/
├── schema.prisma                   # Auth + ecommerce models (11 total)
├── seed.ts                         # Superadmin seeder
├── config.ts                       # Prisma 6 config
└── migrations/
```

## Route Groups

| Group | Path | URL |
|-------|------|-----|
| `(admin)` | Admin pages | `/dashboard` |
| `(index)` | Dashboard index | `/dashboard` |
| `(auth)` (admin) | Admin auth pages | `/dashboard/sign-in` |
| `(auth)` (customer) | Customer auth pages | `/sign-in`, `/sign-up` |

Route groups don't affect the URL — they only organize layout inheritance.

## Routes

| URL | Page | Type |
|-----|------|------|
| `/` | Landing page (hero section) | Server |
| `/sign-in` | Customer sign-in (email/password + Google OAuth) | Server + Client |
| `/sign-up` | Customer sign-up (name/email/password + Google OAuth) | Server + Client |
| `/dashboard` | Dashboard overview (charts + cards + table) | Server + Client |
| `/dashboard/sign-in` | Admin sign-in (email/password + Google OAuth) | Server + Client |
| `/dashboard/products` | Product catalog CRUD | Server + Client |
| `/dashboard/orders` | Order management + shipping detail viewer | Server + Client |
| `/dashboard/customers` | User management (edit/delete only) | Server + Client |
| `/dashboard/brands` | Brand CRUD | Server + Client |
| `/dashboard/categories` | Category CRUD | Server + Client |
| `/dashboard/locations` | Location CRUD | Server + Client |
| `/dashboard/settings` | App settings (placeholder) | Server |
| `/dashboard/help` | Help & docs (placeholder) | Server |

## Database

### Prisma Config (`prisma.config.ts`)

```ts
export default defineConfig({
  schema: "prisma/schema.prisma",
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
    directUrl: env("DIRECT_URL"),   // required — migrations use this
  },
});
```

### Schema

All models use `String @id @default(cuid())` for primary keys.

**Auth models** (Better Auth):
- `User` — merged with ecommerce fields (`rule` enum)
- `Session` — with cascade delete on user
- `Account` — OAuth + credential passwords
- `Verification` — email verification tokens

**Ecommerce models**: `Brand`, `Category`, `Location`, `Product`, `Order`, `OrderDetail`, `OrderProduct`

### Migrations

```bash
# Development (interactive)
npx prisma migrate dev --name <name>

# Non-interactive
npx prisma db push            # push schema without migration file
npx prisma db push --accept-data-loss   # force when warned

npx prisma generate           # regenerate client
npx prisma studio             # GUI browser
```

### Seed (Superadmin)

```bash
npx tsx prisma/seed.ts
```

Default credentials:

| Field | Value |
|-------|-------|
| Email | `admin@example.com` |
| Password | `admin123456` |
| Role | `superadmin` |

Seed menggunakan `hashPassword` dari `better-auth/crypto` (scrypt) + Prisma langsung insert ke `User` dan `Account`.

## Auth

### Server Config (`lib/auth.ts`)

```ts
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  trustedOrigins: [process.env.BETTER_AUTH_URL ?? "http://localhost:3000"],
});
```

### Password Hashing

Better Auth menggunakan **scrypt**:

| Runtime | Implementation |
|---------|---------------|
| Node.js | `node:crypto scrypt` (native, non-blocking via libuv thread pool) |
| Edge / Browser | `@noble/hashes scrypt` (pure JavaScript fallback) |

Password disimpan di tabel `Account` (kolom `password`) dengan format `$scrypt$...` — hash dan salt dalam satu string.

Scrypt adalah **memory-hard KDF**, lebih tahan terhadap serangan GPU/ASIC dibanding bcrypt.

```ts
// Internal better-auth (tidak perlu dipanggil manual)
import { hashPassword, verifyPassword } from "better-auth/crypto";

const hashed = await hashPassword("user-password");     // → $scrypt$...
const valid  = await verifyPassword(hashed, "user-password"); // → boolean
```

### Server Action Pattern

Sign-in uses a server action with Zod validation:

```
form submit → useActionState → signInAction (server)
                                   ├─ Zod parse
                                   ├─ auth.api.signInEmail()
                                   ├─ set cookies
                                   └─ redirect /dashboard
```

```tsx
// Client component
const [state, formAction, isPending] = useActionState(signInAction, {
  errors: null,
  message: null,
});

<form action={formAction}>
  <Input name="email" />
  {state.errors?.email && <p>{state.errors.email[0]}</p>}
</form>
```

```ts
// Server action
"use server";
const parsed = signInSchema.safeParse({ email, password });
if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors, message: null };
const response = await auth.api.signInEmail({ body: parsed.data, headers: new Headers() });
redirect("/dashboard");
```

### Google OAuth

Uses client-side `authClient.signIn.social()` because OAuth requires browser redirect:

```tsx
authClient.signIn.social({ provider: "google", callbackURL: "/dashboard" });
```

### Google Cloud Console Setup

1. Create project → APIs & Services → Credentials
2. OAuth 2.0 Client ID → Web application
3. Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

## UI Components

### Add shadcn Components

```bash
npx shadcn add <component>
```

### Base Style

`base-vega` style with neutral color, CSS variables, Lucide icons (see `components.json`).

## CRUD Architecture

### Pattern per Entity

```
┌─────────────────────────────────────────────────────┐
│ page.tsx (Server Component)                         │
│                                                     │
│  const data = await prisma.<entity>.findMany()      │
│  return <XList data={serialize(data)}>              │
└──────────────────────┬──────────────────────────────┘
                       │ props
                       ▼
┌─────────────────────────────────────────────────────┐
│ <entity>-list.tsx (Client Component)                │
│                                                     │
│  - Table with row data                              │
│  - Edit button → setEditing(row) → open Sheet       │
│  - Delete button → useTransition → deleteAction() (soft)    │
│  - Restore button (trash tab) → restoreAction()             │
│  - Permanent delete button (trash tab) → permanentDelete()  │
│  - Active/Trash tabs → searchParams ?tab=trash              │
│  - New button → open Sheet (active tab only)                │
│  - Sheet wraps <EntityForm>                                 │
└──────────────────────┬──────────────────────────────┘
                       │ props (open, onOpenChange, entity)
                       ▼
┌─────────────────────────────────────────────────────┐
│ <entity>-form.tsx (Client Component)                │
│                                                     │
│  - useActionState(createAction | updateAction)      │
│  - <form action={formAction}>                       │
│  - Input/Select/textarea with name attributes       │
│  - Field errors: state.errors.field[0]              │
│  - Toast on success (useEffect)                     │
└──────────────────────┬──────────────────────────────┘
                       │ form POST
                       ▼
┌─────────────────────────────────────────────────────┐
│ actions.ts (Server Actions)                         │
│                                                     │
│  createXAction(prevState, formData)                 │
│    → schema.safeParse(formData)                     │
│    → prisma.<entity>.create(data)                   │
│    → revalidatePath("/dashboard/<entity>")           │
│    → return { errors, message }                     │
│                                                     │
│  updateXAction(id, prevState, formData)              │
│    → schema.safeParse(formData)                     │
│    → prisma.<entity>.update({ where: { id } })      │
│    → revalidatePath(...)                            │
│                                                     │
│  deleteXAction(id)                                  │
│    → prisma.<entity>.update({ deletedAt: new Date() }) │
│    → revalidatePath(...) (soft delete)              │
│                                                     │
│  restoreXAction(id)                                 │
│    → prisma.<entity>.update({ deletedAt: null })    │
│    → revalidatePath(...)                            │
│                                                     │
│  permanentDeleteXAction(id)                         │
│    → prisma.$transaction([...cascade deletes...])   │
│    → revalidatePath(...) (hard delete)              │
└─────────────────────────────────────────────────────┘
```

### Form Validation Pattern

```ts
// lib/validations.ts
export const brandSchema = z.object({
  name: z.string().min(1, "Brand name is required"),
  logo: z.string().min(1, "Logo URL is required"),
});

// actions.ts
const parsed = brandSchema.safeParse({
  name: formData.get("name"),
  logo: formData.get("logo"),
});
if (!parsed.success) {
  return { errors: parsed.error.flatten().fieldErrors, message: null };
}
```

### Serialization

Server components pass data to client components via props. Prisma types (BigInt, Date, Decimal) don't survive serialization. Use the `serialize()` helper from `lib/utils.ts`:

```tsx
// Server component — always serialize
<BrandList brands={serialize(brands)} />
```

`serialize()` wraps `JSON.parse(JSON.stringify(...))` with a BigInt-aware replacer — this avoids the `"Do not know how to serialize a BigInt"` error for fields like `price` (BigInt in Prisma).

### Product-specific patterns

- **price** (BigInt): Form input as string → `BigInt(price)` in action
- **image** (String[]): Comma-separated string input → `.split(",").map(s => s.trim()).filter(Boolean)`
- **stock** (enum): Select component with `StockProduct` values
- **FK selects**: Brand, Category, Location dropdowns fetched in page, passed as props

### Order-specific patterns

- **Order + OrderDetail**: Created together in `prisma.$transaction()`
- **Update**: `orderDetail.upsert()` (create if not exists, update if exists)
- **Detail viewer**: Separate Sheet showing shipping info (read-only)

## Conventions

### Client / Server Boundaries

- **Server Components** (default): pages, layouts, actions
- **Client Components** (`"use client"`): forms, interactive UI, lists with state
- **Server Actions**: validate + mutate + redirect / revalidatePath

### Imports

- `@/` alias → project root
- `@/components/ui/*` → shadcn components
- `@/lib/*` → utilities, config, validations

### Naming

- Page components: `PascalCase` (export default)
- Files: `kebab-case`
- Server actions: `camelCase` with `Action` suffix
- Form components: `<entity>-form.tsx`
- List components: `<entity>-list.tsx`

---

## Flows

### Email/Password Sign-In

```
┌─────────────────────────────────────────────────────┐
│ CLIENT (Browser)                                    │
│                                                     │
│  User fills email + password                        │
│         │                                           │
│         ▼                                           │
│  <form action={formAction}>                         │
│  useActionState(signInAction)                       │
│         │                                           │
└─────────┼───────────────────────────────────────────┘
          │ POST (Server Action)
          ▼
┌─────────────────────────────────────────────────────┐
│ SERVER (Node.js)                                    │
│                                                     │
│  signInAction(formData)                             │
│         │                                           │
│         ▼                                           │
│  signInSchema.safeParse({ email, password })        │
│         │                                           │
│    ┌────┴────┐                                      │
│    │ FAIL    │ PASS                                 │
│    ▼         ▼                                      │
│  return    auth.api.signInEmail({                   │
│  {         │  body: { email, password }             │
│   errors:  │  headers: new Headers()                │
│  }         │ })                                     │
│            │                                        │
│            ▼                                        │
│       Better Auth                                    │
│         │                                           │
│         ├─ Verify credentials (Account table)       │
│         ├─ Create session (Session table)           │
│         └─ Return Set-Cookie header                 │
│            │                                        │
│            ▼                                        │
│       cookies().set(sessionToken)                   │
│            │                                        │
│            ▼                                        │
│       redirect("/dashboard")                        │
│                                                     │
└─────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────┐
│ CLIENT (Browser)                                    │
│                                                     │
│  GET /dashboard                                     │
│  Cookie: session_token=xxx                          │
│         │                                           │
│         ▼                                           │
│  Server reads cookie → validateSession()            │
│         │                                           │
│    ┌────┴────┐                                      │
│    │ INVALID │ VALID                                │
│    ▼         ▼                                      │
│  redirect   Render dashboard page                   │
│  /sign-in   (user is authenticated)                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Google OAuth Sign-In

```
┌─────────────────────────────────────────────────────┐
│ CLIENT                                             │
│                                                     │
│  User clicks "Google"                               │
│         │                                           │
│         ▼                                           │
│  authClient.signIn.social({                         │
│    provider: "google",                              │
│    callbackURL: "/dashboard"                        │
│  })                                                 │
│         │                                           │
│         ▼                                           │
│  Redirect to Google                                 │
│  https://accounts.google.com/o/oauth2/v2/auth       │
│         │                                           │
└─────────┼───────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────┐
│ GOOGLE                                              │
│                                                     │
│  User consents / selects account                    │
│         │                                           │
│         ▼                                           │
│  Redirect back to app                               │
│  GET /api/auth/callback/google?code=xxx             │
│                                                     │
└─────────┬───────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────┐
│ SERVER — Better Auth callback handler               │
│                                                     │
│  1. Exchange code for tokens (Google API)           │
│  2. Fetch user profile from Google                  │
│  3. Find or create User                             │
│  4. Create Account (providerId: "google")            │
│  5. Create Session                                  │
│  6. Set session cookie                              │
│  7. Redirect to callbackURL ("/dashboard")          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Request Lifecycle (Route Group Layouts)

```
Request: GET /dashboard/sign-in
│
▼
app/layout.tsx                    ← Root layout (<html>, <body>, fonts)
│
▼
app/(admin)/dashboard/(auth)/layout.tsx  ← Auth wrapper (centered, muted bg, logo)
│  children = <SignInPage />
│
▼
app/(admin)/dashboard/(auth)/sign-in/page.tsx   ← Server Component
│  renders <LoginForm />
│
▼
components/login-form.tsx        ← Client Component ("use client")
│  useActionState(signInAction)
│  renders <form> with Input, Button
│
▼
User submits → POST to signInAction (server)
```

### Prisma Migration Flow

```
Schema change
│
▼
npx prisma migrate dev --name <name>
│
├─ 1. Read prisma/schema.prisma
├─ 2. Read existing migrations/
├─ 3. Compare schema vs database state
├─ 4. Generate migration.sql (DDL)
├─ 5. Apply migration → database (via DIRECT_URL port 5432)
├─ 6. Record migration in _prisma_migrations table
└─ 7. Regenerate @prisma/client
│
▼
Database in sync with schema

⚠️ DATABASE_URL (port 6543) = PgBouncer → for queries only
⚠️ DIRECT_URL (port 5432)   = Session mode → for migrations (DDL)
```

### Session Validation Flow

```
Every request to protected route
│
▼
Middleware / Server Component
│
▼
Read session cookie from request headers
│
▼
Better Auth: validateSession(token)
│
├─ Look up Session by token in database
├─ Check expiresAt > now
│  ├─ EXPIRED → delete session, clear cookie, redirect /sign-in
│  └─ VALID  → extend expiresAt (sliding window), continue
│
▼
User attached to request context
│
▼
Page renders with authenticated user
```

### Component Data Flow

```
┌──────────────────────────────────────────────┐
│                lib/validations.ts             │
│  signInSchema: { email, password } (Zod)     │
└──────────────────┬───────────────────────────┘
                   │ imported by
                   ▼
┌──────────────────────────────────────────────┐
│              .../sign-in/actions.ts           │
│  signInAction(prevState, formData)           │
│  "use server"                                │
│                                              │
│  1. Zod parse ← signInSchema                 │
│  2. auth.api.signInEmail() ← lib/auth.ts     │
│  3. cookies() ← next/headers                 │
│  4. redirect() ← next/navigation             │
└──────────────────┬───────────────────────────┘
                   │ imported by
                   ▼
┌──────────────────────────────────────────────┐
│            components/login-form.tsx          │
│  "use client"                                │
│                                              │
│  useActionState(signInAction)                │
│  <form action={formAction}>                  │
│    <Input name="email" />                    │
│    <Input name="password" />                 │
│    <Button type="submit" />                  │
│  </form>                                     │
│                                              │
│  state.errors.email[0] → field error         │
│  state.message → general error               │
│  isPending → loading spinner                 │
└──────────────────────────────────────────────┘
```
