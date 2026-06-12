# Next Steps

Priority-ordered backlog. Work top-to-bottom.

---

## 1. Fix Orange Split Background Height on Detail Pages
**Priority:** High

The orange terracotta left-column pseudo-background on service and product detail pages may not extend to full content height when the left column is taller than expected. Audit `scss/pc/service/detail.scss` and `scss/pc/product/detail.scss` for the `.detail-page__col-left` pseudo-element (or equivalent) and ensure `min-height` covers the tallest left-column content.

**Key files:**
- `scss/pc/service/detail.scss`
- `scss/pc/product/detail.scss`

---

## 2. Hide Duplicate Specialist Info in Inquiry Card on Detail Pages
**Priority:** High

The inquiry sidebar on detail pages shows specialist name/avatar twice — once from the `ServiceDetailInquirySidebar` component and once injected by the `.detail-card--inquiry` CSS context. Audit the sidebar component and CSS overrides to remove the duplicate rendering without refactoring the sidebar component itself.

**Key files:**
- `libs/components/inquiry/ServiceDetailInquirySidebar.tsx`
- `libs/components/inquiry/ListingInquiryDetailSidebarFields.tsx`
- `scss/pc/service/detail.scss`

---

## 3. Homepage Redesign
**Priority:** High

Redesign remaining homepage sections to match PawPal brand (hero, why-pawpal, and featured-products are already done):
- Services preview section
- Products preview section
- Specialists preview section
- Blog / community preview section

**Key files:**
- `pages/index.tsx`
- `libs/components/homepage/OurServices.tsx`
- `libs/components/homepage/BrandShowcase.tsx`
- `scss/home.scss`

---

## 4. Fix Homepage Section Backgrounds
**Priority:** High (do alongside or immediately after homepage redesign)

All homepage sections should use the cream background `#f5f0e8` to match the PawPal warm palette. Audit every section background and replace any leftover white or grey backgrounds.

---

## 5. Remove Decorative Shapes from OUR SERVICES Section
**Priority:** Medium

The OUR SERVICES homepage section has decorative geometric shapes (circles, blobs) carried over from Nestar. Remove these entirely — PawPal's design language does not use them.

---

## 6. Product Catalog Card Styling — Verify After Detail Redesign
**Priority:** Medium

After the detail page changes, confirm the product catalog card grid (`/products`) still renders correctly. If card backgrounds, badge colours, or button styles regressed, restore from `scss/pc/product/catalog.scss`.

**Key files:**
- `scss/pc/product/catalog.scss`
- `libs/components/products/ProductCard.tsx`

---

## 7. Re-enable Dark Mode
**Priority:** Medium (after homepage is stable)

Dark mode was disabled during the redesign to stabilise the light-mode layout. Once the homepage redesign is complete and light mode is verified across all pages, re-enable dark mode and audit each page for contrast and readability.

See [DECISIONS.md](DECISIONS.md) for the rationale behind disabling it.

---

## 8. Enrich Test Accounts
**Priority:** Medium

Seed data for specialist and user profiles needs:
- Verified profile photos (use confirmed working Unsplash IDs)
- Full address data (Korean addresses)
- All required fields populated (phone, bio, experience, etc.)

See [AGENTS.md](AGENTS.md) for test credential placeholders to fill in.

---

## 9. Create Sample Content
**Priority:** Medium

Populate the platform with realistic sample data:
- Sample services (at least 3–5 per category)
- Sample products (at least 3–5 per category)
- Sample blog articles (at least 5)
- Mock bookings tied to sample services
- Mock inquiries tied to sample products
