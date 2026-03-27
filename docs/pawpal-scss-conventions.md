# PawPal SCSS conventions (homepage & new UI)

These rules apply to **new** PawPal sections. Do not extend legacy Nestar-style flat chains.

## 1. Nesting

Use SCSS nesting for new components. Prefer a **short layout anchor** once, then nest.

## 2. Avoid long flat selectors

Avoid repeating:

```scss
#pc-wrap .home-page .my-section .my-section__title { }
```

## 3. Preferred structure

Anchor **layout wrappers** in one line (needed for `#pc-wrap` / `#mobile-wrap`), then nest under `.home-page`:

```scss
#pc-wrap .home-page,
#mobile-wrap .home-page {
  .my-section {
    /* block */

    &__title { }
    &__body { }

    &--variant { }
  }
}
```

## 4. BEM

Use BEM-style naming where it helps readability: block `my-section`, elements `&__title`, modifiers `&--variant` or state `.is-active`.

## 5. Scope & readability

Keep selectors scoped under `.home-page` (plus layout wrappers). Do not leak global styles from section partials.

## 6. Legacy

Existing Nestar-era SCSS in `main.scss` / old page partials is **not** the template for new work—migrate opportunistically.
