# PawPal Web

Frontend for **PawPal**, a full-stack pet-care marketplace connecting pet owners with specialists, services, and pet-product sellers.

This application is the customer-facing and specialist-facing web client for the PawPal platform and includes marketplace discovery, service/product flows, bookings, inquiries, community features, messaging, and admin-oriented interfaces.

> Live product: https://pawpall.online  
> Backend repository: https://github.com/Max-Mukhiddin/pawpal  
> Portfolio: https://max-mukhiddin.github.io/homepage/

## Tech Stack

- **Next.js 14**
- **React 18**
- **TypeScript**
- **Apollo Client** + GraphQL
- **Material UI**
- **Styled Components**
- Sass / SCSS
- TipTap rich-text editor
- React Three Fiber / Three.js
- i18next
- WebSocket subscriptions

## Product Areas

### Marketplace

- Product and service discovery
- Category and location-based browsing
- Specialist/service detail flows
- Rich listing content and media

### Bookings & Inquiries

- Service booking flows
- Customer inquiry submission
- Specialist-side inquiry handling

### Community

- Articles
- Comments
- Likes
- Follows
- Views
- Notifications

### Messaging

- Conversation UI
- Real-time message feeds
- WebSocket-enabled communication

### Administration

The frontend includes protected interfaces for managing platform content and operational workflows.

## Architecture

```text
Next.js / React
      |
      v
Apollo Client
      |
      v
GraphQL API
      |
      v
NestJS + MongoDB
```

## Local Development

### Install

```bash
npm install
```

or

```bash
yarn
```

### Run

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Start production build

```bash
npm start
```

## Environment

Runtime configuration is kept outside the repository through local environment files. `.env`, `.env.local`, and development-specific environment files are excluded from version control.

## Project Background

PawPal was developed as an independent portfolio product after learning marketplace architecture through earlier course work. The pet-care domain, product/service model, booking and inquiry workflows, communication features, visual system, and production deployment were developed specifically for PawPal.

## Author

**Mukhiddin “Max” Solijonov**  
Full-Stack · DevOps · AI Engineer  
South Korea

- Portfolio: https://max-mukhiddin.github.io/homepage/
- GitHub: https://github.com/Max-Mukhiddin
