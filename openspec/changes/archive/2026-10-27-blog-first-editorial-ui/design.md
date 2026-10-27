## Context

See proposal.md for motivation. Astro 6 renders 248 Markdown entries, while Svelte and existing scripts power activity maps, charts, and filters. Both archive pages duplicate card markup. The shared layout owns Pagefind search, theme persistence, and navigation. Existing CSS combines warm semantic tokens with hardcoded clay surfaces. No prior main specs exist.

## Goals / Non-Goals

**Goals:** Make writing the primary journey; use reusable server-rendered article rows and pagination; improve reading comfort and shared theme semantics without adding dependencies.

**Non-Goals:** Content rewrites, fabricated imagery, data model changes, replacing activity engines, repository/deployment changes, or changing existing public URLs.

## Decisions

- Use the newest article as a cover story and display its existing hero only when provided. A split editorial feature and compact chronological rows provide hierarchy without making activity metrics dominant. A text masthead and restrained existing cat avatar retain personality without introducing synthetic assets.
- Share typed content-view helpers, post rows, pagination, and topic links. Generate static topic routes from exact tags using encoded URL segments; this reaches all matching posts rather than filtering just the first 20 archive entries. Keep original `/blog`, `/blog/page/*`, and article paths.
- Use warm paper and ink with a dark ocean canvas, accessible ocean accents, serif editorial headings via local system fonts, and Sora/system Chinese body fallbacks. Avoid new remote font dependencies. Centralize tokens and replace clay card movement with quiet borders/surfaces; keep chart and map colors functionally distinct.
- Keep desktop section links in the header and mobile section links in the bottom bar; preserve search/theme controls on both. Add current-page semantics and a skip link. Keep existing search/comments integrations and activity scripts, with focused shell accessibility fixes only.
- Verify full build including Pagefind and existing behavioral tests. Add focused tests for chronological ordering, exact-tag discovery, encoding, and route matching; browser checks cover layout, navigation, theme persistence, search, and activity interactions.

## Risks / Trade-offs

- Static topic pages increase build output → reuse existing entries and components, with no new client bundle or dependencies.
- Existing third-party maps, charts, fonts, and comments depend on network services → verify available runtime interactions and record external failures separately.
- Theme overrides may miss hardcoded colors → inspect all main pages in desktop/mobile and both themes, then fix observable regressions.
- Long Chinese titles and data tables can overflow → use bounded reading columns, wrapping titles, scrollable code/tables, and mobile checks.

## Migration Plan

Deploy through the existing pipeline after PR review; no migration or deployment setting changes. Revert the presentation commit to restore the previous UI while retaining all data and URLs.
