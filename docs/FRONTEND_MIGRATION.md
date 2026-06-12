# Frontend Migration: Nestar → PawPal

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (Pages Router) |
| Data fetching | Apollo Client |
| Styling | SCSS (global + per-page) |
| UI library | MUI (Material UI) |

## Brand

| Token | Value |
|---|---|
| Background (warm white) | `#FFF8F0` |
| Primary orange | `#FF7A1A` |
| Dark footer/bg | `#1A1A1A` |
| Cream section bg | `#f5f0e8` |

## Design Reference

- **Babet** Figma template — specialist/service card patterns
- **Bowwow** Figma template — product layout and hero patterns

---

## Completed Page Redesigns

### Navbar
- Transparent over hero, frosted glass on scroll
- Sticky with backdrop blur and shadow transition

### Footer
- Dark theme (`#1A1A1A`)
- Brand logo, nav links, social icons, copyright

### Services Page
- Category filter pills (chip row)
- `ServicePackages` — pricing tiers section
- `ServiceBenefits` — icon + text benefit cards
- `ServiceFaq` — accordion FAQ
- `ServicesCta` — bottom call-to-action banner

### Products Page
- Category filter pills
- `ProductFeatureBanner` — hero banner for featured product
- `ProductsTrustRow` — trust/icon badges row
- `ProductsCta` — call-to-action banner
- Horizontal card layout (image left, details right)

### Specialists Page
- Circular avatar cards with pastel background colors
- Deterministic color assigned from `_id` hash (consistent across renders)
- `SpecialistsCta` — call-to-action section
- Dynamic showcase panel (featured specialist detail)
- Experience years parsed from bio text

### About Page
- Mission statement section
- History / timeline section
- Services grid overview
- How-we-help section
- Team section with interactive specialist selector
- Testimonials carousel

### Blog List Page
- 3-column card grid
- Sidebar: search input, category list, write CTA
- Detail page with article body and comments section

---

## Image Utilities

Located in [libs/utils/mediaUrl.ts](../libs/utils/mediaUrl.ts):

```ts
resolveMemberImageUrl(member)    // resolves specialist/user avatar
resolveListingImageUrl(listing)  // resolves service/product image
```

Use these helpers everywhere rather than constructing image URLs manually.

---

## Key Learnings

### Unsplash IDs must be verified
Never guess or invent Unsplash photo IDs. Every placeholder image URL must use a verified, working ID. Broken IDs produce 404s that break the layout.

### SCSS scoping on the specialists page
The specialist page styles live in `agent.scss`. The root selector is:
```scss
.specialist-list-page > .container { ... }
```
Always scope new specialist styles under this selector to avoid bleed.

### `min-width: 0` on flex children
Flex children default to `min-width: auto`, which prevents text truncation with `text-overflow: ellipsis`. Any flex child that needs truncation must have `min-width: 0`.

### Apollo queries must not reference deleted Nestar fields
Before writing or updating a GraphQL query, confirm the field exists in the current schema. Fields like `propertyLocation`, `agentRank`, and other Nestar-specific names have been removed. Querying them causes runtime errors.

---

## Dark Mode

Dark mode was disabled during the redesign phase to stabilize the light-mode layout. Re-enabling it is tracked in [NEXT_STEPS.md](NEXT_STEPS.md).
