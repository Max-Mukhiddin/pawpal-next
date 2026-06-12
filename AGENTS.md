# Agent Rules — PawPal Next.js Frontend

Reference this file at the start of any session working on `pawpal-next`. It contains the project rules every AI agent must follow.

---

## Brand Tokens

| Token | Value | Usage |
|---|---|---|
| Cream background | `#f5f0e8` | Page and section backgrounds |
| Orange terracotta | `#c8622a` | Detail page left-column accent, italic title accents |
| Dark text / footer | `#1a1a1a` | Body text, footer background |
| Amber badge | `#f59e0b` (approx) | AVAILABLE status badge on ProductCard |
| White ghost | `rgba(255,255,255,0.15)` | Ghost CTA button on hero |

---

## File Structure Map

```
pawpal-next/
├── pages/                    # Next.js Pages Router — one file per route
│   ├── index.tsx             # Homepage
│   ├── service/
│   │   └── detail.tsx
│   ├── product/
│   │   └── detail.tsx
│   ├── services/index.tsx    # Service catalog
│   ├── products/index.tsx    # Product catalog
│   ├── agent/index.tsx       # Specialists listing
│   ├── community/            # Blog list + detail
│   └── _app.tsx              # App wrapper + Apollo provider
├── libs/
│   ├── components/           # React components by domain
│   │   ├── homepage/
│   │   ├── services/
│   │   ├── products/
│   │   ├── mypage/
│   │   ├── inquiry/
│   │   ├── layout/
│   │   └── common/
│   ├── types/                # TypeScript interfaces (by domain)
│   ├── enums/                # Shared enums (ListingStatus, ListingType, …)
│   └── utils/                # Helpers: mediaUrl, formatterKrw, etc.
├── scss/
│   ├── pc/                   # Desktop-first SCSS per page/section
│   │   ├── homepage/         # hero.scss, why-pawpal.scss, featured-products.scss, …
│   │   ├── service/          # catalog.scss, detail.scss
│   │   └── product/          # catalog.scss, detail.scss
│   └── layout/               # navbar.scss, footer.scss
└── apollo/                   # GraphQL queries, mutations, reactive vars
    └── store.ts              # userVar and other reactive variables
```

---

## SCSS Scoping Rules

1. Every component has a unique BEM root class (e.g., `.services-list-card`, `.detail-page`, `.products-list-card`).
2. Never write flat selectors outside a scoping wrapper class.
3. Page-level wrapper classes are declared in the page component's JSX root and scoped in the matching SCSS file.
4. `scss/pc/service/detail.scss` and `scss/pc/product/detail.scss` are currently **identical** — edit both files whenever changing shared detail styles.
5. See [pawpal-scss-conventions.md](pawpal-scss-conventions.md) for full BEM naming and nesting rules.

---

## Apollo / GraphQL Safety Rules

1. Every `getListings` query **must** include `listingType: SERVICE` or `listingType: PRODUCT` in the input. Never query without this discriminator.
2. Never reference a GraphQL field that does not exist on the backend schema — confirm in `pawpal-api` before adding it to a query.
3. Use `useReactiveVar(userVar)` (imported from `apollo/store`) to access the current logged-in user. Do not pass user data through props if `userVar` already provides it.
4. Do not add new GraphQL fields to the frontend until the backend resolver is confirmed.
5. See [BACKEND_MIGRATION.md](BACKEND_MIGRATION.md) for domain name mappings: Property→Listing, Agent→Specialist, PropertyType→ListingType, etc.

---

## TypeScript Verification

After any component change, run:

```bash
npx tsc --noEmit
```

Fix all TypeScript errors before reporting the task as complete. Do not suppress errors with `@ts-ignore` unless there is a documented reason.

---

## Behaviour Rules

- **Read before write.** Always read a file in full before editing it.
- **Targeted edits only.** Change only what the task specifies. No opportunistic cleanup or refactoring alongside the main change.
- **No scope creep.** If a related issue is noticed, report it to the user — do not fix it without instruction.
- **Keep detail SCSS in sync.** `scss/pc/service/detail.scss` and `scss/pc/product/detail.scss` must remain identical. Apply any change to both.
- **No new components for CSS-only changes.** Layout variations that can be achieved with a modifier class do not need a new component file.
- **No new GraphQL queries** without confirming the backend field exists.
- **No imports of deleted files.** Before deleting a component, search for all imports of it across the codebase.

---

## Multi-Agent Setup

| Repo | Stack | Purpose |
|---|---|---|
| `pawpal-next` (this repo) | Next.js, Apollo Client, SCSS, MUI | Frontend — all UI, pages, components |
| `pawpal-api` | NestJS, GraphQL, MongoDB | Backend — resolvers, schema, auth |

When a frontend task requires a new GraphQL field or resolver change, pause and check `pawpal-api` before writing frontend code. Frontend and backend are developed in separate sessions.

---

## Test Credentials

> Update these with real values once test accounts are set up (tracked in [NEXT_STEPS.md](NEXT_STEPS.md)).

- **Admin:** `[admin-email]` / `[password]`
- **Specialist:** `[specialist-email]` / `[password]`
- **Regular user:** `[user-email]` / `[password]`

---

## Common Gotchas

- **Unsplash IDs** — only use confirmed working photo IDs. A broken Unsplash URL renders a blank image with no console error. See [SKILLS.md](SKILLS.md) pattern #10 for the safe swap approach.
- **Dark mode** — currently disabled. Do not add `@media (prefers-color-scheme: dark)` blocks during light-mode work. Re-enabling dark mode is a tracked task in [NEXT_STEPS.md](NEXT_STEPS.md).
- **`listingType` discriminator** — forgetting this causes a query to return both services and products mixed together, which breaks category pages silently.
- **Avatar colours** — never use `Math.random()` for avatar background colours. Use the deterministic `_id` hash approach already established in `SpecialistCatalogRow.tsx`.
