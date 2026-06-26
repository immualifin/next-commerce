# Next Commerce

Ecommerce app built with Next.js 16, Prisma, and Better Auth.

## Tech Stack

- **Framework**: Next.js 16 (webpack — Turbopack `--webpack` flag for Windows compatibility)
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

# (Optional) Seed superadmin
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
5. Copy **Client ID** and **Client Secret** to `.env`:
   ```env
   GOOGLE_CLIENT_ID="xxxxx.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="GOCSPX-xxxxx"
   ```
6. Restart dev server — Google sign-in button will work at `/dashboard/sign-in`

> **Note:** The dev script uses `--webpack` by default. Turbopack has a known `ChunkLoadError` issue on Windows that causes infinite reload loops. Remove the `--webpack` flag in `package.json` if on macOS/Linux or once the issue is resolved.

## Default Admin

| Field | Value |
|-------|-------|
| Email | `admin@example.com` |
| Password | `admin123456` |

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
├── (admin)/
│   └── dashboard/
│       ├── layout.tsx              # Shared shell: sidebar + header
│       ├── (index)/
│       │   ├── page.tsx            # Dashboard overview (charts + table)
│       │   └── data.json           # Sample data
│       ├── (auth)/
│       │   ├── layout.tsx          # Auth wrapper (centered card)
│       │   └── sign-in/
│       │       ├── page.tsx        # Login form
│       │       └── actions.ts      # Sign-in server action
│       ├── products/
│       │   ├── page.tsx            # Product list (server fetch)
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
├── api/auth/[...all]/route.ts      # Better Auth API handler
├── layout.tsx                      # Root layout + TooltipProvider
└── page.tsx
components/
├── app-sidebar.tsx                 # Sidebar shell + menu data
├── nav-main.tsx                    # Main navigation (with active state)
├── nav-secondary.tsx               # Secondary nav (Settings, Help)
├── nav-user.tsx                    # User dropdown + logout
├── site-header.tsx                 # Top header bar
├── section-cards.tsx               # Dashboard metric cards
├── chart-area-interactive.tsx      # Dashboard area chart
├── data-table.tsx                  # Dashboard data table
├── login-form.tsx                  # Sign-in form
├── brand-form.tsx / brand-list.tsx
├── category-form.tsx / category-list.tsx
├── location-form.tsx / location-list.tsx
├── product-form.tsx / product-list.tsx
├── customer-form.tsx / customer-list.tsx
├── order-form.tsx / order-list.tsx
└── ui/                             # 22 shadcn components
lib/
├── auth.ts                         # Better Auth server config
├── auth-client.ts                  # Better Auth client
├── prisma.ts                       # Prisma singleton
├── utils.ts                        # cn(), serialize() helpers
└── validations.ts                  # Zod schemas (auth + 6 entities)
hooks/
└── use-mobile.ts                   # Mobile detection hook
prisma/
├── schema.prisma                   # Auth + ecommerce models
├── seed.ts                         # Superadmin seeder
├── config.ts
└── migrations/
```

## Routes

| URL | Page | Description |
|-----|------|-------------|
| `/dashboard` | Dashboard overview | Charts, cards, data table |
| `/dashboard/sign-in` | Sign in | Email/password + Google OAuth |
| `/dashboard/products` | Products | Product catalog CRUD |
| `/dashboard/orders` | Orders | Order management + shipping detail |
| `/dashboard/customers` | Customers | User management |
| `/dashboard/brands` | Brands | Brand CRUD |
| `/dashboard/categories` | Categories | Category CRUD |
| `/dashboard/locations` | Locations | Location CRUD |
| `/dashboard/settings` | Settings | App settings (placeholder) |
| `/dashboard/help` | Help | Help & docs (placeholder) |

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
