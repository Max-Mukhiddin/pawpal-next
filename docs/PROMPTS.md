# Reusable Claude Code Prompt Patterns

Copy-paste these templates when giving Claude Code targeted instructions. Fill in the bracketed placeholders.

---

## 1. SCSS Targeted Fix

Use when you need to change a single CSS property without any risk of scope creep.

```
In [file path], find the selector [selector name] and change [property]
from [current value] to [new value]. No other changes.
```

**Example:**
```
In scss/agent.scss, find the selector .specialist-list-page .card-avatar
and change background-color from #e0e0e0 to #fff8f0. No other changes.
```

---

## 2. Component Fix

Use when replacing or updating a function or block inside a React component. Always includes a type-check step.

```
In [component file path], replace [function or JSX block name] with
[new implementation or description]. Run npx tsc --noEmit after.
```

**Example:**
```
In libs/components/mypage/SpecialistCatalogRow.tsx, replace the
getAvatarColor function with a version that uses modulo on the last
character of member._id to pick from a fixed 6-color pastel array.
Run npx tsc --noEmit after.
```

---

## 3. Dead File Check

Use before deleting a file to confirm it has no active imports anywhere in the codebase.

```
Search for imports of [file name or path] across @codebase.
If zero imports are found, delete it.
```

**Example:**
```
Search for imports of PropertyBigCard across @codebase.
If zero imports are found, delete libs/components/common/PropertyBigCard.tsx.
```

---

## 4. Image Fix

Use when a single image URL needs updating. Strictly scoped to one change.

```
In [file path], update the image URL [old URL or variable name]
to [new URL]. No other changes. No other files.
```

**Example:**
```
In pages/about/index.tsx, update the hero image URL to
https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1600.
No other changes. No other files.
```
