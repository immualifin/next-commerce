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

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma 6 (`engine: "classic"`) |
| Auth | Better Auth (email/password + Google OAuth) |
| Password Hashing | scrypt (`node:crypto` native / `@noble/hashes` fallback) |
| Validation | Zod (server actions) |
| UI | Tailwind CSS 4 |
| Components | shadcn (base-vega style, `components.json`) |
| Icons | Lucide React |

## Project Structure

```
app/
├── (admin)/
│   └── dashboard/
│       └── (auth)/              # auth layout wrapper
│           ├── layout.tsx        # centered + logo
│           └── sign-in/
│               ├── page.tsx      # <LoginForm />
│               └── actions.ts    # server action
├── api/
│   └── auth/
│       └── [...all]/
│           └── route.ts          # Better Auth API handler
├── layout.tsx
└── page.tsx
components/
├── login-form.tsx
└── ui/                          # shadcn components
lib/
├── auth.ts                      # Better Auth server config
├── auth-client.ts               # Better Auth client (for OAuth)
├── prisma.ts                    # Prisma singleton
├── utils.ts                     # cn() helper
└── validations.ts               # Zod schemas
prisma/
├── schema.prisma
├── config.ts                    # Prisma 6 config
└── migrations/
```

## Route Groups

| Group | Path | URL |
|-------|------|-----|
| `(admin)` | Admin pages | `/dashboard` |
| `(auth)` | Auth pages | `/dashboard/sign-in` |

Route groups don't affect the URL — they only organize layout inheritance.

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

## Conventions

### Client / Server Boundaries

- **Server Components** (default): pages, layouts, actions
- **Client Components** (`"use client"`): forms, interactive UI
- **Server Actions**: validate + mutate + redirect

### Imports

- `@/` alias → project root
- `@/components/ui/*` → shadcn components
- `@/lib/*` → utilities, config, validations

### Naming

- Page components: `PascalCase` (export default)
- Files: `kebab-case`
- Server actions: `camelCase` with `Action` suffix

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
