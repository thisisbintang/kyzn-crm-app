# KYZN CRM

An internal CRM for tracking prospective gym members (leads) from first contact through conversion at KYZN venues.

## About

KYZN CRM helps the sales team capture leads, schedule and track follow-ups, and manage each lead's path to membership. It is a browser-based tool: there is no backend, and all data is persisted locally in the browser via `localStorage`.

## Features

- **Dashboard** — eight live metric cards driven by the lead store: total leads (with active/closed split), pending, processing, success, and failed leads (each with a share of the total), new this month, follow-ups due (with overdue and due-today breakdown), and conversion rate.
- **Leads table** — global search across name, phone number, and email; filters for status, lead source, and assigned sales consultant; sortable creation and next follow-up dates; pagination; and per-row actions to copy the lead ID, change status, or open the lead details.
- **Create lead** — a dialog opened from the sidebar quick action. Captures full name, phone number, email, lead source, interested venue, assigned sales consultant, and next follow-up date. Validation covers required fields, email format, phone numbers with at least 7 digits, unique email/phone among active leads (phone numbers are compared in normalized `0`/`62` format), and a next follow-up date that can only be today or later — the calendar disables past days and the form schema rejects them on submit.
- **Lead details** — the full lead record grouped into Contact, Lead details, and Dates sections, with a copyable lead ID, a status badge with quick status change, a "Not contacted yet" fallback for the last contact date, and a not-found state for stale links.
- **Lead status lifecycle** — a restricted state machine (see below). New leads start as `pending`. Moving a lead to `processing` or `success` records the last contact date automatically if it was empty.
- **Page titles** — the site header and the browser tab follow the current route ("Dashboard", "Leads", "Lead Details").
- **Theme** — light and dark themes, defaulting to the system preference. Press `D` anywhere outside form fields to toggle.

## Lead status lifecycle

| From         | Can move to                    |
| ------------ | ------------------------------ |
| `pending`    | `processing`, `failed`         |
| `processing` | `success`, `failed`, `pending` |
| `success`    | `processing`                   |
| `failed`     | `processing`                   |

- `pending` — captured but not yet contacted
- `processing` — follow-up is in progress
- `success` — converted to a member
- `failed` — lost, will not convert

`pending` and `processing` are **active**; `success` and `failed` are **closed**. Only active leads reserve their email and phone number, so two active leads can never share the same contact details. Closing a lead frees them, and reopening (`success`/`failed` → `processing`) is blocked while another active lead uses them.

## Tech stack

- **React 19** + **TypeScript**
- **Vite** — dev server and production build
- **TanStack Router** — file-based routing; route `staticData` drives page titles
- **TanStack Table v9** — headless table with registered features (sorting, filtering, pagination)
- **Zustand 5** with the `persist` middleware — lead state persisted to `localStorage`
- **react-hook-form** + **Zod** — create-lead form and validation
- **Tailwind CSS 4** + **shadcn/ui** (Base UI, `base-nova` style) — UI components
- **date-fns** — date formatting and comparisons
- **Vitest** + **Testing Library** (jsdom) — unit tests
- **ESLint**, **Prettier** (with sorted imports and Tailwind class sorting), **Husky** + **lint-staged** — linting, formatting, and a pre-commit hook

## Getting started

Requirements: Node.js (LTS) and pnpm — the repo uses pnpm (`pnpm-lock.yaml`).

```bash
pnpm install
pnpm dev
```

Open the local URL printed by Vite (default: http://localhost:5173). The app starts with an empty lead list — use **Create Lead** in the sidebar to add your first lead.

## Scripts

| Script            | What it does                                   |
| ----------------- | ---------------------------------------------- |
| `pnpm dev`        | Start the Vite dev server                      |
| `pnpm build`      | Type-check (`tsc -b`) and build for production |
| `pnpm preview`    | Preview the production build locally           |
| `pnpm typecheck`  | Type-check without emitting                    |
| `pnpm test`       | Run the Vitest suite once                      |
| `pnpm test:watch` | Run Vitest in watch mode                       |
| `pnpm lint`       | Run ESLint                                     |
| `pnpm format`     | Format `*.ts`/`*.tsx` with Prettier            |

## Project structure

```
src/
├── components/             # App shell and shared UI
│   ├── app-sidebar.tsx     # Sidebar navigation
│   ├── create-lead-dialog.tsx
│   ├── date-picker.tsx
│   ├── metric-cards.tsx    # Dashboard metric cards
│   ├── site-header.tsx     # Header with the current page title
│   └── ui/                 # shadcn/ui components
├── routes/
│   ├── __root.tsx          # Root layout (sidebar + header)
│   ├── index.tsx           # Dashboard ("/")
│   └── leads/
│       ├── index.tsx       # Leads table ("/leads")
│       ├── $uuid/detail.tsx # Lead details ("/leads/$uuid/detail")
│       ├── -lead.ts        # Lead model, status state machine, storage revival
│       ├── -lead-store.ts  # Zustand store with localStorage persistence
│       ├── -lead-form.ts   # Zod schema for the create-lead form
│       ├── -lead-metrics.ts # Dashboard metric calculations
│       ├── -columns.tsx    # Table columns and row actions
│       ├── -data-table.tsx # Table UI (search, filters, pagination)
│       └── -data.ts        # Static options (sources, venues, consultants)
└── test/setup.ts           # Vitest setup
```

Files prefixed with `-` are co-located modules that TanStack Router does not treat as routes.

## Data & persistence

- Leads are stored in `localStorage` under the key `kyzn-crm:leads` (persist version `1`).
- Dates are serialized as ISO strings and revived into `Date` objects when rehydrating; stored entries that fail validation are dropped.
- Data is per-browser: nothing is shared between devices or browsers, and clearing site data removes all leads.
- To reset the app, clear site data for the app's origin (or delete the `kyzn-crm:leads` key in DevTools).

## Testing

`pnpm test` runs the Vitest suite (unit tests only, no component or E2E tests). Coverage includes the lead status state machine, contact uniqueness and reopening rules, dashboard metrics, and the create-lead form schema.

## Limitations

- No backend, authentication, or multi-device sync — data lives in the browser.
- Leads can be created and updated by status, but there is no edit or delete yet.
- Lead sources, venues, and sales consultants are fixed lists in `src/routes/leads/-data.ts`.
- The UI copy is in English.
