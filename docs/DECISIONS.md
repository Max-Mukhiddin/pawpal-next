# Architectural Decisions

---

## 1. Pages Router over App Router

**Decision:** Use Next.js Pages Router (`pages/`) instead of the App Router (`app/`).

**Rationale:** The Nestar codebase was built on Pages Router. Migrating to App Router mid-project would require refactoring every page, layout, and data-fetching pattern simultaneously — a high-risk, low-reward change. Pages Router is stable, well-understood, and fully supported.

**Implications:** All routing lives in `pages/`. Layouts use `_app.tsx` and wrapper components. No React Server Components or `use client` directives needed.

---

## 2. Single `getListings` Endpoint Filtered by `listingType`

**Decision:** Use one GraphQL endpoint (`getListings`) for both services and products, discriminated by the `listingType` enum field.

**Rationale:** Maintaining separate resolvers for services and products would duplicate backend logic. A single parameterized endpoint is simpler to maintain and consistent with how Nestar handled multiple property types.

**Implications:** Every listing query must include `listingType: SERVICE` or `listingType: PRODUCT` in the input. Never query without this discriminator.

---

## 3. Inquiry (not Cart) for Products; Booking for Services

**Decision:** Products use the inquiry flow. Services use the booking flow. No shopping cart.

**Rationale:** PawPal's product catalog is not a typical e-commerce store — products are pet care items where customers often need to ask questions before purchasing. The inquiry-first model matches this behavior. Services, being appointment-based, naturally fit the booking pattern.

**Implications:** There is no cart, no checkout, and no payment integration. Product CTAs lead to an inquiry form. Service CTAs lead to a booking form.

---

## 4. SCSS over CSS Modules

**Decision:** Use global SCSS files per page/section rather than CSS Modules.

**Rationale:** The Nestar codebase was structured with global SCSS. Introducing CSS Modules would create a two-pattern codebase and require renaming class selectors throughout. Continuing with SCSS maintains consistency.

**Implications:** SCSS files live in `scss/`. Class names are global — scoping is handled manually via page-level wrapper classes (e.g., `.specialist-list-page`, `.services-page`). See [pawpal-scss-conventions.md](pawpal-scss-conventions.md) for naming rules.

---

## 5. Dark Mode Disabled During Redesign

**Decision:** Dark mode was disabled while the light-mode redesign was in progress.

**Rationale:** Maintaining two color themes simultaneously during a full visual overhaul doubles the surface area for bugs and inconsistencies. Disabling dark mode allowed the team to stabilize the light theme first.

**Implications:** Dark mode CSS variables may be stale and will need auditing when re-enabled. Re-enabling it is tracked in [NEXT_STEPS.md](NEXT_STEPS.md).

---

## 6. Deterministic Avatar Colors from `_id` Hash

**Decision:** Specialist avatar background colors are assigned deterministically by hashing the MongoDB `_id`.

**Rationale:** Randomly assigned colors change on every render, creating visual noise. Using the `_id` as a seed ensures each specialist always gets the same pastel background color, which feels intentional and consistent to users — even without a real photo.

**Implications:** The color assignment logic must use the same hash function everywhere. Do not use `Math.random()` for avatar colors. The color palette is a fixed set of brand-consistent pastels.

---

## 7. `team-pawpal__*` CSS Classes Shared Between Homepage and Specialist Page

**Decision:** CSS classes prefixed with `team-pawpal__` are declared in `agent.scss` and reused by both the specialists page and the homepage team section.

**Rationale:** The homepage team section and the specialists list page share the same card design. Rather than duplicate the styles, the homepage imports `agent.scss` to reuse these classes.

**Implications:** Changes to `team-pawpal__*` classes in `agent.scss` affect both pages simultaneously. Always check both pages when modifying these styles.

---

## 8. Detail Pages Use Shared `.detail-page__*` CSS Class System

**Decision:** Both service detail and product detail pages use the same `.detail-page__*` BEM class prefix.

**Rationale:** The two pages share an identical layout (hero, two-column grid, cards, reviews, related items). A shared class system avoids duplicating SCSS logic and ensures visual consistency with a single source of truth.

**Implications:** `scss/pc/service/detail.scss` and `scss/pc/product/detail.scss` currently have identical content. When changing the layout, edit both files (or extract to a shared partial in future). Never add page-specific selectors to the shared class prefix — create a separate scoped class for any divergence.

---

## 9. Service and Product Detail SCSS Files Are Intentionally Identical

**Decision:** `scss/pc/service/detail.scss` and `scss/pc/product/detail.scss` contain the same SCSS at this time.

**Rationale:** Both pages use the same layout system. The files are kept separate so each page can diverge in future without a refactor. For now, changes must be applied to both files simultaneously.

**Implications:** Treat them as a pair. A diff between the two should always be empty. If they diverge unintentionally, reconcile before the next session.

---

## 10. ServiceDetailInquirySidebar Styled via CSS Overrides, Not Refactored

**Decision:** `ServiceDetailInquirySidebar` component is kept as-is. Its appearance inside the detail page is controlled by CSS overrides scoped to `.detail-card--inquiry`.

**Rationale:** Refactoring the sidebar component risked breaking the existing inquiry flow on other pages. CSS overrides at the container level achieve the visual changes with zero component risk.

**Implications:** Do not alter `ServiceDetailInquirySidebar.tsx` for layout reasons. All visual adjustments belong in the `.detail-card--inquiry` block inside `detail.scss`.

---

## 11. Orange Terracotta `#c8622a` as Left-Column Accent on Detail Pages

**Decision:** The left column of the detail page layout uses orange terracotta `#c8622a` as its background accent (via a pseudo-element).

**Rationale:** This creates a distinctive visual split that ties detail pages to the PawPal brand without a full-bleed colour block. The right column remains on the neutral cream, keeping content readable.

**Implications:** This colour is the canonical orange for structural backgrounds on detail pages. Do not substitute with the hero orange or button orange variants — keep `#c8622a` consistent across both detail pages.

---

## 12. ServiceDetailBookingSection Was Not Created

**Decision:** `ServiceDetailBookingSection` does not exist as a component. Any references to it are dead.

**Rationale:** During the service detail redesign, the booking section was handled inline within the detail page layout rather than as a separate component. The name may appear in legacy import lists or TODO comments but the file was never committed.

**Implications:** Do not create this file. If a dedicated booking section component is needed in future, design it fresh from the current detail page layout.

---

## 13. Specialist Portrait Photo Standards

**Decision:** Specialist profile and directory photos must follow a consistent editorial portrait standard.

**Standards:**

- Face visible from chin to top of forehead in frame
- Neutral or warm background (no distracting scenes)
- Landscape orientation preferred (4:3 or 4:5 crop)
- Natural, warm lighting — no harsh flash
- Professional but approachable expression

**Rationale:** Inconsistent or default avatars break the premium, photo-dominant specialist card design. Highland-inspired hover-reveal cards depend on strong portrait photography.

**Implications:** Test accounts still on default avatars (`emma_vet`, `taemin_walks`, `seoyeon_stay`) need proper portrait uploads. Use verified Unsplash pet-professional portraits or curated studio shots until real photos are available.
