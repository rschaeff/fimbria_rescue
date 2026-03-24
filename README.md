# Fimbrial Domain Rescue Browser

Web application for browsing homodimer rescue results for fimbrial protein domains. Compares monomer vs dimer AlphaFold predictions to identify domains that are disordered as monomers but fold correctly when predicted as homodimers, reflecting their biological assembly in the chaperone/usher pathway.

## Pages

- **Dashboard** (`/`) — Summary statistics and rescue class distribution
- **Rescue Browser** (`/rescue`) — Sortable, filterable, paginated table of all rescue analysis results
- **Domain Detail** (`/rescue/[domain_id]`) — Per-domain view with metrics cards, pLDDT profile chart, 3DMol.js structure viewer, colored sequence display, and cross-references
- **Literature** (`/literature`) — Card-based literature browser with relevance filtering

## Tech Stack

- Next.js 16 (App Router), React 19, TypeScript 5
- Tailwind CSS 4
- PostgreSQL via `pg` (direct queries, no ORM)
- Recharts for pLDDT profile charts
- 3DMol.js for structure viewing

## Database

PostgreSQL on `dione:45000`, database `ecod_protein`, schema `fimbria`.

Tables: `targets`, `predictions`, `rescue_analysis`, `residue_plddts`, `structures`, `sequences`, `literature`.

## Setup

```bash
npm install
```

### Development

```bash
npm run dev
```

Note: The dev server uses `eval()` for hot module replacement which may be blocked by institutional web proxies. Use production mode if you see blank client components.

### Production

```bash
npm run build
npm run start -- -p 3004 -H 0.0.0.0
```

## Project Structure

```
src/
  app/                    # Next.js App Router pages and API routes
  components/
    layout/               # Header, Footer
    providers/            # ThemeProvider (dark mode)
    rescue/               # RescueTable, PlddtChart, StructureViewer, etc.
    literature/           # LiteratureTable, RelevanceBadge
    ui/                   # SortableTable, Pagination, ThemeToggle
  lib/
    db.ts                 # PostgreSQL connection pool
    cache.ts              # TTL-based in-memory cache
    queries.ts            # Typed SQL query functions
    types.ts              # TypeScript interfaces
```
