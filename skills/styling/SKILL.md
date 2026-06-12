name: styling
description: PawPal SCSS and design system conventions.

Focus on:
- Scope under #pc-wrap or #mobile-wrap
- BEM — short layout anchor then nest
- CSS variables: var(--pp-primary), var(--pp-bg)
- Dark mode is disabled — do not add dark overrides
- service/detail.scss and product/detail.scss must stay in sync
- agent.scss scopes under .specialist-list-page > .container

Do NOT:
- Write flat long selector chains
- Use !important except for MUI overrides
- Add new @keyframes without checking general.scss first
- Touch _theme.tokens.scss without explicit instruction

Files:
- scss/pc/
- scss/variables.scss
- scss/_theme.tokens.scss
