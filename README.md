# Next Commerce

Ecommerce admin dashboard + customer storefront built with **Next.js 16**, **Prisma**, and **Better Auth**.

## Tech Stack

- **Framework**: Next.js 16 (webpack — `--webpack` flag for Windows compatibility)
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma 6
- **Auth**: Better Auth (email/password + Google OAuth, password: scrypt)
- **Validation**: Zod (server actions)
- **UI**: Tailwind CSS 4 + shadcn (base-vega, `@base-ui/react`)
- **Charts**: Recharts
- **Table**: @tanstack/react-table + @dnd-kit
- **Toast**: Sonner
- **Icons**: Lucide React

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in DATABASE_URL, DIRECT_URL, BETTER_AUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET

# Run database migration
npx prisma migrate dev

# (Optional) Seed database — creates superadmin + business data (categories, brands, products)
npx tsx prisma/seed.ts

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → create a project
2. **APIs & Services** → **OAuth consent screen** → External → fill App name & email
3. **Credentials** → **+ Create Credentials** → **OAuth client ID** → Web application
4. Add **Authorized redirect URI**:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
5. Copy **Client ID** and **Client Secret** to `.env**:
   ```env
   GOOGLE_CLIENT_ID="xxxxx.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="GOCSPX-xxxxx"
   ```
6. Restart dev server — Google sign-in button will work on both admin and customer pages

> **Note:** The dev script uses `--webpack` by default. Turbopack has a known `ChunkLoadError` issue on Windows that causes infinite reload loops. Remove the `--webpack` flag in `package.json` if on macOS/Linux or once the issue is resolved.

## Default Admin

| Field | Value |
|-------|-------|
| Email | `admin@example.com` |
| Password | `admin123456` |
| URL | `http://localhost:3000/dashboard/sign-in` |

## Database Viewer

```bash
npx prisma studio
```

