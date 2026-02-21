# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Margem Forte is a client-side margin calculator for Brazilian small businesses (confeiteiros, freelancers, prestadores de serviço). All UI text is in Brazilian Portuguese - never introduce English strings in user-facing content. No backend; data is persisted in localStorage.

## Commands

| Task                   | Command                                      |
| ---------------------- | -------------------------------------------- |
| Dev server (port 8080) | `npm run dev`                                |
| Production build       | `npm run build`                              |
| Lint                   | `npm run lint`                               |
| Run all tests          | `npm run test`                               |
| Watch tests            | `npm run test:watch`                         |
| Run single test file   | `npx vitest run src/lib/margin-math.test.ts` |

## Architecture

**Stack:** React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui (Radix primitives)

**Routing:** React Router DOM with 4 routes: `/` (calculator), `/faq`, `/historico`, `*` (404)

**Path alias:** `@/*` maps to `src/*`

### Key modules

- `src/lib/margin-math.ts` - Pure calculation functions (no React, no side effects). All business math lives here. Has 38 Vitest test cases in the adjacent `.test.ts` file.
- `src/lib/templates.ts` - 6 business templates (prestador, confeitaria, consultoria, artesanal, freelancer TI, personalizado) with suggested cost items and tax regimes.
- `src/lib/storage.ts` - localStorage CRUD under key `margemforte_calculations`. Also has export functions (JSON, CSV, plain text).
- `src/components/calculator/MarginCalculator.tsx` - Main calculator component (~1200 lines). Contains template selection screen and the full calculator form+results. This is the largest and most-edited file in the project.
- `src/components/ui/` - shadcn/ui components. Modify via the shadcn pattern (edit in place), don't replace wholesale.

### Data flow

User inputs → `MarginCalculator` state (useState) → `calculateMargin()` from margin-math.ts → results rendered inline. Saving writes to localStorage via storage.ts. History page reads from the same localStorage key.

### Cost item types

Three input modes for variable costs: `currency` (direct R$ value), `hours_rate` (hours × hourly rate), `quantity_price` (qty × unit price).

### Tax regimes

Brazilian tax presets: MEI (5%), Simples Anexo III (6%), Simples Anexo V (15.5%), Lucro Presumido (16.33%), or custom percentage.

## Conventions

- Currency formatting uses `Intl.NumberFormat` with `pt-BR` locale. Input fields store formatted strings (e.g., "1.250,00") and are parsed by stripping non-digits and dividing by 100.
- Icons come from `lucide-react`. The calculator maps template icons via an `iconMap` record.
- Toast notifications use Sonner (`toast.success`, `toast.error`, `toast.warning`).
- Tailwind theme uses HSL CSS variables defined in `index.css` with custom color tokens (primary, success, warning, destructive, accent-warm, etc.) and custom animations (fade-in, slide-up, scale-in).
