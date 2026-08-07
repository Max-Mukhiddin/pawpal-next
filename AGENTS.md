# PawPal – Agent Guidelines

Read this file before making any changes. Follow every rule here.

## Project Context

PawPal is a B2C pet services and products platform migrated from the
legacy Nestar real estate template. The frontend is being modernized
with a warm editorial pet-care design  while
preserving all existing architecture, business logic, and backend
integrations.

## Stack

- **Frontend:** Next.js Pages Router, Apollo Client, SCSS (BEM), MUI
  — located in `pawpal-next/`
- **Backend:** NestJS, GraphQL, MongoDB — port `3007`, in `pawpal-api/`
- **Package manager:** Yarn only (never use npm or pnpm)
  Install with: `yarn install`


## Key Rules

- **Never rewrite the whole app** — make focused, targeted changes only
- **Never touch GraphQL queries, Apollo hooks, or mutations** unless
  explicitly asked to fix a data bug
- **Never remove or alter business logic** without a verified replacement
- **Never change TypeScript interfaces or enums** without checking both
  frontend and backend for the exact values in use
- **Never use `PROPERTY` enum** — it was removed; use `LISTING` instead
- **CommentGroup enum values:** `MEMBER`, `ARTICLE`, `LISTING`
- **ListingType values:** `SERVICE`, `PRODUCT`
- **MemberType values:** `USER`, `AGENT` (AGENT = specialist in UI)
- Run `npx tsc --noEmit` after every change — zero errors required
- Reset after applying changes: `rm -rf .next && yarn dev`

## Architecture Decisions (locked)

- Single `getListings` endpoint filtered by `listingType` — no split
  resolvers for services vs products
- Services → Booking flow; Products → Inquiry flow (no cart)
- Pages Router only — no App Router migration
- Specialist pages live at `pages/specialist/` not `pages/agent/`
- Specialist SCSS lives in `scss/pc/agent/detail.scss`

## File Structure (key paths)