Opens Prisma Studio at [http://localhost:5555](http://localhost:5555) — a visual GUI to browse, edit, and filter all 11 tables.

## Soft Delete (Trash)

All entities support soft delete — records are moved to trash instead of being permanently removed. Each list page has **Active** and **Trash** tabs:

- **Soft delete** (`deleteXAction`): Sets `deletedAt` — record hidden from active view, appears in trash
- **Restore** (`restoreXAction`): Clears `deletedAt` — record returns to active view
- **Permanent delete** (`permanentDeleteXAction`): Hard delete from database with cascade cleanup (e.g. deleting a brand also removes its products and order references)

The trash view shows the deletion date for each record.

## Project Structure

```
app/
├── (auth)/                      # Customer auth route group
│   ├── layout.tsx               # Centered card layout "Next Commerce"
│   ├── sign-in/
│   │   ├── page.tsx             # Customer sign-in
│   │   └── actions.ts           # → redirect /
│   └── sign-up/
│       ├── page.tsx             # Customer sign-up
│       └── actions.ts           # → redirect /
├── (admin)/
│   └── dashboard/
│       ├── layout.tsx           # Shared shell: sidebar + header
│       ├── (index)/
│       │   ├── page.tsx         # Dashboard overview (charts + table)
│       │   └── data.json        # Sample data
│       ├── (auth)/
│       │   ├── layout.tsx       # Admin auth wrapper (centered card)
│       │   └── sign-in/
│       │       ├── page.tsx     # Admin sign-in
│       │       └── actions.ts   # → redirect /dashboard
│       ├── products/
│       │   ├── page.tsx         # Product list (server fetch)
│       │   └── actions.ts       # CRUD server actions
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
├── api/auth/[...all]/route.ts   # Better Auth API handler
├── layout.tsx                   # Root layout + TooltipProvider
├── page.tsx                     # Landing page — DB-driven via landing components
├── categories/
│   └── page.tsx                 # Customer-facing category page (/categories)
├── products/
│   ├── page.tsx                 # Product listing with filters (/products)
│   └── [id]/
│       ├── page.tsx             # Product detail (/products/[id])
│       └── _components/         # Carousel, PriceInfo widget
├── brands/
│   └── page.tsx                 # Brand listing (/brands)
├── catalogs/
│   ├── page.tsx                 # Full catalog with filters (/catalogs)
│   └── _components/             # Search bar, filter sidebar, product grid
├── _data/
│   └── landing.ts               # Prisma-backed data functions (categories, products, brands)
components/
├── landing/                     # Landing page components
│   ├── landing-navbar.tsx       # Client Component — shared navbar (auth-aware, active link, scroll anchors)
│   ├── list-category.tsx        # Category grid
│   ├── list-products.tsx        # Product grid
│   ├── card-product.tsx         # Product card
│   └── list-brands.tsx          # Brand logo grid
├── app-sidebar.tsx              # Sidebar shell + menu data
├── nav-main.tsx                 # Main navigation (with active state)
├── nav-secondary.tsx            # Secondary nav (Settings, Help)
├── nav-user.tsx                 # User dropdown + logout
├── site-header.tsx              # Top header bar
├── section-cards.tsx            # Dashboard metric cards
├── chart-area-interactive.tsx   # Dashboard area chart
├── data-table.tsx               # Dashboard data table
├── login-form.tsx               # Admin sign-in form
├── sign-in-form.tsx             # Customer sign-in form
├── sign-up-form.tsx             # Customer sign-up form
├── brand-form.tsx / brand-list.tsx
├── category-form.tsx / category-list.tsx
├── location-form.tsx / location-list.tsx
├── product-form.tsx / product-list.tsx
├── customer-form.tsx / customer-list.tsx
├── order-form.tsx / order-list.tsx
└── ui/                          # 22 shadcn components
lib/
├── auth.ts                      # Better Auth server config
├── auth-client.ts               # Better Auth client
├── prisma.ts                    # Prisma singleton
├── utils.ts                     # cn(), serialize() helpers
├── validations.ts               # Zod schemas (auth + 6 entities)
├── rupiah-format.ts             # IDR currency formatter
└── category-icons.ts            # Category name → SVG icon mapping
hooks/
└── use-mobile.ts                # Mobile detection hook
prisma/
├── schema.prisma                # Auth + ecommerce models (11 tables)
├── seed.ts                      # Superadmin seeder
├── config.ts
└── migrations/
```

## Routes

### Customer

| URL | Description |
|-----|-------------|
| `/` | Landing page — bwa-belanja style, auth-aware navbar ("Hi, Name" / Sign In), DB-driven |
| `/sign-in` | Customer sign-in (email/password + Google OAuth) |
| `/sign-up` | Customer sign-up (name/email/password + Google OAuth) |
| `/categories` | Category listing — 8 categories from DB with product counts and icons |
| `/products` | Product listing — filterable by `?category=<id>` & `?brand=<id>`, 5-column grid |
| `/products/[id]` | Product detail — carousel, benefits, testimonials, PriceInfo sidebar, recommendations |
| `/brands` | Brand listing — 5 brands from DB with product counts and logos |
| `/catalogs` | Full catalog — search, filter sidebar (price, stock, brand, category, location), product grid |

### Admin Dashboard

| URL | Description |
|-----|-------------|
| `/dashboard` | Dashboard overview (charts, cards, table) |
| `/dashboard/sign-in` | Admin sign-in (email/password + Google OAuth) |
| `/dashboard/products` | Product catalog CRUD |
| `/dashboard/orders` | Order management + shipping detail |
| `/dashboard/customers` | User management (edit/delete only) |
| `/dashboard/brands` | Brand CRUD |
| `/dashboard/categories` | Category CRUD |
| `/dashboard/locations` | Location CRUD |
| `/dashboard/settings` | App settings (placeholder) |
| `/dashboard/help` | Help & docs (placeholder) |

## CRUD Architecture

Each entity follows the same pattern:

```
Server Action (actions.ts)
  → Zod safeParse for validation
  → Prisma mutation (create/update/soft-delete/restore/permanent-delete)
  → revalidatePath("/dashboard/<entity>")
  → return { errors, message }

Client Form (<entity>-form.tsx)
  → useActionState with server action
  → Sheet modal (create/edit)
  → Field errors from state.errors
  → Sonner toast on success

Client List (<entity>-list.tsx)
  → Active/Trash tabs (searchParams: ?tab=trash)
  → Table with edit/soft-delete row actions (active tab)
  → Table with restore/permanent-delete row actions (trash tab)
  → New button opens Sheet form (active tab only)
  → useTransition for async delete/restore

Page (page.tsx)
  → Server component
  → Reads searchParams.tab to filter active vs trash
  → Fetch data via prisma.findMany({ where: { deletedAt: ... } })
  → Pass tab prop + serialized data to client list component
```

## Authentication

Two separate auth flows with isolated components, actions, and redirect targets:

| Aspect | Customer | Admin |
|--------|----------|-------|
| Sign-in URL | `/sign-in` | `/dashboard/sign-in` |
| Sign-up URL | `/sign-up` | N/A |
| Redirect after login | `/` | `/dashboard` |
| Google OAuth callback | `/` | `/dashboard` |
| Form component | `sign-in-form.tsx` | `login-form.tsx` |
| Default role | `customer` | `superadmin` (via seed) |

## Verification

```bash
# Lint — 0 errors
npm run lint

# Build — 20/20 pages
npm run build
```

## See Also

- [DEVELOPMENT.md](./DEVELOPMENT.md) — Full development guide with timeline, flows, and architecture
- [TODO.md](./TODO.md) — Known issues and planned improvements
