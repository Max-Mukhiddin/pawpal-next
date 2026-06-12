# Claude Code Prompt Skills — PawPal

Reusable prompt patterns for working on this project. More targeted than PROMPTS.md — these are designed for the current PawPal architecture and design system.

Fill in the `[bracketed]` placeholders before using.

---

## 1. Safe Single-Line CSS Fix

Use when you need to change exactly one CSS property with no risk of scope creep.

```
In [scss file path], find the selector [full selector] and change
[property] from [current value] to [new value]. No other changes.
No other files.
```

**Example:**
```
In scss/pc/service/detail.scss, find the selector .detail-page__col-left
and change background from #c8622a to #b85520. No other changes. No other files.
```

---

## 2. Safe Multi-Fix in One File

Use when several CSS properties need updating in the same file but must stay strictly scoped.

```
In [scss file path], make the following changes only — no other selectors,
no other files:
1. In [selector A], change [property] to [value].
2. In [selector B], change [property] to [value].
3. In [selector C], change [property] to [value].
Run no build commands. Report what changed.
```

**Example:**
```
In scss/pc/product/catalog.scss, make the following changes only:
1. In .products-list-card, change background to #fff8f0.
2. In .products-list-card__badge.is-available, change color to #f59e0b.
3. In .products-list-card__inquiry, change border-color to #c8622a.
Run no build commands. Report what changed.
```

---

## 3. Analyse Before Fix

Use when the root cause of a visual bug is unclear. Forces read-first, diagnose-then-fix.

```
Read [file path(s)] in full. Do not make any changes yet.
Identify what is causing [describe the visual problem].
Then propose a single targeted fix — one selector, one property change.
Wait for my approval before editing.
```

**Example:**
```
Read scss/pc/service/detail.scss in full. Do not make any changes yet.
Identify what is causing the orange left-column background to stop
halfway down the page. Then propose a single targeted fix.
Wait for my approval before editing.
```

---

## 4. New Homepage Section

Use when adding a brand-new section component + matching SCSS to the homepage.

```
Create a new homepage section component at
libs/components/homepage/[ComponentName].tsx.
It should render [describe content: heading, subheading, grid of N cards, CTA button].
Use the cream background #f5f0e8 and orange accent #c8622a.
BEM root class: .[kebab-name]
Add matching SCSS at scss/pc/homepage/[kebab-name].scss — no global selectors.
Import the SCSS into pages/index.tsx (check existing import pattern first).
Run npx tsc --noEmit after. No other files changed.
```

---

## 5. Card Component Fix

Use when a catalog card (ServiceCard, ProductCard, etc.) needs a targeted visual change.

```
In libs/components/[domain]/[CardComponent].tsx, change [describe the change].
Also update the matching SCSS in scss/pc/[domain]/[file].scss if needed —
scope all new selectors under .[card-root-class].
Run npx tsc --noEmit after. No other components changed.
```

**Example:**
```
In libs/components/products/ProductCard.tsx, add a hover state that
raises the card with box-shadow. Also update scss/pc/product/catalog.scss —
scope the new rule under .products-list-card:hover. No other components changed.
```

---

## 6. Dark Mode Fix

Use when re-enabling dark mode for a specific page or component.

```
Read [scss file] and [component file] in full. Do not change anything yet.
List every colour value that will need a dark mode override.
Then add a @media (prefers-color-scheme: dark) block at the bottom of
[scss file] with only the minimum overrides needed. No other files changed.
Run npx tsc --noEmit after if any TSX was touched.
```

> Note: Dark mode is currently disabled globally. Only use this pattern once dark mode re-enabling is prioritised (see [NEXT_STEPS.md](NEXT_STEPS.md) item #7).

---

## 7. Detail Page Layout Change

Use when changing the shared `.detail-page__*` layout system. **Always targets both detail SCSS files.**

```
In scss/pc/service/detail.scss AND scss/pc/product/detail.scss,
make the following change: [describe the change].
Both files must end up identical after the edit.
No other files changed.
```

**Example:**
```
In scss/pc/service/detail.scss AND scss/pc/product/detail.scss,
change .detail-page__col-left min-height from 600px to 100%.
Both files must end up identical after the edit. No other files changed.
```

---

## 8. Update Docs After Session

Use at the end of a working session to keep the docs current.

```
Read ALL files in docs/ first. Then read [list the key files changed this session].

After reading everything:
1. Append a new section to docs/COMPLETED_TASKS.md for today's session listing
   every task completed: [list tasks].
2. Update docs/NEXT_STEPS.md — remove completed items, add new remaining priorities:
   [list new items].
3. Append to docs/DECISIONS.md any new architectural decisions made:
   [list decisions].

Do not delete anything already in the docs. Only add or update.
Format consistently with the existing style.
```

---

## 9. Backend GraphQL Field Check

Use before adding any new field to a frontend query or mutation.

```
I want to use the field [fieldName] on the [TypeName] GraphQL type in
pawpal-api. Before I add it to the frontend query, confirm:
1. Does the field exist in the backend schema?
2. What is its return type?
3. Is it nullable?
Search the pawpal-api codebase for [fieldName] and report back.
Do not edit any files.
```

> Run this against the `pawpal-api` repo, not `pawpal-next`.

---

## 10. Unsplash Image Rule

Use when adding or swapping an Unsplash photo in any page or component.

```
I need an Unsplash photo for [describe the subject — e.g. "a golden retriever being groomed"].
Find a confirmed working Unsplash photo ID for this subject.
Use the URL format:
  https://images.unsplash.com/photo-[ID]?w=1200&auto=format&fit=crop

Update [file path] line [N] — change the existing image URL to the new one.
No other changes. No other files.
```

**Rules:**
- Always use a real, confirmed photo ID. Do not invent IDs.
- Always include `?w=1200&auto=format&fit=crop` query params to avoid oversized payloads.
- Test the URL in a browser before committing — Unsplash URLs can return 404 if the photo has been removed.
- Prefer photos with permissive Unsplash licences (all Unsplash photos qualify, but note attribution best practice).
