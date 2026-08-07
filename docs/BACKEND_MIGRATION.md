# Backend Migration: Nestar → PawPal

## Overview

PawPal is a B2C pet services and products platform built by migrating the Nestar real estate codebase. The backend domain language, data models, and business logic have been adapted throughout.

## Stack

| Layer | Technology |
|---|---|
| Framework | NestJS |
| API | GraphQL (code-first) |
| Database | MongoDB (Mongoose) |
| Port | 3007 |

## Member Types

| Original (Nestar) | PawPal | Notes |
|---|---|---|
| USER | USER | Standard customer account |
| AGENT | AGENT (domain: Specialist) | Pet care professionals |
| ADMIN | ADMIN | Platform administrator |

The enum value remains `AGENT` in the database; "Specialist" is the display/domain name used in UI and documentation.

## Key Renames

| Nestar Term | PawPal Term |
|---|---|
| Property | Listing |
| Agent | Specialist |
| PropertyType | ListingType |
| HOUSE / APARTMENT / etc. | SERVICE / PRODUCT |
| Booking (real estate) | Booking (service appointment) |

## Business Model

- **Services** — booked via the booking flow (appointment-based)
- **Products** — purchased via the inquiry flow (no cart; inquiry-first)

## Currency

Korean Won (₩ / KRW). No decimal places. Format: `₩1,000,000`.

## Authentication & Authorization

- New members start with `MemberStatus.PENDING`
- `PENDING` status blocks login entirely — the member cannot authenticate until an admin approves their account
- Approved members move to `MemberStatus.ACTIVE`
- Banned members have `MemberStatus.BLOCK`

## GraphQL API

### Listings

All listing queries use a single `getListings` endpoint filtered by the `listingType` enum:

```graphql
query GetListings($input: ListingsInquiry!) {
  getListings(input: $input) {
    list { ... }
    metaCounter { ... }
  }
}
```

The `listingType` field accepts `SERVICE` or `PRODUCT`.

### Members / Specialists

Specialists are queried as members with `memberType: AGENT`. The `getAgents` / `getSpecialists` resolvers return members filtered by this type.

## MongoDB Collections

| Collection | Description |
|---|---|
| `members` | All users, specialists, admins |
| `listings` | Services and products |
| `board-articles` | Blog/community posts |
| `comments` | Comments on articles and listings |

## Notes

- Do not reference deleted Nestar-specific fields (e.g., `propertyLocation`, `agentRank`) in queries — they no longer exist in the schema
- The `listingType` enum is the primary discriminator between services and products throughout the backend
