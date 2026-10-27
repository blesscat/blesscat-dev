## Context

The shared Astro shell has a manifest link but no favicon or touch icon declarations. The manifest points to absent PNG files. The editorial palette is #152428 and #f7f5ef. See proposal.md for motivation.

## Goals / Non-Goals

**Goals:** Keep the cat recognizable at tab size and provide self-contained static assets.

**Non-Goals:** Replace the existing photograph, rename the journal, add service workers, or change content/navigation.

## Decisions

- Use a hand-authored compact SVG rather than a photo reduction: solid shapes preserve the wide face, ears, and upward gaze at 16px.
- Keep the small SVG nose-free; retain a large SVG source with a pink nose for 180/192/512 PNG exports. Use a 16/32/48 ICO fallback. Commit both vector sources so raster assets can be reproduced without an application dependency.
- Use static root-relative declarations in Layout.astro, preserving all other metadata. Match theme/background colors to #152428.
- Render exports with local vector/raster tools; verify actual built HTML and image dimensions, and inspect a contact sheet at actual and enlarged sizes. No new runtime packages or test framework are needed.

## Risks / Trade-offs

- Browser favicon caching can delay visible updates → verify asset delivery separately from an existing cached tab.
- Simplifying the photograph loses fur detail → preserve silhouette and gaze instead.
- PNGs can drift from vector sources → document export commands and verify regenerated outputs during this change.

## Migration Plan

Deploy static assets and shell together through the normal build. Revert this change to roll back; no data migration is required.
