## Why

The homepage prioritizes four activity metrics over the site's 248 published articles. Repeated mobile navigation, low-contrast metadata, and playful card treatments make sustained Chinese reading and article discovery harder than necessary.

## What Changes

- Lead the homepage with a real newest article, recent writing, and useful topics derived from existing tags; keep activity journals as secondary destinations with real aggregate counts.
- Introduce a cohesive paper, ink, and ocean editorial theme across the shell, article archive, reading view, and activity page headings in light and dark modes.
- Share post rows and archive pagination, add static topic discovery pages, and improve Chinese typography and metadata contrast.
- Use one primary navigation per viewport, while retaining search, persistent theme switching, RSS, comments, and every existing content/activity URL and interaction.

## Capabilities

### New Capabilities

- `editorial-journal`: Blog-first discovery, responsive journal navigation, theme-consistent reading, and preservation of activity functionality.

### Modified Capabilities

None; no existing main specs are present.

## Impact

Presentation under src/pages, src/layouts, src/components, src/styles, small content-view helpers and focused behavioral tests. No content or data edits, framework/dependency additions, repository renaming, deployment, or automation changes. Add the requested root /.worktree/ ignore rule. Topic routes are additive and canonical metadata remains tied to each existing or new URL.
