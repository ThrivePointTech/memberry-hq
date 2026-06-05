---
description: Rules for dashboard client components (dialogs, forms, selects)
paths:
  - src/components/**/*.tsx
  - src/app/**/*.tsx
---

# Client Component Rules

## Edit dialogs must pre-populate from current data

Any dialog that edits an existing entity must:
1. Accept the current entity (or its relevant fields) as a prop
2. Seed `useState` from that prop when the dialog opens — not with empty defaults

```tsx
// Good
function openDialog() {
  setForm(entityToForm(currentEntity))  // seeds from prop
  setOpen(true)
}

// Bad
function openDialog() {
  setForm(EMPTY_FORM)  // loses existing values
  setOpen(true)
}
```

## Controlled shadcn Select inside a Dialog — always pass label as children

`<SelectValue />` with no children renders the raw `value` string (e.g. `"gcash"`) when used in a controlled Select inside a Dialog, because Radix may not have the items mounted yet.

Always maintain a label map and pass it as children:

```tsx
const LABELS = { gcash: 'GCash', maya: 'Maya', bank: 'Bank Transfer' }

<SelectValue>{LABELS[form.method_type]}</SelectValue>
```

## Dashboard API proxy pattern

All client-side fetches go to `/api/...` (Next.js route handlers), never directly to the backend. Route handlers live in `src/app/api/` and forward requests to `NEXT_PUBLIC_API_URL/admin/...` with the `memberry_admin_token` cookie as a Bearer token. After a successful mutation, call `router.refresh()` to re-fetch server component data.
