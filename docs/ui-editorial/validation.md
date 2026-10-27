# Editorial UI validation

Validated 2026-10-27 against baseline `30d92f79ae989e776f3f44ae39287f39081dbb1b` in the independent `blesscat/blog-editorial-ui` worktree.

## Automated checks

- `pnpm install --frozen-lockfile`: installed from clean HEAD package manifests/lockfiles; no dependency or lockfile changes.
- `pnpm test`: 5 files, 46 tests pass, including 4 focused journal-discovery tests covering timestamp ordering, exact-tag results beyond one archive page, tag-route safety, original article paths, and section boundaries.
- `pnpm exec astro check`: 0 errors, 0 warnings; 4 existing hints (unused social helpers and the article JSON-LD inline script). A fresh trusted HEAD source snapshot at `/tmp/blog-ui-baseline-check`, using the same clean-manifest dependency installation, reports 6 errors and 5 hints: two nullable theme-icon closure errors and four untyped archive pagination errors. The changed shell/archive removes those errors; the four remaining hints match the baseline.
- `pnpm build`: succeeds, including all existing article routes, additive real-tag routes, OG assets, sitemap, and Pagefind. Pagefind indexes the 248 article pages using the reading body; topic/archive duplicates are excluded from search.
- `git diff --check`: passes.

## Browser verification

`verify.mjs` runs against the static preview at `http://localhost:4323`, using an already available Playwright module and Chromium executable supplied through environment variables. It adds no project dependency. `runtime-results.json` records all checks and their observed values.

The 64-case matrix covers home, archive, page 2, article, real topic, dives, ski, and explore at desktop 1440×1000, mobile 390×844 and 320×844, and the 769px desktop-navigation breakpoint, each in light and dark. Every case verifies theme state, one header, a single viewport-appropriate section navigation, no horizontal page overflow, and one canonical pointing at the original public origin/path.

Twelve interaction checks verify:

- Theme toggle persists through actual link navigation.
- The inactive back-to-top control is absent from keyboard navigation; reached keyboard focus remains onscreen.
- Repeated search shortcuts while open retain the original trigger as the Escape focus destination.
- Sharing writes the actual article URL to the clipboard; rejected clipboard access shows truthful failure feedback.
- Pagefind returns 10 article destinations for `Hermes`; Escape restores trigger focus and Shift+Tab wraps modal focus.
- The real `AI` topic lists all 178 matching articles and opens an original article URL.
- Previous pagination on page 2 returns to `/blog`.
- Article content, reading progress, sharing control, and Remark42 container/embed remain available.
- All 78 dive and 19 ski records remain present; zero-result search and year filters work, Leaflet maps initialize, and Chart.js charts render.
- Dive entry/exit mini-map opens and closes; the depth curve panel expands.
- Explore's Leaflet map, dive layer toggle, and year slider update.

No comment was posted. External request failures in the log are `ERR_ABORTED` requests canceled during rapid navigation; dedicated map/chart interaction checks subsequently loaded the scripts successfully. CARTO base tiles return HTTP-success images containing `API KEY REQUIRED`, so base geography is unavailable although markers, controls, filters, and charts initialize. A bounded check of the unchanged deployed baseline at `https://blog.blesscat.dev/explore` on the same date reproduces the identical provider watermark and tile URL (`https://a.basemaps.cartocdn.com/dark_all/3/6/3.png`); see `screenshots/baseline-explore-provider.png`. All map engine/provider source is unchanged. This is an existing external provider issue, not a UI regression; no provider/deployment settings were changed. Comment container and embed preservation were checked; full authenticated comment submission was outside scope.

## Visual evidence

The 18 final-UI screenshots in `screenshots/` show the actual built site, without injected content or CSS; `baseline-explore-provider.png` separately records the existing deployed provider issue. The capture script waits for entrance/count-up animations before recording activity values. Home has all four viewport/theme combinations; archive, article (including reading body), and all activity pages have desktop light/mobile dark captures; topic and search have additional mobile captures.

Initial Orca embedded-browser captures showed compositor artifacts (a duplicated header strip). DOM checks proved one header; fresh headless Chromium screenshots replaced those files. The normal dev server also hit host file-watcher limits; polling mode worked, and the final verification used the complete static build/preview instead.

## Scope and retained behavior

Existing article/data files, activity engines, RSS, comment service configuration, public origin, deployment, package identity, and automation settings are unchanged. The homepage feature and all covers/titles/descriptions come from existing content; activity summaries derive from the real datasets. The root worktree ignore rule is included as requested. Topic slugs use a deterministic UTF-8 hex route segment so arbitrary Unicode, slashes, dots, or percent signs cannot escape the topic path.

The existing dive PB panel contains a hardcoded 33.9m record while the real dataset maximum is 39.2m; this pre-existing data discrepancy is retained rather than changed during the presentation task. Homepage and aggregate summaries use the actual dataset.

## Round 1 remediation

Reviewer A passed without actionable findings. Reviewer B reported P2 offscreen focus on the inactive back-to-top button and P3 focus-return loss when the search shortcut reopens an already open dialog. Both were accepted and fixed, with browser regressions added. Clipboard success/failure now has direct browser coverage. A reviewer-observed 320px canvas overflow also reproduced on the deployed baseline (dives 341px, ski 338px scroll widths at a 320px viewport); intrinsic chart sizing is now contained, and the expanded 64-case matrix passes. Preserved Markdown H1 headings now follow the reading hierarchy. All relevant tests, typecheck, full build, runtime assertions, and final UI screenshots were refreshed after these edits.

## Final independent review

Both fresh round-2 Orca reviewers passed with no actionable P0–P3 findings. Exactly two reviewers were used in each of two rounds; all accepted round-1 findings were fixed and verified. See `reviews.md` for Dispatch IDs, inspected evidence, independent check results, and limitations.

## OpenSpec delivery

All 8 tasks completed. Explicit sync created `openspec/specs/editorial-journal/spec.md` with all 5 requirements and every scenario; `openspec validate --specs --strict` passes. The delta was compared against the main spec before taking the already-synced archive path. Archive: `openspec/changes/archive/2026-10-27-blog-first-editorial-ui/`, including `.openspec.yaml`; no active UI change remains. No OpenSpec artifacts are excluded by Git ignore policy. Generated `.astro/`, `dist/`, and installed `node_modules/` remain local and ignored.
