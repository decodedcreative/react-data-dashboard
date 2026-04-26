# GitHub Copilot Instructions

This repository is a React + TypeScript portfolio project for building a data-heavy trading dashboard.

---

## Project goals

The app should demonstrate strong front-end engineering judgement, including:

- Clean React architecture
- Type-safe TypeScript
- Data fetching with TanStack Query
- Data tables with TanStack Table
- Scalable feature-based folder structure
- Accessible, usable UI
- Sensible handling of loading, error and empty states
- Maintainable, production-quality code

---

## Tech stack

Prefer:

- React
- TypeScript
- Vite
- TanStack Query
- TanStack Table
- Zod (for runtime validation where useful)

Avoid introducing large frameworks unless explicitly required.

Avoid:

- Redux unless there is genuine complex client-side state
- Next.js (this is a client-side app for now)
- Over-engineered abstractions
- Premature generic components

---

## Architecture preferences

Use a feature-based structure:

```txt
src/
  api/
  features/
    trades/
      components/
      hooks/
      utils/
      types.ts
  types/
  App.tsx
  main.tsx
```

Guidelines:

Keep business/domain logic close to the relevant feature
Promote shared code only when reused or clearly reusable
Avoid premature abstraction

## Coding Style

Use:

Functional React components
Named exports where practical
Clear and explicit prop types
Early returns for loading and error states
Small, readable functions
Descriptive variable names
Explicit types for public APIs and component props

Avoid:

any
deeply nested JSX
large “god components”
unnecessary custom hooks
clever or opaque abstractions

## Data fetching

Use TanStack Query for server state.

Guidelines:

Use meaningful query keys:

['trades', filters]
Handle loading, error and empty states explicitly
Do not duplicate server data into local state without a clear reason
Keep API logic inside src/api

## Tables

Use TanStack Table for tabular data.

Prioritise:

Sorting
Filtering
Pagination
Clear column definitions
Readable configuration

Avoid building a fully generic reusable table too early.

## UI and UX

The dashboard should feel like a realistic trading/data application.

Prioritise:

Clear information hierarchy
Useful empty states
Readable numbers and dates
Accessible controls
Sensible spacing and layout

Do not over-focus on visual polish at the expense of behaviour and structure.

## Testing

Prefer:

React Testing Library
user-event

Focus on:

Behaviour over implementation
Data transformations
Filtering logic
UI states (loading, error, empty)

## Portfolio mindset

Code should be written as if it will be discussed in an interview.

Prefer solutions that are:

Simple and explainable
Production-minded
Not over-engineered
Representative of real-world front-end work

If multiple approaches exist, choose the simplest one that demonstrates good judgement.